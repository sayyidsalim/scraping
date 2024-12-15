const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const URL =
  "https://www.idx.co.id/id/data-pasar/ringkasan-perdagangan/ringkasan-saham"; // Ganti dengan URL yang ingin discrape

// Fungsi utama scraping
const scrapeData = async () => {
  try {
    // Ambil halaman HTML
    const { data } = await axios.get(URL);

    // Load HTML ke cheerio
    const $ = cheerio.load(data);

    // Ekstrak data (contoh: judul artikel)
    const articles = [];
    $("table").each((index, element) => {
      const title = $(element).text().trim();
      articles.push({ title });
    });

    console.log("Hasil scraping:", articles);
    fs.writeFileSync("articles.json", JSON.stringify(articles, null, 2));
    console.log("Data berhasil disimpan ke articles.json");
  } catch (error) {
    console.error("Terjadi kesalahan saat scraping:", error.message);
  }
};

// Jalankan scraping
scrapeData();
