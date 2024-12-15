const axios = require('axios');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// URL halaman saham KSEI (ubah ke halaman target KSEI yang tepat)
const URL = 'https://www.ksei.co.id/saham/price-history'; // Contoh, sesuaikan dengan URL sebenarnya

// Fungsi scraping
const scrapeStockData = async () => {
  try {
    // Ambil halaman HTML
    const { data } = await axios.get(URL);

    // Parsing HTML menggunakan Cheerio
    const $ = cheerio.load(data);

    // Array untuk menyimpan data saham
    const stockData = [];

    // Ekstrak data dari tabel
    $('table tbody tr').each((index, element) => {
      const row = $(element).find('td');

      // Pastikan jumlah kolom sesuai
      if (row.length > 0) {
        const date = $(row[0]).text().trim(); // Tanggal
        const openPrice = $(row[1]).text().trim(); // Harga Buka
        const closePrice = $(row[4]).text().trim(); // Harga Penutupan

        // Tambahkan data ke array
        stockData.push({ date, openPrice, closePrice });
      }
    });

    // Buat file CSV untuk menyimpan data
    const csvWriter = createCsvWriter({
      path: 'ksei_stock_data.csv',
      header: [
        { id: 'date', title: 'Date' },
        { id: 'openPrice', title: 'Open Price' },
        { id: 'closePrice', title: 'Close Price' },
      ],
    });

    // Tulis data ke file CSV
    await csvWriter.writeRecords(stockData);
    console.log('Data saham berhasil disimpan ke ksei_stock_data.csv');
  } catch (error) {
    console.error('Terjadi kesalahan saat scraping:', error.message);
  }
};

// Jalankan scraping
scrapeStockData();
