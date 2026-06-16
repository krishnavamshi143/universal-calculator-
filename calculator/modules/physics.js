// Physics Formulas Solver Module

const formulas = {
    newton: {
        title: "Newton's Second Law (F = m · a)",
        variables: {
            f: { label: 'Force (F)', suffix: 'N', desc: 'Net force applied to mass' },
            m: { label: 'Mass (m)', suffix: 'kg', desc: 'Mass of the object' },
            a: { label: 'Acceleration (a)', suffix: 'm/s²', desc: 'Rate of change of velocity' }
        },
        solve(target, inputs) {
            const f = parseFloat(inputs.f);
            const m = parseFloat(inputs.m);
            const a = parseFloat(inputs.a);
            
            if (target === 'f') {
                if (isNaN(m) || isNaN(a)) throw new Error('Mass and Acceleration are required');
                return { val: m * a, formula: 'F = m · a' };
            }
            if (target === 'm') {
                if (isNaN(f) || isNaN(a)) throw new Error('Force and Acceleration are required');
                if (a === 0) throw new Error('Acceleration cannot be zero');
                return { val: f / a, formula: 'm = F / a' };
            }
            if (target === 'a') {
                if (isNaN(f) || isNaN(m)) throw new Error('Force and Mass are required');
                if (m === 0) throw new Error('Mass cannot be zero');
                return { val: f / m, formula: 'a = F / m' };
            }
        }
    },
    ohm: {
        title: "Ohm's Law (V = I · R)",
        variables: {
            v: { label: 'Voltage (V)', suffix: 'V', desc: 'Electrical potential difference' },
            i: { label: 'Current (I)', suffix: 'A', desc: 'Electric current flow rate' },
            r: { label: 'Resistance (R)', suffix: 'Ω', desc: 'Opposition to current flow' }
        },
        solve(target, inputs) {
            const v = parseFloat(inputs.v);
            const i = parseFloat(inputs.i);
            const r = parseFloat(inputs.r);

            if (target === 'v') {
                if (isNaN(i) || isNaN(r)) throw new Error('Current and Resistance are required');
                return { val: i * r, formula: 'V = I · R' };
            }
            if (target === 'i') {
                if (isNaN(v) || isNaN(r)) throw new Error('Voltage and Resistance are required');
                if (r === 0) throw new Error('Resistance cannot be zero');
                return { val: v / r, formula: 'I = V / R' };
            }
            if (target === 'r') {
                if (isNaN(v) || isNaN(i)) throw new Error('Voltage and Current are required');
                if (i === 0) throw new Error('Current cannot be zero');
                return { val: v / i, formula: 'R = V / I' };
            }
        }
    },
    gas: {
        title: "Ideal Gas Law (P · V = n · R · T)",
        variables: {
            p: { label: 'Pressure (P)', suffix: 'atm', desc: 'Force exerted by gas per unit area' },
            v: { label: 'Volume (V)', suffix: 'L', desc: 'Space occupied by the gas' },
            n: { label: 'Moles (n)', suffix: 'mol', desc: 'Amount of substance of gas' },
            t: { label: 'Temperature (T)', suffix: 'K', desc: 'Absolute temperature in Kelvin' }
        },
        solve(target, inputs) {
            const p = parseFloat(inputs.p);
            const v = parseFloat(inputs.v);
            const n = parseFloat(inputs.n);
            const t = parseFloat(inputs.t);
            const R = 0.082057; // Gas Constant in L*atm/(mol*K)

            if (target === 'p') {
                if (isNaN(v) || isNaN(n) || isNaN(t)) throw new Error('Volume, Moles, and Temperature are required');
                if (v === 0) throw new Error('Volume cannot be zero');
                return { val: (n * R * t) / v, formula: 'P = nRT / V' };
            }
            if (target === 'v') {
                if (isNaN(p) || isNaN(n) || isNaN(t)) throw new Error('Pressure, Moles, and Temperature are required');
                if (p === 0) throw new Error('Pressure cannot be zero');
                return { val: (n * R * t) / p, formula: 'V = nRT / P' };
            }
            if (target === 'n') {
                if (isNaN(p) || isNaN(v) || isNaN(t)) throw new Error('Pressure, Volume, and Temperature are required');
                if (t === 0) throw new Error('Temperature cannot be zero');
                return { val: (p * v) / (R * t), formula: 'n = PV / RT' };
            }
            if (target === 't') {
                if (isNaN(p) || isNaN(v) || isNaN(n)) throw new Error('Pressure, Volume, and Moles are required');
                if (n === 0) throw new Error('Moles cannot be zero');
                return { val: (p * v) / (n * R), formula: 'T = PV / nR' };
            }
        }
    },
    motion: {
        title: "Velocity Formula (d = v · t)",
        variables: {
            d: { label: 'Distance (d)', suffix: 'm', desc: 'Total path length covered' },
            v: { label: 'Velocity (v)', suffix: 'm/s', desc: 'Rate of displacement' },
            t: { label: 'Time (t)', suffix: 's', desc: 'Duration of the motion' }
        },
        solve(target, inputs) {
            const d = parseFloat(inputs.d);
            const v = parseFloat(inputs.v);
            const t = parseFloat(inputs.t);

            if (target === 'd') {
                if (isNaN(v) || isNaN(t)) throw new Error('Velocity and Time are required');
                return { val: v * t, formula: 'd = v · t' };
            }
            if (target === 'v') {
                if (isNaN(d) || isNaN(t)) throw new Error('Distance and Time are required');
                if (t === 0) throw new Error('Time cannot be zero');
                return { val: d / t, formula: 'v = d / t' };
            }
            if (target === 't') {
                if (isNaN(d) || isNaN(v)) throw new Error('Distance and Velocity are required');
                if (v === 0) throw new Error('Velocity cannot be zero');
                return { val: d / v, formula: 't = d / v' };
            }
        }
    }
};

