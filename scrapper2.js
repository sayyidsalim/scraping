const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// URL target
const URL = "http://localhost:8000/"; // Ganti dengan URL Anda

// Fungsi utama scraping
const scrapeDataToCSV = async () => {
  try {
    // Ambil halaman HTML
    const { data } = await axios.get(URL);

    // Load HTML ke cheerio
    const $ = cheerio.load(data);

    // Buat array untuk menyimpan data
    const elements = [];

    // Ambil semua elemen (contoh: tag `div` dengan teks dan atribut)
    $("*").each((index, element) => {
    //   const tag = $(element).prop("tagName"); // Nama tag elemen
      const text = $(element).text().trim(); // Teks di dalam elemen
    //   const attributes = element.attribs; // Semua atribut elemen

      // Tambahkan elemen ke array
      elements.push({
        // tag,
        text,
        // attributes: JSON.stringify(attributes), // Simpan atribut dalam bentuk string
      });
    });

    // Tulis data ke file CSV
    const csvWriter = createCsvWriter({
      path: "elements.csv", // Nama file CSV
      header: [
        // { id: "tag", title: "Tag" },
        { id: "text", title: "Text" },
        // { id: "attributes", title: "Attributes" },
      ],
    });

    await csvWriter.writeRecords(elements);
    console.log("Data berhasil disimpan ke elements.csv");
  } catch (error) {
    console.error("Terjadi kesalahan saat scraping:", error.message);
  }
};

// Jalankan scraping
scrapeDataToCSV();
