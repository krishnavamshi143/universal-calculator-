// Geometry Shape Area & Volume Calculator Module

export default {
    id: 'geometry',
    name: 'Geometry & Shape Solver',
    icon: 'architecture',
    category: 'geometry',
    description: 'Calculate area, perimeter, volume, and surface area of 2D/3D shapes (Circle, Rectangle, Triangle, Cylinder, Sphere) with interactive SVG visuals.',
    tags: ['geometry', 'shape', 'circle', 'triangle', 'rectangle', 'cylinder', 'sphere', 'area', 'volume', 'perimeter'],

    renderInputs() {
        return `
            <div class="form-group">
                <label class="form-label" for="geom-shape-select">Select Shape</label>
                <select id="geom-shape-select" class="form-select">
                    <option value="circle" selected>Circle (2D)</option>
                    <option value="rectangle">Rectangle (2D)</option>
                    <option value="triangle">Right Triangle (2D)</option>
                    <option value="cylinder">Cylinder (3D)</option>
                    <option value="sphere">Sphere (3D)</option>
                </select>
            </div>

            <!-- Dynamic Input Panels based on active shape selection -->
            <div id="geom-inputs-container" class="flex-column gap-20">
                <!-- Dynamically filled with inputs -->
            </div>

            <button class="calculate-btn" id="geom-calc-btn" style="margin-top: 10px;">
                <span class="material-symbols-outlined">design_services</span>
                <span>Solve Shape Dimensions</span>
            </button>
        `;
    },

    renderOutputs() {
        return `
            <div class="results-container">
                <div class="results-section-title">Visual Schematic</div>
                <div class="geometry-svg-board" id="geom-board">
                    <!-- SVG drawing will render here -->
                </div>
                
                <div class="results-section-title">Geometric Metrics</div>
                <div class="results-grid" id="geom-results-grid">
                    <!-- Results numerical outputs -->
                    <div class="empty-history-msg">Enter dimensions and click Solve to show metrics.</div>
                </div>
            </div>
        `;
    },

    init(containerInputs, containerOutputs, saveHistory) {
        const shapeSelect = containerInputs.querySelector('#geom-shape-select');
        const inputsContainer = containerInputs.querySelector('#geom-inputs-container');
        const calcBtn = containerInputs.querySelector('#geom-calc-btn');
        const board = containerOutputs.querySelector('#geom-board');
        const resultsGrid = containerOutputs.querySelector('#geom-results-grid');

        let activeShape = 'circle';

        const shapeConfigs = {
            circle: {
                inputs: `
                    <div class="form-group">
                        <label class="form-label" for="geom-radius">Radius (r)</label>
                        <input type="number" id="geom-radius" class="form-input number-input geom-dimension" value="10" min="0">
                    </div>
                `,
                calculate(inputs) {
                    const r = parseFloat(inputs.radius) || 0;
                    const area = Math.PI * r * r;
                    const perimeter = 2 * Math.PI * r; // Circumference
                    return [
                        { label: 'Area', val: area, desc: 'Total space inside circle (πr²)' },
                        { label: 'Circumference', val: perimeter, desc: 'Distance around circle (2πr)' }
                    ];
                },
                draw(inputs) {
                    const rVal = parseFloat(inputs.radius) || 10;
                    // Scale radius to fit nice in 200x200 board
                    const r = Math.min(80, Math.max(15, rVal * 5));
                    return `
                        <svg viewBox="0 0 200 200" width="100%" height="100%">
                            <circle cx="100" cy="100" r="${r}" class="geom-svg-shape" />
                            <!-- Center Point -->
                            <circle cx="100" cy="100" r="3" fill="var(--accent-teal)" />
                            <!-- Radius line -->
                            <line x1="100" y1="100" x2="${100 + r}" y2="100" stroke="var(--accent-indigo)" stroke-width="2" />
                            <text x="${100 + r/2}" y="90" class="geom-svg-label" text-anchor="middle">r = ${rVal}</text>
                        </svg>
                    `;
                }
            },
            rectangle: {
                inputs: `
                    <div class="form-group">
                        <label class="form-label" for="geom-width">Width (w)</label>
                        <input type="number" id="geom-width" class="form-input number-input geom-dimension" value="20" min="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="geom-height">Height (h)</label>
                        <input type="number" id="geom-height" class="form-input number-input geom-dimension" value="10" min="0">
                    </div>
                `,
                calculate(inputs) {
                    const w = parseFloat(inputs.width) || 0;
                    const h = parseFloat(inputs.height) || 0;
                    const area = w * h;
                    const perimeter = 2 * (w + h);
                    return [
                        { label: 'Area', val: area, desc: 'Width multiplied by height (w · h)' },
                        { label: 'Perimeter', val: perimeter, desc: 'Boundary length (2w + 2h)' }
                    ];
                },
                draw(inputs) {
                    const wVal = parseFloat(inputs.width) || 20;
                    const hVal = parseFloat(inputs.height) || 10;
                    
                    // Scale width and height
                    const maxDim = Math.max(wVal, hVal, 1);
                    const scale = 140 / maxDim;
                    const w = wVal * scale;
                    const h = hVal * scale;
                    
                    const x = 100 - w/2;
                    const y = 100 - h/2;
                    return `
                        <svg viewBox="0 0 200 200" width="100%" height="100%">
                            <rect x="${x}" y="${y}" width="${w}" height="${h}" class="geom-svg-shape" />
                            <!-- Dimension label bottom (width) -->
                            <text x="100" y="${y + h + 16}" class="geom-svg-label" text-anchor="middle">w = ${wVal}</text>
                            <!-- Dimension label left (height) -->
                            <text x="${x - 10}" y="104" class="geom-svg-label" text-anchor="end">h = ${hVal}</text>
                        </svg>
                    `;
                }
            },
            triangle: {
                inputs: `
                    <div class="form-group">
                        <label class="form-label" for="geom-base">Base (b)</label>
                        <input type="number" id="geom-base" class="form-input number-input geom-dimension" value="15" min="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="geom-height">Height (h)</label>
                        <input type="number" id="geom-height" class="form-input number-input geom-dimension" value="12" min="0">
                    </div>
                `,
                calculate(inputs) {
                    const b = parseFloat(inputs.base) || 0;
                    const h = parseFloat(inputs.height) || 0;
                    const hyp = Math.sqrt(b*b + h*h);
                    const area = 0.5 * b * h;
                    const perimeter = b + h + hyp;
                    return [
                        { label: 'Area', val: area, desc: 'Half base times height (0.5 · b · h)' },
                        { label: 'Hypotenuse (c)', val: hyp, desc: 'Opposite side of right-angle (√(a²+b²))' },
                        { label: 'Perimeter', val: perimeter, desc: 'Sum of all sides (a + b + c)' }
                    ];
                },
                draw(inputs) {
                    const bVal = parseFloat(inputs.base) || 15;
                    const hVal = parseFloat(inputs.height) || 12;
                    
                    const maxDim = Math.max(bVal, hVal, 1);
                    const scale = 130 / maxDim;
                    const b = bVal * scale;
                    const h = hVal * scale;
                    
                    const startX = 100 - b/2;
                    const startY = 100 + h/2;
                    return `
                        <svg viewBox="0 0 200 200" width="100%" height="100%">
                            <polygon points="${startX},${startY} ${startX},${startY - h} ${startX + b},${startY}" class="geom-svg-shape" />
                            <!-- Base label -->
                            <text x="${startX + b/2}" y="${startY + 16}" class="geom-svg-label" text-anchor="middle">b = ${bVal}</text>
                            <!-- Height label -->
                            <text x="${startX - 10}" y="${startY - h/2}" class="geom-svg-label" text-anchor="end">h = ${hVal}</text>
                            <!-- Hypotenuse label -->
                            <text x="${startX + b/2 + 8}" y="${startY - h/2 - 4}" class="geom-svg-label" text-anchor="start">c = ${Number(Math.sqrt(bVal*bVal + hVal*hVal).toFixed(2))}</text>
                        </svg>
                    `;
                }
            },
            cylinder: {
                inputs: `
                    <div class="form-group">
                        <label class="form-label" for="geom-radius">Radius (r)</label>
                        <input type="number" id="geom-radius" class="form-input number-input geom-dimension" value="5" min="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="geom-height">Height (h)</label>
                        <input type="number" id="geom-height" class="form-input number-input geom-dimension" value="15" min="0">
                    </div>
                `,
                calculate(inputs) {
                    const r = parseFloat(inputs.radius) || 0;
                    const h = parseFloat(inputs.height) || 0;
                    const volume = Math.PI * r * r * h;
                    const surfaceArea = 2 * Math.PI * r * h + 2 * Math.PI * r * r;
                    return [
                        { label: 'Volume', val: volume, desc: 'Base area times height (πr²h)' },
                        { label: 'Surface Area', val: surfaceArea, desc: 'Caps area + walls area (2πrh + 2πr²)' }
                    ];
                },
                draw(inputs) {
                    const rVal = parseFloat(inputs.radius) || 5;
                    const hVal = parseFloat(inputs.height) || 15;
                    
                    const maxDim = Math.max(rVal*2, hVal, 1);
                    const scale = 120 / maxDim;
                    const rx = rVal * scale;
                    const ry = rx * 0.35; // perspective flattening
                    const h = hVal * scale;
                    
                    const cx = 100;
                    const cyTop = 100 - h/2;
                    const cyBottom = 100 + h/2;
                    
                    return `
                        <svg viewBox="0 0 200 200" width="100%" height="100%">
                            <!-- Back half of bottom ellipse (dashed) -->
                            <path d="M ${cx - rx},${cyBottom} A ${rx},${ry} 0 0,0 ${cx + rx},${cyBottom}" fill="none" stroke="var(--accent-teal)" stroke-width="2" stroke-dasharray="4" />
                            <!-- Cylinder body walls -->
                            <line x1="${cx - rx}" y1="${cyTop}" x2="${cx - rx}" y2="${cyBottom}" stroke="var(--accent-teal)" stroke-width="2" />
                            <line x1="${cx + rx}" y1="${cyTop}" x2="${cx + rx}" y2="${cyBottom}" stroke="var(--accent-teal)" stroke-width="2" />
                            <!-- Front half of bottom ellipse -->
                            <path d="M ${cx + rx},${cyBottom} A ${rx},${ry} 0 0,0 ${cx - rx},${cyBottom}" fill="none" stroke="var(--accent-teal)" stroke-width="2" />
                            
                            <!-- Cylinder filled color backdrop approximation -->
                            <path d="M ${cx - rx},${cyTop} A ${rx},${ry} 0 0,0 ${cx + rx},${cyTop} L ${cx + rx},${cyBottom} A ${rx},${ry} 0 0,1 ${cx - rx},${cyBottom} Z" fill="rgba(6, 182, 212, 0.05)" />
                            
                            <!-- Top full ellipse -->
                            <ellipse cx="${cx}" cy="${cyTop}" rx="${rx}" ry="${ry}" class="geom-svg-shape" />
                            <!-- Radius indicator top -->
                            <line x1="${cx}" y1="${cyTop}" x2="${cx + rx}" y2="${cyTop}" stroke="var(--accent-indigo)" stroke-width="1.5" />
                            <text x="${cx + rx/2}" y="${cyTop - 6}" class="geom-svg-label" text-anchor="middle">r = ${rVal}</text>
                            <!-- Height indicator side -->
                            <line x1="${cx - rx - 15}" y1="${cyTop}" x2="${cx - rx - 15}" y2="${cyBottom}" stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="2" />
                            <text x="${cx - rx - 20}" y="104" class="geom-svg-label" text-anchor="end">h = ${hVal}</text>
                        </svg>
                    `;
                }
            },
            sphere: {
                inputs: `
                    <div class="form-group">
                        <label class="form-label" for="geom-radius">Radius (r)</label>
                        <input type="number" id="geom-radius" class="form-input number-input geom-dimension" value="8" min="0">
                    </div>
                `,
                calculate(inputs) {
                    const r = parseFloat(inputs.radius) || 0;
                    const volume = (4/3) * Math.PI * Math.pow(r, 3);
                    const surfaceArea = 4 * Math.PI * r * r;
                    return [
                        { label: 'Volume', val: volume, desc: 'Total 3D capacity (4/3 · πr³)' },
                        { label: 'Surface Area', val: surfaceArea, desc: 'Total exterior boundary (4πr²)' }
                    ];
                },
                draw(inputs) {
                    const rVal = parseFloat(inputs.radius) || 8;
                    const r = Math.min(75, Math.max(20, rVal * 6));
                    const ry = r * 0.3; // perspective curve
                    return `
                        <svg viewBox="0 0 200 200" width="100%" height="100%">
                            <!-- Shading circle gradient -->
                            <circle cx="100" cy="100" r="${r}" class="geom-svg-shape" />
                            <!-- Ellipse waist front -->
                            <path d="M ${100 - r},100 A ${r},${ry} 0 0,0 ${100 + r},100" fill="none" stroke="var(--accent-teal)" stroke-width="1.5" />
                            <!-- Ellipse waist back (dashed) -->
                            <path d="M ${100 - r},100 A ${r},${ry} 0 0,1 ${100 + r},100" fill="none" stroke="var(--accent-teal)" stroke-width="1.5" stroke-dasharray="4" />
                            <!-- Radius line from center -->
                            <line x1="100" y1="100" x2="${100 + r * 0.707}" y2="${100 - r * 0.707}" stroke="var(--accent-indigo)" stroke-width="2" />
                            <text x="${100 + r * 0.3}" y="${100 - r * 0.3 - 4}" class="geom-svg-label">r = ${rVal}</text>
                            <!-- Center point -->
                            <circle cx="100" cy="100" r="3" fill="var(--accent-teal)" />
                        </svg>
                    `;
                }
            }
        };

        function updateInputs() {
            const config = shapeConfigs[activeShape];
            inputsContainer.innerHTML = config.inputs;
            
            // Perform basic drawing immediately
            drawShape();
            
            // Add automatic input listeners to update shape visualization live as user types!
            inputsContainer.querySelectorAll('.geom-dimension').forEach(input => {
                input.addEventListener('input', drawShape);
            });
        }

        function drawShape() {
            const config = shapeConfigs[activeShape];
            const dims = getDimensions();
            board.innerHTML = config.draw(dims);
        }

        function getDimensions() {
            const dims = {};
            const radEl = inputsContainer.querySelector('#geom-radius');
            const widthEl = inputsContainer.querySelector('#geom-width');
            const heightEl = inputsContainer.querySelector('#geom-height');
            const baseEl = inputsContainer.querySelector('#geom-base');

            if (radEl) dims.radius = radEl.value;
            if (widthEl) dims.width = widthEl.value;
            if (heightEl) dims.height = heightEl.value;
            if (baseEl) dims.base = baseEl.value;
            
            return dims;
        }

        function solve() {
            const config = shapeConfigs[activeShape];
            const dims = getDimensions();
            
            // Validate dimensions
            for (const [k, v] of Object.entries(dims)) {
                if (parseFloat(v) <= 0 || isNaN(parseFloat(v))) {
                    resultsGrid.innerHTML = '<div class="empty-history-msg" style="color: var(--accent-danger);">Error: All dimensions must be positive values!</div>';
                    return;
                }
            }

            const metrics = config.calculate(dims);
            
            let gridHtml = '';
            metrics.forEach(m => {
                const formattedVal = Number(m.val.toFixed(5));
                gridHtml += `
                    <div class="result-card">
                        <span class="result-card-label">${m.label}</span>
                        <span class="result-card-val success">${formattedVal}</span>
                        <span class="result-card-desc">${m.desc}</span>
                    </div>
                `;
            });
            resultsGrid.innerHTML = gridHtml;

            // Trigger visual refresh
            drawShape();

            const shapeLabel = shapeSelect.options[shapeSelect.selectedIndex].text;
            const dimSummary = Object.entries(dims).map(([k, v]) => `${k.charAt(0)}:${v}`).join(', ');
            saveHistory(`Solved ${shapeLabel} (${dimSummary})`, `${metrics[0].label}: ${Number(metrics[0].val.toFixed(2))}`);
        }

        shapeSelect.addEventListener('change', (e) => {
            activeShape = e.target.value;
            updateInputs();
            resultsGrid.innerHTML = '<div class="empty-history-msg">Enter dimensions and click Solve to show metrics.</div>';
        });

        calcBtn.addEventListener('click', solve);

        // Initial setup
        updateInputs();
    }
};
