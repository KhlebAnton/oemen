// Основной файл - хедер и базовая функциональность

// Управление скроллом
const body = document.body;
const html = document.documentElement;

let scrollbarWidth = window.innerWidth - html.clientWidth;
let openedModals = 0;

function lockScroll() {
    if (openedModals === 0) setScrolled(false);
    openedModals++;
}

function unlockScroll() {
    if (openedModals === 0) return;

    openedModals--;

    if (openedModals === 0) {
        setScrolled(true);
    }
}

function setScrolled(bool) {
    if (bool) {
        body.classList.remove('no-scrolled');
        body.style.paddingRight = '';
    } else {
        if (!body.classList.contains('no-scrolled')) {
            scrollbarWidth = window.innerWidth - html.clientWidth;
        }
        body.style.paddingRight = `${scrollbarWidth}px`;
        body.classList.add('no-scrolled');
    }
}

// Функция закрытия всех модалок
function closeAllModals() {
    // Закрываем все модалки через класс
    const allModals = document.querySelectorAll('.modal_overlay.is-open');
    allModals.forEach(modal => {
        modal.classList.remove('is-open');
    });
    
    // Закрываем меню
    const menuModalEl = document.querySelector('.menu_modal');
    if (menuModalEl && menuModalEl.classList.contains('is-open')) {
        menuModalEl.classList.remove('is-open');
        const btnMenuModalEl = document.querySelector('.btn-burger');
        if (btnMenuModalEl) {
            btnMenuModalEl.classList.remove('btn-close');
        }
    }
    
    // Закрываем поиск
    const searchModalEl = document.querySelector('.search_modal');
    if (searchModalEl && searchModalEl.classList.contains('is-open')) {
        searchModalEl.classList.remove('is-open');
    }
    
    // Сбрасываем счетчик открытых модалок и разблокируем скролл
    openedModals = 0;
    setScrolled(true);
}

// Экспорт функций для использования в других модулях
if (typeof window !== 'undefined') {
    window.lockScroll = lockScroll;
    window.unlockScroll = unlockScroll;
    window.closeAllModals = closeAllModals;
}

// Поиск
const searchContainer = document.querySelector('.btn-search-container');
const headerMiddle = document.querySelector('.header__middle');
const searchInput = document.getElementById('search-input');
const searchModal = document.querySelector('.search_modal');
const searchBtnClose = document.querySelector('.search-btn-close');

if (searchBtnClose && headerMiddle) {
    searchBtnClose.addEventListener('click', () => {
        closeSearchModal();
        headerMiddle.classList.remove('header__middle--search');
    });
}

function openSearchModal() {
    if (searchModal) {
        searchModal.classList.add('is-open');
        lockScroll();
    }
}

function closeSearchModal() {
    if (searchModal) {
        searchModal.classList.remove('is-open');
    }
    unlockScroll();
    if (searchInput) {
        searchInput.value = '';
    }
}

if (searchContainer && headerMiddle && searchInput) {
    searchContainer.addEventListener('click', () => {
        if (!headerMiddle.classList.contains('header__middle--search')) {
            headerMiddle.classList.add('header__middle--search');
            searchInput.focus();
        }
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth > 1100 && searchModal && headerMiddle) {
            if (searchModal.classList.contains('is-open') && !e.target.closest('.btn-search-container') && !e.target.closest('.search-input')) {
                if (!e.target.closest('.search__content')) {
                    headerMiddle.classList.remove('header__middle--search');
                    closeSearchModal();
                }
            }
        }
    });

    searchInput.addEventListener('input', (e) => {
        if (searchModal && !searchModal.classList.contains('is-open')) {
            openSearchModal();
        }
    });

    searchInput.addEventListener('focus', () => {
        if (window.innerWidth <= 1100) {
            openSearchModal();
        }
    });

    searchInput.addEventListener('blur', () => {
        if (searchModal && headerMiddle && !searchModal.classList.contains('is-open')) {
            headerMiddle.classList.remove('header__middle--search');
        }
    });
}

// Меню
const menuModal = document.querySelector('.menu_modal');
const btnMenuModal = document.querySelector('.btn-burger');

