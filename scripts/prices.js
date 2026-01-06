// Функционал для страницы прайсов: работа с чекбоксами и кнопками скачивания

(function() {
    'use strict';

    // Работа с чекбоксами на странице детального прайса
    function initCheckboxes() {
        const container = document.querySelector('.price_detail_section .cart_section-container');
        if (!container) return;
        
        // Используем делегирование событий для динамически добавляемых элементов
        container.addEventListener('change', (e) => {
            // Обработка чекбоксов товаров
            if (e.target.matches('.cart_category__item .label_choose input[type="checkbox"]')) {
                updateCheckboxState();
            }
        });
        
        // Обработка "Выбрать все"
        const selectAllCheckboxes = container.querySelectorAll('.cart_choose_all input[type="checkbox"]');
        selectAllCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleSelectAll);
        });
        
        // Инициализация счетчика
        updateSelectedCount();
    }

    function updateCheckboxState() {
        updateSelectedCount();
        updateSelectAllState();
    }

    function handleSelectAll(e) {
        const isChecked = e.target.checked;
        const container = e.target.closest('.cart_section-container');
        if (!container) return;
        
        // Синхронизируем все чекбоксы "Выбрать все"
        const allSelectAllCheckboxes = container.querySelectorAll('.cart_choose_all input[type="checkbox"]');
        allSelectAllCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            checkbox.indeterminate = false;
        });
        
        // Находим все чекбоксы товаров в этом контейнере
        const itemCheckboxes = container.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]');
        itemCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        
        updateSelectedCount();
    }

    function updateSelectAllState() {
        const container = document.querySelector('.price_detail_section .cart_section-container');
        if (!container) return;
        
        const selectAllCheckboxes = container.querySelectorAll('.cart_choose_all input[type="checkbox"]');
        const itemCheckboxes = container.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]');
        const checkedCount = container.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]:checked').length;
        const totalCount = itemCheckboxes.length;
        
        // Синхронизируем все чекбоксы "Выбрать все"
        selectAllCheckboxes.forEach(selectAllCheckbox => {
            selectAllCheckbox.checked = totalCount > 0 && checkedCount === totalCount;
            selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < totalCount;
        });
    }

    function updateSelectedCount() {
        const container = document.querySelector('.price_detail_section .cart_section-container');
        if (!container) return;
        
        const checkedCount = container.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]:checked').length;
        const countElements = container.querySelectorAll('.choose-count');
        
        countElements.forEach(element => {
            element.textContent = checkedCount;
        });
        
        // Показываем/скрываем кнопки внизу в зависимости от выбранных товаров
        updateCartButtonsVisibility(checkedCount);
    }

    function updateCartButtonsVisibility(checkedCount) {
        const cartBtns = document.querySelector('.price_detail_section .cart-btns');
        if (!cartBtns) return;
        
        const buttons = cartBtns.querySelectorAll('.btn');
        
        if (checkedCount > 0) {
            // Убираем disabled класс - кнопки становятся активными
            buttons.forEach(btn => {
                btn.classList.remove('btn--disabled');
            });
        } else {
            // Добавляем disabled класс - кнопки становятся неактивными
            buttons.forEach(btn => {
                btn.classList.add('btn--disabled');
            });
        }
    }

    // Обработка кнопок добавления в подборку на странице прайсов (prices.html)
    function initPricesButtons() {
        // Находим все кнопки с классом btn_prices_set_cart и атрибутом data-btn-cart-all
        const cartButtons = document.querySelectorAll('.btn_prices_set_cart[data-btn-cart-all]');
        
        // Добавляем обработчик клика для каждой кнопки
        cartButtons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Переключаем класс is-active
                this.classList.toggle('is-active');
            });
        });
    }

    // Инициализация при загрузке страницы
    function init() {
        // Инициализация для страницы детального прайса
        if (document.querySelector('.price_detail_section')) {
            initCheckboxes();
        }
        
        // Инициализация для страницы списка прайсов
        initPricesButtons();
    }

    // Запуск при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
