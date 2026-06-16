// Scientific & Standard Calculator Module

// Custom safe expression evaluator (Tokenization -> Shunting-yard -> RPN evaluation)
class MathParser {
    static tokenize(str) {
        const tokens = [];
        let i = 0;
        str = str.replace(/\s+/g, ''); // strip whitespace
        
        // Match numbers, operators, words (functions/constants), brackets
        while (i < str.length) {
            const char = str[i];
            
            if (/[0-9.]/.test(char)) {
                let numStr = '';
                while (i < str.length && /[0-9.]/.test(str[i])) {
                    numStr += str[i];
                    i++;
                }
                tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
                continue;
            }
            
            if (/[a-zA-Z]/.test(char)) {
                let wordStr = '';
                while (i < str.length && /[a-zA-Z0-9]/.test(str[i])) {
                    wordStr += str[i];
                    i++;
                }
                
                const lower = wordStr.toLowerCase();
                if (lower === 'pi') {
                    tokens.push({ type: 'NUMBER', value: Math.PI });
                } else if (lower === 'e') {
                    tokens.push({ type: 'NUMBER', value: Math.E });
                } else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'abs'].includes(lower)) {
                    tokens.push({ type: 'FUNCTION', value: lower });
                } else {
                    tokens.push({ type: 'VARIABLE', value: wordStr });
                }
                continue;
            }
            
            if ('+-*/%^()'.includes(char)) {
                // Check for unary minus:
                // Minus is unary if it is at the start, or follows another operator or opening parenthesis
                if (char === '-') {
                    const prev = tokens[tokens.length - 1];
                    if (!prev || prev.type === 'OPERATOR' || (prev.type === 'BRACKET' && prev.value === '(')) {
                        tokens.push({ type: 'NUMBER', value: 0 }); // insert 0 for 0 - x trick
                    }
                }
                
                if (char === '(' || char === ')') {
                    tokens.push({ type: 'BRACKET', value: char });
                } else {
                    tokens.push({ type: 'OPERATOR', value: char });
                }
                i++;
                continue;
            }
            
            // Skip unrecognized characters
            i++;
        }
        return tokens;
    }

    static evaluate(str) {
        try {
            const tokens = this.tokenize(str);
            if (tokens.length === 0) return 0;
            
            // Precedence definition
            const precedence = {
                '+': 1, '-': 1,
                '*': 2, '/': 2, '%': 2,
                '^': 3
            };
            
            const associativity = {
                '+': 'L', '-': 'L',
                '*': 'L', '/': 'L', '%': 'L',
                '^': 'R'
            };
            
            const outputQueue = [];
            const operatorStack = [];
            
            for (const token of tokens) {
                if (token.type === 'NUMBER') {
                    outputQueue.push(token);
                } else if (token.type === 'FUNCTION') {
                    operatorStack.push(token);
                } else if (token.type === 'OPERATOR') {
                    let top = operatorStack[operatorStack.length - 1];
                    while (top && (top.type === 'FUNCTION' || (top.type === 'OPERATOR' && (
                        (associativity[token.value] === 'L' && precedence[token.value] <= precedence[top.value]) ||
                        (associativity[token.value] === 'R' && precedence[token.value] < precedence[top.value])
                    )))) {
                        outputQueue.push(operatorStack.pop());
                        top = operatorStack[operatorStack.length - 1];
                    }
                    operatorStack.push(token);
                } else if (token.type === 'BRACKET' && token.value === '(') {
                    operatorStack.push(token);
                } else if (token.type === 'BRACKET' && token.value === ')') {
                    let top = operatorStack[operatorStack.length - 1];
                    while (top && !(top.type === 'BRACKET' && top.value === '(')) {
                        outputQueue.push(operatorStack.pop());
                        top = operatorStack[operatorStack.length - 1];
                    }
                    if (!top) throw new Error('Mismatched parentheses');
                    operatorStack.pop(); // discard '('
                    
                    // If top of stack is a function, pop it onto output queue
                    const nextTop = operatorStack[operatorStack.length - 1];
                    if (nextTop && nextTop.type === 'FUNCTION') {
                        outputQueue.push(operatorStack.pop());
                    }
                }
            }
            
            while (operatorStack.length > 0) {
                const top = operatorStack.pop();
                if (top.type === 'BRACKET') throw new Error('Mismatched parentheses');
                outputQueue.push(top);
            }
            
            // Evaluate Postfix
            const evalStack = [];
            for (const token of outputQueue) {
                if (token.type === 'NUMBER') {
                    evalStack.push(token.value);
                } else if (token.type === 'OPERATOR') {
                    if (evalStack.length < 2) throw new Error('Invalid expression');
                    const b = evalStack.pop();
                    const a = evalStack.pop();
                    switch (token.value) {
                        case '+': evalStack.push(a + b); break;
                        case '-': evalStack.push(a - b); break;
                        case '*': evalStack.push(a * b); break;
                        case '/': 
                            if (b === 0) throw new Error('Division by zero');
                            evalStack.push(a / b); 
                            break;
                        case '%': evalStack.push(a % b); break;
                        case '^': evalStack.push(Math.pow(a, b)); break;
                    }
                } else if (token.type === 'FUNCTION') {
                    if (evalStack.length < 1) throw new Error('Invalid expression');
                    const a = evalStack.pop();
                    switch (token.value) {
                        case 'sin': evalStack.push(Math.sin(a)); break; // in radians
                        case 'cos': evalStack.push(Math.cos(a)); break;
                        case 'tan': evalStack.push(Math.tan(a)); break;
                        case 'log': evalStack.push(Math.log10(a)); break;
                        case 'ln': evalStack.push(Math.log(a)); break;
                        case 'sqrt': 
                            if (a < 0) throw new Error('Square root of negative');
                            evalStack.push(Math.sqrt(a)); 
                            break;
                        case 'abs': evalStack.push(Math.abs(a)); break;
                    }
                }
            }
            
            if (evalStack.length !== 1) throw new Error('Invalid expression');
            return evalStack[0];
        } catch (err) {
            return 'Error: ' + err.message;
        }
    }
}

