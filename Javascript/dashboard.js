let currentWorkouts = [];
let dayCalories = [0, 0, 0, 0, 0];
let totalLoggedCalories = 0;
let dynamicMaxCalorie = 2000;
let dynamicBmiColor = '#34c759';

let activityTotals = {
  Running: 0,
  Cycling: 0,
  Skipping: 0
};

const TOTAL_GLASSES = 9;
let currentGlasses = 0;

document.addEventListener('DOMContentLoaded', () => {
  const heightInput = document.getElementById('heightInput');
  const weightInput = document.getElementById('weightInput');
  const saveBtn = document.getElementById('saveBtn');
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

  // Load Dashboard data
  loadDashboardData();
  initWorkoutTimer();
  initDailyFitnessTip();
  initRealtimeWorkoutPlan();

  async function loadDashboardData() {
    try {
      const res = await fetch('auth/get_dashboard_data.php');
      if (res.status === 401) {
        window.location.replace('Login.html');
        return;
      }
      const data = await res.json();

      if (data.status === 'success') {
        if (data.user) {
          selectedGender = data.user.gender || 'male';
          genderBtns.forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-gender') === selectedGender);
          });
          heightInput.value = data.user.height;
          weightInput.value = data.user.weight;
          processBodyData(parseFloat(data.user.height), parseFloat(data.user.weight), selectedGender);
        }

        currentGlasses = data.water_glasses || 0;
        renderWaterUI();

        if (data.chart_data) {
          dayCalories = data.chart_data;
        }

        const tableBody = document.getElementById('activityLogTableBody');
        if (tableBody && data.activities) {
          tableBody.innerHTML = '';
          activityTotals = { Running: 0, Cycling: 0, Skipping: 0 };
          totalLoggedCalories = 0;

          data.activities.forEach(act => {
            const cal = parseInt(act.calories, 10);
            totalLoggedCalories += cal;
            if (act.activity.includes('Run')) activityTotals.Running += cal;
            else if (act.activity.includes('Cycling')) activityTotals.Cycling += cal;
            else if (act.activity.includes('Skipping')) activityTotals.Skipping += cal;

            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${act.activity}</td>
              <td>${act.duration} min</td>
              <td class="kcal">${cal} kcal</td>
            `;
            tableBody.appendChild(row);
          });
          dayCalories[0] = totalLoggedCalories;
        }

        updateActivityTotalsUI();
        updateLoggedBarUI();
        renderActivityChart();
        updateHudTargetRings();
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }

  // Save Body Data to Database
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const height = parseFloat(heightInput.value);
      const weight = parseFloat(weightInput.value);

      if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
        alert('Please enter valid Height and Weight values!');
        return;
      }

      try {
        const res = await fetch('auth/save_body_data.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ height, weight, gender: selectedGender })
        });
        const result = await res.json();
        if (result.status === 'success') {
          processBodyData(height, weight, selectedGender);
          alert('Body data saved to Database successfully!');
        } else {
          alert(result.message || 'Failed to save body data');
        }
      } catch (err) {
        console.error(err);
        alert('Server error occurred while saving.');
      }
    });
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

    dynamicMaxCalorie = recommendedCalories;
    dynamicBmiColor = color;
    updateLoggedBarUI();

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
    renderActivityChart();
    updateHudTargetRings();
  }

  function updateLoggedBarUI() {
    const loggedBar = document.getElementById('loggedCaloriesBar');
    const goalMaxCalText = document.getElementById('goalMaxCalText');
    const loggedText = document.getElementById('loggedCaloriesText');

    if (goalMaxCalText) goalMaxCalText.textContent = dynamicMaxCalorie.toLocaleString();
    if (loggedText) loggedText.textContent = totalLoggedCalories.toLocaleString();
    if (loggedBar) {
      const goalPercent = Math.min(100, (totalLoggedCalories / dynamicMaxCalorie) * 100);
      loggedBar.style.width = `${goalPercent}%`;
      loggedBar.style.background = `linear-gradient(90deg, ${dynamicBmiColor}88 0%, ${dynamicBmiColor} 100%)`;
    }
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
    updateHudTargetRings();
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
    if (valDisplay) valDisplay.textContent = `${item.current}${item.unit}`;

    const slider = document.getElementById(`slider-${index}`);
    if (slider) slider.style.setProperty('--progress', `${percentage}%`);
  };

  // Activity Log Action
  const logBtn = document.getElementById('logActivityBtn');
  const activitySelect = document.getElementById('activityType');
  const skillSelect = document.getElementById('activitySkill');
  const durationSelect = document.getElementById('activityDuration');
  const tableBody = document.getElementById('activityLogTableBody');

  if (logBtn) {
    logBtn.addEventListener('click', async () => {
      const activity = activitySelect ? activitySelect.value : 'Running';
      const skillMultiplier = skillSelect ? parseFloat(skillSelect.value) : 1.0;
      const duration = durationSelect ? parseInt(durationSelect.value, 10) : 30;

      let baseRate = 8;
      if (activity === 'Cycling') baseRate = 7;
      if (activity === 'Skipping ropes') baseRate = 10;

      const burnedKcal = Math.round(duration * baseRate * skillMultiplier);

      try {
        const res = await fetch('auth/log_activity.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activity, duration, calories: burnedKcal })
        });
        const result = await res.json();

        if (result.status === 'success') {
          if (tableBody) {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${activity}</td>
              <td>${duration} min</td>
              <td class="kcal">${burnedKcal} kcal</td>
            `;
            tableBody.insertBefore(row, tableBody.firstChild);
          }

          if (activity.includes('Run')) activityTotals.Running += burnedKcal;
          else if (activity.includes('Cycling')) activityTotals.Cycling += burnedKcal;
          else if (activity.includes('Skipping')) activityTotals.Skipping += burnedKcal;

          updateActivityTotalsUI();
          totalLoggedCalories += burnedKcal;
          dayCalories[0] += burnedKcal;

          updateLoggedBarUI();
          renderActivityChart();
          updateHudTargetRings();

          alert(`Logged ${burnedKcal} kcal for ${activity}!`);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to log activity to database.');
      }
    });
  }

  function updateActivityTotalsUI() {
    const runningTotalText = document.getElementById('runningTotalText');
    const cyclingTotalText = document.getElementById('cyclingTotalText');
    const skippingTotalText = document.getElementById('skippingTotalText');

    if (runningTotalText) runningTotalText.textContent = `${activityTotals.Running.toLocaleString()} kcal`;
    if (cyclingTotalText) cyclingTotalText.textContent = `${activityTotals.Cycling.toLocaleString()} kcal`;
    if (skippingTotalText) skippingTotalText.textContent = `${activityTotals.Skipping.toLocaleString()} kcal`;
  }

  function renderActivityChart() {
    const chartLine = document.getElementById('chartLine');
    const chartArea = document.getElementById('chartArea');
    const chartPoints = document.getElementById('chartPoints');
    const chartStopColorTop = document.getElementById('chartStopColorTop');
    const chartStopColorBottom = document.getElementById('chartStopColorBottom');
    const day1Label = document.getElementById('day1Label');
    if (!chartLine || !chartArea || !chartPoints) return;

    const activeColor = dynamicBmiColor || '#34c759';
    chartLine.setAttribute('stroke', activeColor);

    if (chartStopColorTop) {
      chartStopColorTop.setAttribute('stop-color', activeColor);
      chartStopColorTop.setAttribute('stop-opacity', '0.45');
    }
    if (chartStopColorBottom) {
      chartStopColorBottom.setAttribute('stop-color', activeColor);
      chartStopColorBottom.setAttribute('stop-opacity', '0.0');
    }

    const y4 = document.getElementById('chartY4');
    const y3 = document.getElementById('chartY3');
    const y2 = document.getElementById('chartY2');
    const y1 = document.getElementById('chartY1');

    const maxKcal = dynamicMaxCalorie || 2000;
    if (y4) y4.textContent = maxKcal;
    if (y3) y3.textContent = Math.round(maxKcal * 0.75);
    if (y2) y2.textContent = Math.round(maxKcal * 0.50);
    if (y1) y1.textContent = Math.round(maxKcal * 0.25);

    const xCoords = [70, 220, 370, 520, 660];
    const chartBottom = 140;
    const chartTop = 20;

    const points = dayCalories.map((kcal, index) => {
      const clampedKcal = Math.min(maxKcal, Math.max(0, kcal));
      const y = chartBottom - ((clampedKcal / maxKcal) * (chartBottom - chartTop));
      return { x: xCoords[index], y: y };
    });

    let pathD = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      if (prev.y === chartBottom && curr.y === chartBottom) {
        pathD += ` L ${curr.x},${curr.y}`;
      } else {
        const cpX1 = prev.x + (curr.x - prev.x) * 0.5;
        const cpX2 = prev.x + (curr.x - prev.x) * 0.5;
        pathD += ` C ${cpX1},${prev.y} ${cpX2},${curr.y} ${curr.x},${curr.y}`;
      }
    }

    chartLine.setAttribute('d', pathD);
    const areaD = `${pathD} L ${points[points.length - 1].x},${chartBottom} L ${points[0].x},${chartBottom} Z`;
    chartArea.setAttribute('d', areaD);

    chartPoints.innerHTML = '';
    points.forEach((p, idx) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', p.x);
      circle.setAttribute('cy', p.y);
      circle.setAttribute('r', idx === 0 ? '5' : '3.5');
      circle.setAttribute('fill', idx === 0 ? activeColor : `${activeColor}88`);
      chartPoints.appendChild(circle);
    });

    if (day1Label) {
      const labelY = Math.max(12, points[0].y - 10);
      day1Label.setAttribute('y', labelY);
      day1Label.setAttribute('x', points[0].x);
      day1Label.setAttribute('fill', activeColor);
    }
  }

  // Water Tracker
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

  async function saveAndUpdateWater() {
    renderWaterUI();
    updateHudTargetRings();
    try {
      await fetch('auth/save_water.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ glasses: currentGlasses })
      });
    } catch (e) {
      console.error('Failed to save water:', e);
    }
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

  function updateHudTargetRings() {
    const ringCal = document.getElementById('ringCalorie');
    const ringWork = document.getElementById('ringWorkout');
    const ringWat = document.getElementById('ringWater');
    const calLabel = document.getElementById('ringCalLabel');
    const workLabel = document.getElementById('ringWorkLabel');
    const watLabel = document.getElementById('ringWatLabel');
    const overallPct = document.getElementById('ringsOverallPct');
    const badgeText = document.getElementById('streakBadgeText');
    const cardEl = document.getElementById('targetRingsCard');

    const calPct = Math.min(100, Math.round((totalLoggedCalories / dynamicMaxCalorie) * 100)) || 0;
    if (ringCal) ringCal.style.strokeDashoffset = 314.15 - (314.15 * (calPct / 100));
    if (calLabel) calLabel.textContent = `${calPct}%`;

    const isWorkoutDone = localStorage.getItem('fitcore_workout_done') === 'true';
    const workPct = isWorkoutDone ? 100 : 0;
    if (ringWork) ringWork.style.strokeDashoffset = 238.76 - (238.76 * (workPct / 100));
    if (workLabel) workLabel.textContent = `${workPct}%`;

    const watPct = Math.min(100, Math.round((currentGlasses / TOTAL_GLASSES) * 100)) || 0;
    if (ringWat) ringWat.style.strokeDashoffset = 163.36 - (163.36 * (watPct / 100));
    if (watLabel) watLabel.textContent = `${watPct}%`;

    const avg = Math.round((calPct + workPct + watPct) / 3);
    if (overallPct) overallPct.textContent = `${avg}%`;

    if (calPct >= 100 && workPct >= 100 && watPct >= 100) {
      if (cardEl) cardEl.classList.add('all-crushed');
      if (badgeText) badgeText.textContent = '🔥 Streak: Active! All 3 Rings Crushed!';
    } else {
      if (cardEl) cardEl.classList.remove('all-crushed');
      if (badgeText) badgeText.textContent = 'Daily Target: In Progress';
    }
  }

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
          alert('Please save body data first!');
          return;
        }
        const totalMinutes = sessionTimeSelect ? parseFloat(sessionTimeSelect.value) : 12;
        timePerExercise = Math.round((totalMinutes * 60) / currentWorkouts.length);
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
          if (timeLeft <= 0) nextWorkoutStep();
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
        localStorage.setItem('fitcore_workout_done', 'true');
        updateHudTargetRings();
        alert('🎉 Great job! Workout completed!');
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

  function initDailyFitnessTip() {
    const tipTitleEl = document.getElementById('dailyTipTitle');
    const tipDescEl = document.getElementById('dailyTipDesc');
    const tipIconEl = document.getElementById('dailyTipIcon');
    const countdownEl = document.getElementById('nextTipCountdown');

    const fitnessTips = [
      { icon: '💧', title: 'Tip of the Day: Stay Hydrated!', desc: 'Drink enough water throughout the day to support recovery and feel energized.' },
      { icon: '😴', title: 'Tip of the Day: Prioritize Sleep', desc: '7 to 9 hours of sleep helps muscle recovery and keeps energy high.' },
      { icon: '🥩', title: 'Tip of the Day: Protein at Breakfast', desc: 'Start your day with a protein-rich breakfast to maintain muscle.' },
      { icon: '🚶', title: 'Tip of the Day: Post-Meal Walking', desc: 'A short walk after a meal supports digestion and blood sugar levels.' }
    ];

    function updateTipContent() {
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      const currentTip = fitnessTips[dayOfYear % fitnessTips.length];
      if (tipIconEl) tipIconEl.textContent = currentTip.icon;
      if (tipTitleEl) tipTitleEl.textContent = currentTip.title;
      if (tipDescEl) tipDescEl.textContent = currentTip.desc;
    }

    function updateCountdown() {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const totalSecs = Math.floor((tomorrow - now) / 1000);
      const hours = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
      const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
      const secs = String(totalSecs % 60).padStart(2, '0');
      if (countdownEl) countdownEl.textContent = `${hours}:${mins}:${secs}`;
    }

    updateTipContent();
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  function initRealtimeWorkoutPlan() {
    const daysGridContainer = document.getElementById('workoutDaysGrid');
    if (!daysGridContainer) return;

    const weeklySchedule = [
      { name: 'MON', letter: 'M', pills: ['Chest', 'Triceps'], dayIndex: 1 },
      { name: 'TUE', letter: 'T', pills: ['Back', 'Biceps'], dayIndex: 2 },
      { name: 'WED', letter: 'W', pills: ['Legs', 'Core'], dayIndex: 3 },
      { name: 'THU', letter: 'T', pills: ['Shoulders', 'Arms'], dayIndex: 4 },
      { name: 'FRI', letter: 'F', pills: ['Cardio', 'HIIT'], dayIndex: 5 },
      { name: 'SAT', letter: 'S', pills: ['Full Body'], dayIndex: 6 },
      { name: 'SUN', letter: 'S', pills: ['Rest', 'Stretch'], dayIndex: 0 }
    ];

    const todayIndex = new Date().getDay();
    daysGridContainer.innerHTML = weeklySchedule.map(day => {
      const isToday = day.dayIndex === todayIndex;
      const pillsHtml = day.pills.map(pill => `<div class="day-pill">${pill}</div>`).join('');
      return `
        <div class="day-card ${isToday ? 'active' : ''}">
          <div class="day-name">${day.name}</div>
          <div class="day-icon-circle">${day.letter}</div>
          <div class="day-pills">${pillsHtml}</div>
          ${isToday ? '<div class="today-tag">TODAY</div>' : ''}
        </div>
      `;
    }).join('');
  }
});