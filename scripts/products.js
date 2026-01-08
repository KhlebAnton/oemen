// Логика продуктов
const swiperContainers = document.querySelectorAll('.swiper_product-img');

// Инициализация Swiper для продуктов
swiperContainers.forEach((container, index) => {
    const pagination = container.querySelector('.product-card-paginaton');
    const prevBtn = container.querySelector('.product-card__custom_nav-prev');
    const nextBtn = container.querySelector('.product-card__custom_nav-next');

    if (typeof Swiper !== 'undefined') {
        new Swiper(container, {
            slidesPerView: 1,
            spaceBetween: 0,
            loop: true,

            pagination: {
                el: pagination,
                clickable: true,
            },

            navigation: {
                nextEl: nextBtn,
                prevEl: prevBtn,
            },

            speed: 400,
        });
    }
});

// Инициализация Swiper для "Похожие товары" (swiper__our-products)
const ourProductsSwiper = document.querySelector('.swiper__our-products');
if (ourProductsSwiper && typeof Swiper !== 'undefined') {
    const prevBtn = ourProductsSwiper.querySelector('.custom_nav-prev');
    const nextBtn = ourProductsSwiper.querySelector('.custom_nav-next');

    new Swiper(ourProductsSwiper, {
        slidesPerView: 2,
        spaceBetween: 0,
        loop: true,

        navigation: {
            nextEl: nextBtn,
            prevEl: prevBtn,
        },

        breakpoints: {
            768: {
                slidesPerView: 3,
                spaceBetween: 0,
            },
            1100: {
                slidesPerView: 4,
                spaceBetween: 0,
            },
        },

        speed: 400,
    });
}

// Инициализация Swiper для цветов продукта (swiper-product-color)
const productColorSwiper = document.querySelector('.swiper-product-color');
if (productColorSwiper && typeof Swiper !== 'undefined') {
    const prevBtn = document.querySelector('.swiper-product-color__prev');
    const nextBtn = document.querySelector('.swiper-product-color__next');

    new Swiper(productColorSwiper, {
        slidesPerView: 'auto',
        spaceBetween: 10,
        loop: false,

        navigation: {
            nextEl: nextBtn,
            prevEl: prevBtn,
        },

        

        speed: 400,
    });
}

// Инициализация Swiper для product_page__img (работает только до 1100px)
const productPageImgSwiper = document.querySelector('.product_page__img');
let productPageImgSwiperInstance = null;

function initProductPageImgSwiper() {
    if (!productPageImgSwiper || typeof Swiper === 'undefined') return;
    
    const pagination = productPageImgSwiper.querySelector('.product-card-paginaton');
    const windowWidth = window.innerWidth;
    
    // Если ширина больше 1100px, уничтожаем Swiper если он был создан
    if (windowWidth > 1100) {
        if (productPageImgSwiperInstance) {
            productPageImgSwiperInstance.destroy(true, true);
            productPageImgSwiperInstance = null;
        }
        return;
    }
    
    // Если ширина меньше или равна 1100px и Swiper еще не создан, создаем его
    if (!productPageImgSwiperInstance) {
        productPageImgSwiperInstance = new Swiper(productPageImgSwiper, {
            slidesPerView: 1,
            spaceBetween: 0,
            loop: true,

            pagination: {
                el: pagination,
                clickable: true,
            },

            speed: 400,
        });
    }
}

// Инициализация при загрузке
if (productPageImgSwiper) {
    initProductPageImgSwiper();
    
    // Обновление при изменении размера окна
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            initProductPageImgSwiper();
        }, 100);
    });
}

