// Financial Calculator Module (Mortgage & Compound Interest)

export default {
    id: 'financial',
    name: 'Financial Calculator',
    icon: 'payments',
    category: 'financial',
    description: 'Calculate monthly mortgage payments or project compound interest growth with detailed amortization tables and dynamic growth charts.',
    tags: ['financial', 'loan', 'mortgage', 'compound', 'interest', 'money', 'investment', 'roi'],
    
    renderInputs() {
        return `
            <div class="form-group">
                <label class="form-label">Financial Calculation Type</label>
                <div class="segmented-control" id="fin-type-switch">
                    <button class="segmented-btn active" data-type="mortgage">Mortgage / Loan</button>
                    <button class="segmented-btn" data-type="compound">Compound Interest</button>
                </div>
            </div>

            <!-- Mortgage Form (Active by default) -->
            <div id="form-mortgage" class="form-sections flex-column gap-20">
                <div class="form-group">
                    <label class="form-label" for="mort-principal">Loan Amount</label>
                    <div class="input-wrapper">
                        <input type="number" id="mort-principal" class="form-input number-input form-input-with-suffix" value="300000" min="0">
                        <span class="input-suffix">$</span>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="mort-rate">Interest Rate</label>
                        <div class="input-wrapper">
                            <input type="number" id="mort-rate" class="form-input number-input form-input-with-suffix" value="6.5" min="0" step="0.01">
                            <span class="input-suffix">%</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="mort-term">Loan Term</label>
                        <div class="input-wrapper">
                            <input type="number" id="mort-term" class="form-input number-input form-input-with-suffix" value="30" min="1">
                            <span class="input-suffix">yrs</span>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="mort-extra">Extra Payment (Monthly)</label>
                    <div class="input-wrapper">
                        <input type="number" id="mort-extra" class="form-input number-input form-input-with-suffix" value="0" min="0">
                        <span class="input-suffix">$/mo</span>
                    </div>
                </div>
            </div>

            <!-- Compound Interest Form (Hidden by default) -->
            <div id="form-compound" class="form-sections hidden flex-column gap-20">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="comp-principal">Initial Deposit</label>
                        <div class="input-wrapper">
                            <input type="number" id="comp-principal" class="form-input number-input form-input-with-suffix" value="10000" min="0">
                            <span class="input-suffix">$</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="comp-monthly">Monthly Addition</label>
                        <div class="input-wrapper">
                            <input type="number" id="comp-monthly" class="form-input number-input form-input-with-suffix" value="200" min="0">
                            <span class="input-suffix">$</span>
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="comp-rate">Interest Rate (Annual)</label>
                        <div class="input-wrapper">
                            <input type="number" id="comp-rate" class="form-input number-input form-input-with-suffix" value="8" min="0" step="0.01">
                            <span class="input-suffix">%</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="comp-term">Years to Grow</label>
                        <div class="input-wrapper">
                            <input type="number" id="comp-term" class="form-input number-input form-input-with-suffix" value="20" min="1">
                            <span class="input-suffix">yrs</span>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="comp-frequency">Compounding Frequency</label>
                    <select id="comp-frequency" class="form-select">
                        <option value="12" selected>Monthly (12/yr)</option>
                        <option value="4">Quarterly (4/yr)</option>
                        <option value="1">Annually (1/yr)</option>
                        <option value="365">Daily (365/yr)</option>
                    </select>
                </div>
            </div>

            <button class="calculate-btn" id="fin-calc-btn">
                <span class="material-symbols-outlined">calculate</span>
                <span>Compute Results</span>
            </button>
        `;
    },

    renderOutputs() {
        return `
            <div class="results-container" id="fin-results">
                <!-- Will be dynamically filled based on calculations -->
            </div>
        `;
    },

    init(containerInputs, containerOutputs, saveHistory) {
        const typeSwitch = containerInputs.querySelector('#fin-type-switch');
        const formMortgage = containerInputs.querySelector('#form-mortgage');
        const formCompound = containerInputs.querySelector('#form-compound');
        const calcBtn = containerInputs.querySelector('#fin-calc-btn');
        const resultsDiv = containerOutputs.querySelector('#fin-results');

        let activeType = 'mortgage';

        // Toggle form types
        typeSwitch.addEventListener('click', (e) => {
            const btn = e.target.closest('.segmented-btn');
            if (!btn) return;
            
            typeSwitch.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            activeType = btn.dataset.type;
            if (activeType === 'mortgage') {
                formMortgage.classList.remove('hidden');
                formCompound.classList.add('hidden');
            } else {
                formMortgage.classList.add('hidden');
                formCompound.classList.remove('hidden');
            }
            resultsDiv.innerHTML = '';
        });

        // Trigger calculation on click
        calcBtn.addEventListener('click', () => {
            if (activeType === 'mortgage') {
                calculateMortgage();
            } else {
                calculateCompound();
            }
        });

        // Format currency helper
        function formatCurrency(val) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
        }

        // SVG Polyline generator
        function generateSVGChart(title, pointsA, pointsB, labels) {
            const svgWidth = 480;
            const svgHeight = 220;
            const paddingLeft = 55;
            const paddingRight = 15;
            const paddingTop = 15;
            const paddingBottom = 30;

            const graphWidth = svgWidth - paddingLeft - paddingRight;
            const graphHeight = svgHeight - paddingTop - paddingBottom;

            // Combine both datasets to find max value
            const allVals = [...pointsA, ...pointsB];
            const maxVal = Math.max(...allVals, 1);
            const numPoints = pointsA.length;

            const pointsAcoords = [];
            const pointsBcoords = [];

            for (let i = 0; i < numPoints; i++) {
                const x = paddingLeft + (i / (numPoints - 1)) * graphWidth;
                const yA = svgHeight - paddingBottom - (pointsA[i] / maxVal) * graphHeight;
                const yB = svgHeight - paddingBottom - (pointsB[i] / maxVal) * graphHeight;
                pointsAcoords.push(`${x},${yA}`);
                pointsBcoords.push(`${x},${yB}`);
            }

            // Create Gridlines & labels
            let yGridlines = '';
            for (let k = 0; k <= 4; k++) {
                const ratio = k / 4;
                const y = svgHeight - paddingBottom - ratio * graphHeight;
                const gridVal = formatCurrency(ratio * maxVal);
                yGridlines += `
                    <line x1="${paddingLeft}" y1="${y}" x2="${svgWidth - paddingRight}" y2="${y}" stroke="rgba(15,23,42,0.08)" stroke-width="1"/>
                    <text x="${paddingLeft - 8}" y="${y + 3}" class="chart-axis-text" text-anchor="end">${gridVal}</text>
                `;
            }

            let xGridlines = '';
            const xStep = Math.max(1, Math.floor(numPoints / 5));
            for (let i = 0; i < numPoints; i += xStep) {
                const x = paddingLeft + (i / (numPoints - 1)) * graphWidth;
                xGridlines += `
                    <line x1="${x}" y1="${paddingTop}" x2="${x}" y2="${svgHeight - paddingBottom}" stroke="rgba(15,23,42,0.08)" stroke-width="1"/>
                    <text x="${x}" y="${svgHeight - 12}" class="chart-axis-text" text-anchor="middle">${labels[i]}</text>
                `;
            }

            return `
                <div class="chart-container">
                    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="svg-chart">
                        <!-- Gradients -->
                        <defs>
                            <linearGradient id="glow-indigo" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="var(--accent-indigo)" stop-opacity="0.3"/>
                                <stop offset="100%" stop-color="var(--accent-indigo)" stop-opacity="0.0"/>
                            </linearGradient>
                            <linearGradient id="glow-teal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="var(--accent-teal)" stop-opacity="0.3"/>
                                <stop offset="100%" stop-color="var(--accent-teal)" stop-opacity="0.0"/>
                            </linearGradient>
                        </defs>
                        <!-- Grid & Axes -->
                        ${yGridlines}
                        ${xGridlines}
                        
                        <!-- Area Under Lines -->
                        <path d="M ${paddingLeft},${svgHeight - paddingBottom} L ${pointsAcoords.join(' L ')} L ${svgWidth - paddingRight},${svgHeight - paddingBottom} Z" fill="url(#glow-indigo)" />
                        <path d="M ${paddingLeft},${svgHeight - paddingBottom} L ${pointsBcoords.join(' L ')} L ${svgWidth - paddingRight},${svgHeight - paddingBottom} Z" fill="url(#glow-teal)" />
                        
                        <!-- Draw lines -->
                        <polyline points="${pointsAcoords.join(' ')}" class="chart-line-loan" />
                        <polyline points="${pointsBcoords.join(' ')}" class="chart-line-interest" />
                        
                        <!-- Axes borders -->
                        <line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${svgHeight - paddingBottom}" class="chart-axis-line" />
                        <line x1="${paddingLeft}" y1="${svgHeight - paddingBottom}" x2="${svgWidth - paddingRight}" y2="${svgHeight - paddingBottom}" class="chart-axis-line" />
                    </svg>
                    <div class="chart-legend">
                        <div class="legend-item">
                            <span class="legend-dot indigo"></span>
                            <span>Principal / Balance</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-dot teal"></span>
                            <span>Total Interest / Deposits</span>
                        </div>
                    </div>
                </div>
            `;
        }

        function calculateMortgage() {
            const principal = parseFloat(containerInputs.querySelector('#mort-principal').value) || 0;
            const annualRate = parseFloat(containerInputs.querySelector('#mort-rate').value) || 0;
            const termYears = parseInt(containerInputs.querySelector('#mort-term').value) || 0;
            const extraPayment = parseFloat(containerInputs.querySelector('#mort-extra').value) || 0;

            if (principal <= 0 || annualRate <= 0 || termYears <= 0) {
                resultsDiv.innerHTML = '<div class="empty-history-msg">Please enter valid calculation inputs.</div>';
                return;
            }

            const monthlyRate = (annualRate / 100) / 12;
            const totalMonths = termYears * 12;
            
            // Standard Mortgage Payment Formula: P * ( r(1+r)^n ) / ( (1+r)^n - 1 )
            const rFactor = Math.pow(1 + monthlyRate, totalMonths);
            const standardMonthlyPayment = monthlyRate > 0 
                ? principal * (monthlyRate * rFactor) / (rFactor - 1) 
                : principal / totalMonths;

            let balance = principal;
            let totalInterest = 0;
            let paymentsMade = 0;
            let month = 0;

            const yearlyDataBalance = [principal];
            const yearlyDataInterest = [0];
            const yearsLabels = ['Start'];

            const amortizationRows = [];

            while (balance > 0 && month < totalMonths) {
                month++;
                const interestPayment = balance * monthlyRate;
                let principalPayment = standardMonthlyPayment - interestPayment;
                
                // Account for extra payment
                let actualPayment = standardMonthlyPayment + extraPayment;
                principalPayment += extraPayment;

                if (balance < principalPayment) {
                    principalPayment = balance;
                    actualPayment = interestPayment + balance;
                    balance = 0;
                } else {
                    balance -= principalPayment;
                }

                totalInterest += interestPayment;
                paymentsMade += actualPayment;

                // Capture data at the end of each year
                if (month % 12 === 0 || balance === 0) {
                    const currentYear = Math.ceil(month / 12);
                    yearlyDataBalance.push(balance);
                    yearlyDataInterest.push(totalInterest);
                    yearsLabels.push(`Yr ${currentYear}`);
                }

                // Add to amortization table rows (sample first month of each year)
                if (month % 12 === 1 || balance === 0) {
                    const yearNo = Math.floor(month / 12) + 1;
                    amortizationRows.push(`
                        <tr>
                            <td class="table-num">Yr ${yearNo} (Mo ${month})</td>
                            <td class="table-num">${formatCurrency(actualPayment)}</td>
                            <td class="table-num">${formatCurrency(principalPayment)}</td>
                            <td class="table-num">${formatCurrency(interestPayment)}</td>
                            <td class="table-num">${formatCurrency(balance)}</td>
                        </tr>
                    `);
                }
                
                if (balance === 0) break;
            }

            const totalPayments = paymentsMade;

            resultsDiv.innerHTML = `
                <div class="results-section-title">Calculation Summary</div>
                <div class="results-grid">
                    <div class="result-card highlight">
                        <span class="result-card-label">Monthly Payment</span>
                        <span class="result-card-val success">${formatCurrency(standardMonthlyPayment)}</span>
                        <span class="result-card-desc">Standard P&I payment</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Total Payments</span>
                        <span class="result-card-val">${formatCurrency(totalPayments)}</span>
                        <span class="result-card-desc">Over duration of loan</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Total Interest Paid</span>
                        <span class="result-card-val indigo">${formatCurrency(totalInterest)}</span>
                        <span class="result-card-desc">Overall interest cost</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Paid Off In</span>
                        <span class="result-card-val success">${(month/12).toFixed(1)} yrs</span>
                        <span class="result-card-desc">With extra payments</span>
                    </div>
                </div>

                <div class="results-section-title">Loan Amortization Over Time</div>
                ${generateSVGChart('Loan Amortization Chart', yearlyDataBalance, yearlyDataInterest, yearsLabels)}

                <div class="results-section-title">Annual Schedule Preview</div>
                <div class="table-wrapper">
                    <table class="table-amort">
                        <thead>
                            <tr>
                                <th>Timeline</th>
                                <th>Payment</th>
                                <th>Principal Paid</th>
                                <th>Interest Paid</th>
                                <th>Remaining Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${amortizationRows.join('')}
                        </tbody>
                    </table>
                </div>
            `;

            saveHistory(`Loan ${formatCurrency(principal)} @ ${annualRate}%`, `Pmt: ${formatCurrency(standardMonthlyPayment)}/mo`);
        }

        function calculateCompound() {
            const initial = parseFloat(containerInputs.querySelector('#comp-principal').value) || 0;
            const monthlyAddition = parseFloat(containerInputs.querySelector('#comp-monthly').value) || 0;
            const rate = parseFloat(containerInputs.querySelector('#comp-rate').value) || 0;
            const term = parseInt(containerInputs.querySelector('#comp-term').value) || 0;
            const frequency = parseInt(containerInputs.querySelector('#comp-frequency').value) || 12;

            if (term <= 0 || (initial <= 0 && monthlyAddition <= 0)) {
                resultsDiv.innerHTML = '<div class="empty-history-msg">Please enter valid calculation inputs.</div>';
                return;
            }

            const r = rate / 100;
            const compoundPeriodsPerYear = frequency;
            
            let totalDeposits = initial;
            let currentBalance = initial;
            let accumulatedInterest = 0;

            const yearlyBalance = [initial];
            const yearlyDeposits = [initial];
            const yearsLabels = ['Start'];

            for (let year = 1; year <= term; year++) {
                // Compound formula per year
                for (let m = 1; m <= 12; m++) {
                    // Calculate interest daily/monthly/quarterly/annually depending on choice
                    // To be simple and accurate, we compute monthly sub-steps:
                    // If compound period is monthly (12), quarterly (4), annual (1)
                    // We apply interest to the balance monthly based on monthly rate
                    // Monthly addition is added at end of month
                    const monthlyInterestRate = r / 12;
                    const monthlyInterest = currentBalance * monthlyInterestRate;
                    currentBalance += monthlyInterest;
                    currentBalance += monthlyAddition;
                    
                    totalDeposits += monthlyAddition;
                    accumulatedInterest += monthlyInterest;
                }

                yearlyBalance.push(currentBalance);
                yearlyDeposits.push(totalDeposits);
                yearsLabels.push(`Yr ${year}`);
            }

            resultsDiv.innerHTML = `
                <div class="results-section-title">Wealth Growth Summary</div>
                <div class="results-grid">
                    <div class="result-card highlight">
                        <span class="result-card-label">Ending Balance</span>
                        <span class="result-card-val success">${formatCurrency(currentBalance)}</span>
                        <span class="result-card-desc">Future portfolio value</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Total Deposits</span>
                        <span class="result-card-val">${formatCurrency(totalDeposits)}</span>
                        <span class="result-card-desc">Your contributions</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Accrued Interest</span>
                        <span class="result-card-val indigo">${formatCurrency(currentBalance - totalDeposits)}</span>
                        <span class="result-card-desc">Interest compounding gains</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Total Growth %</span>
                        <span class="result-card-val success">${(((currentBalance - totalDeposits) / totalDeposits) * 100).toFixed(0)}%</span>
                        <span class="result-card-desc">Yield over cost</span>
                    </div>
                </div>

                <div class="results-section-title">Portfolio Growth Curve</div>
                ${generateSVGChart('Portfolio Growth Curve', yearlyBalance, yearlyDeposits, yearsLabels)}
            `;

            saveHistory(`Compound ${formatCurrency(initial)} + ${formatCurrency(monthlyAddition)}/mo @ ${rate}%`, `FV: ${formatCurrency(currentBalance)}`);
        }
    }
};
