const puppeteer = require('puppeteer');

module.exports = async function handler(req, res) {
  const url = 'https://www.rtve.es/play/videos/directo/informativos/24h/';
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    let streamUrl = null;

    page.on('response', async (response) => {
      const responseUrl = response.url();
      if (responseUrl.includes('.m3u8') && !streamUrl) {
        streamUrl = responseUrl;
      }
    });

    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(10000);
    await browser.close();

    if (streamUrl) {
      res.status(200).json({ stream_url: streamUrl });
    } else {
      res.status(404).json({ error: "No se encontró la señal" });
    }
  } catch (error) {
    if (browser) await browser.close();
    res.status(500).json({ error: error.message });
  }
}
