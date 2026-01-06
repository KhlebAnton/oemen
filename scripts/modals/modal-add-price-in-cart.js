// Модалка добавления позиций из прайса в подборку
const btnsModalAddPriceInCart = document.querySelectorAll('[data-modal-btn="modal-add-price-in-cart"]');
const modalAddPriceInCart = document.querySelector('.modal_overlay[data-modal-id="modal-add-price-in-cart"]');
const modalAddPriceInCartOk = document.querySelector('.modal_overlay[data-modal-id="modal-add-price-in-cart-ok"]');
const closeBtnModalAddPriceInCart = modalAddPriceInCart ? modalAddPriceInCart.querySelector('.modal_close') : null;
const closeBtnModalAddPriceInCartOk = modalAddPriceInCartOk ? modalAddPriceInCartOk.querySelector('.modal_close') : null;

// Кнопки внутри первой модалки
const btnClearAndAdd = modalAddPriceInCart ? modalAddPriceInCart.querySelector('.btn_second') : null;
const btnAddToCurrent = modalAddPriceInCart ? modalAddPriceInCart.querySelector('.btn_primary') : null;

function openModalAddPriceInCart() {
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

function closeModalAddPriceInCart() {
    if (modalAddPriceInCart) {
        modalAddPriceInCart.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
}

function openModalAddPriceInCartOk() {
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
}

// Инициализация
if (btnsModalAddPriceInCart.length > 0) {
    btnsModalAddPriceInCart.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Проверяем, не заблокирована ли кнопка
            if (btn.classList.contains('btn--disabled')) {
                e.preventDefault();
                return;
            }
            openModalAddPriceInCart();
        });
    });
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
        
        // Закрываем первую модалку и открываем вторую
        closeModalAddPriceInCart();
        openModalAddPriceInCartOk();
    });
}

if (btnAddToCurrent) {
    btnAddToCurrent.addEventListener('click', () => {
        // Здесь можно добавить логику добавления позиций в текущую подборку
        console.log('Добавить позиции из прайса в текущую подборку');
        
        // Закрываем первую модалку и открываем вторую
        closeModalAddPriceInCart();
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