// Управление скроллом для sticky элемента product_page__info
const productPageInfo = document.querySelector('.product_page__info');
if (productPageInfo) {
    // Используем существующую обертку для контента
    const contentWrapper = productPageInfo.querySelector('.product_page__info__content');
    if (contentWrapper) {
    
    let stickyStartScrollY = null;
    let lastScrollY = window.scrollY;
    let currentContentScroll = 0;
    let isUserScrolling = false;
    let scrollTimeout = null;
    let lastContentHeight = 0;
    
    function updateStickyScroll(isManualScroll = false) {
        // Не работаем на экранах меньше 1100px
        if (window.innerWidth < 1100) {
            contentWrapper.style.transform = 'translateY(0)';
            stickyStartScrollY = null;
            currentContentScroll = 0;
            return;
        }
        
        const isStickyNow = productPageInfo.getBoundingClientRect().top <= 0;
        const contentHeight = contentWrapper.scrollHeight;
        const viewportHeight = window.innerHeight;
        const canScroll = contentHeight > viewportHeight;
        
        if (isStickyNow && canScroll) {
            // Элемент прилип и контент больше viewport
            if (stickyStartScrollY === null) {
                stickyStartScrollY = window.scrollY;
                currentContentScroll = 0;
            }
            
            const maxScroll = contentHeight - viewportHeight;
            const scrollDelta = window.scrollY - lastScrollY;
            
            // Если контент увеличился, корректируем позицию скролла
            if (contentHeight > lastContentHeight && lastContentHeight > 0) {
                // Контент увеличился
                const oldMaxScroll = lastContentHeight - viewportHeight;
                const newMaxScroll = maxScroll;
                
                // Если мы были внизу (в пределах 20px от конца), остаемся внизу
                if (currentContentScroll >= oldMaxScroll - 20) {
                    currentContentScroll = newMaxScroll;
                    // Плавно скроллим к новому контенту
                    contentWrapper.classList.remove('scrolling');
                    requestAnimationFrame(() => {
                        contentWrapper.style.transform = `translateY(-${currentContentScroll}px)`;
                    });
                }
            }
            
            // Обновляем скролл контента на основе изменения скролла страницы
            if (scrollDelta !== 0 && isManualScroll) {
                currentContentScroll += scrollDelta;
                // Ограничиваем скролл контента
                currentContentScroll = Math.max(0, Math.min(maxScroll, currentContentScroll));
                // Отключаем transition для ручного скролла
                contentWrapper.classList.add('scrolling');
            }
            
            // Применяем transform к контенту
            contentWrapper.style.transform = `translateY(-${currentContentScroll}px)`;
            
            // Включаем transition обратно после небольшой задержки
            if (isManualScroll) {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    contentWrapper.classList.remove('scrolling');
                }, 150);
            }
        } else {
            // Элемент не прилип или контент не больше viewport
            stickyStartScrollY = null;
            currentContentScroll = 0;
            contentWrapper.style.transform = 'translateY(0)';
        }
        
        lastScrollY = window.scrollY;
        lastContentHeight = contentHeight;
    }
    
    // Обновляем при скролле
    window.addEventListener('scroll', () => {
        // Не работаем на экранах меньше 1100px
        if (window.innerWidth < 1100) return;
        
        isUserScrolling = true;
        updateStickyScroll(true);
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isUserScrolling = false;
        }, 100);
    }, { passive: true });
    
    // Отслеживаем изменение размера контента через ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
        // Не работаем на экранах меньше 1100px
        if (window.innerWidth < 1100) return;
        
        if (!isUserScrolling) {
            // Если пользователь не скроллит, обновляем без анимации
            updateStickyScroll(false);
        } else {
            // Если пользователь скроллит, обновляем с учетом изменения размера
            updateStickyScroll(true);
        }
    });
    
    resizeObserver.observe(contentWrapper);
    
    // Обновляем при изменении размера окна
    window.addEventListener('resize', () => {
        updateStickyScroll(false);
    }, { passive: true });
    
    // Отслеживаем раскрытие/сворачивание таблиц
    const tables = productPageInfo.querySelectorAll('.product-card__table, .product_table_two');
    let previousTableStates = new Map();
    
    tables.forEach(table => {
        // Сохраняем начальное состояние
        previousTableStates.set(table, table.classList.contains('is-open'));
        
        const observer = new MutationObserver((mutations) => {
            // Не работаем на экранах меньше 1100px
            if (window.innerWidth < 1100) return;
            
            // Проверяем, было ли раскрытие
            const wasOpen = previousTableStates.get(table);
            const isOpen = table.classList.contains('is-open');
            const wasOpened = !wasOpen && isOpen;
            previousTableStates.set(table, isOpen);
            
            if (wasOpened || (!isOpen && wasOpen)) {
                // Небольшая задержка для завершения анимации раскрытия/сворачивания
                setTimeout(() => {
                    // Проверяем еще раз на случай изменения размера окна
                    if (window.innerWidth < 1100) return;
                    
                    const isStickyNow = productPageInfo.getBoundingClientRect().top <= 0;
                    const contentHeight = contentWrapper.scrollHeight;
                    const viewportHeight = window.innerHeight;
                    
                    if (isStickyNow && contentHeight > viewportHeight) {
                        const maxScroll = contentHeight - viewportHeight;
                        
                        // Если таблица была раскрыта и мы близко к низу, скроллим к новому контенту
                        if (wasOpened && currentContentScroll >= Math.max(0, maxScroll - 100)) {
                            currentContentScroll = maxScroll;
                            contentWrapper.classList.remove('scrolling');
                            requestAnimationFrame(() => {
                                contentWrapper.style.transform = `translateY(-${currentContentScroll}px)`;
                            });
                        }
                    }
                    
                    if (!isUserScrolling) {
                        updateStickyScroll(false);
                    }
                }, 200);
            }
        });
        
        observer.observe(table, {
            attributes: true,
            attributeFilter: ['class'],
            childList: true,
            subtree: true
        });
    });
    
    // Инициализация
    updateStickyScroll(false);
    }
}

