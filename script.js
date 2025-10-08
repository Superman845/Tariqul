// TypingClub Clone - Complete JavaScript Implementation
// All 21 features implemented with modular, clean code

class TypingTutor {
    constructor() {
        this.init();
    }

    init() {
        // Core properties
        this.currentLesson = null;
        this.currentIndex = 0;
        this.startTime = null;
        this.isTyping = false;
        this.isPaused = false;
        this.errors = 0;
        this.totalCharacters = 0;
        this.correctCharacters = 0;
        this.wpmHistory = [];
        this.mistakeMap = new Map();
        this.ghostTypingInterval = null;
        this.isGhostTyping = false;
        this.statsInterval = null;
        
        // Settings
        this.settings = this.loadSettings();
        this.zoomLocked = false;
        this.navbarVisible = true;
        
        // Profiles
        this.currentProfile = this.loadCurrentProfile();
        this.profiles = this.loadProfiles();
        
        // Lessons
        this.builtInLessons = this.getBuiltInLessons();
        this.customLessons = this.loadCustomLessons();
        this.lessonProgress = this.loadLessonProgress();
        
        // Achievements
        this.achievements = this.loadAchievements();
        
        // Key mapping for finger guidance
        this.keyFingerMap = this.getKeyFingerMap();
        
        // Initialize components
        this.initializeDOM();
        this.setupEventListeners();
        this.applySettings();
        this.renderLessons();
        this.renderProfiles();
        this.renderAchievements();
        this.updateProgressStats();
        
        // Request fullscreen on first interaction
        this.requestFullscreenOnInteraction();
        
        console.log('TypingTutor initialized successfully');
    }

    // ==================== INITIALIZATION ====================
    
    initializeDOM() {
        this.elements = {
            // Stats
            wpmDisplay: document.getElementById('wpmDisplay'),
            accuracyDisplay: document.getElementById('accuracyDisplay'),
            charactersDisplay: document.getElementById('charactersDisplay'),
            errorsDisplay: document.getElementById('errorsDisplay'),
            timeDisplay: document.getElementById('timeDisplay'),
            
            // Lesson
            lessonTitle: document.getElementById('lessonTitle'),
            lessonDescription: document.getElementById('lessonDescription'),
            typingText: document.getElementById('typingText'),
            
            // Controls
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            restartBtn: document.getElementById('restartBtn'),
            prevLessonBtn: document.getElementById('prevLessonBtn'),
            nextLessonBtn: document.getElementById('nextLessonBtn'),
            
            // Panels
            lessonsPanel: document.getElementById('lessonsPanel'),
            settingsPanel: document.getElementById('settingsPanel'),
            progressPanel: document.getElementById('progressPanel'),
            profilePanel: document.getElementById('profilePanel'),
            
            // Modals
            summaryModal: document.getElementById('summaryModal'),
            shortcutsModal: document.getElementById('shortcutsModal'),
            
            // Virtual keyboard
            virtualKeyboard: document.querySelector('.virtual-keyboard'),
            
            // Hand guide
            handGuide: document.querySelector('.hand-guide'),
            
            // Audio
            keystrokeSound: document.getElementById('keystrokeSound'),
            errorSound: document.getElementById('errorSound')
        };
    }

