import { buildCorsHeaders, successResponse, errorResponse, verifyToken } from '@/lib/apiUtils';

export default function handler(req, res) {
  const corsHeaders = buildCorsHeaders(req.headers.origin || 'http://localhost:3000');

  res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    // Handle login
    // TODO: Implement user login with JWT token generation
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(
        errorResponse('Email and password are required', 'MISSING_FIELDS')
      );
    }

    return res.status(200).json(
      successResponse('User logged in successfully', {
        token: 'jwt_token_placeholder',
        user: {
          id: 'user_id',
          email,
          role: 'customer',
        },
      })
    );
  }

  res.status(405).end();
}