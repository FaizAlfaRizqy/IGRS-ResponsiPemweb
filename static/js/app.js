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
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const loadingEl = document.getElementById('loading');

const ASPECT_CONFIG = {
  violence: {
    intensityId: 'violence-intensity',
    wrapId: 'violence-intensity-wrap',
    valueId: 'violence-intensity-value'
  },
  horror: {
    intensityId: 'horror-intensity',
    wrapId: 'horror-intensity-wrap',
    valueId: 'horror-intensity-value'
  },
  language: {
    intensityId: 'language-intensity',
    wrapId: 'language-intensity-wrap',
    valueId: 'language-intensity-value'
  },
  sexual: {
    intensityId: 'sexual-intensity',
    wrapId: 'sexual-intensity-wrap',
    valueId: 'sexual-intensity-value'
  }
};

const navLinks = document.querySelectorAll('[data-nav]');
const aspectOrder = ['violence', 'horror', 'language', 'sexual'];
const aspectLabels = {
  violence: 'Kekerasan',
  horror: 'Horor',
  language: 'Bahasa',
  sexual: 'Seksual'
};

let currentAspectIndex = 0;

setupEvents();
showPage('home');
setupConditionalInputs();
renderCurrentAspect();

function setupEvents() {
  if (gameSearchForm) {
    gameSearchForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const gameName = gameNameInput ? gameNameInput.value.trim() : '';
      currentAspectIndex = 0;
      if (gameName && aspectHeading) {
        aspectHeading.textContent = `Kekerasan - ${gameName}`;
      } else if (aspectHeading) {
        aspectHeading.textContent = 'Kekerasan';
      }

      showPage('aspect');
      renderCurrentAspect();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', async () => {
      const isLastStep = currentAspectIndex === aspectOrder.length - 1;

      if (isLastStep) {
        await handleSubmit();
        return;
      }

      currentAspectIndex += 1;
      renderCurrentAspect();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentAspectIndex === 0) {
        return;
      }

      currentAspectIndex -= 1;
      renderCurrentAspect();
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
        currentAspectIndex = 0;
        renderCurrentAspect();
        showPage('aspect');
      }
    });
  });
}

function renderCurrentAspect() {
  const aspectCards = document.querySelectorAll('.aspect-card');
  const currentAspectKey = aspectOrder[currentAspectIndex];

  aspectCards.forEach((card) => {
    const isCurrent = card.getAttribute('data-aspect') === currentAspectKey;
    card.classList.toggle('step-hidden', !isCurrent);
  });

  if (aspectHeading) {
    aspectHeading.textContent = aspectLabels[currentAspectKey] || 'Kekerasan';
  }

  if (nextBtn) {
    nextBtn.textContent = currentAspectIndex === aspectOrder.length - 1 ? 'Analyze' : 'Next';
  }

  if (prevBtn) {
    prevBtn.disabled = currentAspectIndex === 0;
  }
}

function setupConditionalInputs() {
  Object.entries(ASPECT_CONFIG).forEach(([aspectKey, config]) => {
    const checks = document.querySelectorAll(`input[name="${aspectKey}"]`);
    const slider = document.getElementById(config.intensityId);
    const valueEl = document.getElementById(config.valueId);
    const wrapEl = document.getElementById(config.wrapId);

    const updateVisibility = () => {
      const active = Array.from(checks).some((check) => check.checked);
      if (wrapEl) {
        wrapEl.classList.toggle('hidden', !active);
      }
    };

    checks.forEach((check) => {
      check.addEventListener('change', updateVisibility);
    });

    if (slider && valueEl) {
      slider.addEventListener('input', () => {
        valueEl.textContent = slider.value;
      });
    }

    updateVisibility();
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

  const intensities = {
    violence: 0,
    horror: 0,
    language: 0,
    sexual: 0
  };

  Object.entries(ASPECT_CONFIG).forEach(([aspectKey, config]) => {
    const checks = document.querySelectorAll(`input[name="${aspectKey}"]`);
    const selected = Array.from(checks).filter((check) => check.checked);

    selected.forEach((item) => {
      contentFlags[item.value] = true;
    });

    const slider = document.getElementById(config.intensityId);
    intensities[aspectKey] = selected.length > 0 ? Number(slider.value) : 0;
  });

  return { contentFlags, intensities };
}

async function handleSubmit() {
  try {
    const payload = collectInput();

    nextBtn.disabled = true;
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
    nextBtn.disabled = false;
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
