export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      message: "ok",
      service: "tarkeeb-pro-next-api",
      date: new Date().toISOString(),
    });
  } else {
    res.status(405).end();
  }
}