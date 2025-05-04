import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Validate OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY || OPENAI_API_KEY.trim() === '') {
  console.error('ERROR: OpenAI API key is not configured!');
  console.error('Please set the OPENAI_API_KEY environment variable.');
}

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ 
      error: 'OpenAI API key is not configured. Please check server configuration.' 
    });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant specializing in donor management and fundraising strategy. Provide concise, practical advice based on donor data and fundraising best practices.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API');
    }

    res.json({ 
      message: completion.choices[0].message.content 
    });
  } catch (error) {
  console.error('OpenAI API Error:', error);

  if (error.response) {
    console.error('Error response data:', error.response.data);
    res.status(error.response.status).json({
      error: error.response.data.error.message || 'Unknown error from OpenAI API'
    });
  } else {
    res.status(500).json({ error: error.message || 'Failed to get response from OpenAI' });
  }
}

    
    res.status(500).json({ 
      error: 'An error occurred while processing your request. Please try again later.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    apiKey: OPENAI_API_KEY ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  });
});

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`OpenAI API Key status: ${OPENAI_API_KEY ? 'configured' : 'missing'}`);
  console.log(`Server time: ${new Date().toISOString()}`);
});