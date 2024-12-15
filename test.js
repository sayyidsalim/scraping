const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://www.idx.co.id/id/data-pasar/ringkasan-perdagangan/ringkasan-saham';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'max-age=0',
};

// Mendapatkan cookies pertama
const getCookies = async () => {
  try {
    const response = await axios.get(URL, { headers });
    console.log('Cookies:', response.headers['set-cookie']);
    return response.headers['set-cookie'];
  } catch (error) {
    console.error('Error fetching cookies:', error.message);
  }
};

// Menggunakan cookies untuk permintaan berikutnya
const fetchDataWithCookies = async (cookies) => {
  try {
    const response = await axios.get(URL, {
      headers: {
        ...headers,
        'Cookie': cookies.join('; '),
      },
    });
    const $ = cheerio.load(response.data);
    console.log('Data berhasil diambil');
    // Proses data lebih lanjut di sini
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil data:', error.message);
  }
};

(async () => {
  const cookies = await getCookies();
  if (cookies) {
    await fetchDataWithCookies(cookies);
  }
})();
