// Модалка загрузки фото
const modalLoadPhoto = document.querySelector('[data-modal-id="modal-load-photo"]');
const btnsLoadPhoto = document.querySelectorAll('[data-btn="load-photo"]');
const closeBtnModalLoadPhoto = modalLoadPhoto ? modalLoadPhoto.querySelector('.modal_close') : null;
const prevLoadImg = modalLoadPhoto ? modalLoadPhoto.querySelector('.prev_load-img') : null;
const loadPhotoLinks = modalLoadPhoto ? modalLoadPhoto.querySelectorAll('.load-photo__links a') : null;

// Функция открытия модалки загрузки фото
function openModalLoadPhoto(photoUrl) {
    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }

    if (modalLoadPhoto && photoUrl) {
        // Обновляем превью изображения
        if (prevLoadImg) {
            prevLoadImg.src = photoUrl;
        }

        // Обновляем ссылки для скачивания
        if (loadPhotoLinks && loadPhotoLinks.length > 0) {
            loadPhotoLinks.forEach(link => {
                link.href = photoUrl;
            });
        }

        // Открываем модальное окно
        modalLoadPhoto.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
    }
}

// Функция закрытия модалки загрузки фото
function closeModalLoadPhoto() {
    if (modalLoadPhoto) {
        modalLoadPhoto.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
}

// Обработчики для кнопок загрузки фото
if (btnsLoadPhoto.length > 0) {
    btnsLoadPhoto.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const photoUrl = btn.getAttribute('data-url-photo');
            if (photoUrl) {
                openModalLoadPhoto(photoUrl);
            }
        });
    });
}

// Обработчик закрытия модалки
if (closeBtnModalLoadPhoto) {
    closeBtnModalLoadPhoto.addEventListener('click', closeModalLoadPhoto);
}

// Закрытие модалки при клике вне её
document.addEventListener('click', (e) => {
    if (modalLoadPhoto && modalLoadPhoto.classList.contains('is-open') && 
        !e.target.closest('.modal_content') && 
        !e.target.closest('[data-btn="load-photo"]')) {
        closeModalLoadPhoto();
    }
});

// Экспорт функций для использования в других модулях
if (typeof window !== 'undefined') {
    window.openModalLoadPhoto = openModalLoadPhoto;
    window.closeModalLoadPhoto = closeModalLoadPhoto;
}

