import jwt from 'jsonwebtoken';

export function buildCorsHeaders(origin) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
  const isAllowed = allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Workspace-Role',
    'Access-Control-Max-Age': '86400',
  };
}

export function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

export function createResponse(status, data) {
  return {
    status,
    ...data,
  };
}

export function errorResponse(message, code = 'ERROR') {
  return createResponse('error', {
    message,
    code,
  });
}

export function successResponse(message, data = null) {
  return createResponse('success', {
    message,
    ...(data && { data }),
  });
}