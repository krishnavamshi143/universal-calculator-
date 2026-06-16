// Descriptive Statistics Calculator Module

export default {
    id: 'statistics',
    name: 'Statistics Analyzer',
    icon: 'bar_chart',
    category: 'statistics',
    description: 'Analyze lists of numerical data. Computes count, mean, median, mode, standard deviation, variance, and visualizes data using an SVG histogram.',
    tags: ['statistics', 'data', 'mean', 'median', 'mode', 'standard deviation', 'variance', 'math', 'analyzer'],

    renderInputs() {
        return `
            <div class="form-group">
                <label class="form-label" for="stats-input">Enter Numerical Dataset</label>
                <div class="info-tag" style="margin-bottom: 6px; font-size: 12px;">
                    Enter numbers separated by commas, spaces, or newlines.
                </div>
                <textarea id="stats-input" class="form-input number-input" style="height: 120px; font-size: 14px; line-height: 1.6;" placeholder="e.g. 10, 15, 23, 15, 8, 19, 24, 15, 30"></textarea>
            </div>

            <div class="form-group">
                <label class="form-label">Generate Sample Dataset</label>
                <div class="form-row">
                    <button class="back-btn" id="stats-sample-uniform" style="padding: 8px; font-size: 12px; justify-content: center;">Uniform Set</button>
                    <button class="back-btn" id="stats-sample-normal" style="padding: 8px; font-size: 12px; justify-content: center;">Bell Curve Set</button>
                    <button class="back-btn" id="stats-sample-skew" style="padding: 8px; font-size: 12px; justify-content: center;">Skewed Set</button>
                </div>
            </div>

            <button class="calculate-btn" id="stats-calc-btn">
                <span class="material-symbols-outlined">analytics</span>
                <span>Analyze Dataset</span>
            </button>
        `;
    },

    renderOutputs() {
        return `
            <div class="results-container" id="stats-results">
                <div class="empty-history-msg">Enter a dataset on the left and click Analyze to view detailed metrics and visualizations.</div>
            </div>
        `;
    },

    init(containerInputs, containerOutputs, saveHistory) {
        const inputArea = containerInputs.querySelector('#stats-input');
        const calcBtn = containerInputs.querySelector('#stats-calc-btn');
        const resultsDiv = containerOutputs.querySelector('#stats-results');

        const btnUniform = containerInputs.querySelector('#stats-sample-uniform');
        const btnNormal = containerInputs.querySelector('#stats-sample-normal');
        const btnSkew = containerInputs.querySelector('#stats-sample-skew');

        // Sample datasets generators
        btnUniform.addEventListener('click', () => {
            const arr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 50) + 10);
            inputArea.value = arr.join(', ');
        });

        btnNormal.addEventListener('click', () => {
            // Box-Muller transform for normal distribution simulation
            const arr = [];
            for (let i = 0; i < 20; i++) {
                let u = 0, v = 0;
                while(u === 0) u = Math.random(); 
                while(v === 0) v = Math.random();
                const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
                arr.push(Math.round(num * 10 + 50));
            }
            inputArea.value = arr.join(', ');
        });

        btnSkew.addEventListener('click', () => {
            const arr = [];
            for (let i = 0; i < 15; i++) {
                arr.push(Math.round(Math.pow(Math.random(), 3) * 100)); // heavily right skewed
            }
            inputArea.value = arr.join(', ');
        });

        calcBtn.addEventListener('click', () => {
            const rawVal = inputArea.value;
            // Parse numbers
            const nums = rawVal
                .replace(/[^\d.-]/g, ' ') // replace everything except digits, dots, minus with space
                .split(/\s+/)
                .map(parseFloat)
                .filter(n => !isNaN(n));

            if (nums.length === 0) {
                resultsDiv.innerHTML = '<div class="empty-history-msg">Please enter a valid list of numbers first.</div>';
                return;
            }

            calculateStats(nums);
        });

        function calculateStats(arr) {
            const N = arr.length;
            const sorted = [...arr].sort((a, b) => a - b);
            
            // Sum
            const sum = sorted.reduce((acc, curr) => acc + curr, 0);
            
            // Mean
            const mean = sum / N;

            // Median
            let median = 0;
            const mid = Math.floor(N / 2);
            if (N % 2 !== 0) {
                median = sorted[mid];
            } else {
                median = (sorted[mid - 1] + sorted[mid]) / 2;
            }

            // Mode
            const freq = {};
            let maxFreq = 0;
            let modes = [];
            for (const x of sorted) {
                freq[x] = (freq[x] || 0) + 1;
                if (freq[x] > maxFreq) {
                    maxFreq = freq[x];
                }
            }
            if (maxFreq > 1) {
                for (const x in freq) {
                    if (freq[x] === maxFreq) {
                        modes.push(parseFloat(x));
                    }
                }
            }
            const modeText = modes.length > 0 ? modes.join(', ') : 'No unique mode';

            // Min & Max
            const min = sorted[0];
            const max = sorted[N - 1];
            const range = max - min;

            // Standard Deviations & Variances
            const sqDiffSum = sorted.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0);
            
            const popVariance = sqDiffSum / N;
            const popStdDev = Math.sqrt(popVariance);

            // Sample statistics only valid if N > 1
            const sampleVariance = N > 1 ? sqDiffSum / (N - 1) : 0;
            const sampleStdDev = N > 1 ? Math.sqrt(sampleVariance) : 0;

            // Render stats summaries
            resultsDiv.innerHTML = `
                <div class="results-section-title">Descriptive Statistics</div>
                <div class="results-grid">
                    <div class="result-card highlight">
                        <span class="result-card-label">Mean (&mu;)</span>
                        <span class="result-card-val success">${Number(mean.toFixed(4))}</span>
                        <span class="result-card-desc">Average of dataset</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Median (Q2)</span>
                        <span class="result-card-val">${Number(median.toFixed(4))}</span>
                        <span class="result-card-desc">Middle number sorted</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Mode</span>
                        <span class="result-card-val indigo" style="font-size: 18px; word-break: break-all;">${modeText}</span>
                        <span class="result-card-desc">Most frequent value</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Count (N)</span>
                        <span class="result-card-val">${N}</span>
                        <span class="result-card-desc">Total observations</span>
                    </div>
                </div>

                <div class="results-grid">
                    <div class="result-card">
                        <span class="result-card-label">Sample Std Dev (s)</span>
                        <span class="result-card-val success">${Number(sampleStdDev.toFixed(4))}</span>
                        <span class="result-card-desc">Dispersion of sample</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Pop. Std Dev (&sigma;)</span>
                        <span class="result-card-val">${Number(popStdDev.toFixed(4))}</span>
                        <span class="result-card-desc">Dispersion of population</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Sample Variance (s²)</span>
                        <span class="result-card-val indigo">${Number(sampleVariance.toFixed(4))}</span>
                        <span class="result-card-desc">Sample spread metric</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Min / Max</span>
                        <span class="result-card-val" style="font-size: 18px;">${min} / ${max}</span>
                        <span class="result-card-desc">Range: ${range}</span>
                    </div>
                </div>

                <div class="results-section-title">Data Histogram Distribution</div>
                <div id="stats-histogram-container">
                    ${generateHistogram(sorted, min, max, mean)}
                </div>
            `;

            saveHistory(`Analyzed dataset N=${N}`, `Mean: ${mean.toFixed(2)}, StdDev: ${sampleStdDev.toFixed(2)}`);
        }

        // Draw dynamic SVG histogram
        function generateHistogram(sorted, min, max, mean) {
            const svgWidth = 480;
            const svgHeight = 200;
            const paddingLeft = 40;
            const paddingRight = 15;
            const paddingTop = 15;
            const paddingBottom = 30;

            const graphWidth = svgWidth - paddingLeft - paddingRight;
            const graphHeight = svgHeight - paddingTop - paddingBottom;

            // Generate Bins (Sturges' formula or simple 6 bins)
            const numBins = 6;
            const range = max - min;
            const binSize = range === 0 ? 1 : range / numBins;
            const bins = Array(numBins).fill(0);

            for (const x of sorted) {
                let binIdx = Math.floor((x - min) / binSize);
                if (binIdx >= numBins) binIdx = numBins - 1; // handle max value edge case
                if (binIdx < 0) binIdx = 0;
                bins[binIdx]++;
            }

            const maxBinCount = Math.max(...bins, 1);
            const barWidth = graphWidth / numBins;

            let barsHtml = '';
            for (let i = 0; i < numBins; i++) {
                const count = bins[i];
                const barHeight = (count / maxBinCount) * graphHeight;
                const x = paddingLeft + i * barWidth + 3; // add 3px gap
                const y = svgHeight - paddingBottom - barHeight;
                const binMin = min + i * binSize;
                const binMax = min + (i + 1) * binSize;

                barsHtml += `
                    <g class="histogram-bar-group">
                        <rect x="${x}" y="${y}" width="${barWidth - 6}" height="${barHeight}" fill="rgba(20, 184, 166, 0.2)" stroke="var(--accent-teal)" stroke-width="1.5" rx="3" />
                        <text x="${x + (barWidth - 6)/2}" y="${y - 4}" class="chart-axis-text" text-anchor="middle">${count}</text>
                        <text x="${x + (barWidth - 6)/2}" y="${svgHeight - 14}" class="chart-axis-text" text-anchor="middle">${Math.round(binMin)}-${Math.round(binMax)}</text>
                    </g>
                `;
            }

            // Draw line at mean value
            let meanLineHtml = '';
            if (max > min) {
                const meanX = paddingLeft + ((mean - min) / range) * graphWidth;
                meanLineHtml = `
                    <line x1="${meanX}" y1="${paddingTop}" x2="${meanX}" y2="${svgHeight - paddingBottom}" stroke="var(--accent-indigo)" stroke-width="2" stroke-dasharray="4" />
                    <text x="${meanX + 4}" y="${paddingTop + 10}" class="chart-axis-text" fill="var(--accent-indigo)" font-weight="700">Mean: ${mean.toFixed(1)}</text>
                `;
            }

            return `
                <div class="chart-container">
                    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="svg-chart">
                        <!-- Bars -->
                        ${barsHtml}
                        <!-- Mean indicator -->
                        ${meanLineHtml}
                        <!-- Axes -->
                        <line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${svgHeight - paddingBottom}" class="chart-axis-line" />
                        <line x1="${paddingLeft}" y1="${svgHeight - paddingBottom}" x2="${svgWidth - paddingRight}" y2="${svgHeight - paddingBottom}" class="chart-axis-line" />
                        <!-- Y Axis counts -->
                        <text x="${paddingLeft - 8}" y="${paddingTop + 5}" class="chart-axis-text" text-anchor="end">${maxBinCount}</text>
                        <text x="${paddingLeft - 8}" y="${svgHeight - paddingBottom + 3}" class="chart-axis-text" text-anchor="end">0</text>
                    </svg>
                </div>
            `;
        }
    }
};
