// OmniCalc Universal Calculator - Main App Controller

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import standard from './modules/standard.js';
import financial from './modules/financial.js';
import health from './modules/health.js';
import converter from './modules/converter.js';
import statistics from './modules/statistics.js';
import physics from './modules/physics.js';
import geometry from './modules/geometry.js';
import programmer from './modules/programmer.js';
import showcase from './modules/showcase.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdQAyyOH_64XhhOPMCZb6Eo4VCvP8kx04",
  authDomain: "universal-calculator-31643.firebaseapp.com",
  projectId: "universal-calculator-31643",
  storageBucket: "universal-calculator-31643.firebasestorage.app",
  messagingSenderId: "262260700122",
  appId: "1:262260700122:web:e300914f770f33d69d86e3",
  measurementId: "G-K80CT33P9Q"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Module registry
const modules = [
    standard,
    financial,
    health,
    converter,
    statistics,
    physics,
    geometry,
    programmer,
    showcase
];

// App State
let state = {
    favorites: JSON.parse(localStorage.getItem('omnicalc_favorites') || '[]'),
    history: JSON.parse(localStorage.getItem('omnicalc_history') || '[]'),
    activeView: 'dashboard', // dashboard, favorites, or calculator-id
    activeCategory: 'all',
    activeCalculator: null,
    paletteSelectedIndex: 0,
    filteredPaletteModules: []
};

// Elements
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const breadcrumbs = document.getElementById('breadcrumbs');
const searchTrigger = document.getElementById('search-trigger');
const historyToggle = document.getElementById('header-history-btn');
const sidebarHistoryToggle = document.getElementById('btn-history-toggle');
const dashboardView = document.getElementById('dashboard-view');
const workspaceView = document.getElementById('workspace-view');
const categoryList = document.getElementById('category-list');
const calculatorsGrid = document.getElementById('calculators-grid');
const searchModal = document.getElementById('search-modal');
const searchInput = document.getElementById('palette-search-input');
const searchResults = document.getElementById('palette-results');
const historySidebar = document.getElementById('history-sidebar');
const historyCloseBtn = document.getElementById('history-close-btn');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');

// Workspace specific elements
const workspaceTitle = document.getElementById('workspace-title');
const workspaceDesc = document.getElementById('workspace-desc');
const workspaceIcon = document.getElementById('workspace-icon');
const workspaceInputs = document.getElementById('workspace-inputs');
const workspaceOutputs = document.getElementById('workspace-outputs');
const workspaceBackBtn = document.getElementById('workspace-back-btn');
const workspaceFavBtn = document.getElementById('workspace-fav-btn');

// Constants
const CATEGORIES = {
    all: { label: 'All', icon: 'grid_view' },
    math: { label: 'Mathematics', icon: 'calculate' },
    financial: { label: 'Financial', icon: 'payments' },
    health: { label: 'Calorie & Health', icon: 'monitoring' },
    conversions: { label: 'Conversions', icon: 'sync_alt' },
    statistics: { label: 'Statistics', icon: 'bar_chart' },
    physics: { label: 'Physics', icon: 'rocket_launch' },
    geometry: { label: 'Geometry', icon: 'architecture' },
    programmer: { label: 'Programmer', icon: 'code' }
};

// ----------------------------------------------------
// Initialization
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initCategories();
    initSidebarCalcLinks();
    initRouter();
    initCommandPalette();
    initHistory();
    setupGlobalEvents();
});

// ----------------------------------------------------
// Navigation / Routing
// ----------------------------------------------------
function initRouter() {
    // Check initial URL hash
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
}

