import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TARGET_FOLDER_ID = '1q816yim3GYzq0yxTC-OXr29wyhiwTsb-';
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error('Google OAuth credentials not configured');
    return null;
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to refresh access token:', errorText);
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, channel, ownerName, publishDate, accessToken, refreshToken, campaignName } = await req.json();

    // Try to get a valid access token
    let validAccessToken = accessToken;
    
    // If no access token or if we have a refresh token, try to get a fresh token
    if (!validAccessToken && refreshToken) {
      console.log('No access token provided, attempting to refresh');
      validAccessToken = await refreshAccessToken(refreshToken);
    }

    if (!validAccessToken) {
      return new Response(
        JSON.stringify({ error: 'No valid access token available. Please re-authenticate with Google.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Google Doc with new title format: YYYY-MM-DD [Title] [Channel]
    const formattedDate = new Date(publishDate).toISOString().split('T')[0];
    const docTitle = `${formattedDate} ${title} [${channel}]`;
    
    // Step 1: Create a new Google Doc
    let createDocResponse = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${validAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: docTitle,
      }),
    });

    // If failed with 401 and we have refresh token, try to refresh and retry
    if (createDocResponse.status === 401 && refreshToken) {
      console.log('Access token expired, attempting to refresh');
      validAccessToken = await refreshAccessToken(refreshToken);
      
      if (!validAccessToken) {
        return new Response(
          JSON.stringify({ error: 'Failed to refresh access token. Please re-authenticate with Google.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Retry with new token
      createDocResponse = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${validAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: docTitle,
        }),
      });
    }

    if (!createDocResponse.ok) {
      const errorText = await createDocResponse.text();
      console.error('Error creating doc:', errorText);
      throw new Error(`Failed to create Google Doc: ${createDocResponse.statusText}`);
    }

    const docData = await createDocResponse.json();
    const docId = docData.documentId;
    const docUrl = `https://docs.google.com/document/d/${docId}/edit`;

    // Step 2: Move document to shared folder
    try {
      const moveResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${docId}?addParents=${TARGET_FOLDER_ID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${validAccessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!moveResponse.ok) {
        const errorText = await moveResponse.text();
        console.error('Warning: Could not move doc to folder:', errorText);
        // Continue anyway - doc is still created and usable
      }
    } catch (moveError) {
      console.error('Warning: Error moving doc to folder:', moveError);
      // Continue anyway - doc is still created and usable
    }

    // Step 3: Add content to the document
    const content = [
      { text: `• Owner: ${ownerName}\n`, style: 'normal' },
      { text: `• Publish Date: ${publishDate}\n`, style: 'normal' },
      { text: `• Campaign: ${campaignName || 'None'}\n`, style: 'normal' },
      { text: `• Description: ${description}\n\n`, style: 'normal' },
      { text: 'Audience\n', style: 'HEADING_2' },
      { text: 'Who specifically is this for? Forwarders / airlines? Enterprise / SMB? Any particular role or persona? Prospects or customers?\n\n\n', style: 'guidance' },
      { text: 'Goal\n', style: 'HEADING_2' },
      { text: 'What should this piece achieve? State the outcome, not the activity. The more precise you are, the better.\n\n\n', style: 'guidance' },
      { text: 'Key Messages (3 max)\n', style: 'HEADING_2' },
      { text: 'What are the 2-3 things we want them to remember? Each should be a complete thought, not a topic. They should generally relate to our positioning canvas.\n\n\n', style: 'guidance' },
      { text: 'Approach & Rationale\n', style: 'HEADING_2' },
      { text: 'How are we delivering this (format, channel, author/voice, angle) and why? What\'s the insight behind these choices? Include alternatives you considered.\n\n\n', style: 'guidance' },
      { text: 'Supporting Material\n', style: 'HEADING_2' },
      { text: 'What are you basing this on? Customer quotes, research, data points, reference links, internal notes.\n\n\n', style: 'guidance' },
    ];

    const requests = [];
    let index = 1;

    for (const item of content) {
      // Insert text
      requests.push({
        insertText: {
          location: { index },
          text: item.text,
        },
      });

      const endIndex = index + item.text.length;

      // Apply style based on type
      if (item.style === 'HEADING_2') {
        requests.push({
          updateParagraphStyle: {
            range: {
              startIndex: index,
              endIndex: endIndex,
            },
            paragraphStyle: {
              namedStyleType: 'HEADING_2',
            },
            fields: 'namedStyleType',
          },
        });
      } else if (item.style === 'guidance') {
        // Find the actual text content (exclude trailing newlines)
        const textContent = item.text.trimEnd();
        const textEndIndex = index + textContent.length;
        
        // Apply grey italic formatting for guidance text
        requests.push({
          updateTextStyle: {
            range: {
              startIndex: index,
              endIndex: textEndIndex,
            },
            textStyle: {
              foregroundColor: {
                color: {
                  rgbColor: {
                    red: 0.5,
                    green: 0.5,
                    blue: 0.5,
                  },
                },
              },
              italic: true,
            },
            fields: 'foregroundColor,italic',
          },
        });
      }

      index += item.text.length;
    }

    // Apply the batch update
    const updateResponse = await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${validAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Error updating doc:', errorText);
      throw new Error(`Failed to update Google Doc: ${updateResponse.statusText}`);
    }

    return new Response(
      JSON.stringify({ docUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-google-doc function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});