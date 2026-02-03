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
    
    // Закрываем состояние поиска в хедере
    const headerMiddleEl = document.querySelector('.header__middle');
    if (headerMiddleEl && headerMiddleEl.classList.contains('header__middle--search')) {
        headerMiddleEl.classList.remove('header__middle--search');
    }
    
    // Сбрасываем счетчик открытых модалок и разблокируем скролл
    openedModals = 0;
    setScrolled(true);
    
    // Обновляем класс хедера
    if (typeof updateHeaderMenuOpenClass === 'function') {
        updateHeaderMenuOpenClass();
    }
}

// Экспорт функций для использования в других модулях
if (typeof window !== 'undefined') {
    window.lockScroll = lockScroll;
    window.unlockScroll = unlockScroll;
    window.closeAllModals = closeAllModals;
}

// Функция для обновления класса --menu-open на хедере
function updateHeaderMenuOpenClass(header, menuModal, searchModal, headerMiddle) {
    if (!header) return;
    
    const isMenuOpen = menuModal && menuModal.classList.contains('is-open');
    const isSearchOpen = (searchModal && searchModal.classList.contains('is-open')) || 
                         (headerMiddle && headerMiddle.classList.contains('header__middle--search'));
    
    if (isMenuOpen || isSearchOpen) {
        header.classList.add('--menu-open');
    } else {
        header.classList.remove('--menu-open');
    }
}

function openSearchModal(searchModal, lockScroll, updateHeaderMenuOpenClass) {
    if (searchModal) {
        searchModal.classList.add('is-open');
        lockScroll();
        updateHeaderMenuOpenClass();
    }
}

function closeSearchModal(searchModal, searchInput, unlockScroll, updateHeaderMenuOpenClass) {
    if (searchModal) {
        searchModal.classList.remove('is-open');
    }
    unlockScroll();
    if (searchInput) {
        searchInput.value = '';
    }
    updateHeaderMenuOpenClass();
}

function openMenuModal(menuModal, btnMenuModal, lockScroll, updateHeaderMenuOpenClass) {
    if (menuModal && btnMenuModal) {
        menuModal.classList.add('is-open');
        btnMenuModal.classList.add('btn-close');
        lockScroll();
        updateHeaderMenuOpenClass();
    }
}

function closeMenuModal(menuModal, btnMenuModal, unlockScroll, updateHeaderMenuOpenClass) {
    if (menuModal && btnMenuModal) {
        menuModal.classList.remove('is-open');
        btnMenuModal.classList.remove('btn-close');
    }
    unlockScroll();
    updateHeaderMenuOpenClass();
}

// Экспорт функций меню
if (typeof window !== 'undefined') {
    window.closeMenuModal = function() {
        const menuModal = document.querySelector('.menu_modal');
        const btnMenuModal = document.querySelector('.btn-burger');
        const header = document.querySelector('.header');
        const searchModal = document.querySelector('.search_modal');
        const headerMiddle = document.querySelector('.header__middle');
        
        if (menuModal && btnMenuModal) {
            const updateFn = () => updateHeaderMenuOpenClass(header, menuModal, searchModal, headerMiddle);
            closeMenuModal(menuModal, btnMenuModal, unlockScroll, updateFn);
        }
    };
}

function initPageStyle(pageBtns, sectionFilter) {
    // Проверяем наличие section-filter перед установкой стиля из куки
    if (!sectionFilter) return;
    
    const currentPageStyle = document.body.getAttribute('data-page-style');
    let pageStyle = null;
    
    if (typeof getCookie === 'function') {
        const savedStyle = getCookie('page-style') || '';
        if (savedStyle) {
            // Проверяем, есть ли кнопка с таким значением на странице
            const hasButtonForStyle = Array.from(pageBtns).some(btn => 
                btn.getAttribute('data-page') === savedStyle
            );
            
            // Если кнопка есть, устанавливаем стиль из куки
            if (hasButtonForStyle) {
                pageStyle = savedStyle;
            }
        }
    }
    
    // Если нет куки и нет атрибута data-page-style, устанавливаем big-page по умолчанию
    if (!pageStyle && !currentPageStyle) {
        pageStyle = 'big-page';
    } else if (!pageStyle && currentPageStyle) {
        // Если есть атрибут, но нет куки, используем текущий атрибут
        pageStyle = currentPageStyle;
    }
    
    // Если стиль определён, применяем его
    if (pageStyle) {
        // Если ширина <= 1100px и выбран small-page, переключаем на big-page
        if (window.innerWidth <= 1100 && pageStyle === 'small-page') {
            pageStyle = 'big-page';
        }
        
        document.body.setAttribute('data-page-style', pageStyle);
        pageBtns.forEach(btn => {
            if (btn.getAttribute('data-page') === pageStyle) {
                pageBtns.forEach(btn => btn.classList.remove('is-active'));
                btn.classList.add('is-active');
            }
        });
    }
}