export default {
    id: 'physics',
    name: 'Physics Equation Solver',
    icon: 'rocket_launch',
    category: 'physics',
    description: 'Solve classical physics equations. Select a target variable to calculate, input known factors, and view mathematical derivations.',
    tags: ['physics', 'newton', 'ohm', 'gas', 'velocity', 'force', 'speed', 'voltage', 'ideal gas'],

    renderInputs() {
        return `
            <div class="form-group">
                <label class="form-label" for="phys-formula-select">Select Physics Equation</label>
                <select id="phys-formula-select" class="form-select">
                    <option value="newton" selected>Newton's 2nd Law (F = ma)</option>
                    <option value="ohm">Ohm's Law (V = IR)</option>
                    <option value="gas">Ideal Gas Law (PV = nRT)</option>
                    <option value="motion">Linear Motion (d = vt)</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label" for="phys-solve-select">Solve For Variable</label>
                <select id="phys-solve-select" class="form-select">
                    <!-- Options injected dynamically based on formula -->
                </select>
            </div>

            <div class="flex-column gap-16" id="phys-inputs-fields" style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
                <!-- Dynamic input fields based on formula -->
            </div>

            <button class="calculate-btn" id="phys-calc-btn" style="margin-top: 10px;">
                <span class="material-symbols-outlined">physics</span>
                <span>Compute Formula</span>
            </button>
        `;
    },

    renderOutputs() {
        return `
            <div class="results-container" id="phys-results">
                <div class="empty-history-msg">Select a formula, configure the values, and click Compute to view results.</div>
            </div>
        `;
    },

    init(containerInputs, containerOutputs, saveHistory) {
        const formSelect = containerInputs.querySelector('#phys-formula-select');
        const solveSelect = containerInputs.querySelector('#phys-solve-select');
        const inputsContainer = containerInputs.querySelector('#phys-inputs-fields');
        const calcBtn = containerInputs.querySelector('#phys-calc-btn');
        const resultsDiv = containerOutputs.querySelector('#phys-results');

        let activeFormulaKey = 'newton';
        let activeSolveKey = 'f';

        function updateInputs() {
            const formObj = formulas[activeFormulaKey];
            
            // Populate solve target selector
            let solveOptions = '';
            for (const [key, value] of Object.entries(formObj.variables)) {
                solveOptions += `<option value="${key}" ${key === activeSolveKey ? 'selected' : ''}>${value.label}</option>`;
            }
            solveSelect.innerHTML = solveOptions;
            
            // Re-read selected target variable
            activeSolveKey = solveSelect.value;
            
            // Populate input fields
            let inputsHtml = '';
            for (const [key, variable] of Object.entries(formObj.variables)) {
                const isDisabled = key === activeSolveKey;
                const valuePlaceholder = isDisabled ? '[Calculated]' : `Enter ${variable.label.split(' (')[0]}`;
                const valAttr = isDisabled ? 'disabled' : '';
                
                inputsHtml += `
                    <div class="form-group">
                        <label class="form-label" style="font-size: 13px;">${variable.label}</label>
                        <div class="input-wrapper">
                            <input type="number" id="phys-var-${key}" data-var-key="${key}" class="form-input number-input form-input-with-suffix" placeholder="${valuePlaceholder}" ${valAttr}>
                            <span class="input-suffix">${variable.suffix}</span>
                        </div>
                        <div class="toggle-subtitle" style="font-size: 11px; margin-top: 2px;">${variable.desc}</div>
                    </div>
                `;
            }
            inputsContainer.innerHTML = inputsHtml;
            resultsDiv.innerHTML = '';
        }

        formSelect.addEventListener('change', (e) => {
            activeFormulaKey = e.target.value;
            // set default solve target for formula
            activeSolveKey = Object.keys(formulas[activeFormulaKey].variables)[0];
            updateInputs();
        });

        solveSelect.addEventListener('change', (e) => {
            activeSolveKey = e.target.value;
            updateInputs();
        });

        calcBtn.addEventListener('click', () => {
            const formObj = formulas[activeFormulaKey];
            const inputs = {};
            
            // Gather all input values
            inputsContainer.querySelectorAll('input').forEach(input => {
                const key = input.dataset.varKey;
                inputs[key] = input.value;
            });

            try {
                const solution = formObj.solve(activeSolveKey, inputs);
                const targetVarObj = formObj.variables[activeSolveKey];
                
                resultsDiv.innerHTML = `
                    <div class="results-section-title">Physics Solver Result</div>
                    <div class="results-grid">
                        <div class="result-card highlight">
                            <span class="result-card-label">Solved Variable</span>
                            <span class="result-card-val success">${targetVarObj.label.split(' (')[0]}</span>
                            <span class="result-card-desc">${targetVarObj.desc}</span>
                        </div>
                        <div class="result-card">
                            <span class="result-card-label">Result Value</span>
                            <span class="result-card-val indigo">${Number(solution.val.toFixed(6))} ${targetVarObj.suffix}</span>
                            <span class="result-card-desc">Calculated precisely</span>
                        </div>
                    </div>

                    <div class="results-section-title">Mathematical Formula Applied</div>
                    <div class="result-card" style="align-items: center; justify-content: center; padding: 24px;">
                        <span class="result-card-val success" style="font-size: 28px; font-family: var(--font-mono);">${solution.formula}</span>
                        <span class="result-card-desc" style="margin-top: 8px;">Derived equation of state</span>
                    </div>
                `;

                // Update input field visually with the calculated value
                const solvedInput = inputsContainer.querySelector(`#phys-var-${activeSolveKey}`);
                if (solvedInput) {
                    solvedInput.value = Number(solution.val.toFixed(6));
                }

                saveHistory(`Solved ${formObj.title.split(' (')[0]} for ${activeSolveKey.toUpperCase()}`, `${Number(solution.val.toFixed(4))} ${targetVarObj.suffix}`);

            } catch (err) {
                resultsDiv.innerHTML = `
                    <div class="result-card" style="border-color: var(--accent-danger); background: rgba(244,63,94,0.05);">
                        <span class="result-card-label" style="color: var(--accent-danger);">Solver Error</span>
                        <span class="result-card-val" style="font-size: 16px; color: var(--text-primary); font-family: var(--font-sans);">${err.message}</span>
                        <span class="result-card-desc">Ensure all inputs are numerical and valid.</span>
                    </div>
                `;
            }
        });

        // Initialize view
        updateInputs();
    }
};
