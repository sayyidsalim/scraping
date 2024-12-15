const puppeteer = require("puppeteer");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // Headless false untuk debugging
  const page = await browser.newPage();

  // Pergi ke halaman data saham IDX
  await page.goto(
    "https://www.idx.co.id/id/data-pasar/ringkasan-perdagangan/ringkasan-saham",
    {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    }
  );

  // Tunggu input tanggal muncul
  await page.waitForSelector('input[name="date"]', { timeout: 60000 });

  // Siapkan writer CSV
  const csvWriter = createCsvWriter({
    path: "stock_data_full.csv",
    header: [
      { id: "tanggal", title: "Tanggal" },
      { id: "kode_saham", title: "Kode Saham" },
      { id: "tertinggi", title: "Tertinggi" },
      { id: "terendah", title: "Terendah" },
      { id: "penutupan", title: "Penutupan" },
      { id: "selisih", title: "Selisih" },
      { id: "volume", title: "Volume" },
      { id: "nilai", title: "Nilai" },
      { id: "frekuensi", title: "Frekuensi" },
    ],
  });

  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 10); // 10 tahun lalu
  const endDate = new Date();

  console.log(
    `Mengambil data dari ${startDate.toISOString().split("T")[0]} hingga ${
      endDate.toISOString().split("T")[0]
    }`
  );

  const scrapeDataForDate = async (currentDate) => {
    const formattedDate = currentDate.toISOString().split("T")[0];
    console.log(`Mengambil data untuk tanggal: ${formattedDate}`);

    try {
      // Isi input tanggal
      await page.evaluate((date) => {
        const dateInput = document.querySelector('input[name="date"]');
        dateInput.value = date;
        dateInput.dispatchEvent(new Event("change", { bubbles: true }));
      }, formattedDate);

      // Tunggu hingga data pertama dimuat
      await page.waitForSelector("table tbody tr", { timeout: 60000 });

      // Pilih opsi "All" pada dropdown pagination
      // Ganti sesuai dengan selector dropdown di halaman
      await page.select('select[name="perPageSelect"]', '-1'); // Pilih "All"
 // Pastikan nilai "All" sesuai dengan opsi sebenarnya

      // Tunggu hingga semua data dimuat
      await page.waitForFunction(
        () => {
          const rows = document.querySelectorAll("table tbody tr");
          return rows.length > 50; // Pastikan data lebih dari satu halaman dimuat
        },
        { timeout: 60000 }
      );

      // Ambil semua data dari tabel
      const allData = await page.evaluate((date) => {
        const rows = document.querySelectorAll("table tbody tr");
        const data = [];

        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (cells.length === 8) {
            data.push({
              tanggal: date,
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
      }, formattedDate);

      console.log(
        `Data untuk ${formattedDate} berhasil diambil (${allData.length} entri).`
      );
      return allData;
    } catch (error) {
      console.error(
        `Gagal mengambil data untuk ${formattedDate}: ${error.message}`
      );
      return [];
    }
  };

  const allData = [];
  const dateIterator = new Date(startDate);

  while (dateIterator <= endDate) {
    const dailyData = await scrapeDataForDate(dateIterator);

    if (dailyData.length > 0) {
      allData.push(...dailyData);
    }

    dateIterator.setDate(dateIterator.getDate() + 1);
  }

  // Simpan semua data ke file CSV
  if (allData.length > 0) {
    await csvWriter.writeRecords(allData);
    console.log("Data berhasil disimpan ke file stock_data_full.csv");
  } else {
    console.log("Tidak ada data yang diambil.");
  }

  await browser.close();
})();