// Автоматическое переключение small-page на big-page при ширине <= 1100px
function checkPageStyleForMobile(pageBtns) {
    const currentPageStyle = document.body.getAttribute('data-page-style');
    
    // Если ширина экрана <= 1100px и текущий стиль small-page, переключаем на big-page
    if (window.innerWidth <= 1100 && currentPageStyle === 'small-page') {
        document.body.setAttribute('data-page-style', 'big-page');
        
        // Обновляем активную кнопку, если кнопки есть на странице
        if (pageBtns.length > 0) {
            pageBtns.forEach(btn => btn.classList.remove('is-active'));
            const bigPageBtn = Array.from(pageBtns).find(btn => 
                btn.getAttribute('data-page') === 'big-page'
            );
            if (bigPageBtn) {
                bigPageBtn.classList.add('is-active');
            }
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    // Поиск элементов
    const searchContainer = document.querySelector('.btn-search-container');
    const headerMiddle = document.querySelector('.header__middle');
    const searchInput = document.getElementById('search-input');
    const searchModal = document.querySelector('.search_modal');
    const searchBtnClose = document.querySelector('.search-btn-close');
    const header = document.querySelector('.header');

    // Меню
    const menuModal = document.querySelector('.menu_modal');
    const btnMenuModal = document.querySelector('.btn-burger');

    // Создаем обёртки для функций с текущими элементами
    const updateHeaderMenuOpenClassWrapper = () => updateHeaderMenuOpenClass(header, menuModal, searchModal, headerMiddle);
    const openSearchModalWrapper = () => openSearchModal(searchModal, lockScroll, updateHeaderMenuOpenClassWrapper);
    const closeSearchModalWrapper = () => closeSearchModal(searchModal, searchInput, unlockScroll, updateHeaderMenuOpenClassWrapper);
    const openMenuModalWrapper = () => openMenuModal(menuModal, btnMenuModal, lockScroll, updateHeaderMenuOpenClassWrapper);
    const closeMenuModalWrapper = () => closeMenuModal(menuModal, btnMenuModal, unlockScroll, updateHeaderMenuOpenClassWrapper);

    // Поиск
    if (searchBtnClose && headerMiddle) {
        searchBtnClose.addEventListener('click', () => {
            closeSearchModalWrapper();
            headerMiddle.classList.remove('header__middle--search');
            updateHeaderMenuOpenClassWrapper();
        });
    }

    if (searchContainer && headerMiddle && searchInput) {
        searchContainer.addEventListener('click', () => {
            if (!headerMiddle.classList.contains('header__middle--search')) {
                headerMiddle.classList.add('header__middle--search');
                searchInput.focus();
                updateHeaderMenuOpenClassWrapper();
            }
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth > 1100 && searchModal && headerMiddle) {
                if (searchModal.classList.contains('is-open') && !e.target.closest('.btn-search-container') && !e.target.closest('.search-input')) {
                    if (!e.target.closest('.search__content')) {
                        headerMiddle.classList.remove('header__middle--search');
                        closeSearchModalWrapper();
                    }
                }
            }
        });

        searchInput.addEventListener('input', (e) => {
            if (searchModal && !searchModal.classList.contains('is-open')) {
                openSearchModalWrapper();
            }
        });

        searchInput.addEventListener('focus', () => {
            if (window.innerWidth <= 1100) {
                openSearchModalWrapper();
            }
        });

        searchInput.addEventListener('blur', () => {
            if (searchModal && headerMiddle && !searchModal.classList.contains('is-open')) {
                headerMiddle.classList.remove('header__middle--search');
                updateHeaderMenuOpenClassWrapper();
            }
        });
    }

    // Меню
    if (btnMenuModal) {
        btnMenuModal.addEventListener('click', () => {
            if (!btnMenuModal.classList.contains('btn-close')) {
                openMenuModalWrapper();
            } else {
                closeMenuModalWrapper();
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (menuModal && menuModal.classList.contains('is-open') && !e.target.closest('.menu__content') && !e.target.closest('.btn-burger')) {
            closeMenuModalWrapper();
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
            let pageStyle = btn.getAttribute('data-page');
            
            // Если ширина <= 1100px и выбран small-page, переключаем на big-page
            if (window.innerWidth <= 1100 && pageStyle === 'small-page') {
                pageStyle = 'big-page';
                // Обновляем активную кнопку на big-page
                pageBtns.forEach(btn => btn.classList.remove('is-active'));
                const bigPageBtn = Array.from(pageBtns).find(btn => 
                    btn.getAttribute('data-page') === 'big-page'
                );
                if (bigPageBtn) {
                    bigPageBtn.classList.add('is-active');
                }
            }
            
            if (pageStyle) {
                document.body.setAttribute('data-page-style', pageStyle);
                if (typeof setCookie === 'function') {
                    setCookie('page-style', pageStyle);
                }
            }
        });
    });

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

    // Инициализация выбора клиента
    if (typeof initClientSelection === 'function') {
        initClientSelection();
    }
    
    // Инициализация стиля страницы
    initPageStyle(pageBtns, sectionFilter);
    
    // Проверка стиля страницы для мобильных устройств
    checkPageStyleForMobile(pageBtns);
    
    // Инициализация слайдера цены
    if (typeof initPriceSlider === 'function') {
        initPriceSlider();
    }
    
    // Обновление атрибута авторизации
    if (typeof updateAuthAttribute === 'function') {
        updateAuthAttribute();
    }
});

// Обработчик изменения размера окна для автоматического переключения стиля
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        const pageBtns = document.querySelectorAll('[data-page]');
        checkPageStyleForMobile(pageBtns);
    }, 100);
});
