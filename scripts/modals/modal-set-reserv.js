// Модалка установки бронирования
const modalSetReserve = document.querySelector('[data-modal-id="modal-set-reserv"]');
const setReservForm = document.querySelector('.reserv_form');

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
    // Используем универсальную модалку для сообщений
    if (typeof openOkMsg === 'function') {
        openOkMsg('Забронировано');
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


// Экспорт функций
if (typeof window !== 'undefined') {
    window.openSetReserv = openSetReserv;
    window.closeSetReserv = closeSetReserv;
    window.openSetReservMsg = openSetReservMsg;
}

