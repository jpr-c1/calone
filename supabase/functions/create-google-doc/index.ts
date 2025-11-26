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
    const { title, description, channel, ownerName, publishDate, accessToken } = await req.json();

    if (!accessToken) {
      throw new Error('Access token is required');
    }

    // Create Google Doc
    const docTitle = `[${channel}] - ${title}`;
    
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
      { text: 'Content Brief\n', style: 'HEADING_1' },
      { text: '\n' },
      { text: 'Title\n', style: 'HEADING_2' },
      { text: `${title}\n\n` },
      { text: 'Description\n', style: 'HEADING_2' },
      { text: `${description}\n\n` },
      { text: 'Channel\n', style: 'HEADING_2' },
      { text: `${channel}\n\n` },
      { text: 'Owner\n', style: 'HEADING_2' },
      { text: `${ownerName}\n\n` },
      { text: 'Publish Date\n', style: 'HEADING_2' },
      { text: `${publishDate}\n\n` },
      { text: 'Key Messages\n', style: 'HEADING_2' },
      { text: '\n\n\n' },
      { text: 'Target Audience\n', style: 'HEADING_2' },
      { text: '\n\n\n' },
      { text: 'Call to Action\n', style: 'HEADING_2' },
      { text: '\n\n\n' },
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

      // Apply style if specified
      if (item.style) {
        const endIndex = index + item.text.length;
        requests.push({
          updateParagraphStyle: {
            range: {
              startIndex: index,
              endIndex: endIndex,
            },
            paragraphStyle: {
              namedStyleType: item.style,
            },
            fields: 'namedStyleType',
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
