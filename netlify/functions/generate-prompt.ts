import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

// Initialize OpenAI with error handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

export const handler: Handler = async (event) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }
console.error('Generate prompt error:', error);
  
  // Validate request method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Validate API key first
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key missing');
      throw new Error('OpenAI API key is not configured');
    }

    // Parse and validate request body
    if (!event.body) {
      console.error('Missing request body');
      throw new Error('Request body is required');
    }

    let donorData;
    try {
      const parsedBody = JSON.parse(event.body);
      donorData = parsedBody.donorData;
    } catch (e) {
      console.error('Failed to parse request body:', e);
      throw new Error('Invalid request format');
    }

    if (!donorData) {
      console.error('Missing donor data');
      throw new Error('Donor data is required');
    }

    // Format currency values
    const formatCurrency = (value: string) => {
      if (!value) return '$0';
      return value.startsWith('$') ? value : `$${value}`;
    };

    // Generate system prompt
    const systemPrompt = `You are an expert fundraising consultant analyzing donor data. 
    Focus on identifying key opportunities, wealth indicators, and engagement patterns. 
    Provide strategic recommendations based on the donor's profile.
    Format your response in clear sections with bullet points for easy reading.`;

    // Generate user prompt from donor data
    const userPrompt = `Please analyze this donor:
    - Name: ${donorData['First Name']} ${donorData['Last Name']}
    - Estimated Capacity: ${formatCurrency(donorData['Estimated Capacity'])}
    - Total Giving: ${formatCurrency(donorData['Total Gift Amount'])}
    - Last Gift: ${formatCurrency(donorData['Last Gift Amount'])} (${donorData['Last Gift Date'] || 'No date'})
    - Annual Fund Likelihood: ${donorData['Annual Fund Likelihood']}%
    - Major Gift Likelihood: ${donorData['Major Gift Likelihood']}%
    - Business Revenue: ${formatCurrency(donorData['Business Revenue'])}
    - Real Estate Value: ${formatCurrency(donorData['Real Estate Est'])}
    - Number of Properties: ${donorData['# Of Prop']}
    - Total Philanthropic Giving: ${formatCurrency(donorData['Philanthropy and Grantmaking Total'])}
    - Education Giving: ${formatCurrency(donorData['Education Gift Amount'])}
    
    Provide a strategic analysis including:
    1. Wealth Capacity Assessment
    2. Giving History Analysis
    3. Engagement Opportunities
    4. Specific Recommendations for Next Steps`;

    console.log('Sending request to OpenAI with prompts:', {
      systemPrompt,
      userPrompt: userPrompt.substring(0, 100) + '...' // Log truncated for brevity
    });

    // Call OpenAI API with timeout and error handling
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API request timed out')), 60000);
    });

    const completionPromise = openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    console.log('Waiting for OpenAI response...');
    
    const completion = await Promise.race([completionPromise, timeoutPromise]) as OpenAI.Chat.ChatCompletion;

    // Log successful response
    console.log('Received OpenAI response:', {
      status: 'success',
      tokens: completion.usage,
      modelUsed: completion.model,
      responseLength: completion.choices[0]?.message?.content?.length || 0
    });

    // Validate OpenAI response
    if (!completion?.choices?.[0]?.message?.content) {
      console.error('Invalid response from OpenAI:', JSON.stringify(completion, null, 2));
      throw new Error('Failed to generate analysis');
    }

    // Return successful response
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        analysis: completion.choices[0].message.content
      })
    };
  } catch (error) {
    // Enhanced error logging
    console.error('Generate prompt error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });

    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error details:', {
        status: error.status,
        headers: error.headers,
        error: error.error,
        type: error.type,
      });
    }
    
    let statusCode = 500;
    let errorMessage = 'An unexpected error occurred';
    let errorDetails = null;

    if (error instanceof Error) {
      // Map specific error types to appropriate status codes and messages
      if (error.message.includes('Request body') || error.message.includes('Invalid request')) {
        statusCode = 400;
        errorMessage = error.message;
      } else if (error.message.includes('API key')) {
        statusCode = 500;
        errorMessage = 'API configuration error';
      } else if (error.message.includes('timed out')) {
        statusCode = 504;
        errorMessage = 'Analysis generation timed out - please try again';
      } else if (error.message.includes('rate limit')) {
        statusCode = 429;
        errorMessage = 'Too many requests - please try again later';
      } else if (error instanceof OpenAI.APIError) {
        statusCode = error.status || 500;
        errorMessage = 'OpenAI API error';
        errorDetails = {
          type: error.type,
          code: error.code,
          param: error.param,
        };
      } else {
        errorMessage = 'Failed to generate analysis - please try again';
      }

      // Log the final error response being sent
      console.error('Sending error response:', {
        statusCode,
        errorMessage,
        errorDetails: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      });
    }
    
    return {
      statusCode,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      })
    };
  }
};