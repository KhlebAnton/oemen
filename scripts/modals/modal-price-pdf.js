// Модалка выгрузки в .pdf
const btnsModalSaveCartPdf = document.querySelectorAll('[data-modal-btn="price-pdf"]');
const modalSaveCartPdf = document.querySelector('.modal_overlay[data-modal-id="modal-save-cart-pdf"]');
const closeBtnModalSaveCartPdf = modalSaveCartPdf ? modalSaveCartPdf.querySelector('.modal_close') : null;
const saveCartPdfForm = modalSaveCartPdf ? modalSaveCartPdf.querySelector('.reserv_form') : null;

function openModalSaveCartPdf() {
    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }

    if (modalSaveCartPdf) {
        modalSaveCartPdf.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
    }
}

function closeModalSaveCartPdf() {
    if (modalSaveCartPdf) {
        modalSaveCartPdf.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
}

// Инициализация
if (btnsModalSaveCartPdf.length > 0) {
    btnsModalSaveCartPdf.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Проверяем, не заблокирована ли кнопка
            if (btn.classList.contains('btn--disabled')) {
                e.preventDefault();
                return;
            }
            openModalSaveCartPdf();
        });
    });
}

if (closeBtnModalSaveCartPdf) {
    closeBtnModalSaveCartPdf.addEventListener('click', closeModalSaveCartPdf);
}

// Закрытие при клике вне модалки
document.addEventListener('click', (e) => {
    if (modalSaveCartPdf && modalSaveCartPdf.classList.contains('is-open') && 
        !e.target.closest('.modal_content') && 
        !e.target.closest('[data-modal-btn="price-pdf"]')) {
        closeModalSaveCartPdf();
    }
});

// Обработка отправки формы
if (saveCartPdfForm) {
    saveCartPdfForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(saveCartPdfForm);
        const nameCart = formData.get('name-cart');
        
        // Здесь можно добавить логику выгрузки в .pdf
        console.log('Выгрузка в .pdf:', {
            name: nameCart
        });
        
        // Закрываем модалку после выгрузки
        closeModalSaveCartPdf();
        
        // Показываем модалку скачивания (заглушка - будет заменена на реальный URL)
        if (typeof openModalSaveOk === 'function') {
            openModalSaveOk('./images/promo/1.jpg'); // Заглушка, заменить на реальный URL файла
        }
    });
}

// Экспорт функций для использования в других модулях
if (typeof window !== 'undefined') {
    window.openModalSaveCartPdf = openModalSaveCartPdf;
    window.closeModalSaveCartPdf = closeModalSaveCartPdf;
}





