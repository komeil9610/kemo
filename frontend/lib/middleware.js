export function withAuth(handler) {
  return (req, res) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Missing or invalid authorization header',
        code: 'UNAUTHORIZED',
      });
    }

    req.token = authorization.substring(7);
    return handler(req, res);
  };
}

export function withCors(handler, allowedOrigins = []) {
  return (req, res) => {
    const origin = req.headers.origin || 'http://localhost:3000';
    const allowed = allowedOrigins.length > 0 ? allowedOrigins : ['http://localhost:3000'];

    if (allowed.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Workspace-Role');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    return handler(req, res);
  };
}

export function compose(...middlewares) {
  return (handler) => middlewares.reduceRight((prev, middleware) => middleware(prev), handler);
}