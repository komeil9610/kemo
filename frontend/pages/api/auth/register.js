import { buildCorsHeaders, successResponse, errorResponse } from '@/lib/apiUtils';

export default function handler(req, res) {
  const corsHeaders = buildCorsHeaders(req.headers.origin || 'http://localhost:3000');

  res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    // Handle registration
    // TODO: Implement user registration with email validation
    return res.status(200).json(
      successResponse('User registered successfully', {
        userId: 'placeholder',
      })
    );
  }

  res.status(405).end();
}