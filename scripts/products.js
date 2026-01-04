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
    const tableBtn = table.querySelector('.product-card__table__plus');
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

