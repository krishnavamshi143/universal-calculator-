// Health, BMI & Calorie TDEE Calculator Module

export default {
    id: 'health',
    name: 'Calorie & Health Estimator',
    icon: 'monitoring',
    category: 'health',
    description: 'Calculate your BMI or estimate your daily calorie requirements (TDEE/BMR) and macronutrient ratios for weight management.',
    tags: ['health', 'calorie', 'bmi', 'weight', 'bmr', 'tdee', 'diet', 'nutrition'],

    renderInputs() {
        return `
            <div class="form-group">
                <label class="form-label">Health Metric Type</label>
                <div class="segmented-control" id="health-type-switch">
                    <button class="segmented-btn active" data-type="bmi">BMI Calculator</button>
                    <button class="segmented-btn" data-type="tdee">BMR & TDEE Calorie</button>
                </div>
            </div>

            <!-- Unit System switcher -->
            <div class="form-group">
                <label class="form-label">Measurement Unit System</label>
                <div class="segmented-control" id="health-unit-switch">
                    <button class="segmented-btn active" data-unit="metric">Metric (kg, cm)</button>
                    <button class="segmented-btn" data-unit="imperial">Imperial (lbs, ft/in)</button>
                </div>
            </div>

            <!-- BMI & TDEE Weight/Height Form Inputs -->
            <div class="form-row">
                <div class="form-group" id="group-weight">
                    <label class="form-label" for="health-weight">Weight</label>
                    <div class="input-wrapper">
                        <input type="number" id="health-weight" class="form-input number-input form-input-with-suffix" value="70" min="1">
                        <span class="input-suffix" id="label-weight-unit">kg</span>
                    </div>
                </div>

                <!-- Height: Metric CM or Imperial FT/IN -->
                <div class="form-group" id="group-height-cm">
                    <label class="form-label" for="health-height-cm">Height</label>
                    <div class="input-wrapper">
                        <input type="number" id="health-height-cm" class="form-input number-input form-input-with-suffix" value="175" min="1">
                        <span class="input-suffix">cm</span>
                    </div>
                </div>

                <div class="form-row hidden" id="group-height-ftin">
                    <div class="form-group">
                        <label class="form-label" for="health-height-ft">Height (Ft)</label>
                        <input type="number" id="health-height-ft" class="form-input number-input" value="5" min="1">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="health-height-in">Height (In)</label>
                        <input type="number" id="health-height-in" class="form-input number-input" value="9" min="0" max="11">
                    </div>
                </div>
            </div>

            <!-- TDEE Specific Inputs (Hidden by default) -->
            <div id="tdee-inputs" class="hidden flex-column gap-20">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="health-age">Age</label>
                        <input type="number" id="health-age" class="form-input number-input" value="28" min="1" max="120">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Gender</label>
                        <div class="segmented-control" id="health-gender">
                            <button class="segmented-btn active" data-gender="male">Male</button>
                            <button class="segmented-btn" data-gender="female">Female</button>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="health-activity">Activity Level</label>
                    <select id="health-activity" class="form-select">
                        <option value="1.2" selected>Sedentary (desk job, no exercise)</option>
                        <option value="1.375">Lightly Active (light exercise 1-3 days/wk)</option>
                        <option value="1.55">Moderately Active (moderate exercise 3-5 days/wk)</option>
                        <option value="1.725">Very Active (heavy exercise 6-7 days/wk)</option>
                        <option value="1.9">Extra Active (athlete, hard physical work)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Fitness Goal</label>
                    <div class="segmented-control" id="health-goal">
                        <button class="segmented-btn" data-goal="lose">Lose Weight</button>
                        <button class="segmented-btn active" data-goal="maintain">Maintain</button>
                        <button class="segmented-btn" data-goal="gain">Gain Weight</button>
                    </div>
                </div>
            </div>

            <button class="calculate-btn" id="health-calc-btn">
                <span class="material-symbols-outlined">health_and_safety</span>
                <span>Calculate Health Metrics</span>
            </button>
        `;
    },

    renderOutputs() {
        return `
            <div class="results-container" id="health-results">
                <!-- Dynamically filled health metrics -->
            </div>
        `;
    },

    init(containerInputs, containerOutputs, saveHistory) {
        const typeSwitch = containerInputs.querySelector('#health-type-switch');
        const unitSwitch = containerInputs.querySelector('#health-unit-switch');
        const tdeeInputs = containerInputs.querySelector('#tdee-inputs');
        const calcBtn = containerInputs.querySelector('#health-calc-btn');
        const resultsDiv = containerOutputs.querySelector('#health-results');

        // Height selector groups
        const weightInput = containerInputs.querySelector('#health-weight');
        const weightLabel = containerInputs.querySelector('#label-weight-unit');
        const heightCmGroup = containerInputs.querySelector('#group-height-cm');
        const heightFtInGroup = containerInputs.querySelector('#group-height-ftin');
        
        let activeType = 'bmi';
        let activeUnit = 'metric';
        let activeGender = 'male';
        let activeGoal = 'maintain';

        // Listen for type change
        typeSwitch.addEventListener('click', (e) => {
            const btn = e.target.closest('.segmented-btn');
            if (!btn) return;
            typeSwitch.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            activeType = btn.dataset.type;
            if (activeType === 'bmi') {
                tdeeInputs.classList.add('hidden');
            } else {
                tdeeInputs.classList.remove('hidden');
            }
            resultsDiv.innerHTML = '';
        });

        // Listen for unit system changes
        unitSwitch.addEventListener('click', (e) => {
            const btn = e.target.closest('.segmented-btn');
            if (!btn) return;
            unitSwitch.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            activeUnit = btn.dataset.unit;
            if (activeUnit === 'metric') {
                weightLabel.textContent = 'kg';
                weightInput.value = '70';
                heightCmGroup.classList.remove('hidden');
                heightFtInGroup.classList.add('hidden');
            } else {
                weightLabel.textContent = 'lbs';
                weightInput.value = '154';
                heightCmGroup.classList.add('hidden');
                heightFtInGroup.classList.remove('hidden');
            }
            resultsDiv.innerHTML = '';
        });

        // Gender switch
        const genderSwitch = containerInputs.querySelector('#health-gender');
        genderSwitch.addEventListener('click', (e) => {
            const btn = e.target.closest('.segmented-btn');
            if (!btn) return;
            genderSwitch.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeGender = btn.dataset.gender;
        });

        // Goal switch
        const goalSwitch = containerInputs.querySelector('#health-goal');
        goalSwitch.addEventListener('click', (e) => {
            const btn = e.target.closest('.segmented-btn');
            if (!btn) return;
            goalSwitch.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeGoal = btn.dataset.goal;
        });

        // Click Calculate
        calcBtn.addEventListener('click', () => {
            // Get standardized metric values first
            let weightKg = parseFloat(weightInput.value) || 0;
            let heightCm = 0;

            if (activeUnit === 'imperial') {
                // Lbs to Kg
                weightKg = weightKg * 0.453592;
                
                const ft = parseFloat(containerInputs.querySelector('#health-height-ft').value) || 0;
                const inches = parseFloat(containerInputs.querySelector('#health-height-in').value) || 0;
                const totalInches = (ft * 12) + inches;
                // Inches to Cm
                heightCm = totalInches * 2.54;
            } else {
                heightCm = parseFloat(containerInputs.querySelector('#health-height-cm').value) || 0;
            }

            if (weightKg <= 0 || heightCm <= 0) {
                resultsDiv.innerHTML = '<div class="empty-history-msg">Please enter valid height and weight values.</div>';
                return;
            }

            if (activeType === 'bmi') {
                calculateBMI(weightKg, heightCm);
            } else {
                calculateTDEE(weightKg, heightCm);
            }
        });

        function calculateBMI(weight, height) {
            const heightM = height / 100;
            const bmi = weight / (heightM * heightM);
            
            let category = '';
            let colorClass = '';
            let bmrRatioText = '';
            
            if (bmi < 18.5) {
                category = 'Underweight';
                colorClass = 'indigo';
                bmrRatioText = 'A healthy weight target would be higher.';
            } else if (bmi >= 18.5 && bmi < 25) {
                category = 'Healthy Weight';
                colorClass = 'success';
                bmrRatioText = 'Excellent! Keep up your current lifestyle.';
            } else if (bmi >= 25 && bmi < 30) {
                category = 'Overweight';
                colorClass = 'indigo';
                bmrRatioText = 'A slight calorie deficit would benefit weight goals.';
            } else {
                category = 'Obese';
                colorClass = 'indigo';
                bmrRatioText = 'Consult a specialist about a tailored diet plan.';
            }

            // Ideal weights range (for BMI 18.5 - 24.9)
            const minIdealWeight = 18.5 * (heightM * heightM);
            const maxIdealWeight = 24.9 * (heightM * heightM);

            const displayMin = activeUnit === 'imperial' ? `${Math.round(minIdealWeight * 2.20462)} lbs` : `${Math.round(minIdealWeight)} kg`;
            const displayMax = activeUnit === 'imperial' ? `${Math.round(maxIdealWeight * 2.20462)} lbs` : `${Math.round(maxIdealWeight)} kg`;

            resultsDiv.innerHTML = `
                <div class="results-section-title">BMI Analysis</div>
                <div class="results-grid">
                    <div class="result-card highlight">
                        <span class="result-card-label">Your BMI</span>
                        <span class="result-card-val ${colorClass}">${bmi.toFixed(1)}</span>
                        <span class="result-card-desc">Body Mass Index value</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Classification</span>
                        <span class="result-card-val success">${category}</span>
                        <span class="result-card-desc">${bmrRatioText}</span>
                    </div>
                </div>

                <div class="results-section-title">Healthy Weights Range</div>
                <div class="results-grid">
                    <div class="result-card">
                        <span class="result-card-label">Target Weight Range</span>
                        <span class="result-card-val indigo">${displayMin} - ${displayMax}</span>
                        <span class="result-card-desc">Calculated for height of ${Math.round(height)}cm</span>
                    </div>
                </div>
            `;

            saveHistory(`BMI Calculator (Weight: ${Math.round(weight)}kg)`, `BMI: ${bmi.toFixed(1)} (${category})`);
        }

        function calculateTDEE(weight, height) {
            const age = parseInt(containerInputs.querySelector('#health-age').value) || 28;
            const activityFactor = parseFloat(containerInputs.querySelector('#health-activity').value) || 1.2;

            // Mifflin-St Jeor Equation
            let bmr = 0;
            if (activeGender === 'male') {
                bmr = 10 * weight + 6.25 * height - 5 * age + 5;
            } else {
                bmr = 10 * weight + 6.25 * height - 5 * age - 161;
            }

            const tdee = bmr * activityFactor;
            
            let calorieGoal = tdee;
            let goalLabel = 'Maintain Weight';
            if (activeGoal === 'lose') {
                calorieGoal = tdee - 500;
                goalLabel = 'Fat Loss (-500 kcal)';
            } else if (activeGoal === 'gain') {
                calorieGoal = tdee + 500;
                goalLabel = 'Muscle Gain (+500 kcal)';
            }

            // Macros (Protein: 30%, Fats: 25%, Carbs: 45%)
            const proteinGrams = (calorieGoal * 0.30) / 4;
            const fatsGrams = (calorieGoal * 0.25) / 9;
            const carbsGrams = (calorieGoal * 0.45) / 4;

            // Gauge circumference is 440 (r=70)
            // BMR ratio of Goal Calorie
            const ratio = bmr / calorieGoal;
            const bmrStrokeOffset = 440 - (ratio * 440);

            resultsDiv.innerHTML = `
                <div class="results-section-title">Caloric Breakdown</div>
                
                <div class="gauge-visual">
                    <svg width="180" height="180" class="gauge-svg">
                        <defs>
                            <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stop-color="var(--accent-indigo)" />
                                <stop offset="100%" stop-color="var(--accent-teal)" />
                            </linearGradient>
                        </defs>
                        <circle cx="90" cy="90" r="70" class="gauge-bg" />
                        <circle cx="90" cy="90" r="70" class="gauge-fill" id="calorie-gauge" style="stroke-dashoffset: 440;" />
                    </svg>
                    <div class="gauge-label">
                        <div class="gauge-num" id="gauge-num-val">${Math.round(calorieGoal)}</div>
                        <div class="gauge-text">KCAL / DAY</div>
                    </div>
                </div>

                <div class="results-grid">
                    <div class="result-card">
                        <span class="result-card-label">Daily Goal Target</span>
                        <span class="result-card-val success">${Math.round(calorieGoal)} kcal</span>
                        <span class="result-card-desc">${goalLabel} plan</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Maintenance (TDEE)</span>
                        <span class="result-card-val">${Math.round(tdee)} kcal</span>
                        <span class="result-card-desc">Total energy cost</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Basal Metabolism (BMR)</span>
                        <span class="result-card-val indigo">${Math.round(bmr)} kcal</span>
                        <span class="result-card-desc">Resting energy cost</span>
                    </div>
                </div>

                <div class="results-section-title">Suggested Daily Macronutrients</div>
                <div class="results-grid">
                    <div class="result-card">
                        <span class="result-card-label">Protein (30%)</span>
                        <span class="result-card-val success">${Math.round(proteinGrams)}g</span>
                        <span class="result-card-desc">Essential tissue repair</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Carbohydrates (45%)</span>
                        <span class="result-card-val indigo">${Math.round(carbsGrams)}g</span>
                        <span class="result-card-desc">Primary workout fuel</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Dietary Fats (25%)</span>
                        <span class="result-card-val">${Math.round(fatsGrams)}g</span>
                        <span class="result-card-desc">Healthy hormone function</span>
                    </div>
                </div>
            `;

            // Trigger gauge fill transition in next frame
            setTimeout(() => {
                const gaugeElement = resultsDiv.querySelector('#calorie-gauge');
                if (gaugeElement) {
                    // Animate stroke dashoffset to show TDEE filling up relative to BMR or full circumference
                    // Set to percentage of the daily limit. We'll show a full fill (offset=0) since it's the goal
                    gaugeElement.style.strokeDashoffset = '0';
                }
            }, 50);

            saveHistory(`Calorie Est. (Age: ${age}, Weight: ${Math.round(weight)}kg)`, `Goal: ${Math.round(calorieGoal)} kcal/day`);
        }
    }
};
