/**
 * Smart IGRS Analyzer - Frontend JavaScript
 */

const homePage = document.getElementById('home-page');
const aspectPage = document.getElementById('aspect-page');
const resultPage = document.getElementById('result-page');

const gameSearchForm = document.getElementById('game-search-form');
const gameNameInput = document.getElementById('game-name');
const aspectHeading = document.getElementById('aspect-heading');

const form = document.getElementById('analyzer-form');
const backBtn = document.getElementById('back-btn');
const analyzeBtn = document.getElementById('analyze-btn');
const loadingEl = document.getElementById('loading');

const violenceSlider = document.getElementById('violence-intensity');
const violenceValue = document.getElementById('violence-intensity-value');
const navLinks = document.querySelectorAll('[data-nav]');

setupEvents();
showPage('home');

function setupEvents() {
  if (violenceSlider && violenceValue) {
    violenceSlider.addEventListener('input', () => {
      violenceValue.textContent = violenceSlider.value;
    });
  }

  if (gameSearchForm) {
    gameSearchForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const gameName = gameNameInput ? gameNameInput.value.trim() : '';
      if (gameName && aspectHeading) {
        aspectHeading.textContent = `Kekerasan - ${gameName}`;
      } else if (aspectHeading) {
        aspectHeading.textContent = 'Kekerasan';
      }

      showPage('aspect');
    });
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      await handleSubmit();
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      showPage('aspect');
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = link.getAttribute('data-nav');
      if (target === 'home') {
        showPage('home');
      }
      if (target === 'aspect') {
        showPage('aspect');
      }
    });
  });
}

function showPage(page) {
  homePage.classList.toggle('hidden', page !== 'home');
  aspectPage.classList.toggle('hidden', page !== 'aspect');
  resultPage.classList.toggle('hidden', page !== 'result');
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function collectInput() {
  const contentFlags = {
    blood: false,
    weapon: false,
    gore: false,
    jumpscare: false,
    monster: false,
    disturbing: false,
    bad_words: false,
    heavy_profanity: false,
    suggestive: false,
    explicit: false
  };

  const selected = Array.from(document.querySelectorAll('input[name="violence"]:checked'));
  selected.forEach((item) => {
    contentFlags[item.value] = true;
  });

  const intensities = {
    violence: selected.length > 0 ? Number(violenceSlider.value) : 0,
    horror: 0,
    language: 0,
    sexual: 0
  };

  return { contentFlags, intensities };
}

async function handleSubmit() {
  try {
    const payload = collectInput();

    analyzeBtn.disabled = true;
    loadingEl.classList.remove('hidden');

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    renderResult(result);
    showPage('result');
  } catch (error) {
    console.error('Error:', error);
    alert('Error analyzing game rating: ' + error.message);
  } finally {
    analyzeBtn.disabled = false;
    loadingEl.classList.add('hidden');
  }
}

function renderResult(result) {
  const finalRatingEl = document.getElementById('final-rating');
  const explanationEl = document.getElementById('result-explanation');
  const aspectScoresEl = document.getElementById('aspect-scores');
  const rulesEl = document.getElementById('triggered-rules');
  const membershipsEl = document.getElementById('fuzzy-memberships');

  finalRatingEl.textContent = result.finalRating;
  explanationEl.textContent = result.explanation;

  aspectScoresEl.innerHTML = '';
  const aspectLabels = {
    violence: 'Violence',
    horror: 'Horror',
    language: 'Language',
    sexual: 'Sexual Content'
  };

  Object.entries(result.intensities).forEach(([key, value]) => {
    const li = document.createElement('li');
    li.textContent = `${aspectLabels[key]}: ${value}/10`;
    aspectScoresEl.appendChild(li);
  });

  membershipsEl.innerHTML = '';
  Object.entries(result.allFuzzy).forEach(([aspectKey, degrees]) => {
    const box = document.createElement('div');
    box.className = 'membership-item';
    box.textContent = (
      `${aspectLabels[aspectKey]} -> rendah: ${degrees.low.toFixed(3)}, ` +
      `sedang: ${degrees.medium.toFixed(3)}, tinggi: ${degrees.high.toFixed(3)}`
    );
    membershipsEl.appendChild(box);
  });

  const summary = document.createElement('div');
  summary.className = 'membership-item';
  summary.style.marginTop = '4px';
  summary.style.fontWeight = '600';
  summary.textContent = (
    `Fuzzy Score: ${result.fuzzyScore.toFixed(2)} | ` +
    `Fuzzy Rating: ${result.fuzzyRating} | Expert Rating: ${result.expertRating}`
  );
  membershipsEl.appendChild(summary);

  rulesEl.innerHTML = '';
  if (result.triggeredRules.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Tidak ada rule spesifik terpicu.';
    rulesEl.appendChild(li);
  } else {
    result.triggeredRules.forEach((rule) => {
      const li = document.createElement('li');
      li.textContent = `${rule.id}: ${rule.text}`;
      rulesEl.appendChild(li);
    });
  }
}
