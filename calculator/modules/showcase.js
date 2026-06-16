// Source Code Showcase & Inspector Module

const files = {
    'modules/standard.js': 'Scientific & Standard Math',
    'modules/financial.js': 'Mortgage & Compound Interest',
    'modules/health.js': 'BMR/TDEE & BMI Estimator',
    'modules/converter.js': 'Bidirectional Unit Sync Grid',
    'modules/statistics.js': 'Summary Statistics & Histogram',
    'modules/physics.js': 'Physics Variables Solver',
    'modules/geometry.js': 'Geometry Dimension Scaler',
    'modules/programmer.js': '32-Bit Programmer Converter',
    'app.js': 'Main Controller & Router'
};

function highlightJS(code) {
    // Escape HTML entities to prevent rendering issues
    let escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Highlight comments (green/slate)
    escaped = escaped.replace(/(\/\/.*)/g, '<span style="color: #64748b; font-style: italic;">$1</span>');

    // Highlight strings (teal)
    escaped = escaped.replace(/(["'`])((?:\\\1|.)*?)\1/g, '<span style="color: #0d9488;">$1$2$1</span>');

    // Highlight keywords (indigo)
    const keywords = /\b(const|let|var|function|return|import|export|default|class|extends|static|if|else|for|while|switch|case|break|try|catch|throw|new|this|async|await|parseFloat|parseInt|Math)\b/g;
    escaped = escaped.replace(keywords, '<span style="color: #4f46e5; font-weight: 600;">$1</span>');

    // Highlight numbers (orange/amber)
    escaped = escaped.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color: #d97706;">$1</span>');

    return escaped;
}

export default {
    id: 'showcase',
    name: 'Source Code Viewer',
    icon: 'terminal',
    category: 'programmer',
    description: 'Inspect, copy, and share the modular formulas and JavaScript algorithms powering this universal calculator.',
    tags: ['code', 'source', 'developer', 'javascript', 'showcase', 'equations', 'math'],

    renderInputs() {
        let fileOptions = '';
        for (const [path, label] of Object.entries(files)) {
            fileOptions += `<option value="${path}">${label} (${path})</option>`;
        }

        return `
            <div class="form-group">
                <label class="form-label" for="showcase-file-select">Select File to Inspect</label>
                <select id="showcase-file-select" class="form-select">
                    ${fileOptions}
                </select>
            </div>

            <div class="result-card highlight" style="gap: 10px;">
                <span class="result-card-label" style="color: var(--accent-indigo);">About This Showcase</span>
                <span class="result-card-desc" style="font-size: 13px; line-height: 1.5; color: var(--text-secondary);">
                    This module dynamically fetches the raw Javascript source files directly from the hosting server. 
                    You can inspect the math logic, formulas, and visual rendering codes, copy them, and share them with friends.
                </span>
            </div>

            <button class="calculate-btn" id="showcase-copy-btn">
                <span class="material-symbols-outlined">content_copy</span>
                <span>Copy Raw Code</span>
            </button>
        `;
    },

    renderOutputs() {
        return `
            <div class="results-container" style="max-height: 100%; display: flex; flex-direction: column;">
                <div class="results-section-title" id="showcase-code-title">Source Code View</div>
                <div style="flex-grow: 1; overflow: auto; background-color: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; min-height: 360px;">
                    <pre style="margin: 0; font-family: var(--font-mono); font-size: 12px; line-height: 1.6; white-space: pre;"><code id="showcase-code-display" style="display: block; color: var(--text-primary);">Loading code...</code></pre>
                </div>
            </div>
        `;
    },

    init(containerInputs, containerOutputs, saveHistory) {
        const fileSelect = containerInputs.querySelector('#showcase-file-select');
        const copyBtn = containerInputs.querySelector('#showcase-copy-btn');
        const codeTitle = containerOutputs.querySelector('#showcase-code-title');
        const codeDisplay = containerOutputs.querySelector('#showcase-code-display');

        let activePath = 'modules/standard.js';
        let rawCode = '';

        function loadCode() {
            codeDisplay.textContent = 'Fetching file from server...';
            
            fetch(`./${activePath}`)
                .then(res => {
                    if (!res.ok) throw new Error(`Could not load ${activePath}`);
                    return res.text();
                })
                .then(code => {
                    rawCode = code;
                    codeDisplay.innerHTML = highlightJS(code);
                    codeTitle.textContent = `Source Code: ${activePath}`;
                })
                .catch(err => {
                    codeDisplay.textContent = `Error loading source: ${err.message}`;
                });
        }

        fileSelect.addEventListener('change', (e) => {
            activePath = e.target.value;
            loadCode();
        });

        copyBtn.addEventListener('click', () => {
            if (!rawCode) return;

            navigator.clipboard.writeText(rawCode).then(() => {
                const prevText = copyBtn.querySelector('span:last-child').textContent;
                copyBtn.querySelector('span:last-child').textContent = 'Copied!';
                copyBtn.querySelector('.material-symbols-outlined').textContent = 'check';
                copyBtn.style.background = 'linear-gradient(135deg, var(--accent-success), var(--accent-teal))';
                
                setTimeout(() => {
                    copyBtn.querySelector('span:last-child').textContent = prevText;
                    copyBtn.querySelector('.material-symbols-outlined').textContent = 'content_copy';
                    copyBtn.style.background = 'linear-gradient(135deg, var(--accent-indigo), var(--accent-teal))';
                }, 1200);

                saveHistory(`Copied source: ${activePath}`, 'Code clipboard sync');
            });
        });

        // Load standard calculator code by default on load
        loadCode();
    }
};
