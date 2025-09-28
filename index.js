const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Google Sheets setup
let auth;
let sheets;

const initializeGoogleSheets = async () => {
  try {
    // Initialize Google Sheets API with service account
    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL
    };

    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    sheets = google.sheets({ version: 'v4', auth });
    console.log('Google Sheets API initialized successfully');
  } catch (error) {
    console.error('Error initializing Google Sheets API:', error);
  }
};

// Initialize Google Sheets on server start
initializeGoogleSheets();

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Wedding API is running!',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /',
      docs: 'GET /api/docs',
      submit: 'POST /api/submit',
      read: 'GET /api/read/:sheetId'
    }
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'My Wedding API Documentation',
    version: '1.0.0',
    description: 'Node.js Express API for Google Sheets integration',
    endpoints: [
      {
        method: 'GET',
        path: '/',
        description: 'Health check and basic API information'
      },
      {
        method: 'POST',
        path: '/api/submit',
        description: 'Submit data to Google Sheets',
        body: {
          data: 'Array, Object, or String - Data to insert',
          sheetId: 'String - Google Sheets ID (required)',
          range: 'String - Sheet range (optional, default: Sheet1!A:Z)'
        },
        example: {
          data: ['John Doe', 'john@example.com', 'Hello World'],
          sheetId: '1ABC123def456GHI789jkl',
          range: 'Sheet1!A:C'
        }
      },
      {
        method: 'GET',
        path: '/api/read/:sheetId',
        description: 'Read data from Google Sheets',
        parameters: {
          sheetId: 'String - Google Sheets ID (required)',
          range: 'String - Sheet range (query parameter, optional)'
        },
        example: '/api/read/1ABC123def456GHI789jkl?range=Sheet1!A:C'
      }
    ],
    setup: 'See README.md for complete setup instructions'
  });
});

// API endpoint to write data to Google Sheets
app.post('/api/submit', async (req, res) => {
  try {
    const { data, sheetId, range } = req.body;

    // Validate required fields
    if (!data || !sheetId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide data and sheetId'
      });
    }

    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets API not initialized',
        message: 'Please check server configuration'
      });
    }

    // Prepare data for insertion
    let values;
    if (Array.isArray(data)) {
      values = data;
    } else if (typeof data === 'object') {
      values = [Object.values(data)];
    } else {
      values = [[data]];
    }

    // Default range if not provided
    const targetRange = range || 'Sheet1!A:Z';

    // Insert data into Google Sheets
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: targetRange,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: values
      }
    });

    res.json({
      success: true,
      message: 'Data successfully written to Google Sheets',
      updatedRows: response.data.updates.updatedRows,
      updatedRange: response.data.updates.updatedRange
    });

  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
    res.status(500).json({
      error: 'Failed to write to Google Sheets',
      message: error.message
    });
  }
});

// API endpoint to read data from Google Sheets
app.get('/api/read/:sheetId', async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { range } = req.query;

    if (!sheetId) {
      return res.status(400).json({
        error: 'Missing sheetId parameter'
      });
    }

    if (!sheets) {
      return res.status(500).json({
        error: 'Google Sheets API not initialized',
        message: 'Please check server configuration'
      });
    }

    const targetRange = range || 'Sheet1!A:Z';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: targetRange
    });

    res.json({
      success: true,
      data: response.data.values || [],
      range: response.data.range
    });

  } catch (error) {
    console.error('Error reading from Google Sheets:', error);
    res.status(500).json({
      error: 'Failed to read from Google Sheets',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

app.listen(port, () => {
  console.log(`Wedding API server running on port ${port}`);
});

module.exports = app;