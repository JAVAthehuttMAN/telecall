// Vercel Serverless Function: ブラウザ→GAS の中継役。
// ブラウザから直接GASを叩くと CORS / 302リダイレクト / 404 で落ちるため、
// 同一オリジン(/api/gas)で受けて、サーバー間でGASへ転送する（これらの制約が無い）。
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzMXEXjSxGjROu0dv8WhEy8DcaRmGpwNUMvn-4LSmmP1F10ENgDiCVe3r9Ke4W1oMi0JQ/exec';
 
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
      const r = await fetch(GAS_URL + qs, { method: 'GET', redirect: 'follow' });
      const text = await r.text();
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(r.ok ? 200 : r.status).send(text);
      return;
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body || {});
      const r = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body,
        redirect: 'follow',
      });
      const text = await r.text();
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(r.ok ? 200 : r.status).send(text);
      return;
    }
    res.status(405).json({ ok: false, error: 'method not allowed' });
  } catch (err) {
    res.status(502).json({ ok: false, error: 'proxy error: ' + String(err) });
  }
}
 
