document.addEventListener('DOMContentLoaded', () => {

    // Countdown until June 9, 2026
    const examDate = new Date('2026-06-09T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = examDate - today;
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    document.getElementById('countdown').textContent = daysLeft;

    // ===== STREAK SYSTEM =====
    const todayStr = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const lastVisit = localStorage.getItem('revisio_last_visit');
    let streak = parseInt(localStorage.getItem('revisio_streak') || '0', 10);

    if (lastVisit === todayStr) {
        // Already visited today, streak stays the same
    } else if (lastVisit) {
        const lastDate = new Date(lastVisit + 'T00:00:00');
        const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Visited yesterday → streak +1
            streak += 1;
        } else {
            // Missed a day → reset
            streak = 1;
        }
    } else {
        // First visit ever
        streak = 1;
    }

    localStorage.setItem('revisio_last_visit', todayStr);
    localStorage.setItem('revisio_streak', streak.toString());

    // Update streak UI
    const streakNumberEl = document.querySelector('.streak-number');
    const streakBadge = document.querySelector('.streak-badge');
    const streakMessage = document.querySelector('.streak-message');
    const dayEls = document.querySelectorAll('.streak-days .day');

    if (streakNumberEl) streakNumberEl.textContent = streak;

    // Update badge text based on streak
    if (streakBadge) {
        if (streak >= 30) streakBadge.textContent = 'Légendaire';
        else if (streak >= 14) streakBadge.textContent = 'Inarrêtable';
        else if (streak >= 7) streakBadge.textContent = 'En feu';
        else if (streak >= 3) streakBadge.textContent = 'Bon début';
        else streakBadge.textContent = 'Début';
    }

    // Update streak message
    if (streakMessage) {
        if (streak === 1) {
            streakMessage.innerHTML = 'Premier jour — le début de quelque chose.<br>Reviens demain pour continuer.';
        } else if (streak < 7) {
            streakMessage.innerHTML = `${streak} jours de suite, continue comme ça !<br>Ne lâche rien — l'examen approche.`;
        } else {
            streakMessage.innerHTML = `Tu révises chaque jour depuis ${streak} jours.<br>Continue — l'examen approche.`;
        }
    }

    // Highlight days of the week based on streak
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    // dayEls: L=0, M=1, M=2, J=3, V=4, S=5, D=6
    const mappedToday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    dayEls.forEach((el, i) => {
        el.classList.remove('active', 'done');
        // How many days back from today is this day in the week
        let daysBack = mappedToday - i;
        if (daysBack < 0) daysBack += 7;
        if (daysBack === 0) {
            el.classList.add('active');
        } else if (daysBack < streak && daysBack < 7) {
            el.classList.add('done');
        }
    });

    // Update the "JOURS DE SUITE" stat
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 3) {
        statNumbers[2].textContent = streak;
    }

    // Progress bar animation on scroll
    const progressBars = document.querySelectorAll('.progress-fill');

    const animateProgress = () => {
        progressBars.forEach(bar => {
            const rect = bar.getBoundingClientRect();
            if (rect.top < window.innerHeight - 50) {
                const progress = bar.getAttribute('data-progress');
                bar.style.width = progress + '%';
            }
        });
    };

    animateProgress();
    window.addEventListener('scroll', animateProgress);

    // Quiz interaction
    const quizOptions = document.querySelectorAll('.quiz-option');
    quizOptions.forEach(option => {
        option.addEventListener('click', () => {
            quizOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
});
