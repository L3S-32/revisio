// ===== GLOBAL FEATURES: Dark Mode, Pomodoro, Search, Keyboard Shortcuts =====

(function() {
    'use strict';

    // ========== DARK MODE ==========
    const savedTheme = localStorage.getItem('revisfredo_theme') || 'light';
    if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

    function toggleDarkMode() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('revisfredo_theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('revisfredo_theme', 'dark');
        }
    }

    // ========== POMODORO TIMER ==========
    let pomodoroInterval = null;
    let pomodoroSeconds = 25 * 60;
    let pomodoroRunning = false;
    let pomodoroMode = 'work'; // 'work' or 'break'
    let pomodoroCount = parseInt(localStorage.getItem('pomodoro_count') || '0');

    function formatTime(s) {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    function updatePomodoroUI() {
        const display = document.getElementById('pomodoroTime');
        const modeLabel = document.getElementById('pomodoroMode');
        const btn = document.getElementById('pomodoroBtn');
        const countEl = document.getElementById('pomodoroCount');
        if (display) display.textContent = formatTime(pomodoroSeconds);
        if (modeLabel) modeLabel.textContent = pomodoroMode === 'work' ? 'FOCUS' : 'PAUSE';
        if (btn) btn.textContent = pomodoroRunning ? '⏸' : '▶';
        if (countEl) countEl.textContent = pomodoroCount;
    }

    function pomodoroTick() {
        if (pomodoroSeconds <= 0) {
            clearInterval(pomodoroInterval);
            pomodoroRunning = false;
            // Play notification sound
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 800;
                gain.gain.value = 0.3;
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
                setTimeout(() => {
                    const osc2 = ctx.createOscillator();
                    const gain2 = ctx.createGain();
                    osc2.connect(gain2);
                    gain2.connect(ctx.destination);
                    osc2.frequency.value = 1000;
                    gain2.gain.value = 0.3;
                    osc2.start();
                    osc2.stop(ctx.currentTime + 0.4);
                }, 400);
            } catch(e) {}

            if (pomodoroMode === 'work') {
                pomodoroCount++;
                localStorage.setItem('pomodoro_count', pomodoroCount);
                pomodoroMode = 'break';
                pomodoroSeconds = 5 * 60;
            } else {
                pomodoroMode = 'work';
                pomodoroSeconds = 25 * 60;
            }
            updatePomodoroUI();
            return;
        }
        pomodoroSeconds--;
        updatePomodoroUI();
    }

    function togglePomodoro() {
        if (pomodoroRunning) {
            clearInterval(pomodoroInterval);
            pomodoroRunning = false;
        } else {
            pomodoroRunning = true;
            pomodoroInterval = setInterval(pomodoroTick, 1000);
        }
        updatePomodoroUI();
    }

    function resetPomodoro() {
        clearInterval(pomodoroInterval);
        pomodoroRunning = false;
        pomodoroMode = 'work';
        pomodoroSeconds = 25 * 60;
        updatePomodoroUI();
    }

    // ========== SEARCH ==========
    const searchModules = [
        { name: 'C++', code: 'M319', desc: 'Programmation orientée objet · Pointeurs · Classes', href: 'module.html?name=C%2B%2B&code=M319' },
        { name: 'Maintenance BDD', code: 'M106', desc: 'Requêtes SQL · Optimisation · Sauvegarde', href: 'module.html?name=Maintenance%20BDD&code=M106' },
        { name: 'Protection des données', code: 'M231', desc: 'Chiffrement · RGPD · Sécurité réseau', href: 'module.html?name=Protection%20des%20donn%C3%A9es&code=M231' },
        { name: 'Modélisation de données', code: 'M162', desc: 'MCD · MLD · Entités · Relations', href: 'module.html?name=Mod%C3%A9lisation%20de%20donn%C3%A9es&code=M162' },
        { name: 'Sciences appliquées', code: 'SI', desc: 'Logique · Numération · Algèbre de Boole', href: 'module.html?name=Sciences%20appliqu%C3%A9es&code=SI' },
        { name: 'Infrastructure réseau', code: 'M117', desc: 'TCP/IP · DNS · DHCP · VLAN · Routage', href: 'module.html?name=Infrastructure%20r%C3%A9seau&code=M117' },
        { name: 'Culture générale', code: 'EGC', desc: 'Société · Économie · Politique', href: 'module.html?name=Culture%20g%C3%A9n%C3%A9rale&code=EGC' },
        { name: 'Français', code: 'FR', desc: 'Rédaction · Analyse · Argumentation', href: 'module.html?name=Fran%C3%A7ais&code=FR' },
        { name: 'Anglais', code: 'AN', desc: 'Vocabulaire · Grammaire · Compréhension', href: 'module.html?name=Anglais&code=AN' },
        { name: 'Sciences', code: 'SC', desc: 'Physique · Chimie · Énergie', href: 'module.html?name=Sciences&code=SC' },
        { name: 'Maths', code: 'MA', desc: 'Algèbre · Fonctions · Statistiques', href: 'module.html?name=Maths&code=MA' },
    ];

    const searchPages = [
        { name: 'Accueil', desc: 'Page principale', href: 'index.html' },
        { name: 'Fiches', desc: 'Tous les modules', href: 'fiches.html' },
        { name: 'Résultats', desc: 'Historique des résultats', href: 'resultats.html' },
        { name: 'Calendrier', desc: 'Planning de révision', href: 'calendrier.html' },
        { name: 'Mon profil', desc: 'Paramètres du profil', href: 'profil.html' },
    ];

    let searchSelectedIndex = 0;

    function filterSearch(query) {
        const q = query.toLowerCase().trim();
        if (!q) return [...searchPages, ...searchModules];
        return [...searchPages, ...searchModules].filter(item => {
            return item.name.toLowerCase().includes(q) ||
                   item.code?.toLowerCase().includes(q) ||
                   item.desc.toLowerCase().includes(q);
        });
    }

    function renderSearchResults(results) {
        const list = document.getElementById('searchResults');
        if (!list) return;
        if (results.length === 0) {
            list.innerHTML = '<div class="search-empty">Aucun résultat</div>';
            return;
        }
        searchSelectedIndex = Math.min(searchSelectedIndex, results.length - 1);
        list.innerHTML = results.map((r, i) => `
            <a href="${r.href}" class="search-item ${i === searchSelectedIndex ? 'selected' : ''}">
                <span class="search-item-name">${r.name}${r.code ? ' <span class="search-item-code">' + r.code + '</span>' : ''}</span>
                <span class="search-item-desc">${r.desc}</span>
            </a>
        `).join('');
    }

    function openSearch() {
        const modal = document.getElementById('searchModal');
        if (modal) {
            modal.classList.add('open');
            const input = document.getElementById('searchInput');
            if (input) { input.value = ''; input.focus(); }
            searchSelectedIndex = 0;
            renderSearchResults(filterSearch(''));
        }
    }

    function closeSearch() {
        const modal = document.getElementById('searchModal');
        if (modal) modal.classList.remove('open');
    }

    // ========== INJECT UI ==========
    function injectToolbar() {
        // Floating toolbar (bottom-right)
        const toolbar = document.createElement('div');
        toolbar.id = 'globalToolbar';
        toolbar.innerHTML = `
            <!-- Search shortcut hint -->
            <button class="toolbar-btn" id="toolbarSearch" title="Rechercher (Ctrl+K)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <!-- Dark mode toggle -->
            <button class="toolbar-btn" id="toolbarDark" title="Mode sombre">
                <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
            <!-- Pomodoro toggle -->
            <button class="toolbar-btn" id="toolbarPomodoro" title="Timer Pomodoro">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="13" x2="15" y2="13"/><line x1="9" y1="1" x2="15" y2="1"/><line x1="12" y1="1" x2="12" y2="4"/></svg>
            </button>
        `;
        document.body.appendChild(toolbar);

        // Pomodoro panel
        const pomPanel = document.createElement('div');
        pomPanel.id = 'pomodoroPanel';
        pomPanel.innerHTML = `
            <div class="pom-header">
                <span id="pomodoroMode">FOCUS</span>
                <span class="pom-sessions"><span id="pomodoroCount">${pomodoroCount}</span> sessions</span>
            </div>
            <div class="pom-time" id="pomodoroTime">${formatTime(pomodoroSeconds)}</div>
            <div class="pom-controls">
                <button class="pom-btn" id="pomodoroBtn" title="Démarrer/Pause">▶</button>
                <button class="pom-btn pom-btn-reset" id="pomodoroReset" title="Réinitialiser">↻</button>
            </div>
        `;
        document.body.appendChild(pomPanel);

        // Search modal
        const searchModal = document.createElement('div');
        searchModal.id = 'searchModal';
        searchModal.innerHTML = `
            <div class="search-backdrop"></div>
            <div class="search-content">
                <div class="search-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" id="searchInput" placeholder="Rechercher un module, une page..." autocomplete="off">
                    <kbd class="search-kbd">ESC</kbd>
                </div>
                <div class="search-results" id="searchResults"></div>
                <div class="search-footer">
                    <span><kbd>↑↓</kbd> naviguer</span>
                    <span><kbd>↵</kbd> ouvrir</span>
                    <span><kbd>esc</kbd> fermer</span>
                </div>
            </div>
        `;
        document.body.appendChild(searchModal);

        // Keyboard shortcuts help (shown on ?)
        const kbHelp = document.createElement('div');
        kbHelp.id = 'kbHelp';
        kbHelp.innerHTML = `
            <div class="search-backdrop"></div>
            <div class="kb-content">
                <h3>Raccourcis clavier</h3>
                <div class="kb-grid">
                    <div class="kb-item"><kbd>Ctrl + K</kbd><span>Rechercher</span></div>
                    <div class="kb-item"><kbd>D</kbd><span>Mode sombre</span></div>
                    <div class="kb-item"><kbd>P</kbd><span>Timer Pomodoro</span></div>
                    <div class="kb-item"><kbd>?</kbd><span>Aide raccourcis</span></div>
                    <div class="kb-divider">Flashcards</div>
                    <div class="kb-item"><kbd>Espace</kbd><span>Retourner la carte</span></div>
                    <div class="kb-item"><kbd>←</kbd><span>Faux / Incorrecte</span></div>
                    <div class="kb-item"><kbd>→</kbd><span>Correct</span></div>
                </div>
                <button class="kb-close" id="kbHelpClose">Fermer</button>
            </div>
        `;
        document.body.appendChild(kbHelp);

        // Event listeners
        document.getElementById('toolbarDark').addEventListener('click', toggleDarkMode);
        document.getElementById('toolbarSearch').addEventListener('click', openSearch);

        const pomBtn = document.getElementById('toolbarPomodoro');
        let pomOpen = false;
        pomBtn.addEventListener('click', () => {
            pomOpen = !pomOpen;
            document.getElementById('pomodoroPanel').classList.toggle('open', pomOpen);
        });

        document.getElementById('pomodoroBtn').addEventListener('click', togglePomodoro);
        document.getElementById('pomodoroReset').addEventListener('click', resetPomodoro);

        // Search events
        document.querySelector('#searchModal .search-backdrop').addEventListener('click', closeSearch);
        document.getElementById('searchInput').addEventListener('input', (e) => {
            searchSelectedIndex = 0;
            renderSearchResults(filterSearch(e.target.value));
        });

        // KB help events
        document.querySelector('#kbHelp .search-backdrop').addEventListener('click', () => {
            document.getElementById('kbHelp').classList.remove('open');
        });
        document.getElementById('kbHelpClose').addEventListener('click', () => {
            document.getElementById('kbHelp').classList.remove('open');
        });
    }

    // ========== KEYBOARD SHORTCUTS ==========
    function setupShortcuts() {
        document.addEventListener('keydown', (e) => {
            const tag = e.target.tagName;
            const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable;
            const searchOpen = document.getElementById('searchModal')?.classList.contains('open');
            const kbOpen = document.getElementById('kbHelp')?.classList.contains('open');

            // Ctrl+K or Cmd+K: open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (searchOpen) closeSearch(); else openSearch();
                return;
            }

            // ESC: close modals
            if (e.key === 'Escape') {
                if (searchOpen) { closeSearch(); return; }
                if (kbOpen) { document.getElementById('kbHelp').classList.remove('open'); return; }
                // Close pomodoro panel
                const pom = document.getElementById('pomodoroPanel');
                if (pom?.classList.contains('open')) { pom.classList.remove('open'); return; }
            }

            // Search modal navigation
            if (searchOpen) {
                const input = document.getElementById('searchInput');
                const results = filterSearch(input?.value || '');
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    searchSelectedIndex = Math.min(searchSelectedIndex + 1, results.length - 1);
                    renderSearchResults(results);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    searchSelectedIndex = Math.max(searchSelectedIndex - 1, 0);
                    renderSearchResults(results);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (results[searchSelectedIndex]) {
                        window.location.href = results[searchSelectedIndex].href;
                    }
                }
                return;
            }

            // Don't fire shortcuts when typing in inputs
            if (isInput) return;

            // D: toggle dark mode
            if (e.key === 'd' || e.key === 'D') {
                toggleDarkMode();
                return;
            }

            // P: toggle pomodoro panel
            if (e.key === 'p' || e.key === 'P') {
                const pom = document.getElementById('pomodoroPanel');
                pom?.classList.toggle('open');
                return;
            }

            // ?: show keyboard shortcuts
            if (e.key === '?') {
                document.getElementById('kbHelp')?.classList.toggle('open');
                return;
            }

            // Flashcard shortcuts (only on flashcard page)
            const isFlashcard = document.querySelector('.flashcard-page');
            if (isFlashcard) {
                if (e.key === ' ' || e.code === 'Space') {
                    e.preventDefault();
                    const flipBtn = document.getElementById('btnFlip');
                    if (flipBtn) flipBtn.click();
                }
                if (e.key === 'ArrowLeft') {
                    const wrongBtn = document.getElementById('btnWrong');
                    if (wrongBtn && !wrongBtn.disabled) wrongBtn.click();
                }
                if (e.key === 'ArrowRight') {
                    const correctBtn = document.getElementById('btnCorrect');
                    if (correctBtn && !correctBtn.disabled) correctBtn.click();
                }
            }

            // Examen shortcuts
            const isExamen = document.querySelector('.exam-container');
            if (isExamen) {
                // 1-4 for QCM options
                if (['1','2','3','4'].includes(e.key)) {
                    const options = document.querySelectorAll('.exam-option:not(.disabled)');
                    const idx = parseInt(e.key) - 1;
                    if (options[idx]) options[idx].click();
                }
            }
        });
    }

    // ========== INIT ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { injectToolbar(); setupShortcuts(); });
    } else {
        injectToolbar(); setupShortcuts();
    }
})();
