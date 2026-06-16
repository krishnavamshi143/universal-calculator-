// Multi-Unit Converter Module (Bidirectional Sync Grid)

const unitData = {
    length: {
        title: 'Length Units',
        base: 'm',
        units: {
            m: { label: 'Meters (m)', factor: 1 },
            km: { label: 'Kilometers (km)', factor: 0.001 },
            cm: { label: 'Centimeters (cm)', factor: 100 },
            mm: { label: 'Millimeters (mm)', factor: 1000 },
            mi: { label: 'Miles (mi)', factor: 0.000621371 },
            yd: { label: 'Yards (yd)', factor: 1.09361 },
            ft: { label: 'Feet (ft)', factor: 3.28084 },
            in: { label: 'Inches (in)', factor: 39.3701 }
        }
    },
    weight: {
        title: 'Mass / Weight Units',
        base: 'kg',
        units: {
            kg: { label: 'Kilograms (kg)', factor: 1 },
            g: { label: 'Grams (g)', factor: 1000 },
            mg: { label: 'Milligrams (mg)', factor: 1000000 },
            lb: { label: 'Pounds (lbs)', factor: 2.20462 },
            oz: { label: 'Ounces (oz)', factor: 35.274 },
            st: { label: 'Stones (st)', factor: 0.157473 }
        }
    },
    temperature: {
        title: 'Temperature Units',
        isSpecial: true,
        units: {
            c: { label: 'Celsius (°C)' },
            f: { label: 'Fahrenheit (°F)' },
            k: { label: 'Kelvin (K)' }
        },
        // Custom conversion helpers
        fromBase(cVal, toUnit) {
            if (toUnit === 'c') return cVal;
            if (toUnit === 'f') return (cVal * 9/5) + 32;
            if (toUnit === 'k') return cVal + 273.15;
        },
        toBase(val, fromUnit) {
            if (fromUnit === 'c') return val;
            if (fromUnit === 'f') return (val - 32) * 5/9;
            if (fromUnit === 'k') return val - 273.15;
        }
    },
    area: {
        title: 'Area Units',
        base: 'sqm',
        units: {
            sqm: { label: 'Square Meters (m²)', factor: 1 },
            sqkm: { label: 'Square Kilometers (km²)', factor: 0.000001 },
            sqmi: { label: 'Square Miles (mi²)', factor: 3.861e-7 },
            acre: { label: 'Acres (ac)', factor: 0.000247105 },
            hectare: { label: 'Hectares (ha)', factor: 0.0001 }
        }
    },
    volume: {
        title: 'Volume Units',
        base: 'l',
        units: {
            l: { label: 'Liters (L)', factor: 1 },
            ml: { label: 'Milliliters (ml)', factor: 1000 },
            cbm: { label: 'Cubic Meters (m³)', factor: 0.001 },
            gal: { label: 'US Gallons (gal)', factor: 0.264172 },
            qt: { label: 'US Quarts (qt)', factor: 1.05669 },
            pt: { label: 'US Pints (pt)', factor: 2.11338 },
            cup: { label: 'Cups', factor: 4.22675 }
        }
    },
    speed: {
        title: 'Speed Units',
        base: 'mps',
        units: {
            mps: { label: 'Meters / Sec (m/s)', factor: 1 },
            kmh: { label: 'Kilometers / Hour (km/h)', factor: 3.6 },
            mph: { label: 'Miles / Hour (mph)', factor: 2.23694 },
            knot: { label: 'Knots (kt)', factor: 1.94384 }
        }
    },
    time: {
        title: 'Time Units',
        base: 'sec',
        units: {
            sec: { label: 'Seconds (s)', factor: 1 },
            min: { label: 'Minutes (m)', factor: 1 / 60 },
            hr: { label: 'Hours (h)', factor: 1 / 3600 },
            day: { label: 'Days (d)', factor: 1 / 86400 },
            week: { label: 'Weeks (w)', factor: 1 / 604800 },
            yr: { label: 'Years (y)', factor: 1 / 31536000 }
        }
    }
};

