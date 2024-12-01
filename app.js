class PomodoroTimer {
    constructor() {
        // DOM elements
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.timerLabel = document.getElementById('timerLabel');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.dailyCount = document.getElementById('dailyCount');
        this.totalCount = document.getElementById('totalCount');
        this.progressRing = document.querySelector('.progress-ring-circle');
        this.motivationText = document.getElementById('motivationText');
        this.sessionCountDisplay = document.getElementById('sessionCount');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Settings elements
        this.settingsModal = document.getElementById('settingsModal');
        this.workTimeInput = document.getElementById('workTime');
        this.breakTimeInput = document.getElementById('breakTime');
        this.longBreakTimeInput = document.getElementById('longBreakTime');
        this.soundEnabledInput = document.getElementById('soundEnabled');
        this.motivationEnabledInput = document.getElementById('motivationEnabled');
        this.saveSettingsBtn = document.getElementById('saveSettings');
        this.closeSettingsBtn = document.getElementById('closeSettings');
        
        // Timer variables
        this.workTime = 25 * 60;
        this.breakTime = 5 * 60;
        this.longBreakTime = 15 * 60;
        this.timeLeft = this.workTime;
        this.isRunning = false;
        this.isBreak = false;
        this.timer = null;
        this.sessionCount = 1;
        
        // Progress circle
        const circle = this.progressRing;
        const radius = circle.r.baseVal.value;
        this.circumference = 2 * Math.PI * radius;
        circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        circle.style.strokeDashoffset = this.circumference;
        
        // Features
        this.sound = new Audio('notification.mp3');
        this.soundEnabled = true;
        this.motivationEnabled = true;
        this.motivationalMessages = {
            work: [
                "Diqqatingizni jamlang! ",
                "Siz bunga qodirsiz! ",
                "Har bir daqiqa muhim! ",
                "Maqsad sari olg'a! ",
                "Bugun yangi yutuqlar kuni! "
            ],
            break: [
                "Yaxshi ishladingiz! ",
                "Dam olish vaqti! ",
                "Energiyangizni tiklang! ",
                "Biroz nafas oling! ",
                "Siz bunga loyiqsiz! "
            ],
            longBreak: [
                "Ajoyib natija! ",
                "Uzoqroq dam oling! ",
                "O'zingizni mukofotlang! ",
                "Katta tanaffus vaqti! ",
                "Keyingi sessiyaga tayyormisiz? "
            ]
        };
        
        // Load settings and stats
        this.loadSettings();
        this.loadStats();
        this.loadTheme();
        
        // Event listeners
        this.startBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.hideSettings());
        this.themeToggle.addEventListener('change', () => this.toggleTheme());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleTimer();
            } else if (e.code === 'KeyR') {
                this.resetTimer();
            } else if (e.code === 'KeyS') {
                this.showSettings();
            }
        });
        
        // Initial display
        this.updateDisplay();
    }
    
    setProgress(percent) {
        const offset = this.circumference - (percent / 100 * this.circumference);
        this.progressRing.style.strokeDashoffset = offset;
    }
    
    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }
    
    startTimer() {
        this.isRunning = true;
        this.startBtn.textContent = "TO'XTATISH";
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.handleTimerComplete();
            }
        }, 1000);
    }
    
    pauseTimer() {
        this.isRunning = false;
        this.startBtn.textContent = "DAVOM ETTIRISH";
        clearInterval(this.timer);
    }
    
    resetTimer() {
        this.pauseTimer();
        this.isBreak = false;
        this.timeLeft = this.workTime;
        this.sessionCount = 1;
        this.startBtn.textContent = "BOSHLASH";
        this.timerLabel.textContent = "Ishlash vaqti";
        this.sessionCountDisplay.textContent = "1";
        this.showMotivationMessage('work');
        this.updateDisplay();
    }
    
    handleTimerComplete() {
        if (this.soundEnabled) {
            this.sound.play();
        }
        
        if (this.isBreak) {
            this.isBreak = false;
            this.timeLeft = this.workTime;
            this.timerLabel.textContent = "Ishlash vaqti";
            this.showMotivationMessage('work');
        } else {
            this.isBreak = true;
            if (this.sessionCount % 4 === 0) {
                this.timeLeft = this.longBreakTime;
                this.timerLabel.textContent = "Uzoq tanaffus";
                this.showMotivationMessage('longBreak');
            } else {
                this.timeLeft = this.breakTime;
                this.timerLabel.textContent = "Tanaffus vaqti";
                this.showMotivationMessage('break');
            }
            this.updateStats();
            this.sessionCount = (this.sessionCount % 4) + 1;
            this.sessionCountDisplay.textContent = this.sessionCount;
        }
        
        this.updateDisplay();
    }
    
    showMotivationMessage(type) {
        if (!this.motivationEnabled) return;
        
        const messages = this.motivationalMessages[type];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.motivationText.textContent = randomMessage;
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
        
        // Update progress ring
        const totalTime = this.isBreak ? 
            (this.sessionCount % 4 === 0 ? this.longBreakTime : this.breakTime) : 
            this.workTime;
        const progress = (this.timeLeft / totalTime) * 100;
        this.setProgress(progress);
    }
    
    showSettings() {
        this.settingsModal.classList.add('show');
        this.workTimeInput.value = this.workTime / 60;
        this.breakTimeInput.value = this.breakTime / 60;
        this.longBreakTimeInput.value = this.longBreakTime / 60;
        this.soundEnabledInput.checked = this.soundEnabled;
        this.motivationEnabledInput.checked = this.motivationEnabled;
    }
    
    hideSettings() {
        this.settingsModal.classList.remove('show');
    }
    
    saveSettings() {
        const workMinutes = parseInt(this.workTimeInput.value);
        const breakMinutes = parseInt(this.breakTimeInput.value);
        const longBreakMinutes = parseInt(this.longBreakTimeInput.value);
        
        if (workMinutes > 0 && breakMinutes > 0 && longBreakMinutes > 0) {
            this.workTime = workMinutes * 60;
            this.breakTime = breakMinutes * 60;
            this.longBreakTime = longBreakMinutes * 60;
            this.soundEnabled = this.soundEnabledInput.checked;
            this.motivationEnabled = this.motivationEnabledInput.checked;
            
            localStorage.setItem('pomodoroSettings', JSON.stringify({
                workTime: this.workTime,
                breakTime: this.breakTime,
                longBreakTime: this.longBreakTime,
                soundEnabled: this.soundEnabled,
                motivationEnabled: this.motivationEnabled
            }));
            
            this.resetTimer();
            this.hideSettings();
        }
    }
    
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('pomodoroSettings'));
        if (settings) {
            this.workTime = settings.workTime;
            this.breakTime = settings.breakTime;
            this.longBreakTime = settings.longBreakTime || 15 * 60;
            this.soundEnabled = settings.soundEnabled;
            this.motivationEnabled = settings.motivationEnabled ?? true;
            this.timeLeft = this.workTime;
        }
    }
    
    toggleTheme() {
        const isDark = this.themeToggle.checked;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.themeToggle.checked = savedTheme === 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    updateStats() {
        const today = new Date().toLocaleDateString();
        const stats = JSON.parse(localStorage.getItem('pomodoroStats')) || {
            daily: {},
            total: 0
        };
        
        if (!stats.daily[today]) {
            stats.daily[today] = 0;
        }
        
        stats.daily[today]++;
        stats.total++;
        
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
        this.displayStats(stats);
    }
    
    loadStats() {
        const stats = JSON.parse(localStorage.getItem('pomodoroStats')) || {
            daily: {},
            total: 0
        };
        this.displayStats(stats);
    }
    
    displayStats(stats) {
        const today = new Date().toLocaleDateString();
        this.dailyCount.textContent = (stats.daily[today] || 0).toString();
        this.totalCount.textContent = stats.total.toString();
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});
