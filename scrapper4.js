const puppeteer = require("puppeteer");

(async () => {
  // Meluncurkan browser dan membuka tab baru
  const browser = await puppeteer.launch({ headless: false }); // Menjalankan dengan UI untuk melihat proses (headless: true untuk mode tanpa UI)
  const page = await browser.newPage();

  // Pergi ke halaman URL IDX
  await page.goto(
    "https://www.idx.co.id/id/data-pasar/ringkasan-perdagangan/ringkasan-saham",
    {
      waitUntil: "domcontentloaded", // Tunggu sampai konten dimuat
    }
  );

  // Tunggu sampai tabel atau elemen yang diperlukan tersedia
  await page.waitForSelector("table"); // Sesuaikan dengan elemen yang ingin diambil

  // Ambil data dari halaman setelah rendering
  const stockData = await page.evaluate(() => {
    const rows = document.querySelectorAll("table tbody tr");
    const data = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      data.push({
        date: cells[0].innerText.trim(),
        volume: cells[1].innerText.trim(),
        value: cells[2].innerText.trim(),
        transaction: cells[3].innerText.trim(),
      });
    });

    return data;
  });

  console.log(stockData); // Menampilkan data yang telah diambil

  // Jika ingin menyimpan ke CSV
  const fs = require("fs");
  const createCsvWriter = require("csv-writer").createObjectCsvWriter;

  const csvWriter = createCsvWriter({
    path: "stock_data_idx.csv",
    header: [
      { id: "date", title: "Date" },
      { id: "volume", title: "Volume" },
      { id: "value", title: "Value" },
      { id: "transaction", title: "Transaction" },
    ],
  });

  await csvWriter.writeRecords(stockData);
  console.log("Data berhasil disimpan ke stock_data_idx.csv");

  // Tutup browser setelah selesai
  await browser.close();
})();
