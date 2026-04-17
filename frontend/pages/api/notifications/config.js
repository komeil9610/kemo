import { buildCorsHeaders, successResponse, errorResponse } from '@/lib/apiUtils';

export default function handler(req, res) {
  const corsHeaders = buildCorsHeaders(req.headers.origin || 'http://localhost:3000');

  res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    // Get push notification configuration
    return res.status(200).json(
      successResponse('Push config retrieved', {
        publicKey: process.env.WEB_PUSH_PUBLIC_KEY || '',
      })
    );
  }

  res.status(405).end();
}