// Модалка добавления позиций из прайса в подборку
const btnsModalAddPriceInCart = document.querySelectorAll('[data-modal-btn="modal-add-price-in-cart"]');
const modalAddPriceInCart = document.querySelector('.modal_overlay[data-modal-id="modal-add-price-in-cart"]');
const modalAddPriceInCartOk = document.querySelector('.modal_overlay[data-modal-id="modal-add-price-in-cart-ok"]');
const closeBtnModalAddPriceInCart = modalAddPriceInCart ? modalAddPriceInCart.querySelector('.modal_close') : null;
const closeBtnModalAddPriceInCartOk = modalAddPriceInCartOk ? modalAddPriceInCartOk.querySelector('.modal_close') : null;

// Кнопки внутри первой модалки
const btnClearAndAdd = modalAddPriceInCart ? modalAddPriceInCart.querySelector('.btn_second') : null;
const btnAddToCurrent = modalAddPriceInCart ? modalAddPriceInCart.querySelector('.btn_primary') : null;

// Переменная для хранения ссылки на кнопку, которая открыла модалку
let currentButton = null;

function openModalAddPriceInCart(button) {
    // Сохраняем ссылку на кнопку
    currentButton = button;
    
    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }

    if (modalAddPriceInCart) {
        modalAddPriceInCart.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
    }
}

function closeModalAddPriceInCart(keepButton) {
    if (modalAddPriceInCart) {
        modalAddPriceInCart.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
    // Очищаем ссылку на кнопку только если не передали флаг keepButton
    if (!keepButton) {
        currentButton = null;
    }
}

function openModalAddPriceInCartOk() {
    // Добавляем класс is-active на кнопку, которая открыла модалку, если это кнопка btn_prices_set_cart
    if (currentButton && currentButton.classList.contains('btn_prices_set_cart')) {
        currentButton.classList.add('is-active');
    }
    
    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }

    if (modalAddPriceInCartOk) {
        modalAddPriceInCartOk.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
    }
}

function closeModalAddPriceInCartOk() {
    if (modalAddPriceInCartOk) {
        modalAddPriceInCartOk.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
    // Очищаем ссылку на кнопку после закрытия модалки подтверждения
    currentButton = null;
}

// Функция инициализации обработчиков
function initModalAddPriceInCartButtons() {
    const buttons = document.querySelectorAll('[data-modal-btn="modal-add-price-in-cart"]');
    buttons.forEach(btn => {
        // Проверяем, не добавлен ли уже обработчик
        if (!btn.hasAttribute('data-modal-add-price-in-cart-handler')) {
            btn.setAttribute('data-modal-add-price-in-cart-handler', 'true');
            btn.addEventListener('click', (e) => {
                // Останавливаем всплытие события, чтобы другие обработчики не сработали
                e.stopPropagation();
                
                // Проверяем, не заблокирована ли кнопка
                if (btn.classList.contains('btn--disabled')) {
                    e.preventDefault();
                    return;
                }
                // Если у кнопки есть класс is-active, не открываем модалку
                if (btn.classList.contains('is-active')) {
                    e.preventDefault();
                    return;
                }
                e.preventDefault();
                openModalAddPriceInCart(btn);
            });
        }
    });
}

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Небольшая задержка для гарантии, что все элементы загружены
        setTimeout(initModalAddPriceInCartButtons, 50);
    });
} else {
    // DOM уже готов - инициализируем сразу с небольшой задержкой
    setTimeout(initModalAddPriceInCartButtons, 50);
}

// Обработка закрытия первой модалки
if (closeBtnModalAddPriceInCart) {
    closeBtnModalAddPriceInCart.addEventListener('click', closeModalAddPriceInCart);
}

// Обработка закрытия второй модалки
if (closeBtnModalAddPriceInCartOk) {
    closeBtnModalAddPriceInCartOk.addEventListener('click', closeModalAddPriceInCartOk);
}

// Обработка кнопок внутри первой модалки
if (btnClearAndAdd) {
    btnClearAndAdd.addEventListener('click', () => {
        // Здесь можно добавить логику очистки подборки и добавления позиций
        console.log('Очистить текущую подборку и добавить позиции из прайса');
        
        // Закрываем первую модалку (сохраняя ссылку на кнопку) и открываем вторую
        closeModalAddPriceInCart(true);
        openModalAddPriceInCartOk();
    });
}

if (btnAddToCurrent) {
    btnAddToCurrent.addEventListener('click', () => {
        // Здесь можно добавить логику добавления позиций в текущую подборку
        console.log('Добавить позиции из прайса в текущую подборку');
        
        // Закрываем первую модалку (сохраняя ссылку на кнопку) и открываем вторую
        closeModalAddPriceInCart(true);
        openModalAddPriceInCartOk();
    });
}

// Закрытие при клике вне модалки
document.addEventListener('click', (e) => {
    if (modalAddPriceInCart && modalAddPriceInCart.classList.contains('is-open') && 
        !e.target.closest('.modal_content') && 
        !e.target.closest('[data-modal-btn="modal-add-price-in-cart"]')) {
        closeModalAddPriceInCart();
    }
    
    if (modalAddPriceInCartOk && modalAddPriceInCartOk.classList.contains('is-open') && 
        !e.target.closest('.modal_content')) {
        closeModalAddPriceInCartOk();
    }
});

// Экспорт функций для использования в других модулях
if (typeof window !== 'undefined') {
    window.openModalAddPriceInCart = openModalAddPriceInCart;
    window.closeModalAddPriceInCart = closeModalAddPriceInCart;
    window.openModalAddPriceInCartOk = openModalAddPriceInCartOk;
    window.closeModalAddPriceInCartOk = closeModalAddPriceInCartOk;
}

