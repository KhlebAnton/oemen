// Универсальная модалка для сообщений OK
const modalOkMsg = document.querySelector('[data-modal-id="ok-msg"]');
const msgModal = modalOkMsg ? modalOkMsg.querySelector('.msg-modal') : null;
const closeBtnModalOkMsg = modalOkMsg ? modalOkMsg.querySelector('.modal_close') : null;

function openOkMsg(message) {
    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }
    
    if (modalOkMsg && msgModal) {
        msgModal.textContent = message || 'Готово';
        modalOkMsg.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
    }
}

function closeOkMsg() {
    if (modalOkMsg) {
        modalOkMsg.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
}

// Инициализация
if (closeBtnModalOkMsg) {
    closeBtnModalOkMsg.addEventListener('click', closeOkMsg);
}

// Закрытие при клике вне модалки
if (modalOkMsg) {
    document.addEventListener('click', (e) => {
        if (modalOkMsg.classList.contains('is-open') && 
            !e.target.closest('.modal_content')) {
            closeOkMsg();
        }
    });
}

// Экспорт функций
if (typeof window !== 'undefined') {
    window.openOkMsg = openOkMsg;
    window.closeOkMsg = closeOkMsg;
}