export default {
    id: 'standard',
    name: 'Scientific Calculator',
    icon: 'calculate',
    category: 'math',
    description: 'Perform standard math and advanced scientific operations with nested formulas and function evaluation.',
    tags: ['math', 'scientific', 'trig', 'log', 'parenthesis', 'standard'],
    
    renderInputs() {
        return `
            <div class="sci-calculator-container">
                <div class="sci-display">
                    <div class="sci-formula" id="sci-formula-display"></div>
                    <div class="sci-input-line" id="sci-current-val">0</div>
                </div>
                <div class="sci-keyboard">
                    <button class="sci-btn fn" data-val="sin(">sin</button>
                    <button class="sci-btn fn" data-val="cos(">cos</button>
                    <button class="sci-btn fn" data-val="tan(">tan</button>
                    <button class="sci-btn fn" data-val="pi">&pi;</button>
                    <button class="sci-btn fn" data-val="e">e</button>

                    <button class="sci-btn fn" data-val="log(">log</button>
                    <button class="sci-btn fn" data-val="ln(">ln</button>
                    <button class="sci-btn fn" data-val="sqrt(">√</button>
                    <button class="sci-btn fn" data-val="^">^</button>
                    <button class="sci-btn action" data-action="backspace">⌫</button>

                    <button class="sci-btn fn" data-val="(">(</button>
                    <button class="sci-btn fn" data-val=")">)</button>
                    <button class="sci-btn fn" data-action="clear-entry">CE</button>
                    <button class="sci-btn action" data-action="clear">C</button>
                    <button class="sci-btn operator" data-val="/">/</button>

                    <button class="sci-btn" data-val="7">7</button>
                    <button class="sci-btn" data-val="8">8</button>
                    <button class="sci-btn" data-val="9">9</button>
                    <button class="sci-btn fn" data-action="memory-add">M+</button>
                    <button class="sci-btn operator" data-val="*">*</button>

                    <button class="sci-btn" data-val="4">4</button>
                    <button class="sci-btn" data-val="5">5</button>
                    <button class="sci-btn" data-val="6">6</button>
                    <button class="sci-btn fn" data-action="memory-recall">MR</button>
                    <button class="sci-btn operator" data-val="-">-</button>

                    <button class="sci-btn" data-val="1">1</button>
                    <button class="sci-btn" data-val="2">2</button>
                    <button class="sci-btn" data-val="3">3</button>
                    <button class="sci-btn fn" data-action="memory-clear">MC</button>
                    <button class="sci-btn operator" data-val="+">+</button>

                    <button class="sci-btn" data-val="0">0</button>
                    <button class="sci-btn" data-val=".">.</button>
                    <button class="sci-btn fn" data-val="%">%</button>
                    <button class="sci-btn equal" data-action="equals">=</button>
                </div>
            </div>
        `;
    },

    renderOutputs() {
        return `
            <div class="results-container">
                <div class="results-section-title">Calculator Memory</div>
                <div class="results-grid">
                    <div class="result-card">
                        <span class="result-card-label">Memory Value (M)</span>
                        <span class="result-card-val indigo" id="sci-mem-val">0</span>
                        <span class="result-card-desc">Saved via memory keys</span>
                    </div>
                </div>
                <div class="results-section-title">Calculator Tape</div>
                <div class="history-tape" id="sci-history-tape">
                    <!-- History items will be shown here -->
                </div>
            </div>
        `;
    },

    init(containerInputs, containerOutputs, saveHistory) {
        let currentInput = '';
        let lastResult = '';
        let memory = 0;
        
        const formulaDisplay = containerInputs.querySelector('#sci-formula-display');
        const inputDisplay = containerInputs.querySelector('#sci-current-val');
        const memDisplay = containerOutputs.querySelector('#sci-mem-val');
        const tapeContainer = containerOutputs.querySelector('#sci-history-tape');

        function updateScreen() {
            inputDisplay.textContent = currentInput || '0';
            formulaDisplay.textContent = lastResult ? `${lastResult}` : '';
            // Auto scroll display right
            inputDisplay.scrollLeft = inputDisplay.scrollWidth;
        }

        function calculate() {
            if (!currentInput) return;
            
            const expr = currentInput;
            const res = MathParser.evaluate(expr);
            
            // Format number results cleanly
            let displayRes = res;
            if (typeof res === 'number') {
                if (isNaN(res)) {
                    displayRes = 'Error';
                } else if (!isFinite(res)) {
                    displayRes = 'Error: Infinite';
                } else {
                    // Check float length and round nicely
                    displayRes = Number(res.toFixed(10)).toString();
                }
            }

            lastResult = expr + ' =';
            currentInput = displayRes.toString();
            updateScreen();
            
            if (displayRes !== 'Error' && !displayRes.startsWith('Error')) {
                // Add to dynamic history tapes
                saveHistory(expr, displayRes);
                addToLocalTape(expr, displayRes);
            }
        }

        function addToLocalTape(expr, res) {
            const item = document.createElement('div');
            item.className = 'history-tape-item';
            item.innerHTML = `
                <div class="history-tape-expr">${expr} =</div>
                <div class="history-tape-res">${res}</div>
            `;
            item.addEventListener('click', () => {
                currentInput = res;
                updateScreen();
            });
            
            if (tapeContainer.firstChild) {
                tapeContainer.insertBefore(item, tapeContainer.firstChild);
            } else {
                tapeContainer.appendChild(item);
            }
        }

        // Event listener for keys
        containerInputs.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const val = button.dataset.val;
            const action = button.dataset.action;

            if (val) {
                if (currentInput === '0' || currentInput === 'Error' || currentInput.startsWith('Error')) {
                    currentInput = val;
                } else {
                    currentInput += val;
                }
                updateScreen();
            } else if (action) {
                switch (action) {
                    case 'clear':
                        currentInput = '';
                        lastResult = '';
                        updateScreen();
                        break;
                    case 'clear-entry':
                        currentInput = '';
                        updateScreen();
                        break;
                    case 'backspace':
                        if (currentInput.length > 0 && currentInput !== 'Error') {
                            currentInput = currentInput.slice(0, -1);
                        }
                        updateScreen();
                        break;
                    case 'equals':
                        calculate();
                        break;
                    case 'memory-add':
                        const vToAdd = parseFloat(currentInput);
                        if (!isNaN(vToAdd)) {
                            memory += vToAdd;
                            memDisplay.textContent = Number(memory.toFixed(6)).toString();
                        }
                        break;
                    case 'memory-clear':
                        memory = 0;
                        memDisplay.textContent = '0';
                        break;
                    case 'memory-recall':
                        currentInput = Number(memory.toFixed(6)).toString();
                        updateScreen();
                        break;
                }
            }
        });

        // Add keyboard support specifically when this calculator workspace is active
        const handleKeyDown = (e) => {
            if (e.key >= '0' && e.key <= '9') {
                if (currentInput === '0' || currentInput === 'Error' || currentInput.startsWith('Error')) currentInput = e.key;
                else currentInput += e.key;
                updateScreen();
            } else if (['+', '-', '*', '/', '%', '(', ')', '^', '.'].includes(e.key)) {
                currentInput += e.key;
                updateScreen();
            } else if (e.key === 'Enter' || e.key === '=') {
                e.preventDefault();
                calculate();
            } else if (e.key === 'Backspace') {
                if (currentInput.length > 0 && currentInput !== 'Error') {
                    currentInput = currentInput.slice(0, -1);
                }
                updateScreen();
            } else if (e.key === 'Escape') {
                currentInput = '';
                lastResult = '';
                updateScreen();
            }
        };

        // Attach to window for scope, but remove when changing calculator
        window.addEventListener('keydown', handleKeyDown);

        // Save reference to cleanup on module swap
        this.cleanup = () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }
};