// Переключение активных цветов продукта
const colorProductItems = document.querySelectorAll('.color-product-item');
const colorTitleSpan = document.querySelector('.product_page__colors_title .color');

colorProductItems.forEach(item => {
    item.addEventListener('click', function() {
        // Проверяем, не disabled ли элемент
        if (this.classList.contains('--disabled')) {
            return;
        }

        // Убираем активный класс со всех элементов
        colorProductItems.forEach(el => el.classList.remove('--is-active'));
        
        // Добавляем активный класс на кликнутый элемент
        this.classList.add('--is-active');
        
        // Обновляем текст цвета в заголовке
        const colorValue = this.getAttribute('data-color');
        if (colorTitleSpan && colorValue) {
            colorTitleSpan.textContent = colorValue;
        }
    });
});

// Переключение активных размеров продукта
const sizeProductItems = document.querySelectorAll('.product_page__size_item');

sizeProductItems.forEach(item => {
    item.addEventListener('click', function() {
        // Проверяем, не disabled ли элемент
        if (this.classList.contains('--disabled')) {
            return;
        }

        // Убираем активный класс со всех элементов
        sizeProductItems.forEach(el => el.classList.remove('--is-active'));
        
        // Добавляем активный класс на кликнутый элемент
        this.classList.add('--is-active');
    });
});

// Кнопки добавления продукта
const btnsAddProduct = document.querySelectorAll('.btn_product-card');

btnsAddProduct.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('is-active')) {
            btn.classList.remove('is-active');
        } else {
            btn.classList.add('is-active');
        }
    });
});

// Кнопки лайков
const btnsLikeProduct = document.querySelectorAll('.product-card__btn-like');

btnsLikeProduct.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('is-active')) {
            btn.classList.remove('is-active');
        } else {
            btn.classList.add('is-active');
        }
    });
});

// Табы продуктов
const tabContainers = document.querySelectorAll('[data-tabs-container]');
tabContainers.forEach(container => {
    const tabs = container.querySelectorAll('.product-card__count-btn');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('is-active'));
            this.classList.add('is-active');
        });
    });
});

// Кнопки добавления в таблице
const btnsTableAdd = document.querySelectorAll('.product-card__table_btn_add');

btnsTableAdd.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('is-active')) {
            btn.classList.remove('is-active');
        } else {
            btn.classList.add('is-active');
        }
    });
});

// Обработка строк таблицы продуктов
const productRows = document.querySelectorAll('.product-card__table__product-row');

