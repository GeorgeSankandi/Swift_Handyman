// --- Live Sale Timer Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const countdownElements = document.querySelectorAll('.countdown-timer');

    countdownElements.forEach(timer => {
        const saleEndDate = new Date(timer.dataset.saleEnd).getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = saleEndDate - now;

            if (distance < 0) {
                clearInterval(interval);
                timer.innerHTML = "Sale has ended";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            timer.innerHTML = `<span>${days}d</span> <span>${hours}h</span> <span>${minutes}m</span> <span>${seconds}s</span>`;
        }, 1000);
    });
});