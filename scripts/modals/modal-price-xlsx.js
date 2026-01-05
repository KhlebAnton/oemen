// Модалка выгрузки в .xlsx
const btnsModalSaveCartXlsx = document.querySelectorAll('[data-modal-btn="price-xlsx"]');
const modalSaveCartXlsx = document.querySelector('.modal_overlay[data-modal-id="modal-save-cart-xlsx"]');
const closeBtnModalSaveCartXlsx = modalSaveCartXlsx ? modalSaveCartXlsx.querySelector('.modal_close') : null;
const saveCartXlsxForm = modalSaveCartXlsx ? modalSaveCartXlsx.querySelector('.reserv_form') : null;

function openModalSaveCartXlsx() {
    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }

    if (modalSaveCartXlsx) {
        modalSaveCartXlsx.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
    }
}

function closeModalSaveCartXlsx() {
    if (modalSaveCartXlsx) {
        modalSaveCartXlsx.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
}

// Инициализация
if (btnsModalSaveCartXlsx.length > 0) {
    btnsModalSaveCartXlsx.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Проверяем, не заблокирована ли кнопка
            if (btn.classList.contains('btn--disabled')) {
                e.preventDefault();
                return;
            }
            openModalSaveCartXlsx();
        });
    });
}

if (closeBtnModalSaveCartXlsx) {
    closeBtnModalSaveCartXlsx.addEventListener('click', closeModalSaveCartXlsx);
}

// Закрытие при клике вне модалки
document.addEventListener('click', (e) => {
    if (modalSaveCartXlsx && modalSaveCartXlsx.classList.contains('is-open') && 
        !e.target.closest('.modal_content') && 
        !e.target.closest('[data-modal-btn="price-xlsx"]') &&
        !e.target.closest('.promo-banner__position-btn') &&
        !e.target.closest('.promo-banner__file_del') &&
        !e.target.closest('.promo-banner__file_btn')) {
        closeModalSaveCartXlsx();
    }
});

// Обработка отправки формы
if (saveCartXlsxForm) {
    saveCartXlsxForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(saveCartXlsxForm);
        const nameCart = formData.get('name-cart');
        const theme = formData.get('name-cart_theme');
        
        // Здесь можно добавить логику выгрузки в .xlsx
        console.log('Выгрузка в .xlsx:', {
            name: nameCart,
            theme: theme
        });
        
        // Закрываем модалку после выгрузки
        closeModalSaveCartXlsx();
        
        // Показываем модалку скачивания (заглушка - будет заменена на реальный URL)
        if (typeof openModalSaveOk === 'function') {
            openModalSaveOk('./images/promo/1.jpg'); // Заглушка, заменить на реальный URL файла
        }
    });
}

// Экспорт функций для использования в других модулях
if (typeof window !== 'undefined') {
    window.openModalSaveCartXlsx = openModalSaveCartXlsx;
    window.closeModalSaveCartXlsx = closeModalSaveCartXlsx;
}

