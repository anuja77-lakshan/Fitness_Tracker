let currentWorkouts = [];
document.addEventListener('DOMContentLoaded', () => {
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
  const genderBtns = document.querySelectorAll('.gender-btn');
  
  let selectedGender = 'male';

  genderBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      genderBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedGender = btn.getAttribute('data-gender');
    });
  });

  loadSavedBodyData();
  initWaterTracker();
  initWorkoutTimer();

  // Body Data Saver
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
      localStorage.setItem('user_gender', selectedGender);

      processBodyData(height, weight, selectedGender);
      alert('Body data saved successfully!');
    });
  }

  function loadSavedBodyData() {
    const savedHeight = localStorage.getItem('user_height');
    const savedWeight = localStorage.getItem('user_weight');
    const savedGender = localStorage.getItem('user_gender');

    if (savedGender) {
      selectedGender = savedGender;
      genderBtns.forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-gender') === savedGender);
      });
    }

    if (savedHeight && savedWeight) {
      heightInput.value = savedHeight;
      weightInput.value = savedWeight;
      processBodyData(parseFloat(savedHeight), parseFloat(savedWeight), selectedGender);
    } else {
      heightInput.value = 178;
      weightInput.value = 74;
      processBodyData(178, 74, selectedGender);
    }
  }

  function processBodyData(heightCm, weightKg, gender) {
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

    let category = '';
    let status = '';
    let color = '#34c759';
    const genderMultiplier = gender === 'female' ? 0.92 : 1.0;
    let baseCalories = 2000;

    if (bmi < 18.5) {
      category = 'underweight';
      status = 'Underweight';
      color = '#3b82f6';
      baseCalories = weightKg * 35;
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      category = 'normal';
      status = 'Normal';
      color = '#34c759';
      baseCalories = weightKg * 30;
    } else if (bmi >= 25 && bmi <= 29.9) {
      category = 'overweight';
      status = 'Overweight';
      color = '#eab308';
      baseCalories = weightKg * 25;
    } else {
      category = 'obese';
      status = 'Obese';
      color = '#ef4444';
      baseCalories = weightKg * 20;
    }

    const recommendedCalories = Math.round(baseCalories * genderMultiplier);

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

    updateWorkoutPlan(category);
  }

  function updateWorkoutPlan(category) {
    switch (category) {
      case 'underweight':
        currentWorkouts = [
          { name: '🔄 Squats (Light)', minReps: 10, maxReps: 40, current: 10, step: 1, unit: ' reps' },
          { name: '⚡ Push-ups (Knee/Standard)', minReps: 10, maxReps: 35, current: 10, step: 1, unit: ' reps' },
          { name: '🏃🏻‍♀️‍➡️ Light Jog', minReps: 1.5, maxReps: 6.0, current: 1.5, step: 0.5, unit: ' km' },
          { name: '🏋️ Pull-ups / Body Rows', minReps: 5, maxReps: 25, current: 5, step: 1, unit: ' reps' }
        ];
        break;
      case 'normal':
        currentWorkouts = [
          { name: '🔄 Squats', minReps: 15, maxReps: 60, current: 15, step: 1, unit: ' reps' },
          { name: '⚡ Push-ups', minReps: 20, maxReps: 60, current: 20, step: 1, unit: ' reps' },
          { name: '🏃🏻‍♀️‍➡️ Run', minReps: 3.0, maxReps: 12.0, current: 3.0, step: 0.5, unit: ' km' },
          { name: '🏋️ Pull-ups', minReps: 10, maxReps: 35, current: 10, step: 1, unit: ' reps' }
        ];
        break;
      case 'overweight':
        currentWorkouts = [
          { name: '🔄 Bodyweight Squats', minReps: 20, maxReps: 70, current: 20, step: 1, unit: ' reps' },
          { name: '⚡ Push-ups', minReps: 25, maxReps: 70, current: 25, step: 1, unit: ' reps' },
          { name: '🏃🏻‍♀️‍➡️ Brisk Walk / Run', minReps: 4.0, maxReps: 15.0, current: 4.0, step: 0.5, unit: ' km' },
          { name: '🏋️ Pull-ups / Lat Pulls', minReps: 12, maxReps: 40, current: 12, step: 1, unit: ' reps' }
        ];
        break;
      case 'obese':
        currentWorkouts = [
          { name: '🔄 Chair Squats', minReps: 25, maxReps: 80, current: 25, step: 1, unit: ' reps' },
          { name: '⚡ Incline Push-ups', minReps: 15, maxReps: 50, current: 15, step: 1, unit: ' reps' },
          { name: '🏃🏻‍♀️‍➡️ Low-impact Walk', minReps: 5.0, maxReps: 18.0, current: 5.0, step: 0.5, unit: ' km' },
          { name: '🏋️ Resistance Band Pulls', minReps: 15, maxReps: 50, current: 15, step: 1, unit: ' reps' }
        ];
        break;
    }
    renderWorkoutList();
  }

  function renderWorkoutList() {
  const container = document.getElementById('workoutListContainer');
  if (!container) return;

  container.innerHTML = currentWorkouts.map((item, index) => {
    const range = item.maxReps - item.minReps;
    const progressFromBase = item.current - item.minReps;
    const percentage = range > 0 ? (progressFromBase / range) * 100 : 0;

    return `
      <div class="workout-item">
        <div class="workout-info">
          <span class="workout-name">${item.name}</span>
          <div class="workout-percentage">
            <strong id="workoutVal-${index}">${item.current}${item.unit}</strong> <span class="min-val">(Min: ${item.minReps}${item.unit})</span>
          </div>
        </div>
        <input 
          type="range" 
          class="workout-slider" 
          id="slider-${index}"
          min="${item.minReps}" 
          max="${item.maxReps}" 
          step="${item.step}" 
          value="${item.current}"
          style="--progress: ${percentage}%;"
          oninput="window.handleSliderChange(${index}, this.value)"
        >
      </div>
    `;
  }).join('');
}