export default {
    id: 'converter',
    name: 'Unit Converter',
    icon: 'sync_alt',
    category: 'conversions',
    description: 'Convert length, mass, temperature, area, volume, speed, and time. Type in any box to instantly convert all other units.',
    tags: ['converter', 'conversion', 'unit', 'length', 'metric', 'imperial', 'weight', 'temperature', 'speed'],

    renderInputs() {
        return `
            <div class="form-group">
                <label class="form-label" for="converter-category">Select Unit Category</label>
                <select id="converter-category" class="form-select">
                    <option value="length" selected>Length (meters, miles, feet...)</option>
                    <option value="weight">Mass / Weight (kg, lbs, ounces...)</option>
                    <option value="temperature">Temperature (Celsius, Fahrenheit, Kelvin)</option>
                    <option value="area">Area (sq meters, acres, hectares...)</option>
                    <option value="volume">Volume (liters, gallons, cups...)</option>
                    <option value="speed">Speed (m/s, km/h, mph, knots)</option>
                    <option value="time">Time (seconds, hours, days, years)</option>
                </select>
            </div>
            
            <div class="info-tag" style="margin-top: 10px; font-size: 13px;">
                💡 Pro-Tip: Enter a value in any unit input box, and all other unit values will sync automatically in real-time.
            </div>
        `;
    },

    renderOutputs() {
        return `
            <div class="results-container">
                <div class="results-section-title" id="converter-results-title">Length Units Converter</div>
                <div class="flex-column gap-16" id="converter-grid-container" style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
                    <!-- Unit inputs will be rendered here dynamically -->
                </div>
            </div>
        `;
    },

    init(containerInputs, containerOutputs, saveHistory) {
        const catSelect = containerInputs.querySelector('#converter-category');
        const resultsTitle = containerOutputs.querySelector('#converter-results-title');
        const gridContainer = containerOutputs.querySelector('#converter-grid-container');

        let activeCategory = 'length';

        function renderGrid() {
            const data = unitData[activeCategory];
            resultsTitle.textContent = data.title;
            
            let html = '';
            // Render a card with input for each unit
            for (const [key, unit] of Object.entries(data.units)) {
                // Initial value for base unit can be 1, others calculated
                let initialVal = '';
                if (key === data.base || (data.isSpecial && key === 'c')) {
                    initialVal = '1';
                }
                
                html += `
                    <div class="form-group">
                        <label class="form-label" style="font-size: 13px;">${unit.label}</label>
                        <div class="input-wrapper">
                            <input type="number" data-unit-key="${key}" class="form-input number-input converter-unit-input" placeholder="Enter value..." value="${initialVal}">
                        </div>
                    </div>
                `;
            }
            gridContainer.innerHTML = html;
            
            // Perform initial conversion based on the default value of 1
            const initialSource = data.isSpecial ? 'c' : data.base;
            syncValues(initialSource, 1);
        }

        // Synchronize all other boxes when any box changes
        function syncValues(sourceKey, rawValue) {
            const data = unitData[activeCategory];
            if (isNaN(rawValue)) {
                // Clear all if NaN
                gridContainer.querySelectorAll('.converter-unit-input').forEach(input => {
                    if (input.dataset.unitKey !== sourceKey) input.value = '';
                });
                return;
            }

            let valueInBase = 0;
            if (data.isSpecial) {
                valueInBase = data.toBase(rawValue, sourceKey);
            } else {
                // baseVal = inputVal / factor
                const sourceUnit = data.units[sourceKey];
                valueInBase = rawValue / sourceUnit.factor;
            }

            // Update all other inputs
            gridContainer.querySelectorAll('.converter-unit-input').forEach(input => {
                const targetKey = input.dataset.unitKey;
                if (targetKey === sourceKey) return; // don't overwrite user typing

                let computedVal = 0;
                if (data.isSpecial) {
                    computedVal = data.fromBase(valueInBase, targetKey);
                } else {
                    // targetVal = baseVal * factor
                    const targetUnit = data.units[targetKey];
                    computedVal = valueInBase * targetUnit.factor;
                }

                // Format cleanly
                if (computedVal === 0) {
                    input.value = '0';
                } else {
                    // round to 6 decimal places cleanly without trailing zeros
                    const rounded = Number(computedVal.toFixed(6));
                    input.value = rounded.toString();
                }
            });
        }

        // Handle category selection change
        catSelect.addEventListener('change', (e) => {
            activeCategory = e.target.value;
            renderGrid();
        });

        // Setup input event delegation
        gridContainer.addEventListener('input', (e) => {
            const input = e.target.closest('.converter-unit-input');
            if (!input) return;

            const sourceKey = input.dataset.unitKey;
            const val = parseFloat(input.value);
            
            syncValues(sourceKey, val);

            // Log conversions once in a while to the main tape
            if (!isNaN(val) && input.value !== '') {
                const data = unitData[activeCategory];
                const sourceLabel = data.units[sourceKey].label.split(' (')[0];
                saveHistory(`Converted unit: ${val} ${sourceKey} (${activeCategory})`, `Synced grid`);
            }
        });

        // First render
        renderGrid();
    }
};