function handleHashChange() {
    const hash = window.location.hash.slice(1);
    
    // Cleanup active calculator if running
    if (state.activeCalculator && state.activeCalculator.cleanup) {
        state.activeCalculator.cleanup();
    }
    state.activeCalculator = null;

    if (!hash || hash === 'dashboard' || hash === '') {
        state.activeView = 'dashboard';
        state.activeCategory = 'all';
        showDashboard();
    } else if (hash === 'favorites') {
        state.activeView = 'favorites';
        state.activeCategory = 'favorites';
        showDashboard();
    } else if (hash.startsWith('category-')) {
        const cat = hash.replace('category-', '');
        state.activeView = 'dashboard';
        state.activeCategory = cat;
        showDashboard();
    } else if (hash.startsWith('calc-')) {
        const calcId = hash.replace('calc-', '');
        const targetCalc = modules.find(m => m.id === calcId);
        if (targetCalc) {
            state.activeView = calcId;
            state.activeCalculator = targetCalc;
            showWorkspace(targetCalc);
        } else {
            window.location.hash = '#dashboard';
        }
    }
    
    updateSidebarUI();
    updateBreadcrumbs();
}

function showDashboard() {
    dashboardView.classList.remove('hidden');
    workspaceView.classList.add('hidden');
    renderCalculatorCards();
}

function showWorkspace(calc) {
    dashboardView.classList.add('hidden');
    workspaceView.classList.remove('hidden');
    
    // Setup workspace metadata
    workspaceTitle.textContent = calc.name;
    workspaceDesc.textContent = calc.description;
    workspaceIcon.textContent = calc.icon;
    
    // Favorite button state
    if (state.favorites.includes(calc.id)) {
        workspaceFavBtn.classList.add('active');
        workspaceFavBtn.querySelector('span').textContent = 'star';
        workspaceFavBtn.querySelector('span').style.fontVariationSettings = "'FILL' 1";
    } else {
        workspaceFavBtn.classList.remove('active');
        workspaceFavBtn.querySelector('span').textContent = 'star';
        workspaceFavBtn.querySelector('span').style.fontVariationSettings = "'FILL' 0";
    }

    // Dynamic views render
    workspaceInputs.innerHTML = calc.renderInputs();
    workspaceOutputs.innerHTML = calc.renderOutputs();
    
    // Init calculator inputs
    calc.init(workspaceInputs, workspaceOutputs, (expr, res) => {
        saveCalculationTape(calc.id, expr, res);
    });
}