    setupEventListeners() {
        // Navigation toggle
        document.getElementById('navToggleBtn').addEventListener('click', () => this.toggleNavbar());
        
        // Navigation buttons
        document.getElementById('lessonsBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePanel('lessonsPanel');
        });
        document.getElementById('settingsBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePanel('settingsPanel');
        });
        document.getElementById('progressBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePanel('progressPanel');
        });
        document.getElementById('profileBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePanel('profilePanel');
        });
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('shortcutsBtn').addEventListener('click', () => this.toggleModal('shortcutsModal'));
        
        // Control buttons
        this.elements.startBtn.addEventListener('click', () => this.startLesson());
        this.elements.pauseBtn.addEventListener('click', () => this.pauseLesson());
        this.elements.restartBtn.addEventListener('click', () => this.restartLesson());
        this.elements.prevLessonBtn.addEventListener('click', () => this.previousLesson());
        this.elements.nextLessonBtn.addEventListener('click', () => this.nextLesson());
        
        // Close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const panel = e.target.closest('.panel');
                const modal = e.target.closest('.modal');
                if (panel) this.closePanel(panel.id);
                if (modal) this.closeModal(modal.id);
            });
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Virtual keyboard clicks
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('click', () => this.handleVirtualKeyClick(key));
        });
        
        // Settings
        this.setupSettingsListeners();
        
        // Lessons
        this.setupLessonsListeners();
        
        // Profiles
        this.setupProfilesListeners();
        
        // Touch events for panel closing
        document.addEventListener('click', (e) => this.handleTouchClose(e));
        
        // Zoom support
        this.setupZoomSupport();
        
        // Resize handling
        window.addEventListener('resize', () => this.handleResize());
    }

    // ==================== LESSON SYSTEM ====================
    
    getBuiltInLessons() {
        return {
            beginner: [
                { id: 'b1', title: 'Day 1: Home Row Basics', description: 'Learn the home row keys', text: 'fff jjj fff jjj aaa ;;; aaa ;;; sss lll sss lll ddd kkk ddd kkk' },
                { id: 'b2', title: 'Day 2: Home Row Words', description: 'Simple home row words', text: 'ask ask lad lad dad dad sad sad fad fad jad jad kad kad' },
                { id: 'b3', title: 'Day 3: Home Row Sentences', description: 'Complete sentences using home row', text: 'dad asks sad lad; lad asks dad; sad dad asks lad;' }
            ],
            homeRow: [
                { id: 'h1', title: 'ASDF JKL;', description: 'Master the home row', text: 'asdf jkl; asdf jkl; asdf jkl; fff jjj ddd kkk sss lll aaa ;;;' },
                { id: 'h2', title: 'Home Row Combinations', description: 'Letter combinations', text: 'as ask asks fad fall jag jags lad lads sad sash flask flask' },
                { id: 'h3', title: 'Home Row Mastery', description: 'Complex home row text', text: 'all ads ask dad; sad lad falls; flask flask; salad salad;' }
            ],
            topRow: [
                { id: 't1', title: 'QWER UIOP', description: 'Learn the top row', text: 'qwer uiop qwer uiop qwe uio wer iop qwer uiop' },
                { id: 't2', title: 'Top Row Words', description: 'Words with top row letters', text: 'quip quip ripe ripe pier pier wire wire quiet quiet power power' },
                { id: 't3', title: 'Top Row Integration', description: 'Combine with home row', text: 'power tools; quip flask; ripe fruit; pier side; quiet people;' }
            ],
            bottomRow: [
                { id: 'bt1', title: 'ZXCV BNM', description: 'Learn the bottom row', text: 'zxcv bnm, zxcv bnm, zxc bnm xcv nm, zxcv bnm,' },
                { id: 'bt2', title: 'Bottom Row Words', description: 'Words with bottom row letters', text: 'zone zone coin coin vine vine maze maze cabin cabin' },
                { id: 'bt3', title: 'Full Alphabet', description: 'Using all letter keys', text: 'the quick brown fox jumps over the lazy dog again and again' }
            ],
            numbers: [
                { id: 'n1', title: 'Number Row 1-5', description: 'Left hand numbers', text: '123 123 234 234 345 345 1234 1234 2345 2345' },
                { id: 'n2', title: 'Number Row 6-0', description: 'Right hand numbers', text: '678 678 789 789 890 890 6789 6789 7890 7890' },
                { id: 'n3', title: 'All Numbers', description: 'Complete number practice', text: '1234567890 0987654321 1029384756 5647382910' },
                { id: 'n4', title: 'Numbers with Text', description: 'Mixed numbers and letters', text: 'call me at 555-1234 or email user123@domain.com today' },
                { id: 'n5', title: 'Symbols Practice', description: 'Special characters', text: '!@#$%^&*()_+ {}[]|\\:";\'<>?,./' }
            ],
            advanced: [
                { id: 'a1', title: 'Speed Building 1', description: 'Increase typing speed', text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.' },
                { id: 'a2', title: 'Speed Building 2', description: 'Common words practice', text: 'which there would could other after first never these think where right their great' },
                { id: 'a3', title: 'Punctuation Master', description: 'Complex punctuation', text: 'Hello, world! How are you today? I\'m fine, thank you. Let\'s practice typing together.' },
                { id: 'a4', title: 'Programming Text', description: 'Code-like typing', text: 'function hello() { return "Hello, World!"; } console.log(hello());' },
                { id: 'a5', title: 'Advanced Paragraph', description: 'Long form text', text: 'In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.' }
            ]
        };
    }

    loadCustomLessons() {
        const saved = localStorage.getItem('customLessons');
        return saved ? JSON.parse(saved) : [];
    }

    saveCustomLessons() {
        localStorage.setItem('customLessons', JSON.stringify(this.customLessons));
    }

    loadLessonProgress() {
        const saved = localStorage.getItem(`lessonProgress_${this.currentProfile.id}`);
        return saved ? JSON.parse(saved) : {};
    }

    saveLessonProgress() {
        localStorage.setItem(`lessonProgress_${this.currentProfile.id}`, JSON.stringify(this.lessonProgress));
    }

    // ==================== TYPING ENGINE ====================
    
    startLesson() {
        if (!this.currentLesson) {
            alert('Please select a lesson first!');
            return;
        }

        if (this.isGhostTyping) {
            this.stopGhostTyping();
        }

        this.isTyping = true;
        this.isPaused = false;
        this.startTime = Date.now();
        this.currentIndex = 0;
        this.errors = 0;
        this.totalCharacters = 0;
        this.correctCharacters = 0;
        this.wpmHistory = [];
        this.mistakeMap.clear();

        this.renderTypingText();
        this.updateStats();
        this.highlightNextKey();
        this.animateFingerGuide();

        // Start stats update interval
        this.statsInterval = setInterval(() => this.updateStats(), 100);

        // Update UI
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        this.elements.restartBtn.disabled = false;

        if (this.settings.ghostTyping) {
            this.startGhostTyping();
        }
    }

    pauseLesson() {
        if (!this.isTyping) return;

        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            clearInterval(this.statsInterval);
            this.elements.pauseBtn.textContent = 'Resume';
            if (this.isGhostTyping) {
                clearInterval(this.ghostTypingInterval);
            }
        } else {
            this.statsInterval = setInterval(() => this.updateStats(), 100);
            this.elements.pauseBtn.textContent = 'Pause';
            if (this.settings.ghostTyping) {
                this.startGhostTyping();
            }
        }
    }

    restartLesson() {
        this.stopLesson();
        this.startLesson();
    }

    stopLesson() {
        this.isTyping = false;
        this.isPaused = false;
        
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
            this.statsInterval = null;
        }

        if (this.isGhostTyping) {
            this.stopGhostTyping();
        }

        // Reset UI
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.pauseBtn.textContent = 'Pause';
        this.elements.restartBtn.disabled = true;

        // Clear highlights
        this.clearKeyboardHighlights();
        this.clearFingerAnimations();
    }

    handleKeyDown(e) {
        // Handle keyboard shortcuts
        if (e.ctrlKey) {
            this.handleKeyboardShortcuts(e);
            return;
        }

        // Only process typing keys when lesson is active
        if (!this.isTyping || this.isPaused || this.isGhostTyping) {
            return;
        }

        e.preventDefault();

        const key = this.normalizeKey(e.key);
        const targetChar = this.currentLesson.text[this.currentIndex];

        // Highlight pressed key
        this.highlightPressedKey(key);

        // Check if key matches target character
        if (key === targetChar) {
            this.handleCorrectKeypress(key);
        } else {
            this.handleIncorrectKeypress(key, targetChar);
        }

        // Update display
        this.renderTypingText();
        this.updateStats();
        this.highlightNextKey();
        this.animateFingerGuide();

        // Check if lesson is complete
        if (this.currentIndex >= this.currentLesson.text.length) {
            this.completeLesson();
        }
    }

    handleKeyUp(e) {
        // Clear key highlight
        const key = this.normalizeKey(e.key);
        this.clearKeyHighlight(key);
    }

    handleCorrectKeypress(key) {
        this.currentIndex++;
        this.totalCharacters++;
        this.correctCharacters++;

        // Play sound
        if (this.settings.sound) {
            this.playKeystrokeSound();
        }

        // Track WPM
        this.trackWPM();
    }

    handleIncorrectKeypress(key, targetChar) {
        this.errors++;
        this.totalCharacters++;

        // Track mistake
        if (this.mistakeMap.has(targetChar)) {
            this.mistakeMap.set(targetChar, this.mistakeMap.get(targetChar) + 1);
        } else {
            this.mistakeMap.set(targetChar, 1);
        }

        // Play error sound
        if (this.settings.sound) {
            this.playErrorSound();
        }

        // Vibrate on mobile
        if (this.settings.vibration && 'vibrate' in navigator) {
            navigator.vibrate(100);
        }
    }

    normalizeKey(key) {
        const keyMap = {
            ' ': ' ',
            'Enter': '\n',
            'Tab': '\t'
        };
        return keyMap[key] || key;
    }

    // ==================== VIRTUAL KEYBOARD ====================
    
    handleVirtualKeyClick(keyElement) {
        if (!this.isTyping || this.isPaused || this.isGhostTyping) {
            return;
        }

        const key = keyElement.getAttribute('data-key');
        const targetChar = this.currentLesson.text[this.currentIndex];

        // Simulate keypress
        keyElement.classList.add('active');
        setTimeout(() => keyElement.classList.remove('active'), 150);

        // Process the keypress
        if (key === targetChar) {
            this.handleCorrectKeypress(key);
        } else {
            this.handleIncorrectKeypress(key, targetChar);
        }

        // Update display
        this.renderTypingText();
        this.updateStats();
        this.highlightNextKey();
        this.animateFingerGuide();

        // Check if lesson is complete
        if (this.currentIndex >= this.currentLesson.text.length) {
            this.completeLesson();
        }
    }

    highlightNextKey() {
        if (!this.settings.keyHighlight) return;
        
        // Clear previous highlights
        document.querySelectorAll('.key.next').forEach(key => {
            key.classList.remove('next');
        });

        if (this.currentIndex < this.currentLesson.text.length) {
            const nextChar = this.currentLesson.text[this.currentIndex];
            const keyElement = this.findKeyElement(nextChar);
            if (keyElement) {
                keyElement.classList.add('next');
            }
        }
    }

    highlightPressedKey(key) {
        const keyElement = this.findKeyElement(key);
        if (keyElement) {
            keyElement.classList.add('active');
        }
    }

    clearKeyHighlight(key) {
        const keyElement = this.findKeyElement(key);
        if (keyElement) {
            keyElement.classList.remove('active');
        }
    }

    clearKeyboardHighlights() {
        document.querySelectorAll('.key.next, .key.active').forEach(key => {
            key.classList.remove('next', 'active');
        });
    }

    findKeyElement(char) {
        return document.querySelector(`.key[data-key="${char}"]`);
    }

    // ==================== HAND GUIDE & FINGER ANIMATION ====================
    
    getKeyFingerMap() {
        return {
            // Left hand
            'q': 'left-pinky', 'a': 'left-pinky', 'z': 'left-pinky', '1': 'left-pinky',
            'w': 'left-ring', 's': 'left-ring', 'x': 'left-ring', '2': 'left-ring',
            'e': 'left-middle', 'd': 'left-middle', 'c': 'left-middle', '3': 'left-middle',
            'r': 'left-index', 'f': 'left-index', 'v': 'left-index', '4': 'left-index',
            't': 'left-index', 'g': 'left-index', 'b': 'left-index', '5': 'left-index',
            ' ': 'thumb',
            
            // Right hand
            'y': 'right-index', 'h': 'right-index', 'n': 'right-index', '6': 'right-index',
            'u': 'right-index', 'j': 'right-index', 'm': 'right-index', '7': 'right-index',
            'i': 'right-middle', 'k': 'right-middle', ',': 'right-middle', '8': 'right-middle',
            'o': 'right-ring', 'l': 'right-ring', '.': 'right-ring', '9': 'right-ring',
            'p': 'right-pinky', ';': 'right-pinky', '/': 'right-pinky', '0': 'right-pinky',
            '[': 'right-pinky', "'": 'right-pinky', '-': 'right-pinky', '=': 'right-pinky'
        };
    }

    animateFingerGuide() {
        if (!this.settings.fingerGuide) return;

        // Clear previous animations
        this.clearFingerAnimations();

        if (this.currentIndex < this.currentLesson.text.length) {
            const nextChar = this.currentLesson.text[this.currentIndex].toLowerCase();
            const finger = this.keyFingerMap[nextChar];
            
            if (finger) {
                const fingerElement = document.querySelector(`[data-finger="${finger}"]`);
                if (fingerElement) {
                    fingerElement.classList.add('active');
                }
            }
        }
    }

    clearFingerAnimations() {
        document.querySelectorAll('.finger.active, .thumb.active').forEach(finger => {
            finger.classList.remove('active');
        });
    }

    // ==================== GHOST TYPING ====================
    
    startGhostTyping() {
        if (!this.currentLesson || this.isTyping) return;

        this.isGhostTyping = true;
        this.currentIndex = 0;
        this.renderTypingText();

        this.ghostTypingInterval = setInterval(() => {
            if (this.currentIndex < this.currentLesson.text.length) {
                const char = this.currentLesson.text[this.currentIndex];
                
                // Highlight key and finger
                this.highlightPressedKey(char);
                this.animateFingerGuide();
                
                // Update text
                this.currentIndex++;
                this.renderTypingText();
                
                // Clear highlights after a delay
                setTimeout(() => {
                    this.clearKeyHighlight(char);
                }, 200);
                
                this.highlightNextKey();
            } else {
                this.stopGhostTyping();
                this.currentIndex = 0;
                this.renderTypingText();
            }
        }, 100);
    }

    stopGhostTyping() {
        this.isGhostTyping = false;
        if (this.ghostTypingInterval) {
            clearInterval(this.ghostTypingInterval);
            this.ghostTypingInterval = null;
        }
        this.clearKeyboardHighlights();
        this.clearFingerAnimations();
    }

    // ==================== DISPLAY & STATS ====================
    
    renderTypingText() {
        if (!this.currentLesson) {
            this.elements.typingText.innerHTML = '<span class="char current">Select a lesson to start typing...</span>';
            return;
        }

        const text = this.currentLesson.text;
        let html = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i] === ' ' ? '&nbsp;' : text[i];
            let classes = 'char';
            
            if (i < this.currentIndex) {
                // Already typed - mark as correct (simplified for ghost typing)
                classes += ' correct';
            } else if (i === this.currentIndex) {
                // Current character
                classes += ' current';
            }
            
            html += `<span class="${classes}">${char}</span>`;
        }
        
        this.elements.typingText.innerHTML = html;
        
        // Scroll to keep current character visible
        this.scrollToCurrentChar();
    }

    scrollToCurrentChar() {
        const currentChar = this.elements.typingText.querySelector('.char.current');
        if (currentChar && this.elements.typingText) {
            const containerWidth = this.elements.typingText.offsetWidth;
            const charPosition = currentChar.offsetLeft;
            const scrollLeft = Math.max(0, charPosition - containerWidth / 2);
            this.elements.typingText.scrollLeft = scrollLeft;
        }
    }

    updateStats() {
        if (!this.isTyping || !this.startTime) return;

        const timeElapsed = (Date.now() - this.startTime) / 1000; // seconds
        const minutes = timeElapsed / 60;
        
        // WPM calculation (assuming average word length of 5 characters)
        const wpm = minutes > 0 ? Math.round((this.correctCharacters / 5) / minutes) : 0;
        
        // Accuracy calculation
        const accuracy = this.totalCharacters > 0 ? Math.round((this.correctCharacters / this.totalCharacters) * 100) : 100;
        
        // Update display
        this.elements.wpmDisplay.textContent = wpm;
        this.elements.accuracyDisplay.textContent = `${accuracy}%`;
        this.elements.charactersDisplay.textContent = this.totalCharacters;
        this.elements.errorsDisplay.textContent = this.errors;
        this.elements.timeDisplay.textContent = this.formatTime(timeElapsed);
    }

    trackWPM() {
        if (!this.startTime) return;
        
        const timeElapsed = (Date.now() - this.startTime) / 1000;
        const minutes = timeElapsed / 60;
        const wpm = minutes > 0 ? Math.round((this.correctCharacters / 5) / minutes) : 0;
        
        this.wpmHistory.push({ time: timeElapsed, wpm: wpm });
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // ==================== LESSON COMPLETION ====================
    
    completeLesson() {
        this.stopLesson();
        
        const timeElapsed = (Date.now() - this.startTime) / 1000;
        const minutes = timeElapsed / 60;
        const finalWpm = minutes > 0 ? Math.round((this.correctCharacters / 5) / minutes) : 0;
        const finalAccuracy = this.totalCharacters > 0 ? Math.round((this.correctCharacters / this.totalCharacters) * 100) : 100;
        
        // Save lesson progress
        this.lessonProgress[this.currentLesson.id] = {
            completed: true,
            wpm: finalWpm,
            accuracy: finalAccuracy,
            errors: this.errors,
            time: timeElapsed,
            date: new Date().toISOString()
        };
        this.saveLessonProgress();
        
        // Check achievements
        this.checkAchievements(finalWpm, finalAccuracy, this.errors);
        
        // Show summary
        this.showLessonSummary(finalWpm, finalAccuracy, timeElapsed);
        
        // Update progress display
        this.updateProgressStats();
        this.renderLessons();
    }

    showLessonSummary(wpm, accuracy, time) {
        // Update summary stats
        document.getElementById('summaryWpm').textContent = wpm;
        document.getElementById('summaryAccuracy').textContent = `${accuracy}%`;
        document.getElementById('summaryErrors').textContent = this.errors;
        document.getElementById('summaryTime').textContent = this.formatTime(time);
        
        // Show mistakes analysis
        this.renderMistakesAnalysis();
        
        // Show WPM chart
        this.renderWPMChart();
        
        // Show modal
        this.toggleModal('summaryModal');
        
        // Setup summary action buttons
        document.getElementById('retryLessonBtn').onclick = () => {
            this.closeModal('summaryModal');
            this.restartLesson();
        };
        
        document.getElementById('continueNextBtn').onclick = () => {
            this.closeModal('summaryModal');
            this.nextLesson();
        };
    }

    renderMistakesAnalysis() {
        const mistakesList = document.getElementById('mistakesList');
        const sortedMistakes = Array.from(this.mistakeMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        if (sortedMistakes.length === 0) {
            mistakesList.innerHTML = '<p>Perfect typing! No mistakes found.</p>';
            return;
        }
        
        const html = sortedMistakes.map(([char, count]) => {
            const displayChar = char === ' ' ? 'Space' : char;
            return `<div class="mistake-item">
                <span class="mistake-char">${displayChar}</span>
                <span class="mistake-count">${count} errors</span>
            </div>`;
        }).join('');
        
        mistakesList.innerHTML = html;
    }

    renderWPMChart() {
        const canvas = document.getElementById('wpmChart');
        const ctx = canvas.getContext('2d');
        
        if (this.wpmHistory.length < 2) {
            ctx.fillText('Not enough data for chart', 50, 75);
            return;
        }
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.wpmHistory.map((_, i) => `${i}s`),
                datasets: [{
                    label: 'WPM',
                    data: this.wpmHistory.map(h => h.wpm),
                    borderColor: 'rgb(74, 144, 226)',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Words Per Minute'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                }
            }
        });
    }

    // ==================== LESSON NAVIGATION ====================
    
    selectLesson(lesson) {
        this.currentLesson = lesson;
        this.currentIndex = 0;
        
        // Update lesson info
        this.elements.lessonTitle.textContent = lesson.title;
        this.elements.lessonDescription.textContent = lesson.description;
        
        // Reset typing text
        this.renderTypingText();
        
        // Reset stats
        this.elements.wpmDisplay.textContent = '0';
        this.elements.accuracyDisplay.textContent = '100%';
        this.elements.charactersDisplay.textContent = '0';
        this.elements.errorsDisplay.textContent = '0';
        this.elements.timeDisplay.textContent = '0:00';
        
        // Enable start button
        this.elements.startBtn.disabled = false;
        this.elements.restartBtn.disabled = true;
        
        // Close lessons panel
        this.closePanel('lessonsPanel');
        
        // Start ghost typing if enabled
        if (this.settings.ghostTyping && !this.isTyping) {
            this.startGhostTyping();
        }
    }

    nextLesson() {
        const allLessons = this.getAllLessons();
        const currentIndex = allLessons.findIndex(l => l.id === this.currentLesson?.id);
        
        if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
            this.selectLesson(allLessons[currentIndex + 1]);
        }
    }

    previousLesson() {
        const allLessons = this.getAllLessons();
        const currentIndex = allLessons.findIndex(l => l.id === this.currentLesson?.id);
        
        if (currentIndex > 0) {
            this.selectLesson(allLessons[currentIndex - 1]);
        }
    }

    getAllLessons() {
        const builtIn = Object.values(this.builtInLessons).flat();
        return [...builtIn, ...this.customLessons];
    }

    // ==================== LESSONS PANEL ====================
    
    renderLessons() {
        // Render built-in lessons
        Object.keys(this.builtInLessons).forEach(category => {
            const container = document.getElementById(`${category}Lessons`);
            if (container) {
                container.innerHTML = this.builtInLessons[category].map(lesson => 
                    this.createLessonHTML(lesson)
                ).join('');
            }
        });
        
        // Render custom lessons
        const customContainer = document.getElementById('customLessonsList');
        if (customContainer) {
            customContainer.innerHTML = this.customLessons.map(lesson => 
                this.createCustomLessonHTML(lesson)
            ).join('');
        }
    }

    createLessonHTML(lesson) {
        const progress = this.lessonProgress[lesson.id];
        const isCompleted = progress?.completed || false;
        const isCurrent = this.currentLesson?.id === lesson.id;
        
        let statusClass = '';
        let statusText = '';
        
        if (isCurrent) {
            statusClass = 'current';
            statusText = 'Current';
        } else if (isCompleted) {
            statusClass = 'completed';
            statusText = `✓ ${progress.wpm} WPM`;
        }
        
        return `
            <div class="lesson-item ${statusClass}" onclick="app.selectLesson(${JSON.stringify(lesson).replace(/"/g, '&quot;')})">
                <div class="lesson-title">${lesson.title}</div>
                <div class="lesson-stats">${statusText}</div>
            </div>
        `;
    }

    createCustomLessonHTML(lesson) {
        const progress = this.lessonProgress[lesson.id];
        const isCompleted = progress?.completed || false;
        const isCurrent = this.currentLesson?.id === lesson.id;
        
        let statusClass = '';
        let statusText = '';
        
        if (isCurrent) {
            statusClass = 'current';
            statusText = 'Current';
        } else if (isCompleted) {
            statusClass = 'completed';
            statusText = `✓ ${progress.wpm} WPM`;
        }
        
        return `
            <div class="lesson-item ${statusClass}">
                <div class="lesson-title" onclick="app.selectLesson(${JSON.stringify(lesson).replace(/"/g, '&quot;')})">${lesson.title}</div>
                <div class="lesson-stats">
                    ${statusText}
                    <button onclick="app.deleteCustomLesson('${lesson.id}')" class="btn danger" style="margin-left: 10px; padding: 0.25rem 0.5rem; font-size: 0.8rem;">Delete</button>
                </div>
            </div>
        `;
    }

    setupLessonsListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
        
        // Add custom lesson
        document.getElementById('addCustomLessonBtn').addEventListener('click', () => {
            this.addCustomLesson();
        });
        
        // Reset lessons
        document.getElementById('resetLessonsBtn').addEventListener('click', () => {
            this.resetLessons();
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.getAttribute('data-tab') === tabName);
        });
    }

    addCustomLesson() {
        const title = document.getElementById('customLessonTitle').value.trim();
        const text = document.getElementById('customLessonText').value.trim();
        
        if (!title || !text) {
            alert('Please enter both title and text for the lesson.');
            return;
        }
        
        const lesson = {
            id: 'custom_' + Date.now(),
            title: title,
            description: 'Custom lesson',
            text: text
        };
        
        this.customLessons.push(lesson);
        this.saveCustomLessons();
        this.renderLessons();
        
        // Clear form
        document.getElementById('customLessonTitle').value = '';
        document.getElementById('customLessonText').value = '';
    }

    deleteCustomLesson(lessonId) {
        if (confirm('Are you sure you want to delete this lesson?')) {
            this.customLessons = this.customLessons.filter(l => l.id !== lessonId);
            this.saveCustomLessons();
            this.renderLessons();
            
            // If this was the current lesson, clear it
            if (this.currentLesson?.id === lessonId) {
                this.currentLesson = null;
                this.elements.lessonTitle.textContent = 'Select a Lesson';
                this.elements.lessonDescription.textContent = 'Choose a lesson to get started.';
                this.renderTypingText();
            }
        }
    }

    resetLessons() {
        if (confirm('Are you sure you want to reset all lessons? This will clear all custom lessons and progress.')) {
            this.customLessons = [];
            this.lessonProgress = {};
            this.saveCustomLessons();
            this.saveLessonProgress();
            this.renderLessons();
            this.updateProgressStats();
        }
    }

    // ==================== SETTINGS ====================
    
    loadSettings() {
        const defaults = {
            fontSize: 16,
            zoom: 1,
            theme: 'light',
            showKeyboard: true,
            keyHighlight: true,
            keyboardTheme: 'default',
            fingerGuide: true,
            ghostTyping: false,
            sound: true,
            vibration: true,
            zoomLocked: false
        };
        
        const saved = localStorage.getItem('typingTutorSettings');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }

    saveSettings() {
        localStorage.setItem('typingTutorSettings', JSON.stringify(this.settings));
    }

    applySettings() {
        // Theme
        document.body.setAttribute('data-theme', this.settings.theme);
        
        // Font size
        document.documentElement.style.setProperty('--typing-font-size', `${this.settings.fontSize}px`);
        
        // Zoom
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.transform = `scale(${this.settings.zoom})`;
        }
        
        // Keyboard visibility
        const keyboardContainer = document.querySelector('.keyboard-container');
        if (keyboardContainer) {
            keyboardContainer.style.display = this.settings.showKeyboard ? 'block' : 'none';
        }
        
        // Hand guide visibility
        if (this.elements.handGuide) {
            this.elements.handGuide.style.display = this.settings.fingerGuide ? 'block' : 'none';
        }
        
        // Keyboard theme
        if (this.elements.virtualKeyboard) {
            this.elements.virtualKeyboard.className = `virtual-keyboard theme-${this.settings.keyboardTheme}`;
        }
        
        // Update UI controls
        this.updateSettingsUI();
    }

    updateSettingsUI() {
        document.getElementById('fontSizeSlider').value = this.settings.fontSize;
        document.getElementById('fontSizeValue').textContent = `${this.settings.fontSize}px`;
        
        document.getElementById('zoomSlider').value = this.settings.zoom;
        document.getElementById('zoomValue').textContent = `${Math.round(this.settings.zoom * 100)}%`;
        
        // Update zoom lock button
        const zoomLockBtn = document.getElementById('zoomLockBtn');
        if (this.settings.zoomLocked) {
            zoomLockBtn.textContent = '🔒 Locked';
            zoomLockBtn.classList.add('locked');
        } else {
            zoomLockBtn.textContent = '🔓 Unlock Zoom';
            zoomLockBtn.classList.remove('locked');
        }
        
        document.getElementById('themeSelect').value = this.settings.theme;
        document.getElementById('showKeyboardToggle').checked = this.settings.showKeyboard;
        document.getElementById('keyHighlightToggle').checked = this.settings.keyHighlight;
        document.getElementById('keyboardThemeSelect').value = this.settings.keyboardTheme;
        document.getElementById('fingerGuideToggle').checked = this.settings.fingerGuide;
        document.getElementById('ghostTypingToggle').checked = this.settings.ghostTyping;
        document.getElementById('soundToggle').checked = this.settings.sound;
        document.getElementById('vibrationToggle').checked = this.settings.vibration;
    }

    setupSettingsListeners() {
        // Font size
        document.getElementById('fontSizeSlider').addEventListener('input', (e) => {
            this.settings.fontSize = parseInt(e.target.value);
            document.getElementById('fontSizeValue').textContent = `${this.settings.fontSize}px`;
            this.applySettings();
            this.saveSettings();
        });
        
        // Zoom
        document.getElementById('zoomSlider').addEventListener('input', (e) => {
            if (this.settings.zoomLocked) {
                e.target.value = this.settings.zoom;
                this.showZoomIndicator('Zoom is locked!');
                return;
            }
            this.settings.zoom = parseFloat(e.target.value);
            document.getElementById('zoomValue').textContent = `${Math.round(this.settings.zoom * 100)}%`;
            this.applySettings();
            this.saveSettings();
            this.showZoomIndicator(`${Math.round(this.settings.zoom * 100)}%`);
        });
        
        // Zoom lock
        document.getElementById('zoomLockBtn').addEventListener('click', () => {
            this.toggleZoomLock();
        });
        
        // Theme
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.settings.theme = e.target.value;
            this.applySettings();
            this.saveSettings();
        });
        
        // Toggles
        const toggles = [
            'showKeyboard', 'keyHighlight', 'fingerGuide', 
            'ghostTyping', 'sound', 'vibration'
        ];
        
        toggles.forEach(setting => {
            const element = document.getElementById(`${setting}Toggle`);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.settings[setting] = e.target.checked;
                    this.applySettings();
                    this.saveSettings();
                });
            }
        });
        
        // Keyboard theme
        document.getElementById('keyboardThemeSelect').addEventListener('change', (e) => {
            this.settings.keyboardTheme = e.target.value;
            this.applySettings();
            this.saveSettings();
        });
        
        // Reset settings
        document.getElementById('resetSettingsBtn').addEventListener('click', () => {
            this.resetSettings();
        });
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            this.settings = this.loadSettings();
            // Clear localStorage to force defaults
            localStorage.removeItem('typingTutorSettings');
            this.settings = this.loadSettings();
            this.applySettings();
            this.saveSettings();
        }
    }

    // ==================== PROFILES ====================
    
    loadCurrentProfile() {
        const saved = localStorage.getItem('currentProfile');
        return saved ? JSON.parse(saved) : { id: 'default', name: 'Default User' };
    }

    saveCurrentProfile() {
        localStorage.setItem('currentProfile', JSON.stringify(this.currentProfile));
    }

    loadProfiles() {
        const saved = localStorage.getItem('profiles');
        return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Default User' }];
    }

    saveProfiles() {
        localStorage.setItem('profiles', JSON.stringify(this.profiles));
    }

    renderProfiles() {
        // Update current profile display
        document.getElementById('profileName').textContent = this.currentProfile.name;
        document.getElementById('profileInitials').textContent = this.getInitials(this.currentProfile.name);
        
        // Render profiles list
        const profilesList = document.getElementById('profilesList');
        profilesList.innerHTML = this.profiles.map(profile => `
            <div class="profile-item ${profile.id === this.currentProfile.id ? 'active' : ''}" 
                 onclick="app.switchProfile('${profile.id}')">
                <div>
                    <strong>${profile.name}</strong>
                    <div style="font-size: 0.8rem; opacity: 0.7;">
                        ${profile.id === 'default' ? 'Default Profile' : 'Custom Profile'}
                    </div>
                </div>
                ${profile.id !== 'default' ? `
                    <button onclick="event.stopPropagation(); app.deleteProfile('${profile.id}')" 
                            class="btn danger" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Delete</button>
                ` : ''}
            </div>
        `).join('');
    }

    setupProfilesListeners() {
        document.getElementById('createProfileBtn').addEventListener('click', () => {
            this.createProfile();
        });
    }

    createProfile() {
        const name = document.getElementById('newProfileName').value.trim();
        
        if (!name) {
            alert('Please enter a profile name.');
            return;
        }
        
        if (this.profiles.some(p => p.name === name)) {
            alert('A profile with this name already exists.');
            return;
        }
        
        const profile = {
            id: 'profile_' + Date.now(),
            name: name
        };
        
        this.profiles.push(profile);
        this.saveProfiles();
        this.renderProfiles();
        
        // Clear input
        document.getElementById('newProfileName').value = '';
        
        // Switch to new profile
        this.switchProfile(profile.id);
    }

    switchProfile(profileId) {
        const profile = this.profiles.find(p => p.id === profileId);
        if (!profile) return;
        
        // Save current profile's data
        this.saveLessonProgress();
        
        // Switch to new profile
        this.currentProfile = profile;
        this.saveCurrentProfile();
        
        // Load new profile's data
        this.lessonProgress = this.loadLessonProgress();
        
        // Update UI
        this.renderProfiles();
        this.renderLessons();
        this.updateProgressStats();
        
        // Close panel
        this.closePanel('profilePanel');
    }

    deleteProfile(profileId) {
        if (profileId === 'default') {
            alert('Cannot delete the default profile.');
            return;
        }
        
        if (confirm('Are you sure you want to delete this profile? All progress will be lost.')) {
            this.profiles = this.profiles.filter(p => p.id !== profileId);
            this.saveProfiles();
            
            // Clean up profile data
            localStorage.removeItem(`lessonProgress_${profileId}`);
            localStorage.removeItem(`achievements_${profileId}`);
            
            // Switch to default if current profile was deleted
            if (this.currentProfile.id === profileId) {
                this.switchProfile('default');
            } else {
                this.renderProfiles();
            }
        }
    }

    getInitials(name) {
        return name.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    // ==================== PROGRESS & ACHIEVEMENTS ====================
    
    loadAchievements() {
        const defaultAchievements = [
            { id: 'first_lesson', title: '100% Accuracy', description: 'Complete a lesson with 100% accuracy', icon: '🎯', unlocked: false },
            { id: 'speed_demon', title: 'Speed Demon', description: 'Reach 50 WPM', icon: '⚡', unlocked: false },
            { id: 'five_lessons', title: 'Dedicated Learner', description: 'Complete 5 lessons', icon: '📚', unlocked: false },
            { id: 'perfect_lesson', title: 'Perfectionist', description: 'Complete a lesson with 0 mistakes', icon: '💎', unlocked: false },
            { id: 'fast_fingers', title: 'Fast Fingers', description: 'Reach 70 WPM', icon: '🏃', unlocked: false },
            { id: 'consistency', title: 'Consistent Typer', description: 'Complete 10 lessons', icon: '🔥', unlocked: false }
        ];
        
        const saved = localStorage.getItem(`achievements_${this.currentProfile.id}`);
        return saved ? JSON.parse(saved) : defaultAchievements;
    }

    saveAchievements() {
        localStorage.setItem(`achievements_${this.currentProfile.id}`, JSON.stringify(this.achievements));
    }

    checkAchievements(wpm, accuracy, errors) {
        let newUnlocks = [];
        
        // 100% Accuracy
        if (accuracy === 100 && !this.achievements.find(a => a.id === 'first_lesson').unlocked) {
            this.unlockAchievement('first_lesson');
            newUnlocks.push('100% Accuracy');
        }
        
        // Speed Demon (50 WPM)
        if (wpm >= 50 && !this.achievements.find(a => a.id === 'speed_demon').unlocked) {
            this.unlockAchievement('speed_demon');
            newUnlocks.push('Speed Demon');
        }
        
        // Fast Fingers (70 WPM)
        if (wpm >= 70 && !this.achievements.find(a => a.id === 'fast_fingers').unlocked) {
            this.unlockAchievement('fast_fingers');
            newUnlocks.push('Fast Fingers');
        }
        
        // Perfectionist (0 errors)
        if (errors === 0 && !this.achievements.find(a => a.id === 'perfect_lesson').unlocked) {
            this.unlockAchievement('perfect_lesson');
            newUnlocks.push('Perfectionist');
        }
        
        // Check lesson count achievements
        const completedCount = Object.values(this.lessonProgress).filter(p => p.completed).length;
        
        if (completedCount >= 5 && !this.achievements.find(a => a.id === 'five_lessons').unlocked) {
            this.unlockAchievement('five_lessons');
            newUnlocks.push('Dedicated Learner');
        }
        
        if (completedCount >= 10 && !this.achievements.find(a => a.id === 'consistency').unlocked) {
            this.unlockAchievement('consistency');
            newUnlocks.push('Consistent Typer');
        }
        
        // Show achievement notifications
        newUnlocks.forEach(achievement => {
            this.showAchievementNotification(achievement);
        });
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement) {
            achievement.unlocked = true;
            this.saveAchievements();
            this.renderAchievements();
        }
    }

    showAchievementNotification(title) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-popup">
                <h4>🏆 Achievement Unlocked!</h4>
                <p>${title}</p>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 1rem;
            border-radius: var(--border-radius);
            z-index: 3000;
            animation: slideInRight 0.5s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }

    renderAchievements() {
        const achievementsList = document.getElementById('achievementsList');
        if (!achievementsList) return;
        
        achievementsList.innerHTML = this.achievements.map(achievement => `
            <div class="achievement ${achievement.unlocked ? 'unlocked' : ''}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-title">${achievement.title}</div>
            </div>
        `).join('');
    }

    updateProgressStats() {
        const completedLessons = Object.values(this.lessonProgress).filter(p => p.completed);
        const totalLessons = this.getAllLessons().length;
        const bestWpm = completedLessons.length > 0 ? Math.max(...completedLessons.map(p => p.wpm)) : 0;
        const avgAccuracy = completedLessons.length > 0 ? 
            Math.round(completedLessons.reduce((sum, p) => sum + p.accuracy, 0) / completedLessons.length) : 0;
        
        // Update stats display
        const totalLessonsElement = document.getElementById('totalLessonsCount');
        const completedLessonsElement = document.getElementById('completedLessonsCount');
        const bestWpmElement = document.getElementById('bestWpmStat');
        const avgAccuracyElement = document.getElementById('avgAccuracyStat');
        
        if (totalLessonsElement) totalLessonsElement.textContent = totalLessons;
        if (completedLessonsElement) completedLessonsElement.textContent = completedLessons.length;
        if (bestWpmElement) bestWpmElement.textContent = bestWpm;
        if (avgAccuracyElement) avgAccuracyElement.textContent = `${avgAccuracy}%`;
        
        // Render progress chart
        this.renderProgressChart();
    }

    renderProgressChart() {
        const canvas = document.getElementById('progressChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const completedLessons = Object.values(this.lessonProgress)
            .filter(p => p.completed)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-10); // Last 10 lessons
        
        if (completedLessons.length === 0) {
            ctx.fillText('Complete some lessons to see progress!', 50, 100);
            return;
        }
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: completedLessons.map((_, i) => `Lesson ${i + 1}`),
                datasets: [
                    {
                        label: 'WPM',
                        data: completedLessons.map(p => p.wpm),
                        borderColor: 'rgb(74, 144, 226)',
                        backgroundColor: 'rgba(74, 144, 226, 0.1)',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Accuracy',
                        data: completedLessons.map(p => p.accuracy),
                        borderColor: 'rgb(40, 167, 69)',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'WPM'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Accuracy %'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    // ==================== UI HELPERS ====================
    
    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        
        const isOpen = panel.classList.contains('open');
        
        // Close all panels first
        document.querySelectorAll('.panel.open').forEach(p => {
            p.classList.remove('open');
        });
        
        // Open the target panel if it wasn't already open
        if (!isOpen) {
            panel.classList.add('open');
            console.log(`Panel ${panelId} opened`);
        }
    }

    closePanel(panelId) {
        const panel = document.getElementById(panelId);
        panel.classList.remove('open');
    }

    toggleModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.toggle('open');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('open');
    }

    handleTouchClose(e) {
        // Check if click is on any navigation button
        const navButtons = ['lessonsBtn', 'settingsBtn', 'progressBtn', 'profileBtn'];
        const clickedNavButton = navButtons.find(btnId => e.target.closest(`#${btnId}`));
        
        // Close panels when clicking outside, but not when clicking nav buttons
        if (!clickedNavButton) {
            document.querySelectorAll('.panel.open').forEach(panel => {
                if (!panel.contains(e.target)) {
                    panel.classList.remove('open');
                }
            });
        }
        
        // Close modals when clicking outside
        document.querySelectorAll('.modal.open').forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('open');
            }
        });
    }

    // ==================== KEYBOARD SHORTCUTS ====================
    
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey) {
            switch (e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    this.startLesson();
                    break;
                case 'r':
                    e.preventDefault();
                    this.restartLesson();
                    break;
                case 'n':
                    e.preventDefault();
                    this.nextLesson();
                    break;
                case 'b':
                    e.preventDefault();
                    this.previousLesson();
                    break;
                case 'l':
                    e.preventDefault();
                    this.togglePanel('lessonsPanel');
                    break;
                case 'p':
                    e.preventDefault();
                    this.togglePanel('settingsPanel');
                    break;
                case 't':
                    e.preventDefault();
                    this.toggleTheme();
                    break;
                case '=':
                case '+':
                    e.preventDefault();
                    this.zoomIn();
                    break;
                case '-':
                    e.preventDefault();
                    this.zoomOut();
                    break;
                case 'escape':
                    e.preventDefault();
                    this.closeAllPanels();
                    break;
                case 'z':
                    e.preventDefault();
                    this.toggleModal('shortcutsModal');
                    break;
                case 'h':
                    e.preventDefault();
                    this.toggleNavbar();
                    break;
            }
        }
    }

    toggleTheme() {
        const themes = ['light', 'dark', 'night', 'colorful'];
        const currentIndex = themes.indexOf(this.settings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.settings.theme = themes[nextIndex];
        this.applySettings();
        this.saveSettings();
    }

    zoomIn() {
        if (this.settings.zoomLocked) {
            this.showZoomIndicator('Zoom is locked!');
            return;
        }
        this.settings.zoom = Math.min(2, this.settings.zoom + 0.1);
        this.applySettings();
        this.saveSettings();
        this.showZoomIndicator(`${Math.round(this.settings.zoom * 100)}%`);
    }

    zoomOut() {
        if (this.settings.zoomLocked) {
            this.showZoomIndicator('Zoom is locked!');
            return;
        }
        this.settings.zoom = Math.max(0.5, this.settings.zoom - 0.1);
        this.applySettings();
        this.saveSettings();
        this.showZoomIndicator(`${Math.round(this.settings.zoom * 100)}%`);
    }

    closeAllPanels() {
        document.querySelectorAll('.panel.open').forEach(panel => {
            panel.classList.remove('open');
        });
        document.querySelectorAll('.modal.open').forEach(modal => {
            modal.classList.remove('open');
        });
    }

    // ==================== ZOOM & TOUCH SUPPORT ====================
    
    setupZoomSupport() {
        let scale = 1;
        let panning = false;
        let pointX = 0;
        let pointY = 0;
        let start = { x: 0, y: 0 };
        
        const mainContent = document.querySelector('.main-content');
        
        // Touch zoom support
        let initialDistance = 0;
        let initialScale = 1;
        
        mainContent.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
                initialScale = scale;
            } else if (e.touches.length === 1) {
                panning = true;
                start = { x: e.touches[0].clientX - pointX, y: e.touches[0].clientY - pointY };
            }
        });
        
        mainContent.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 2) {
                if (this.settings.zoomLocked) {
                    this.showZoomIndicator('Zoom is locked!');
                    return;
                }
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                scale = initialScale * (currentDistance / initialDistance);
                scale = Math.max(0.5, Math.min(2, scale));
                
                this.settings.zoom = scale;
                this.applySettings();
                this.showZoomIndicator(`${Math.round(this.settings.zoom * 100)}%`);
            } else if (e.touches.length === 1 && panning) {
                pointX = e.touches[0].clientX - start.x;
                pointY = e.touches[0].clientY - start.y;
                mainContent.style.transform = `scale(${scale}) translate(${pointX}px, ${pointY}px)`;
            }
        });
        
        mainContent.addEventListener('touchend', () => {
            panning = false;
            if (scale !== this.settings.zoom) {
                this.saveSettings();
            }
        });
    }

    toggleNavbar() {
        const navbar = document.getElementById('navbar');
        const toggleBtn = document.getElementById('navToggleBtn');
        
        this.navbarVisible = !this.navbarVisible;
        
        if (this.navbarVisible) {
            navbar.classList.remove('hidden');
            toggleBtn.textContent = '^';
            toggleBtn.style.transform = 'rotate(0deg)';
        } else {
            navbar.classList.add('hidden');
            toggleBtn.textContent = '^';
            toggleBtn.style.transform = 'rotate(180deg)';
        }
    }

    toggleZoomLock() {
        this.settings.zoomLocked = !this.settings.zoomLocked;
        const btn = document.getElementById('zoomLockBtn');
        
        if (this.settings.zoomLocked) {
            btn.textContent = '🔒 Locked';
            btn.classList.add('locked');
            this.showZoomIndicator('Zoom locked!');
        } else {
            btn.textContent = '🔓 Unlock Zoom';
            btn.classList.remove('locked');
            this.showZoomIndicator('Zoom unlocked!');
        }
        
        this.saveSettings();
    }

    showZoomIndicator(text) {
        const indicator = document.getElementById('zoomIndicator');
        const textElement = document.getElementById('zoomIndicatorText');
        
        textElement.textContent = text;
        indicator.classList.add('show');
        
        // Clear any existing timeout
        if (this.zoomIndicatorTimeout) {
            clearTimeout(this.zoomIndicatorTimeout);
        }
        
        // Hide after 1 second
        this.zoomIndicatorTimeout = setTimeout(() => {
            indicator.classList.remove('show');
        }, 1000);
    }

    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    handleResize() {
        // Adjust keyboard scaling on mobile
        const keyboard = this.elements.virtualKeyboard;
        if (keyboard && window.innerWidth < 768) {
            const scale = Math.min(0.8, window.innerWidth / 900);
            keyboard.style.transform = `scale(${scale})`;
        }
    }

    // ==================== FULLSCREEN SUPPORT ====================
    
    requestFullscreenOnInteraction() {
        const enterFullscreen = () => {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
            document.removeEventListener('click', enterFullscreen);
            document.removeEventListener('keydown', enterFullscreen);
        };
        
        document.addEventListener('click', enterFullscreen);
        document.addEventListener('keydown', enterFullscreen);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // ==================== AUDIO ====================
    
    playKeystrokeSound() {
        if (this.elements.keystrokeSound) {
            this.elements.keystrokeSound.currentTime = 0;
            this.elements.keystrokeSound.play().catch(() => {
                // Ignore audio play errors
            });
        }
    }

    playErrorSound() {
        if (this.elements.errorSound) {
            this.elements.errorSound.currentTime = 0;
            this.elements.errorSound.play().catch(() => {
                // Ignore audio play errors
            });
        }
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TypingTutor();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TypingTutor;
}