// Модалки для продления и отмены бронирования

const modalCancelBooking = document.querySelector('[data-modal-id="booking-cancel"]');
const modalExtendBooking = document.querySelector('[data-modal-id="booking-extend"]');
const modalBookingMsg = document.querySelector('[data-modal-id="booking-msg"]');
const bookingMsgTitle = modalBookingMsg ? modalBookingMsg.querySelector('.booking-msg-title') : null;

const extendBtns = document.querySelectorAll('[data-btn="extend-booking"]');
const cancelBtns = document.querySelectorAll('[data-btn="cancel-booking"]');

// Текущая строка таблицы, с которой работаем
let currentBookingRow = null;

// Функция получения данных из строки таблицы
function getBookingDataFromRow(row) {
    if (!row) return null;

    const clientColumn = row.querySelector('[data-column="Клиент"]');
    const orderColumn = row.querySelector('[data-column="Заказ"]');
    const countColumn = row.querySelector('[data-column="Кол-во позиций"]');
    const priceColumn = row.querySelector('[data-column="Сумма"]');

    const client = clientColumn ? clientColumn.textContent.trim() : '';
    
    // Теперь заказ - это просто текст в колонке
    const order = orderColumn ? orderColumn.textContent.trim() : '';
    
    const count = countColumn ? countColumn.textContent.trim() : '';
    const price = priceColumn ? priceColumn.textContent.trim() : '';

    return {
        client,
        product: order, // Используем order как product для совместимости
        color: '', // Убрано из новой структуры
        size: '', // Убрано из новой структуры
        count,
        price
    };
}

// Функция заполнения модалки данными
function fillBookingModal(modal, data) {
    if (!modal || !data) return;

    const clientEl = modal.querySelector('.booking-info-client');
    const productEl = modal.querySelector('.booking-info-product');
    const colorEl = modal.querySelector('.booking-info-color');
    const sizeEl = modal.querySelector('.booking-info-size');
    const countEl = modal.querySelector('.booking-info-count');
    const priceEl = modal.querySelector('.booking-info-price');

    if (clientEl) clientEl.textContent = data.client;
    if (productEl) productEl.textContent = data.product;
    // Цвет и размер больше не используются в новой структуре
    // if (colorEl) colorEl.textContent = data.color;
    // if (sizeEl) sizeEl.textContent = data.size;
    if (countEl) countEl.textContent = data.count;
    if (priceEl) priceEl.textContent = data.price;
}

// Функция открытия модалки отмены бронирования
function openCancelBookingModal(row) {
    if (!modalCancelBooking) return;

    currentBookingRow = row;
    const data = getBookingDataFromRow(row);
    
    if (data) {
        fillBookingModal(modalCancelBooking, data);
    }

    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }

    modalCancelBooking.classList.add('is-open');
    if (typeof lockScroll === 'function') {
        lockScroll();
    }
}

// Функция закрытия модалки отмены бронирования
function closeCancelBookingModal() {
    if (modalCancelBooking) {
        modalCancelBooking.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
    currentBookingRow = null;
}

// Функция открытия модалки продления бронирования
function openExtendBookingModal(row) {
    if (!modalExtendBooking) return;

    currentBookingRow = row;
    const data = getBookingDataFromRow(row);
    
    if (data) {
        fillBookingModal(modalExtendBooking, data);
    }

    // Очищаем поле ввода дней
    const daysInput = modalExtendBooking.querySelector('.booking-days-input');
    if (daysInput) {
        daysInput.value = '';
    }

    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }

    modalExtendBooking.classList.add('is-open');
    if (typeof lockScroll === 'function') {
        lockScroll();
    }
}

// Функция закрытия модалки продления бронирования
function closeExtendBookingModal() {
    if (modalExtendBooking) {
        modalExtendBooking.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
    currentBookingRow = null;
}

// Функция открытия модалки сообщения
function openBookingMsgModal(message) {
    if (!modalBookingMsg) return;

    if (bookingMsgTitle) {
        bookingMsgTitle.textContent = message || 'Готово';
    }

    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }

    modalBookingMsg.classList.add('is-open');
    if (typeof lockScroll === 'function') {
        lockScroll();
    }
}

// Функция закрытия модалки сообщения
function closeBookingMsgModal() {
    if (modalBookingMsg) {
        modalBookingMsg.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
}

// Обработка кнопок отмены бронирования
cancelBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const row = btn.closest('.lk_table-row');
        if (row) {
            openCancelBookingModal(row);
        }
    });
});

// Обработка кнопок продления бронирования
extendBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const row = btn.closest('.lk_table-row');
        if (row) {
            openExtendBookingModal(row);
        }
    });
});

// Обработка кнопки подтверждения отмены бронирования
if (modalCancelBooking) {
    const cancelActionBtn = modalCancelBooking.querySelector('[data-action="cancel-booking"]');
    const closeBtn = modalCancelBooking.querySelector('.modal_close');

    if (cancelActionBtn) {
        cancelActionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeCancelBookingModal();
            openBookingMsgModal('Бронь отменена');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeCancelBookingModal);
    }

    // Закрытие при клике вне модалки
    document.addEventListener('click', (e) => {
        if (modalCancelBooking.classList.contains('is-open') && 
            !e.target.closest('.modal_content') && 
            !e.target.closest('[data-btn="cancel-booking"]')) {
            closeCancelBookingModal();
        }
    });
}

// Обработка кнопки подтверждения продления бронирования
if (modalExtendBooking) {
    const extendActionBtn = modalExtendBooking.querySelector('[data-action="extend-booking"]');
    const closeBtn = modalExtendBooking.querySelector('.modal_close');
    const daysInput = modalExtendBooking.querySelector('.booking-days-input');

    if (extendActionBtn) {
        extendActionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Проверяем заполненность поля дней
            if (daysInput && !daysInput.value.trim()) {
                daysInput.focus();
                return;
            }

            closeExtendBookingModal();
            openBookingMsgModal('Бронь продлена');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeExtendBookingModal);
    }

    // Закрытие при клике вне модалки
    document.addEventListener('click', (e) => {
        if (modalExtendBooking.classList.contains('is-open') && 
            !e.target.closest('.modal_content') && 
            !e.target.closest('[data-btn="extend-booking"]')) {
            closeExtendBookingModal();
        }
    });
}

// Обработка модалки сообщения
if (modalBookingMsg) {
    const closeBtn = modalBookingMsg.querySelector('.modal_close');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeBookingMsgModal);
    }

    // Закрытие при клике вне модалки
    document.addEventListener('click', (e) => {
        if (modalBookingMsg.classList.contains('is-open') && 
            !e.target.closest('.modal_content')) {
            closeBookingMsgModal();
        }
    });
}

// Экспорт функций
if (typeof window !== 'undefined') {
    window.openCancelBookingModal = openCancelBookingModal;
    window.closeCancelBookingModal = closeCancelBookingModal;
    window.openExtendBookingModal = openExtendBookingModal;
    window.closeExtendBookingModal = closeExtendBookingModal;
    window.openBookingMsgModal = openBookingMsgModal;
    window.closeBookingMsgModal = closeBookingMsgModal;
}








