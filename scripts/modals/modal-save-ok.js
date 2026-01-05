// Модалка успешного скачивания
const modalSaveOk = document.querySelector('[data-modal-id="modal-save-ok"]');
const downloadLink = modalSaveOk ? modalSaveOk.querySelector('.link-cart-link') : null;
const closeBtnModalSaveOk = modalSaveOk ? modalSaveOk.querySelector('.modal_close') : null;

function openModalSaveOk(downloadUrl = '#') {
    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }
    
    if (modalSaveOk && downloadLink) {
        // Устанавливаем ссылку для скачивания
        downloadLink.href = downloadUrl;
        downloadLink.download = downloadUrl !== '#' ? downloadUrl.split('/').pop() : '';
        
        // Открываем модалку
        modalSaveOk.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
        
        // Автоматически запускаем скачивание, если URL валидный
        if (downloadUrl && downloadUrl !== '#') {
            // Небольшая задержка для корректного отображения модалки
            setTimeout(() => {
                downloadLink.click();
            }, 100);
        }
    }
}

function closeModalSaveOk() {
    if (modalSaveOk) {
        modalSaveOk.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
}

// Инициализация
if (closeBtnModalSaveOk) {
    closeBtnModalSaveOk.addEventListener('click', closeModalSaveOk);
}

// Закрытие при клике вне модалки
if (modalSaveOk) {
    document.addEventListener('click', (e) => {
        if (modalSaveOk.classList.contains('is-open') && 
            !e.target.closest('.modal_content') &&
            !e.target.closest('.link-cart-link')) {
            closeModalSaveOk();
        }
    });
}

// Экспорт функций для использования в других модулях
if (typeof window !== 'undefined') {
    window.openModalSaveOk = openModalSaveOk;
    window.closeModalSaveOk = closeModalSaveOk;
}

