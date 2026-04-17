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

  if (req.method === 'POST') {
    // Handle Excel import
    const { file } = req.body;

    if (!file) {
      return res.status(400).json(
        errorResponse('File is required', 'MISSING_FILE')
      );
    }

    // TODO: Process Excel file, parse data, validate
    return res.status(200).json(
      successResponse('Excel preview generated', {
        preview: [],
        rowCount: 0,
        issues: [],
      })
    );
  }

  res.status(405).end();
}