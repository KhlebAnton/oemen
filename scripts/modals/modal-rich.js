// Модалка просмотра rich контента
const modalRich = document.querySelector('[data-modal-id="modal-rich"]');
const btnsRich = document.querySelectorAll('[data-btn="rich"]');
const closeBtnModalRich = modalRich ? modalRich.querySelector('.modal_close') : null;
const richWrapper = modalRich ? modalRich.querySelector('.rich__wrapper') : null;

// Функция парсинга массива изображений из строки
function parseRichImages(richString) {
    try {
        // Убираем пробелы и парсим строку как JSON массив
        const cleaned = richString.trim();
        // Если строка начинается с [' и заканчивается на '], заменяем одинарные кавычки на двойные
        if (cleaned.startsWith("['") && cleaned.endsWith("']")) {
            const jsonString = cleaned.replace(/'/g, '"');
            return JSON.parse(jsonString);
        }
        // Если уже в формате JSON
        return JSON.parse(cleaned);
    } catch (e) {
        console.error('Ошибка парсинга массива изображений:', e);
        return [];
    }
}

// Функция открытия модалки rich контента
function openModalRich(imagesArray) {
    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }

    if (modalRich && richWrapper && imagesArray && imagesArray.length > 0) {
        // Очищаем контейнер
        richWrapper.innerHTML = '';

        // Добавляем все изображения
        imagesArray.forEach(imageUrl => {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = '';
            richWrapper.appendChild(img);
        });

        // Открываем модальное окно
        modalRich.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
    }
}

// Функция закрытия модалки rich контента
function closeModalRich() {
    if (modalRich) {
        modalRich.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
}

// Обработчики для кнопок rich контента
if (btnsRich.length > 0) {
    btnsRich.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const richData = btn.getAttribute('data-rich');
            if (richData) {
                const imagesArray = parseRichImages(richData);
                if (imagesArray.length > 0) {
                    openModalRich(imagesArray);
                }
            }
        });
    });
}

// Обработчик закрытия модалки
if (closeBtnModalRich) {
    closeBtnModalRich.addEventListener('click', closeModalRich);
}

// Закрытие модалки при клике вне её
document.addEventListener('click', (e) => {
    if (modalRich && modalRich.classList.contains('is-open') && 
        !e.target.closest('.modal_content') && 
        !e.target.closest('[data-btn="rich"]')) {
        closeModalRich();
    }
});

// Экспорт функций для использования в других модулях
if (typeof window !== 'undefined') {
    window.openModalRich = openModalRich;
    window.closeModalRich = closeModalRich;
}

