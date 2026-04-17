import { buildCorsHeaders, successResponse, errorResponse } from '@/lib/apiUtils';

export default function handler(req, res) {
  const corsHeaders = buildCorsHeaders(req.headers.origin || 'http://localhost:3000');

  res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
  res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Return products
    return res.status(200).json(
      successResponse('Products retrieved', {
        products: [],
      })
    );
  }

  if (req.method === 'POST') {
    // Create product
    return res.status(201).json(
      successResponse('Product created', {
        productId: 'product_id_placeholder',
      })
    );
  }

  res.status(405).end();
}