window.handleSliderChange = function(index, value) {
  const item = currentWorkouts[index];
  item.current = parseFloat(value);

  const range = item.maxReps - item.minReps;
  const progressFromBase = item.current - item.minReps;
  const percentage = range > 0 ? (progressFromBase / range) * 100 : 0;

  const valDisplay = document.getElementById(`workoutVal-${index}`);
  if (valDisplay) {
    valDisplay.textContent = `${item.current}${item.unit}`;
  }

  const slider = document.getElementById(`slider-${index}`);
  if (slider) {
    slider.style.setProperty('--progress', `${percentage}%`);
  }
};

  function initWorkoutTimer() {
    const startWorkoutBtn = document.querySelector('.start-workout-btn');
    const sessionTimeSelect = document.getElementById('sessionTimeSelect');
    const timerModal = document.getElementById('workoutTimerModal');
    const modalWorkoutStep = document.getElementById('modalWorkoutStep');
    const modalWorkoutTitle = document.getElementById('modalWorkoutTitle');
    const modalWorkoutTarget = document.getElementById('modalWorkoutTarget');
    const modalTimeDisplay = document.getElementById('modalTimeDisplay');
    const timerActiveCircle = document.getElementById('timerActiveCircle');
    const modalPauseBtn = document.getElementById('modalPauseBtn');
    const modalNextBtn = document.getElementById('modalNextBtn');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    if (!timerModal) return;

    const CIRCLE_CIRCUMFERENCE = 439.8;
    let currentWorkoutIndex = 0;
    let timerInterval = null;
    let timePerExercise = 45;
    let timeLeft = timePerExercise;
    let isPaused = false;

    if (startWorkoutBtn) {
      startWorkoutBtn.addEventListener('click', () => {
        if (!currentWorkouts || currentWorkouts.length === 0) {
          alert('Please save body data first to generate workouts!');
          return;
        }

        const totalMinutes = sessionTimeSelect ? parseFloat(sessionTimeSelect.value) : 12;
        const totalSeconds = totalMinutes * 60;
        timePerExercise = Math.round(totalSeconds / currentWorkouts.length);

        currentWorkoutIndex = 0;
        timerModal.classList.add('active');
        loadWorkoutStep(currentWorkoutIndex);
      });
    }

    function loadWorkoutStep(index) {
      clearInterval(timerInterval);
      const item = currentWorkouts[index];
      if (!item) return;

      if (modalWorkoutStep) modalWorkoutStep.textContent = `EXERCISE ${index + 1} OF ${currentWorkouts.length}`;
      if (modalWorkoutTitle) modalWorkoutTitle.textContent = item.name;
      if (modalWorkoutTarget) modalWorkoutTarget.textContent = `Target: ${item.current}${item.unit}`;

      timeLeft = timePerExercise;
      isPaused = false;
      if (modalPauseBtn) modalPauseBtn.textContent = 'Pause';
      updateTimerDisplay();

      timerInterval = setInterval(() => {
        if (!isPaused) {
          timeLeft--;
          updateTimerDisplay();
          if (timeLeft <= 0) {
            nextWorkoutStep();
          }
        }
      }, 1000);
    }

    function updateTimerDisplay() {
      if (!modalTimeDisplay || !timerActiveCircle) return;
      const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
      const secs = String(timeLeft % 60).padStart(2, '0');
      modalTimeDisplay.textContent = `${mins}:${secs}`;

      const offset = CIRCLE_CIRCUMFERENCE - (timeLeft / timePerExercise) * CIRCLE_CIRCUMFERENCE;
      timerActiveCircle.style.strokeDashoffset = offset;
    }

    function nextWorkoutStep() {
      currentWorkoutIndex++;
      if (currentWorkoutIndex < currentWorkouts.length) {
        loadWorkoutStep(currentWorkoutIndex);
      } else {
        clearInterval(timerInterval);
        alert('🎉 Great job! You completed all workouts!');
        timerModal.classList.remove('active');
      }
    }

    if (modalPauseBtn) {
      modalPauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        modalPauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
      });
    }

    if (modalNextBtn) modalNextBtn.addEventListener('click', nextWorkoutStep);
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        timerModal.classList.remove('active');
      });
    }
  }

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

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    window.location.href = 'Home.html';
  });
}