function updateSidebarUI() {
    // Dashboard main buttons
    const btnDashboard = document.getElementById('btn-dashboard');
    const btnFavorites = document.getElementById('btn-favorites');
    
    btnDashboard.classList.remove('active');
    btnFavorites.classList.remove('active');

    if (state.activeCategory === 'all') {
        btnDashboard.classList.add('active');
    } else if (state.activeCategory === 'favorites') {
        btnFavorites.classList.add('active');
    }

    // Category list items
    categoryList.querySelectorAll('.category-btn').forEach(btn => {
        const cat = btn.dataset.category;
        if (cat === state.activeCategory) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Direct Switcher active states
    const sidebarCalcLinks = document.getElementById('sidebar-calc-links');
    if (sidebarCalcLinks) {
        sidebarCalcLinks.querySelectorAll('.sidebar-calc-link').forEach(btn => {
            const calcId = btn.dataset.calcId;
            if (state.activeView === calcId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

function updateBreadcrumbs() {
    const crumbActive = breadcrumbs.querySelector('.crumb.active');
    const crumbParent = breadcrumbs.querySelector('.crumb.parent');
    const separator = breadcrumbs.querySelector('.crumb-separator');

    if (state.activeView === 'dashboard') {
        crumbActive.textContent = 'Dashboard';
        separator.classList.add('hidden');
        crumbParent.classList.add('hidden');
    } else if (state.activeView === 'favorites') {
        crumbActive.textContent = 'Favorites';
        separator.classList.add('hidden');
        crumbParent.classList.add('hidden');
    } else if (state.activeCalculator) {
        crumbParent.classList.remove('hidden');
        crumbParent.textContent = 'Dashboard';
        crumbParent.onclick = () => window.location.hash = '#dashboard';
        separator.classList.remove('hidden');
        crumbActive.textContent = state.activeCalculator.name;
    }
}

// ----------------------------------------------------
// UI Renderings
// ----------------------------------------------------
function initCategories() {
    let catHtml = '';
    
    // Skip 'all' since we have a dedicated button
    for (const [key, value] of Object.entries(CATEGORIES)) {
        if (key === 'all') continue;
        
        // Count calculators in category
        const count = modules.filter(m => m.category === key).length;
        
        catHtml += `
            <button class="category-btn" data-category="${key}">
                <span style="display: flex; align-items: center; gap: 10px;">
                    <span class="material-symbols-outlined" style="font-size: 18px;">${value.icon}</span>
                    <span>${value.label}</span>
                </span>
                <span class="cat-count">${count}</span>
            </button>
        `;
    }
    categoryList.innerHTML = catHtml;

    // Attach click listeners
    categoryList.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-btn');
        if (!btn) return;
        const cat = btn.dataset.category;
        window.location.hash = `#category-${cat}`;
    });

    document.getElementById('btn-dashboard').onclick = () => window.location.hash = '#dashboard';
    document.getElementById('btn-favorites').onclick = () => window.location.hash = '#favorites';
}

function initSidebarCalcLinks() {
    const sidebarCalcLinks = document.getElementById('sidebar-calc-links');
    if (!sidebarCalcLinks) return;
    
    let linksHtml = '';
    modules.forEach(calc => {
        linksHtml += `
            <button class="category-btn sidebar-calc-link" data-calc-id="${calc.id}" style="justify-content: flex-start; gap: 10px; padding: 8px 12px; font-size: 13px;">
                <span class="material-symbols-outlined" style="font-size: 16px;">${calc.icon}</span>
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${calc.name.replace(' Calculator', '').replace(' Math', '')}</span>
            </button>
        `;
    });
    sidebarCalcLinks.innerHTML = linksHtml;
    
    sidebarCalcLinks.addEventListener('click', (e) => {
        const btn = e.target.closest('.sidebar-calc-link');
        if (!btn) return;
        const calcId = btn.dataset.calcId;
        window.location.hash = `#calc-${calcId}`;
    });
}

function renderCalculatorCards() {
    let filtered = modules;
    if (state.activeCategory === 'favorites') {
        filtered = modules.filter(m => state.favorites.includes(m.id));
    } else if (state.activeCategory !== 'all') {
        filtered = modules.filter(m => m.category === state.activeCategory);
    }

    if (filtered.length === 0) {
        calculatorsGrid.innerHTML = `
            <div class="empty-history-msg" style="grid-column: 1 / -1; padding: 40px;">
                <span class="material-symbols-outlined" style="font-size: 48px; color: var(--text-muted); margin-bottom: 12px;">star</span>
                <p>No calculators found in this category.</p>
            </div>
        `;
        return;
    }

    let cardsHtml = '';
    filtered.forEach(calc => {
        const isFav = state.favorites.includes(calc.id);
        const favFill = isFav ? "style=\"font-variation-settings: 'FILL' 1;\"" : "";
        const favClass = isFav ? "active" : "";
        const categoryLabel = CATEGORIES[calc.category]?.label || calc.category;

        cardsHtml += `
            <div class="calc-card" data-id="${calc.id}">
                <div class="calc-card-header">
                    <div class="calc-card-icon-wrapper">
                        <span class="material-symbols-outlined calc-card-icon">${calc.icon}</span>
                    </div>
                    <button class="calc-card-fav-btn ${favClass}" data-id="${calc.id}" aria-label="Favorite">
                        <span class="material-symbols-outlined" ${favFill}>star</span>
                    </button>
                </div>
                <div class="calc-card-body">
                    <h3>${calc.name}</h3>
                    <p>${calc.description}</p>
                </div>
                <div class="calc-card-footer">
                    <span class="calc-card-tag">${categoryLabel}</span>
                    <span class="material-symbols-outlined calc-card-go">arrow_forward</span>
                </div>
            </div>
        `;
    });

    calculatorsGrid.innerHTML = cardsHtml;
}

// ----------------------------------------------------
// Favorites Management
// ----------------------------------------------------
function toggleFavorite(calcId) {
    const idx = state.favorites.indexOf(calcId);
    if (idx === -1) {
        state.favorites.push(calcId);
    } else {
        state.favorites.splice(idx, 1);
    }
    
    localStorage.setItem('omnicalc_favorites', JSON.stringify(state.favorites));
    
    // Rerender active cards or update workspace fav btn if opened
    if (state.activeView === 'favorites' || state.activeView === 'dashboard') {
        renderCalculatorCards();
    } else if (state.activeCalculator && state.activeCalculator.id === calcId) {
        showWorkspace(state.activeCalculator);
    }
}

// ----------------------------------------------------
// Calculation History Tape
// ----------------------------------------------------
function initHistory() {
    const q = query(collection(db, "history"), orderBy("timestamp", "desc"), limit(30));
    onSnapshot(q, (snapshot) => {
        const historyItems = [];
        snapshot.forEach((d) => {
            historyItems.push({
                id: d.id,
                ...d.data()
            });
        });
        state.history = historyItems;
        renderHistory();
    });
}

function saveCalculationTape(calcId, expression, result) {
    const item = {
        calcId,
        calcName: modules.find(m => m.id === calcId)?.name || 'Calculator',
        expression,
        result,
        timestamp: Date.now()
    };
    
    addDoc(collection(db, "history"), item).catch(err => {
        console.error("Error saving calculation to Firebase: ", err);
    });
}

function renderHistory() {
    if (state.history.length === 0) {
        historyList.innerHTML = '<div class="empty-history-msg">No recent calculations. They will appear here as you compute.</div>';
        return;
    }

    let html = '';
    state.history.forEach((h, idx) => {
        const timeStr = new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        html += `
            <div class="history-item" data-index="${idx}">
                <div class="history-item-meta">
                    <span>${h.calcName}</span>
                    <span>${timeStr}</span>
                </div>
                <div class="history-item-calc">${h.expression} =</div>
                <div class="history-item-result">${h.result}</div>
            </div>
        `;
    });
    historyList.innerHTML = html;
}

async function clearHistory() {
    try {
        const q = query(collection(db, "history"));
        const querySnapshot = await getDocs(q);
        const deletePromises = [];
        querySnapshot.forEach((d) => {
            deletePromises.push(deleteDoc(doc(db, "history", d.id)));
        });
        await Promise.all(deletePromises);
    } catch (err) {
        console.error("Error clearing Firebase history: ", err);
    }
}

// ----------------------------------------------------
// Command Palette Search
// ----------------------------------------------------
function initCommandPalette() {
    // Open palette trigger
    searchTrigger.onclick = openPalette;
    
    // Close palette on overlay click
    searchModal.onclick = (e) => {
        if (e.target === searchModal) closePalette();
    };

    // Filter results on typing
    searchInput.oninput = filterPaletteResults;

    // Keyboard handlers inside search bar
    searchInput.onkeydown = (e) => {
        const listItems = searchResults.querySelectorAll('.palette-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (listItems.length === 0) return;
            state.paletteSelectedIndex = (state.paletteSelectedIndex + 1) % listItems.length;
            updatePaletteActiveSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (listItems.length === 0) return;
            state.paletteSelectedIndex = (state.paletteSelectedIndex - 1 + listItems.length) % listItems.length;
            updatePaletteActiveSelection();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const selectedModule = state.filteredPaletteModules[state.paletteSelectedIndex];
            if (selectedModule) {
                closePalette();
                window.location.hash = `#calc-${selectedModule.id}`;
            }
        } else if (e.key === 'Escape') {
            closePalette();
        }
    };
}

function openPalette() {
    searchModal.classList.remove('hidden');
    searchInput.value = '';
    state.paletteSelectedIndex = 0;
    filterPaletteResults();
    setTimeout(() => searchInput.focus(), 50);
}

function closePalette() {
    searchModal.classList.add('hidden');
    searchInput.blur();
}

function filterPaletteResults() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        state.filteredPaletteModules = [...modules];
    } else {
        state.filteredPaletteModules = modules.filter(m => {
            return m.name.toLowerCase().includes(query) || 
                   m.description.toLowerCase().includes(query) ||
                   m.tags.some(tag => tag.toLowerCase().includes(query)) ||
                   m.category.toLowerCase().includes(query);
        });
    }

    state.paletteSelectedIndex = 0;
    renderPaletteItems();
}

function renderPaletteItems() {
    if (state.filteredPaletteModules.length === 0) {
        searchResults.innerHTML = '<div class="empty-history-msg" style="padding: 24px;">No matching calculators found.</div>';
        return;
    }

    let html = '';
    state.filteredPaletteModules.forEach((calc, idx) => {
        const isActive = idx === state.paletteSelectedIndex ? 'active' : '';
        const catLabel = CATEGORIES[calc.category]?.label || calc.category;
        html += `
            <div class="palette-item ${isActive}" data-id="${calc.id}" data-idx="${idx}">
                <span class="material-symbols-outlined palette-item-icon">${calc.icon}</span>
                <div class="palette-item-info">
                    <span class="palette-item-name">${calc.name}</span>
                    <span class="palette-item-desc">${calc.description}</span>
                </div>
                <span class="palette-item-category">${catLabel}</span>
            </div>
        `;
    });
    
    searchResults.innerHTML = html;
    
    // Attach click triggers
    searchResults.querySelectorAll('.palette-item').forEach(item => {
        item.onclick = () => {
            const id = item.dataset.id;
            closePalette();
            window.location.hash = `#calc-${id}`;
        };
        item.onmouseenter = () => {
            state.paletteSelectedIndex = parseInt(item.dataset.idx);
            updatePaletteActiveSelection();
        };
    });
}

function updatePaletteActiveSelection() {
    const listItems = searchResults.querySelectorAll('.palette-item');
    listItems.forEach((item, idx) => {
        if (idx === state.paletteSelectedIndex) {
            item.classList.add('active');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

// ----------------------------------------------------
// Global Events Hookup
// ----------------------------------------------------
function setupGlobalEvents() {
    // Menu Sidebar toggle on mobile
    menuToggle.onclick = () => {
        sidebar.classList.toggle('open');
    };
    
    // Click outside sidebar on mobile closes it
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== menuToggle) {
            sidebar.classList.remove('open');
        }
    });

    // Dashboard click delegation for opening cards and toggling favorites
    calculatorsGrid.addEventListener('click', (e) => {
        const favBtn = e.target.closest('.calc-card-fav-btn');
        if (favBtn) {
            e.stopPropagation();
            const id = favBtn.dataset.id;
            toggleFavorite(id);
            return;
        }

        const card = e.target.closest('.calc-card');
        if (card) {
            const id = card.dataset.id;
            window.location.hash = `#calc-${id}`;
        }
    });

    // Workspace back button click
    workspaceBackBtn.onclick = () => {
        window.location.hash = '#dashboard';
    };

    // Workspace favorite star click
    workspaceFavBtn.onclick = () => {
        if (state.activeCalculator) {
            toggleFavorite(state.activeCalculator.id);
        }
    };

    // Drawer Toggles
    const openHistory = () => historySidebar.classList.add('open');
    const closeHistory = () => historySidebar.classList.remove('open');
    
    historyToggle.onclick = openHistory;
    sidebarHistoryToggle.onclick = openHistory;
    historyCloseBtn.onclick = closeHistory;
    clearHistoryBtn.onclick = clearHistory;

    // Click history item to load its result in standard calc if open, or copy to clipboard
    historyList.onclick = (e) => {
        const item = e.target.closest('.history-item');
        if (!item) return;

        const idx = parseInt(item.dataset.index);
        const calcHist = state.history[idx];
        if (!calcHist) return;

        // Visual feedback (flash copy message)
        navigator.clipboard.writeText(calcHist.result).then(() => {
            const prevText = item.querySelector('.history-item-result').textContent;
            item.querySelector('.history-item-result').textContent = 'Copied!';
            item.querySelector('.history-item-result').style.color = 'var(--accent-indigo)';
            setTimeout(() => {
                item.querySelector('.history-item-result').textContent = prevText;
                item.querySelector('.history-item-result').style.color = 'var(--accent-teal)';
            }, 800);
        });
    };

    // Global keyboard listener
    window.addEventListener('keydown', (e) => {
        // Toggle search modal on '/' (if not inside an input field) or Ctrl+K
        if ((e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') ||
            (e.key === 'k' && (e.ctrlKey || e.metaKey))) {
            e.preventDefault();
            openPalette();
        }
    });
}
