[readme_pertemuan_5.md](https://github.com/user-attachments/files/33245608/readme_pertemuan_5.md)
# Weather App - Tugas Pemrograman Web (Pertemuan 5)

Repository ini berisi *source code* untuk tugas mata kuliah Pemrograman Web pada pertemuan kelima. Pada proyek kali ini, fokus utama adalah mempelajari dan mengimplementasikan **JavaScript Asynchronous** (Fetch API / `async` & `await`) untuk mengambil data cuaca terkini secara *real-time* dari layanan pihak ketiga (REST API).

## 📝 Deskripsi Proyek

**Weather App** adalah aplikasi berbasis web interaktif yang memungkinkan pengguna untuk memantau kondisi cuaca saat ini berdasarkan nama kota yang dicari. Proyek ini memadukan manipulasi DOM (*Document Object Model*) menggunakan JavaScript murni (Vanilla JS) dengan konsumsi data dari REST API publik (seperti OpenWeatherMap atau WeatherAPI).

## ✨ Fitur Utama

* **Pencarian Kota Real-Time:** Pengguna dapat mengetikkan nama kota di seluruh dunia untuk mendapatkan informasi cuaca terbaru.
* **Informasi Cuaca Lengkap:** Menampilkan suhu (dalam Celsius), kondisi cuaca (Cerah, Hujan, Berawan, dll.), kelembapan (*humidity*), serta kecepatan angin.
* **Ikon Cuaca Dinamis:** Tampilan ikon akan menyesuaikan secara otomatis sesuai dengan kondisi cuaca yang didapatkan dari API.
* **Penanganan Error (Error Handling):** Menampilkan pesan peringatan jika nama kota tidak ditemukan atau terjadi kendala koneksi internet.

## 🛠️ Teknologi yang Digunakan

* **HTML5:** Struktur utama halaman antarmuka.
* **CSS3 / SCSS:** Pengaturan tata letak, gaya visual, dan animasi antarmuka yang responsif.
* **JavaScript (ES6+):** Menangani logika aplikasi, interaksi pengguna, manipulasi DOM, serta proses *asynchronous request* menggunakan Fetch API.
* **Weather REST API:** Penyedia data cuaca secara *real-time*.

## 🚀 Cara Menjalankan Proyek

1. *Clone* repositori ini ke komputer Anda:
   ```bash
   git clone https://github.com/ValdoMilo/TugasPemrogramanWeb-Pertemuan5-WeatherApp-.git
   ```

2. Buka folder proyek di Text Editor pilihan Anda (misalnya **Visual Studio Code**).

3. Jika menggunakan API Key pribadi, pastikan file konfigurasi JavaScript sudah disesuaikan.

4. Buka file `index.html` menggunakan ekstensi **Live Server** di VS Code atau cukup klik ganda file `index.html` untuk menjalankannya langsung di browser.

5. Ketik nama kota pada kolom pencarian dan tekan tombol **Cari** / **Enter**.

## 👨‍💻 Pembuat

* **GitHub:** [@ValdoMilo](https://github.com/ValdoMilo)

*Dibuat untuk memenuhi penugasan mata kuliah Pemrograman Web - Pertemuan 5.*
