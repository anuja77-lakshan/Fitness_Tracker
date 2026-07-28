document.addEventListener('DOMContentLoaded', () => {
  //BMI
  const heightInput = document.getElementById('heightInput');
  const weightInput = document.getElementById('weightInput');
  const saveBtn = document.getElementById('saveBtn');

  const TOTAL_GLASSES = 9;
  let currentGlasses = 0;
  const waterCountEl = document.getElementById('waterCount');
  const waterBarFillEl = document.getElementById('waterBarFill');
  const waterRemTextEl = document.getElementById('waterRemText');
  const waterIconsContainer = document.getElementById('waterIconsContainer');
  const waterMinusBtn = document.getElementById('waterMinusBtn');
  const waterPlusBtn = document.getElementById('waterPlusBtn');


  loadSavedBodyData();
  initWaterTracker();

  // Body Data saver
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const height = parseFloat(heightInput.value);
      const weight = parseFloat(weightInput.value);

      if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
        alert('Please enter valid Height and Weight values!');
        return;
      }

      localStorage.setItem('user_height', height);
      localStorage.setItem('user_weight', weight);

      updateBmiUI(height, weight);
      alert('Body data saved successfully!');
    });
  }

  if (heightInput) heightInput.addEventListener('input', calculateRealtime);
  if (weightInput) weightInput.addEventListener('input', calculateRealtime);

  function calculateRealtime() {
    const h = parseFloat(heightInput.value);
    const w = parseFloat(weightInput.value);
    if (h > 0 && w > 0) {
      updateBmiUI(h, w);
    }
  }

  function loadSavedBodyData() {
    const savedHeight = localStorage.getItem('user_height');
    const savedWeight = localStorage.getItem('user_weight');

    if (savedHeight && savedWeight) {
      heightInput.value = savedHeight;
      weightInput.value = savedWeight;
      updateBmiUI(parseFloat(savedHeight), parseFloat(savedWeight));
    } else {
      heightInput.value = 178;
      weightInput.value = 74;
      updateBmiUI(178, 74);
    }
  }

  function updateBmiUI(heightCm, weightKg) {
    const heightMeters = heightCm / 100;
    const bmi = parseFloat((weightKg / (heightMeters * heightMeters)).toFixed(1));

    const bmiDisplay = document.getElementById('bmiDisplay');
    const gaugeBmiNum = document.getElementById('gaugeBmiNum');
    const gaugeBmiStatus = document.getElementById('gaugeBmiStatus');
    const calorieTarget = document.getElementById('calorieTarget');
    const speedoActiveTrack = document.getElementById('speedoActiveTrack');
    const speedoNeedleWrapper = document.getElementById('speedoNeedleWrapper');

    if (bmiDisplay) bmiDisplay.textContent = bmi;
    if (gaugeBmiNum) gaugeBmiNum.textContent = bmi;

    let status = '';
    let color = '#34c759';
    let recommendedCalories = 2000;

    if (bmi < 18.5) {
      status = 'Underweight';
      color = '#3b82f6';
      recommendedCalories = Math.round(weightKg * 35);
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      status = 'Normal';
      color = '#34c759';
      recommendedCalories = Math.round(weightKg * 30);
    } else if (bmi >= 25 && bmi <= 29.9) {
      status = 'Overweight';
      color = '#eab308';
      recommendedCalories = Math.round(weightKg * 25);
    } else {
      status = 'Obese';
      color = '#ef4444';
      recommendedCalories = Math.round(weightKg * 20);
    }

    if (gaugeBmiStatus) {
      gaugeBmiStatus.textContent = status;
      gaugeBmiStatus.style.color = color;
      gaugeBmiStatus.style.border = `1px solid ${color}88`;
      gaugeBmiStatus.style.background = `${color}1A`;
      gaugeBmiStatus.style.boxShadow = `0 0 15px ${color}40, inset 0 0 10px ${color}20`;
    }

    if (calorieTarget) {
      calorieTarget.textContent = `${recommendedCalories} kcal/day`;
    }

    // Arc Track & Pointer math
    const minBmi = 15;
    const maxBmi = 35;
    const clampedBmi = Math.min(Math.max(bmi, minBmi), maxBmi);
    const percentage = (clampedBmi - minBmi) / (maxBmi - minBmi);

    const totalLength = 251.2;
    const strokeOffset = totalLength - (totalLength * percentage);

    if (speedoActiveTrack) {
      speedoActiveTrack.style.strokeDashoffset = strokeOffset;
      speedoActiveTrack.style.stroke = color;
    }

    const angle = -90 + (percentage * 180);
    if (speedoNeedleWrapper) {
      speedoNeedleWrapper.style.transform = `rotate(${angle}deg)`;
    }
  }

  // ==================== WATER TRACKER LOGIC ====================
  function initWaterTracker() {
    const savedGlasses = localStorage.getItem('user_water_glasses');
    currentGlasses = savedGlasses !== null ? parseInt(savedGlasses, 10) : 5;
    renderWaterUI();
  }

  function renderWaterUI() {
    if (!waterIconsContainer) return;

    waterIconsContainer.innerHTML = '';
    for (let i = 1; i <= TOTAL_GLASSES; i++) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', `water-icon ${i <= currentGlasses ? 'active' : ''}`);
      svg.setAttribute('viewBox', '0 0 24 24');
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z');
      svg.appendChild(path);

      svg.addEventListener('click', () => {
        currentGlasses = i;
        saveAndUpdateWater();
      });

      waterIconsContainer.appendChild(svg);
    }

    if (waterCountEl) waterCountEl.textContent = currentGlasses;
    
    const percentage = (currentGlasses / TOTAL_GLASSES) * 100;
    if (waterBarFillEl) waterBarFillEl.style.width = `${percentage}%`;

    const remaining = TOTAL_GLASSES - currentGlasses;
    if (waterRemTextEl) {
      if (remaining > 0) {
        waterRemTextEl.textContent = `${remaining} glass${remaining > 1 ? 'es' : ''} remaining`;
        waterRemTextEl.style.color = '#8e8e93';
      } else {
        waterRemTextEl.textContent = '🎉 Daily goal reached!';
        waterRemTextEl.style.color = '#34c759';
      }
    }
  }

  function saveAndUpdateWater() {
    localStorage.setItem('user_water_glasses', currentGlasses);
    renderWaterUI();
  }

  if (waterPlusBtn) {
    waterPlusBtn.addEventListener('click', () => {
      if (currentGlasses < TOTAL_GLASSES) {
        currentGlasses++;
        saveAndUpdateWater();
      }
    });
  }

  if (waterMinusBtn) {
    waterMinusBtn.addEventListener('click', () => {
      if (currentGlasses > 0) {
        currentGlasses--;
        saveAndUpdateWater();
      }
    });
  }
});
