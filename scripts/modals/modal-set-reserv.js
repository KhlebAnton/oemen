// Модалка установки бронирования
const modalSetReserve = document.querySelector('[data-modal-id="modal-set-reserv"]');
const setReservForm = document.querySelector('.reserv_form');
const modalSetReserveAlert = document.querySelector('[data-modal-id="modal-set-reserv__ok"]');

function openSetReserv(num) {
    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }
    
    if (modalSetReserve) {
        const countInput = modalSetReserve.querySelector('[name="count-product"]');
        if (countInput) {
            countInput.value = num;
        }
        modalSetReserve.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
    }
}

function closeSetReserv() {
    if (modalSetReserve) {
        modalSetReserve.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
}

function openSetReservMsg() {
    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }
    
    if (modalSetReserveAlert) {
        modalSetReserveAlert.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
    }
}

function closeSetReservMsg() {
    if (modalSetReserveAlert) {
        modalSetReserveAlert.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
}

// Инициализация
if (modalSetReserve) {
    const closeBtn = modalSetReserve.querySelector('.modal_close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSetReserv);
    }

    document.addEventListener('click', (e) => {
        if (modalSetReserve.classList.contains('is-open') && !e.target.closest('.modal_content') && !e.target.closest('[data-btn="set-reserv"]')) {
            closeSetReserv();
        }
    });
}

if (setReservForm) {
    setReservForm.addEventListener('submit', (e) => {
        e.preventDefault();
        closeSetReserv();
        openSetReservMsg();
    });
}

if (modalSetReserveAlert) {
    const closeBtn = modalSetReserveAlert.querySelector('.modal_close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSetReservMsg);
    }

    document.addEventListener('click', (e) => {
        if (modalSetReserveAlert.classList.contains('is-open') && !e.target.closest('.modal_content')) {
            closeSetReservMsg();
        }
    });
}

// Экспорт функций
if (typeof window !== 'undefined') {
    window.openSetReserv = openSetReserv;
    window.closeSetReserv = closeSetReserv;
    window.closeSetReservMsg = closeSetReservMsg;
    window.openSetReservMsg = openSetReservMsg;
}

