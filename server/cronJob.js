const cron = require('node-cron');
const axios = require('axios');

const BACKEND_URL = 'https://s89-madhukiran-fashionmerge.onrender.com';
const HEALTH_ENDPOINT = `${BACKEND_URL}/health`;

cron.schedule('*/7 * * * *', async () => {
  try {
    const startTime = Date.now();
    const res = await axios.get(HEALTH_ENDPOINT, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Fashion-Merge-KeepAlive/1.0'
      }
    });
    const responseTime = Date.now() - startTime;

    console.log(`✅ Keep-alive ping successful: ${res.status} (${responseTime}ms)`);

    // Log additional health info if available
    if (res.data && res.data.uptime) {
      console.log(`   Server uptime: ${Math.floor(res.data.uptime / 60)} minutes`);
    }
  } catch (err) {
    console.error(`❌ Keep-alive ping failed: ${err.message}`);

    // Try fallback to root endpoint if health endpoint fails
    try {
      const fallbackRes = await axios.get(BACKEND_URL, { timeout: 5000 });
      console.log(`✅ Fallback ping successful: ${fallbackRes.status}`);
    } catch (fallbackErr) {
      console.error(`❌ Fallback ping also failed: ${fallbackErr.message}`);
    }
  }
});

console.log('Cron job started to keep the server awake every 7 minutes');
console.log(`Health check endpoint: ${HEALTH_ENDPOINT}`);