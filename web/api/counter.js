import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  if (req.method === 'POST') {
    const count = await redis.incr('addresses_generated');
    return res.json({ count });
  }

  const count = (await redis.get('addresses_generated')) || 0;
  return res.json({ count });
}
