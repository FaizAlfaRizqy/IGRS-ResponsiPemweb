# Smart IGRS Analyzer - Quick Start Guide

## Struktur Project

```
d:\Praktikum Kecerdasan Buatan\
├── app.py                     # Flask main application
├── run.bat                    # Run script untuk Windows
├── run.sh                     # Run script untuk Linux/Mac
├── requirements.txt           # Python dependencies (Flask, Werkzeug)
├── README.md                  # Full documentation
│
├── modules/                   # Backend logic
│   ├── __init__.py
│   ├── fuzzy_logic.py        # Fuzzy membership functions & inference
│   └── expert_system.py      # Forward chaining rules engine
│
├── templates/                 # Jinja2 templates
│   └── index.html            # Main HTML template
│
└── static/                    # Static files (CSS, JS)
    ├── css/
    │   └── style.css         # Modern dashboard styling
    └── js/
        └── app.js            # Frontend logic & API calls
```

## Quick Start (Windows)

### Cara 1: Double-click run.bat
```
1. Buka folder: d:\Praktikum Kecerdasan Buatan
2. Double-click file: run.bat
3. Tunggu sampai muncul: "Running on http://localhost:5000"
4. Buka browser: http://localhost:5000
```

### Cara 2: Manual (PowerShell)
```powershell
# Navigate to project folder
cd "d:\Praktikum Kecerdasan Buatan"

# Install dependencies (run once)
pip install -r requirements.txt

# Run Flask app
python app.py
```

Browser akan otomatis membuka http://localhost:5000

## Quick Start (Linux/Mac)

```bash
# Navigate to project folder
cd d/Praktikum\ Kecerdasan\ Buatan

# Run script (make executable first)
chmod +x run.sh
./run.sh

# Or manual
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

## Fitur Utama

### 1. ✅ Form Input Konten (Expert System Detection)
- Checkbox untuk Violence, Horror, Language, Sexual Content
- Setiap aspek punya 2-3 item deteksi

### 2. ✅ Conditional Dynamic Input
- Slider intensitas 1-10 hanya muncul jika ada konten yang dicentang
- Otomatis disembunyikan jika tidak ada item yang dipilih

### 3. ✅ Fuzzy Logic Processing
- **Fuzzification**: Konversi intensity (1-10) ke membership degree (0-1)
- **Membership Functions**: Triangular dengan 3 level (low, medium, high)
- **Fuzzy Inference**: Kombinasi membership semua aspek
- **Defuzzification**: Centroid method untuk menghasilkan crisp score (0-100)

### 4. ✅ Expert System (Forward Chaining)
- 12 Production Rules yang mencakup berbagai kombinasi
- Rules trigger berdasarkan content flags + fuzzy labels
- Menghasilkan expert rating (3+, 7+, 13+, 15+, 18+)

### 5. ✅ Final Rating Determination
- Kombinasi max dari fuzzy rating dan expert rating
- Displayed dengan penjelasan alasan

### 6. ✅ Result Analysis Display
- Rating akhir IGRS
- Skor intensitas per aspek
- Derajat keanggotaan fuzzy (low/medium/high per aspek)
- Daftar rules yang terpicu dengan ID dan penjelasan
- Penjelasan lengkap reasoning

### 7. ✅ Modern Responsive UI
- Gradient background animations
- Card-based layout
- Mobile-friendly responsive design
- Smooth transitions dan loading indicator

## API Documentation

### POST /api/analyze

Kirim data input dan terima analisis hasil.

**Request:**
```json
{
  "contentFlags": {
    "blood": true,
    "weapon": false,
    "gore": true,
    "jumpscare": false,
    "monster": true,
    "disturbing": false,
    "bad_words": true,
    "heavy_profanity": false,
    "suggestive": false,
    "explicit": false
  },
  "intensities": {
    "violence": 8,
    "horror": 6,
    "language": 5,
    "sexual": 0
  }
}
```

**Response:**
```json
{
  "finalRating": "18+",
  "fuzzyScore": 68.5,
  "fuzzyRating": "15+",
  "expertRating": "18+",
  "intensities": { ... },
  "allFuzzy": {
    "violence": {"low": 0.0, "medium": 0.2, "high": 0.8},
    "horror": {"low": 0.1, "medium": 0.7, "high": 0.2},
    "language": {"low": 0.3, "medium": 0.6, "high": 0.1},
    "sexual": {"low": 1.0, "medium": 0.0, "high": 0.0}
  },
  "triggeredRules": [
    {
      "id": "R1",
      "text": "IF gore = true AND violence_intensity = tinggi THEN rating = 18+",
      "rating": "18+"
    }
  ],
  "explanation": "Rating akhir 18+ ditetapkan dari kombinasi hasil fuzzy (15+, skor 68.50) dan expert system (18+) dengan 1 rule terpicu."
}
```

## Testing Scenarios

### Test 1: Game Dengan Gore + Violence Tinggi
```
Input:
- Violence: ✓ (blood, weapon, gore)
- Intensity: 9

Expected:
- Rating: 18+ (Rule R1 triggered)
- Fuzzy Score: ~70+
```

### Test 2: Game Tanpa Konten Sensitif
```
Input:
- Semua unchecked

Expected:
- Rating: 3+ (Rule R12 triggered)
- Fuzzy Score: ~2
```

### Test 3: Game Horror Sedang
```
Input:
- Horror: ✓ (jumpscare, monster)
- Intensity: 5

Expected:
- Rating: 13+ (Rule R6 triggered)
- Fuzzy Score: ~35-40
```

## Troubleshooting

### Error: "Python is not installed"
**Solusi**: Install Python 3.8+ dari https://www.python.org (pastikan checklist "Add Python to PATH")

### Error: "ModuleNotFoundError: No module named 'flask'"
**Solusi**: Run `pip install -r requirements.txt`

### Port 5000 sudah digunakan
**Solusi**: Edit app.py baris terakhir:
```python
app.run(debug=True, port=5001)  # ubah ke port lain
```

### Browser tidak bisa akses localhost:5000
**Solusi**: 
1. Pastikan Flask server masih berjalan (lihat terminal)
2. Coba buka http://127.0.0.1:5000
3. Check firewall tidak block port 5000

## File Descriptions

| File | Purpose |
|------|---------|
| `app.py` | Flask main app, routes, API endpoint |
| `modules/fuzzy_logic.py` | Triangular membership, fuzzify, inference, defuzzify |
| `modules/expert_system.py` | Forward chaining dengan 12 production rules |
| `templates/index.html` | Jinja2 HTML template dengan form |
| `static/css/style.css` | Modern dashboard styling |
| `static/js/app.js` | Frontend logic, form handling, API calls |
| `requirements.txt` | Python dependencies |
| `run.bat` | Windows run script |
| `run.sh` | Linux/Mac run script |

## Developer Notes

### Modifying Rules
Edit file `modules/expert_system.py` function `run_expert_system()` untuk tambah/ubah rules.

### Adjusting Fuzzy Parameters
Edit file `modules/fuzzy_logic.py` di dictionary `ASPECTS` untuk ubah membership function parameters.

### Changing UI
Edit `templates/index.html` (HTML structure) dan `static/css/style.css` (styling).

### API Response Format
Edit `app.py` function `analyze_igrs()` untuk ubah response format jika diperlukan.

---

**Ready to analyze! Start with `run.bat` (Windows) atau `run.sh` (Linux/Mac)** 🚀
