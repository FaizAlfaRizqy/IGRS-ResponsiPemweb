# Smart IGRS Analyzer

Smart IGRS Analyzer adalah aplikasi web untuk menentukan rating game berdasarkan **Indonesian Game Rating System (IGRS)**. Aplikasi ini memakai kombinasi **Fuzzy Logic** dan **Expert System** untuk menganalisis konten game seperti kekerasan, horor, bahasa kasar, dan unsur seksual.

## Fitur

- Analisis rating game berbasis IGRS
- Fuzzy logic untuk menghitung tingkat intensitas aspek
- Expert system dengan forward chaining untuk rule-based rating
- Antarmuka web interaktif dengan mode wizard satu aspek per layar
- Hasil akhir rating, skor fuzzy, dan rule yang terpicu

## Struktur Project

```text
smart-igrs-analyzer/
├── app.py                  # Flask main app
├── modules/
│   ├── fuzzy_logic.py      # Fuzzy logic dan defuzzification
│   └── expert_system.py    # Rule-based expert system
├── templates/
│   └── index.html          # UI utama
├── static/
│   ├── css/
│   │   └── style.css       # Styling frontend
│   └── js/
│       └── app.js          # Logika interaktif frontend
├── source/                 # Aset gambar
└── requirements.txt        # Dependency Python
```

## Cara Setup

### 1. Pastikan Python sudah terpasang

Cek versi Python:

```bash
python --version
```

Kalau di Windows dan `python` tidak dikenali, coba:

```bash
py --version
```

### 2. Buat virtual environment

```bash
python -m venv .venv
```

### 3. Aktifkan virtual environment


#### macOS / Linux

```bash
source .venv/bin/activate
```

### 4. Install dependency

```bash
pip install -r requirements.txt
```

## Cara Menjalankan

Setelah dependency terpasang, jalankan aplikasi:

```bash
python app.py
```

Lalu buka di browser:

```text
http://127.0.0.1:5000
```

## Alur Penggunaan

1. Masukkan nama game di halaman awal.
2. Klik tombol **Rate**.
3. Isi tiap aspek satu per satu pada wizard.
4. Gunakan tombol **Next** dan **Prev** untuk berpindah antar aspek.
5. Pada langkah terakhir, klik **Analyze** untuk melihat hasil rating.

## Daftar Rules Expert System

Rules berikut digunakan di [modules/expert_system.py](modules/expert_system.py):

- **R1**: Jika `gore = true` dan `violence_intensity = tinggi` maka rating `18+`
- **R2**: Jika `explicit = true` dan `sexual_intensity >= sedang` maka rating `18+`
- **R3**: Jika `heavy_profanity = true` dan `language_intensity = tinggi` maka rating `15+`
- **R4**: Jika `monster = true` dan `horror_intensity = tinggi` maka rating `15+`
- **R5**: Jika `weapon = true` dan `violence_intensity >= sedang` maka rating `15+`
- **R6**: Jika `jumpscare = true` dan `horror_intensity = sedang` maka rating `13+`
- **R7**: Jika `suggestive = true` dan `sexual_intensity = sedang` maka rating `13+`
- **R8**: Jika `bad_words = true` dan `language_intensity = sedang` maka rating `13+`
- **R9**: Jika `blood = true` dan `violence_intensity = sedang` maka rating `13+`
- **R10**: Jika `disturbing = true` dan `horror_intensity = sedang` maka rating `13+`
- **R11**: Jika ada konten terdeteksi tapi intensitas dominan rendah maka rating `7+`
- **R12**: Jika tidak ada kekerasan, horor, bahasa kasar, dan seksual maka rating `3+`

## Daftar Aspek Fuzzy

Aspek yang diproses oleh fuzzy logic ada di [modules/fuzzy_logic.py](modules/fuzzy_logic.py):

- `violence`
- `horror`
- `language`
- `sexual`

Setiap aspek memiliki membership function:

- `low`: `(0, 0, 4)`
- `medium`: `(2, 5, 8)`
- `high`: `(6, 10, 10)`

## Rating Scale

Rating yang digunakan aplikasi:

- `3+`
- `7+`
- `13+`
- `15+`
- `18+`

## Catatan

- Aplikasi berjalan dengan Flask.
- Aset gambar disimpan di folder `source/`.
- Hasil akhir rating adalah gabungan dari fuzzy rating dan expert system rating.

## Lisensi

Proyek ini digunakan untuk keperluan praktikum dan pengembangan edukasi.
