import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, channel, ownerName, publishDate, accessToken, campaignName } = await req.json();

    if (!accessToken) {
      throw new Error('Access token is required');
    }

    // Create Google Doc with new title format: YYYY-MM-DD [Title] [Channel]
    const formattedDate = new Date(publishDate).toISOString().split('T')[0];
    const docTitle = `${formattedDate} ${title} [${channel}]`;
    
    // Step 1: Create a new Google Doc
    const createDocResponse = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: docTitle,
      }),
    });

    if (!createDocResponse.ok) {
      const errorText = await createDocResponse.text();
      console.error('Error creating doc:', errorText);
      throw new Error(`Failed to create Google Doc: ${createDocResponse.statusText}`);
    }

    const docData = await createDocResponse.json();
    const docId = docData.documentId;
    const docUrl = `https://docs.google.com/document/d/${docId}/edit`;

    // Step 2: Add content to the document
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
        'Authorization': `Bearer ${accessToken}`,
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
