const puppeteer = require('puppeteer');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // Lihat tampilan browser
  const page = await browser.newPage();

  // Pergi ke halaman data saham IDX
  await page.goto('https://www.idx.co.id/id/data-pasar/ringkasan-perdagangan/ringkasan-saham', {
    waitUntil: 'domcontentloaded',
  });

  // Tunggu tabel muncul, menunggu konten yang lebih stabil muncul sebelum input tanggal
  await page.waitForSelector('table', { timeout: 60000 });

  // Tunggu input tanggal muncul
  await page.waitForSelector('input[name="date"]', { timeout: 60000 });

  // Ambil tahun saat ini
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 10; // 10 tahun terakhir

  // Siapkan csv writer untuk menyimpan data
  const csvWriter = createCsvWriter({
    path: 'stock_data_10_years.csv',
    header: [
      { id: 'kode_saham', title: 'Kode Saham' },
      { id: 'tertinggi', title: 'Tertinggi' },
      { id: 'terendah', title: 'Terendah' },
      { id: 'penutupan', title: 'Penutupan' },
      { id: 'selisih', title: 'Selisih' },
      { id: 'volume', title: 'Volume' },
      { id: 'nilai', title: 'Nilai' },
      { id: 'frekuensi', title: 'Frekuensi' },
    ],
  });

  // Loop untuk mengambil data dari 10 tahun terakhir
  for (let year = startYear; year <= currentYear; year++) {
    console.log(`Mengambil data untuk tahun: ${year}`);

    // Pilih tahun pada input tanggal
    const date = `${year}-01-01`; // Menggunakan tanggal pertama tiap tahun (YYYY-MM-DD)
    await page.type('input[name="date"]', date, { delay: 100 }); // Mengisi input tanggal

    // Tunggu hingga data tahun tersebut dimuat
    await page.waitForSelector('table'); // Tunggu hingga tabel muncul

    // Ambil data dari tabel
    const stockData = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      const data = [];

      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");

        // Pastikan jumlah sel sama dengan yang diharapkan
        if (cells.length === 8) {
          data.push({
            kode_saham: cells[0].innerText.trim(),
            tertinggi: cells[1].innerText.trim(),
            terendah: cells[2].innerText.trim(),
            penutupan: cells[3].innerText.trim(),
            selisih: cells[4].innerText.trim(),
            volume: cells[5].innerText.trim(),
            nilai: cells[6].innerText.trim(),
            frekuensi: cells[7].innerText.trim(),
          });
        }
      });

      return data;
    });

    // Simpan data dari tahun ini ke file CSV
    if (stockData.length > 0) {
      await csvWriter.writeRecords(stockData);
      console.log(`Data tahun ${year} berhasil disimpan ke CSV`);
    } else {
      console.log(`Tidak ada data untuk tahun ${year}`);
    }
  }

  // Tutup browser setelah selesai
  await browser.close();
})();
