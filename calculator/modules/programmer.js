// Programmer Base Converter & Bit Manipulation Module

export default {
    id: 'programmer',
    name: 'Programmer Base Math',
    icon: 'code',
    category: 'programmer',
    description: 'Convert between Hexadecimal, Decimal, Octal, and Binary. Includes an interactive 32-bit binary board and bitwise operation calculators.',
    tags: ['programmer', 'base', 'hex', 'binary', 'decimal', 'octal', 'bitwise', 'and', 'or', 'xor'],

    renderInputs() {
        return `
            <div class="results-section-title">Base Conversions</div>
            <div class="form-group">
                <label class="form-label" for="prog-hex">Hexadecimal (HEX - Base 16)</label>
                <div class="input-wrapper">
                    <input type="text" id="prog-hex" data-base="16" class="form-input number-input prog-base-input" placeholder="e.g. A3F" style="text-transform: uppercase;">
                    <span class="input-suffix">HEX</span>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label" for="prog-dec">Decimal (DEC - Base 10)</label>
                <div class="input-wrapper">
                    <input type="number" id="prog-dec" data-base="10" class="form-input number-input prog-base-input" placeholder="e.g. 2623" min="-2147483648" max="4294967295">
                    <span class="input-suffix">DEC</span>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="prog-oct">Octal (OCT - Base 8)</label>
                <div class="input-wrapper">
                    <input type="text" id="prog-oct" data-base="8" class="form-input number-input prog-base-input" placeholder="e.g. 5107">
                    <span class="input-suffix">OCT</span>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="prog-bin">Binary (BIN - Base 2)</label>
                <div class="input-wrapper">
                    <input type="text" id="prog-bin" data-base="2" class="form-input number-input prog-base-input" placeholder="e.g. 101000111111">
                    <span class="input-suffix">BIN</span>
                </div>
            </div>
            
            <div class="results-section-title" style="margin-top: 10px;">Bitwise Operator</div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="prog-op-a">Operand A</label>
                    <input type="text" id="prog-op-a" class="form-input number-input" value="12" style="font-size: 14px;">
                </div>
                <div class="form-group">
                    <label class="form-label" for="prog-op-b">Operand B</label>
                    <input type="text" id="prog-op-b" class="form-input number-input" value="5" style="font-size: 14px;">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="prog-operator">Operation</label>
                    <select id="prog-operator" class="form-select" style="padding: 10px;">
                        <option value="&">AND (&)</option>
                        <option value="|">OR (|)</option>
                        <option value="^">XOR (^)</option>
                        <option value="<<">LSH (<<)</option>
                        <option value=">>">RSH (>>)</option>
                        <option value="~">NOT (~ A)</option>
                    </select>
                </div>
                <div class="form-group" style="justify-content: flex-end;">
                    <button class="calculate-btn" id="prog-bitwise-calc-btn" style="padding: 11px;">
                        Compute Bitwise
                    </button>
                </div>
            </div>
        `;
    },

    renderOutputs() {
        return `
            <div class="results-container">
                <div class="results-section-title">Interactive 32-Bit Register</div>
                <div class="bit-grid" id="prog-bit-grid">
                    <!-- Dynamic rendering of 32 bits grouped into bytes -->
                </div>
                
                <div class="results-section-title" id="bitwise-result-title">Bitwise Results</div>
                <div class="results-grid" id="bitwise-results-grid">
                    <div class="result-card">
                        <span class="result-card-label">Select operation</span>
                        <span class="result-card-val">No result</span>
                        <span class="result-card-desc">Result will be shown here</span>
                    </div>
                </div>
            </div>
        `;
    },

    init(containerInputs, containerOutputs, saveHistory) {
        const hexInput = containerInputs.querySelector('#prog-hex');
        const decInput = containerInputs.querySelector('#prog-dec');
        const octInput = containerInputs.querySelector('#prog-oct');
        const binInput = containerInputs.querySelector('#prog-bin');
        const baseInputs = containerInputs.querySelectorAll('.prog-base-input');

        const opAInput = containerInputs.querySelector('#prog-op-a');
        const opBInput = containerInputs.querySelector('#prog-op-b');
        const opSelect = containerInputs.querySelector('#prog-operator');
        const bitwiseCalcBtn = containerInputs.querySelector('#prog-bitwise-calc-btn');

        const bitGrid = containerOutputs.querySelector('#prog-bit-grid');
        const bitwiseResultsGrid = containerOutputs.querySelector('#bitwise-results-grid');

        let currentValue = 0; // standard 32-bit unsigned representation

        // Update all conversion fields based on currentValue
        function updateAllFields(sourceKey = null) {
            // Guarantee 32-bit unsigned
            const unsignedVal = currentValue >>> 0;

            if (sourceKey !== 'HEX') hexInput.value = unsignedVal.toString(16).toUpperCase();
            if (sourceKey !== 'DEC') decInput.value = currentValue.toString(10);
            if (sourceKey !== 'OCT') octInput.value = unsignedVal.toString(8);
            if (sourceKey !== 'BIN') binInput.value = unsignedVal.toString(2);

            drawBitGrid(unsignedVal);
        }

        // Render the 32 bits interactive board
        function drawBitGrid(val) {
            let html = '';
            
            // Build 32 bits, grouped into 4 bytes (rows of 8 bits)
            for (let byteIdx = 3; byteIdx >= 0; byteIdx--) {
                const bitStart = byteIdx * 8 + 7;
                const bitEnd = byteIdx * 8;
                
                let cellsHtml = '';
                for (let bit = bitStart; bit >= bitEnd; bit--) {
                    const isSet = (val & (1 << bit)) !== 0;
                    const cellClass = isSet ? 'bit-cell active' : 'bit-cell';
                    cellsHtml += `<div class="${cellClass}" data-bit-idx="${bit}">${isSet ? 1 : 0}</div>`;
                }

                html += `
                    <div class="bit-row-wrapper">
                        <div class="bit-row-label">Byte ${byteIdx} (Bits ${bitStart}–${bitEnd})</div>
                        <div class="bit-row">${cellsHtml}</div>
                    </div>
                `;
            }
            bitGrid.innerHTML = html;
        }

        // Bidirectional base conversions sync
        containerInputs.addEventListener('input', (e) => {
            const input = e.target.closest('.prog-base-input');
            if (!input) return;

            const base = parseInt(input.dataset.base);
            const valStr = input.value.trim();

            if (valStr === '') {
                currentValue = 0;
                updateAllFields(input.id === 'prog-hex' ? 'HEX' : input.id === 'prog-dec' ? 'DEC' : input.id === 'prog-oct' ? 'OCT' : 'BIN');
                return;
            }

            try {
                let parsed = 0;
                if (base === 10) {
                    parsed = parseInt(valStr, 10);
                } else if (base === 16) {
                    parsed = parseInt(valStr, 16);
                } else if (base === 8) {
                    parsed = parseInt(valStr, 8);
                } else if (base === 2) {
                    parsed = parseInt(valStr, 2);
                }

                if (isNaN(parsed)) {
                    throw new Error('Invalid input');
                }

                currentValue = parsed;
                updateAllFields(input.id === 'prog-hex' ? 'HEX' : input.id === 'prog-dec' ? 'DEC' : input.id === 'prog-oct' ? 'OCT' : 'BIN');

            } catch (err) {
                // don't change values on active typing errors, just wait
            }
        });

        // Click on bit grid toggle
        bitGrid.addEventListener('click', (e) => {
            const cell = e.target.closest('.bit-cell');
            if (!cell) return;

            const bitIdx = parseInt(cell.dataset.bit_idx || cell.dataset.bitIdx);
            
            // Toggle the bit in currentValue
            currentValue = currentValue ^ (1 << bitIdx);
            updateAllFields();
            
            saveHistory(`Toggled bit ${bitIdx}`, `DEC: ${currentValue}`);
        });

        // Compute bitwise operation
        bitwiseCalcBtn.addEventListener('click', () => {
            const opAStr = opAInput.value.trim();
            const opBStr = opBInput.value.trim();
            const op = opSelect.value;

            // Detect prefix base
            function parseOperand(str) {
                str = str.toLowerCase();
                if (str.startsWith('0x')) return parseInt(str.slice(2), 16);
                if (str.startsWith('0b')) return parseInt(str.slice(2), 2);
                if (str.startsWith('0o')) return parseInt(str.slice(2), 8);
                return parseInt(str, 10);
            }

            try {
                const a = parseOperand(opAStr);
                const b = parseOperand(opBStr);

                if (isNaN(a)) throw new Error('Operand A is invalid');
                if (op !== '~' && isNaN(b)) throw new Error('Operand B is required');

                let result = 0;
                let mathRepr = '';
                
                switch (op) {
                    case '&':
                        result = a & b;
                        mathRepr = `${a} & ${b}`;
                        break;
                    case '|':
                        result = a | b;
                        mathRepr = `${a} | ${b}`;
                        break;
                    case '^':
                        result = a ^ b;
                        mathRepr = `${a} ^ ${b}`;
                        break;
                    case '<<':
                        result = a << b;
                        mathRepr = `${a} << ${b}`;
                        break;
                    case '>>':
                        result = a >> b;
                        mathRepr = `${a} >> ${b}`;
                        break;
                    case '~':
                        result = ~a;
                        mathRepr = `~${a}`;
                        break;
                }

                const uResult = result >>> 0;

                bitwiseResultsGrid.innerHTML = `
                    <div class="result-card highlight">
                        <span class="result-card-label">Result (DEC)</span>
                        <span class="result-card-val success">${result}</span>
                        <span class="result-card-desc">Expression: ${mathRepr}</span>
                    </div>
                    <div class="result-card">
                        <span class="result-card-label">Result (HEX)</span>
                        <span class="result-card-val indigo">0x${uResult.toString(16).toUpperCase()}</span>
                        <span class="result-card-desc">Hexadecimal format</span>
                    </div>
                    <div class="result-card" style="grid-column: span 2;">
                        <span class="result-card-label">Result (BIN)</span>
                        <span class="result-card-val success" style="font-size: 14px; word-break: break-all;">${uResult.toString(2)}</span>
                        <span class="result-card-desc">Binary 32-bit sequence</span>
                    </div>
                `;

                saveHistory(`Bitwise calc: ${mathRepr}`, `Result: ${result}`);

            } catch (err) {
                bitwiseResultsGrid.innerHTML = `
                    <div class="result-card" style="border-color: var(--accent-danger); background: rgba(244,63,94,0.05); grid-column: span 2;">
                        <span class="result-card-label" style="color: var(--accent-danger);">Operator Error</span>
                        <span class="result-card-val" style="font-size: 15px; color: var(--text-primary); font-family: var(--font-sans);">${err.message}</span>
                        <span class="result-card-desc">Ensure integers are valid (use prefixes 0x/0b if needed).</span>
                    </div>
                `;
            }
        });

        // Initialize with default 0
        updateAllFields();
    }
};
