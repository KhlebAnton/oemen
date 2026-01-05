// Модалка сохранения подборки
const btnsModalSaveCart = document.querySelectorAll('[data-modal-btn="save-cart"]');
const modalSaveCart = document.querySelector('.modal_overlay[data-modal-id="modal-save-cart"]');
const closeBtnModalSaveCart = modalSaveCart ? modalSaveCart.querySelector('.modal_close') : null;
const saveCartForm = modalSaveCart ? modalSaveCart.querySelector('.reserv_form') : null;

function openModalSaveCart() {
    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }

    if (modalSaveCart) {
        modalSaveCart.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
        
        // Очищаем форму при открытии
        if (saveCartForm) {
            saveCartForm.reset();
        }
    }
}

function closeModalSaveCart() {
    if (modalSaveCart) {
        modalSaveCart.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
}

// Инициализация
if (btnsModalSaveCart.length > 0) {
    btnsModalSaveCart.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Проверяем, не заблокирована ли кнопка
            if (btn.classList.contains('btn--disabled')) {
                e.preventDefault();
                return;
            }
            openModalSaveCart();
        });
    });
}

if (closeBtnModalSaveCart) {
    closeBtnModalSaveCart.addEventListener('click', closeModalSaveCart);
}

// Закрытие при клике вне модалки
document.addEventListener('click', (e) => {
    if (modalSaveCart && modalSaveCart.classList.contains('is-open') && 
        !e.target.closest('.modal_content') && 
        !e.target.closest('[data-modal-btn="save-cart"]')) {
        closeModalSaveCart();
    }
});

// Обработка отправки формы
if (saveCartForm) {
    saveCartForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(saveCartForm);
        const nameCart = formData.get('name-cart');
        const comment = formData.get('msg');
        
        // Здесь можно добавить логику сохранения подборки
        console.log('Сохранение подборки:', {
            name: nameCart,
            comment: comment
        });
        
        // Закрываем модалку после сохранения
        closeModalSaveCart();
        
        openOkMsg('Сохранено')
    });
}

// Экспорт функций для использования в других модулях
if (typeof window !== 'undefined') {
    window.openModalSaveCart = openModalSaveCart;
    window.closeModalSaveCart = closeModalSaveCart;
}