productRows.forEach(row => {
    const input = row.querySelector('.product-card__table_input');
    const button = row.querySelector('.btn_reserve');

    if (input && button) {
        input.addEventListener('input', function (e) {
            this.value = this.value.replace(/\D/g, '');
            if (this.value) {
                input.classList.add('is-value');
                input.classList.remove('is-err');
            } else {
                input.classList.remove('is-value');
            }
        });

        input.addEventListener('paste', function (e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            this.value = pastedText.replace(/\D/g, '');
        });

        button.addEventListener('click', function () {
            const value = input.value.trim();

            if (value === '' || parseInt(value) <= 0) {
                input.classList.remove('is-value');
                input.classList.add('is-err');
                input.focus();
                console.log('Ошибка: введите количество больше 0');
            } else {
                input.classList.remove('is-err');
                input.classList.add('is-value');
                if (typeof window.openSetReserv === 'function') {
                    window.openSetReserv(value);
                }
                console.log(`Забронировано: ${value} шт.`);
            }
        });

        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                button.click();
            }
        });
    }
});

// Tooltips
const toolTips = document.querySelectorAll('.tooltip_icon');

toolTips.forEach(el => {
    el.addEventListener('click', () => {
        toolTips.forEach(el => el.classList.remove('is-active'));
        el.classList.add('is-active');
    });
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.tooltip_icon') && !e.target.closest('.tooltip_hidden')) {
        toolTips.forEach(el => el.classList.remove('is-active'));
    }
});

// Таблицы продуктов
const productTableTwoArray = document.querySelectorAll('.product_table_two');

productTableTwoArray.forEach(table => {
    const tableBtn = table.querySelector('.btn_more_table_product');
    if (tableBtn) {
        tableBtn.addEventListener('click', () => {
            if (!table.classList.contains('is-open')) {
                productTableTwoArray.forEach(table => table.classList.remove('is-open'));
                table.classList.add('is-open');
            } else {
                productTableTwoArray.forEach(table => table.classList.remove('is-open'));
                table.classList.remove('is-open');
            }
        });
    }
});

const productTableArray = document.querySelectorAll('.product-card__table');

productTableArray.forEach(table => {
    const tableBtn = table.querySelector('.product-card__table__top');
    if (tableBtn) {
        tableBtn.addEventListener('click', () => {
            if (!table.classList.contains('is-open')) {
                productTableArray.forEach(table => table.classList.remove('is-open'));
                table.classList.add('is-open');
            } else {
                productTableArray.forEach(table => table.classList.remove('is-open'));
                table.classList.remove('is-open');
            }
        });
    }
});

// Функционал копирования артикула
const copySpanButtons = document.querySelectorAll('[data-btn="copy-span"]');

copySpanButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const copySpan = button.querySelector('.copy_span');
        if (!copySpan) return;

        const textToCopy = copySpan.textContent.trim();

        try {
            // Копируем текст в буфер обмена
            await navigator.clipboard.writeText(textToCopy);
            
            // Добавляем класс copy-ok
            button.classList.add('copy-ok');
            
            // Убираем класс через 2 секунды
            setTimeout(() => {
                button.classList.remove('copy-ok');
            }, 2000);
        } catch (err) {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                button.classList.add('copy-ok');
                setTimeout(() => {
                    button.classList.remove('copy-ok');
                }, 2000);
            } catch (err) {
                console.error('Ошибка копирования:', err);
            } finally {
                document.body.removeChild(textArea);
            }
        }
    });
});

// Функционал копирования URL страницы для кнопок share_btn
const shareButtons = document.querySelectorAll('.share_btn');

shareButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const urlToCopy = window.location.href;

        try {
            // Копируем URL в буфер обмена
            await navigator.clipboard.writeText(urlToCopy);
            
            // Добавляем класс copy-ok для визуальной обратной связи
            button.classList.add('copy-ok');
            
            // Убираем класс через 2 секунды
            setTimeout(() => {
                button.classList.remove('copy-ok');
            }, 2000);
        } catch (err) {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = urlToCopy;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                button.classList.add('copy-ok');
                setTimeout(() => {
                    button.classList.remove('copy-ok');
                }, 2000);
            } catch (err) {
                console.error('Ошибка копирования:', err);
            } finally {
                document.body.removeChild(textArea);
            }
        }
    });
});