function openMenuModal() {
    if (menuModal && btnMenuModal) {
        menuModal.classList.add('is-open');
        btnMenuModal.classList.add('btn-close');
        lockScroll();
    }
}

function closeMenuModal() {
    if (menuModal && btnMenuModal) {
        menuModal.classList.remove('is-open');
        btnMenuModal.classList.remove('btn-close');
    }
    unlockScroll();
}

// Экспорт функций меню
if (typeof window !== 'undefined') {
    window.closeMenuModal = closeMenuModal;
}

if (btnMenuModal) {
    btnMenuModal.addEventListener('click', () => {
        if (!btnMenuModal.classList.contains('btn-close')) {
            openMenuModal();
        } else {
            closeMenuModal();
        }
    });
}

document.addEventListener('click', (e) => {
    if (menuModal && menuModal.classList.contains('is-open') && !e.target.closest('.menu__content') && !e.target.closest('.btn-burger')) {
        closeMenuModal();
    }
});

// Dropdown меню
const dropdownItems = document.querySelectorAll('.mobile_menu_dropdown');

dropdownItems.forEach(dropdown => {
    dropdown.addEventListener('click', () => {
        if (!dropdown.classList.contains('is-open')) {
            dropdownItems.forEach(dropdown => dropdown.classList.remove('is-open'));
            dropdown.classList.add('is-open');
        } else {
            dropdown.classList.remove('is-open');
        }
    });
});

// Сортировка фильтров
const filterSortBtn = document.querySelector('.filter-btn-sort');
const filterSortContent = document.querySelector('.sort_content');

if (filterSortBtn && filterSortContent) {
    filterSortBtn.addEventListener('click', () => {
        filterSortContent.classList.add('is-open');
    });

    document.addEventListener('click', (e) => {
        if (filterSortContent.classList.contains('is-open') && !e.target.closest('.filter-btn-sort')) {
            filterSortContent.classList.remove('is-open');
        }
    });
}

// Стиль страницы
const pageBtns = document.querySelectorAll('[data-page]');
const sectionFilter = document.querySelector('.section-filter');

pageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Проверяем наличие section-filter перед изменением стиля
        if (!sectionFilter) return;
        
        pageBtns.forEach(btn => btn.classList.remove('is-active'));
        btn.classList.add('is-active');
        const pageStyle = btn.getAttribute('data-page');
        if (pageStyle) {
            document.body.setAttribute('data-page-style', pageStyle);
            if (typeof setCookie === 'function') {
                setCookie('page-style', pageStyle);
            }
        }
    });
});

function initPageStyle() {
    // Проверяем наличие section-filter перед установкой стиля из куки
    if (!sectionFilter) return;
    
    if (typeof getCookie === 'function') {
        const savedStyle = getCookie('page-style') || '';
        if (savedStyle) {
            document.body.setAttribute('data-page-style', savedStyle);
        }
        pageBtns.forEach(btn => {
            if (btn.getAttribute('data-page') === savedStyle) {
                pageBtns.forEach(btn => btn.classList.remove('is-active'));
                btn.classList.add('is-active');
            }
        });
    }
}

// Футер
const footerItems = document.querySelectorAll('.footer_nav__column');

footerItems.forEach(el => {
    const title = el.querySelector('.footer_nav__column-title');
    if (title) {
        title.addEventListener('click', () => {
            if (el.classList.contains('is-open')) {
                footerItems.forEach(el => el.classList.remove('is-open'));
                el.classList.remove('is-open');
            } else {
                footerItems.forEach(el => el.classList.remove('is-open'));
                el.classList.add('is-open');
            }
        });
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    // Инициализация выбора клиента
    if (typeof initClientSelection === 'function') {
        initClientSelection();
    }
    
    // Инициализация стиля страницы
    initPageStyle();
    
    // Инициализация слайдера цены
    if (typeof initPriceSlider === 'function') {
        initPriceSlider();
    }
    
    // Обновление атрибута авторизации
    if (typeof updateAuthAttribute === 'function') {
        updateAuthAttribute();
    }
});
