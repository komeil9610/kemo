import { buildCorsHeaders, successResponse, errorResponse, verifyToken } from '@/lib/apiUtils';

export default function handler(req, res) {
  const corsHeaders = buildCorsHeaders(req.headers.origin || 'http://localhost:3000');

  res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = verifyToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json(errorResponse('Unauthorized', 'UNAUTHORIZED'));
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    // Get specific order
    return res.status(200).json(
      successResponse('Order retrieved', {
        orderId: id,
        status: 'pending',
      })
    );
  }

  if (req.method === 'PUT') {
    // Update order
    return res.status(200).json(
      successResponse('Order updated', {
        orderId: id,
      })
    );
  }

  if (req.method === 'DELETE') {
    // Delete order
    return res.status(200).json(
      successResponse('Order deleted')
    );
  }

  res.status(405).end();
}