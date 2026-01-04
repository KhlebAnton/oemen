// Фильтры, модалка фильтра и слайдер цены

// Модалка фильтра
const filterModal = document.querySelector('[data-modal-id="modal-filter"]');
const filterBtn = document.querySelector('.filter-btn-filter');
const filterItems = document.querySelectorAll('.filter_item');

// Инициализация модалки фильтра
if (filterBtn && filterModal) {
    filterBtn.addEventListener('click', () => {
        // Закрываем все другие модалки
        if (typeof closeAllModals === 'function') {
            closeAllModals();
        }
        
        filterModal.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
    });

    const closeBtn = filterModal.querySelector('.modal_close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            filterModal.classList.remove('is-open');
            if (typeof unlockScroll === 'function') {
                unlockScroll();
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (filterModal.classList.contains('is-open') && !e.target.closest('.modal_filter') && !e.target.closest('.filter-btn-filter')) {
            filterModal.classList.remove('is-open');
            if (typeof unlockScroll === 'function') {
                unlockScroll();
            }
        }
    });
}

// Обработка элементов фильтра
filterItems.forEach(el => {
    const title = el.querySelector('.filter_item__title');
    if (title) {
        title.addEventListener('click', () => {
            if (el.classList.contains('is-open')) {
                filterItems.forEach(el => el.classList.remove('is-open'));
                el.classList.remove('is-open');
            } else {
                filterItems.forEach(el => el.classList.remove('is-open'));
                el.classList.add('is-open');
            }
        });
    }
});

// Кнопки модалки фильтра
const filterModalBtns = filterModal ? filterModal.querySelector('.modal-filter-btns') : null;
const btnApply = filterModalBtns ? filterModalBtns.querySelector('.btn_primary') : null;
const btnReset = filterModalBtns ? filterModalBtns.querySelector('.btn_second') : null;

// Функция сброса фильтров
function resetFilters() {
    // Сброс всех чекбоксов
    const checkboxes = filterModal ? filterModal.querySelectorAll('input[type="checkbox"]') : [];
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // Сброс слайдера цены к начальным значениям
    const priceSlider = filterModal ? filterModal.querySelector('.filter-price') : null;
    if (priceSlider) {
        const sliderMin = priceSlider.querySelector('.slider-min');
        const sliderMax = priceSlider.querySelector('.slider-max');
        const inputMin = priceSlider.querySelector('.price-input-min');
        const inputMax = priceSlider.querySelector('.price-input-max');
        const hiddenMin = priceSlider.querySelector('input[name="price_min"]');
        const hiddenMax = priceSlider.querySelector('input[name="price_max"]');

        const defaultMin = 2500;
        const defaultMax = 23500;

        if (sliderMin) sliderMin.value = defaultMin;
        if (sliderMax) sliderMax.value = defaultMax;
        if (inputMin) inputMin.value = defaultMin + ' ₽';
        if (inputMax) inputMax.value = defaultMax + ' ₽';
        if (hiddenMin) hiddenMin.value = defaultMin;
        if (hiddenMax) hiddenMax.value = defaultMax;

        // Обновляем трек слайдера
        if (sliderMin && sliderMax && priceSlider.querySelector('.slider-track')) {
            const track = priceSlider.querySelector('.slider-track');
            const minValue = parseInt(sliderMin.min) || 0;
            const maxValue = parseInt(sliderMax.max) || 50000;
            const minPercent = ((defaultMin - minValue) / (maxValue - minValue)) * 100;
            const maxPercent = ((defaultMax - minValue) / (maxValue - minValue)) * 100;
            track.style.left = minPercent + '%';
            track.style.width = (maxPercent - minPercent) + '%';
            
            // Обновляем z-index
            sliderMin.style.zIndex = '3';
            sliderMax.style.zIndex = '4';
        }
    }
}

// Функция закрытия модалки фильтра
function closeFilterModal() {
    if (filterModal) {
        filterModal.classList.remove('is-open');
        if (typeof unlockScroll === 'function') {
            unlockScroll();
        }
    }
}

// Обработчик кнопки "Сбросить"
if (btnReset) {
    btnReset.addEventListener('click', (e) => {
        e.preventDefault();
        resetFilters();
    });
}

// Обработчик кнопки "Применить"
if (btnApply) {
    btnApply.addEventListener('click', (e) => {
        e.preventDefault();
        closeFilterModal();
    });
}

// Слайдер цены
function initPriceSlider() {
    const priceSlider = document.querySelector('.filter-price');
    if (!priceSlider) return;

    const sliderMin = priceSlider.querySelector('.slider-min');
    const sliderMax = priceSlider.querySelector('.slider-max');
    const inputMin = priceSlider.querySelector('.price-input-min');
    const inputMax = priceSlider.querySelector('.price-input-max');
    const hiddenMin = priceSlider.querySelector('input[name="price_min"]');
    const hiddenMax = priceSlider.querySelector('input[name="price_max"]');
    const track = priceSlider.querySelector('.slider-track');

    if (!sliderMin || !sliderMax || !inputMin || !inputMax || !track) return;

    const minValue = parseInt(sliderMin.min) || 0;
    const maxValue = parseInt(sliderMax.max) || 50000;
    const minDifference = 1000; // Минимальная разница между ползунками

    function updateTrack() {
        const min = parseInt(sliderMin.value) || minValue;
        const max = parseInt(sliderMax.value) || maxValue;

        const minPercent = ((min - minValue) / (maxValue - minValue)) * 100;
        const maxPercent = ((max - minValue) / (maxValue - minValue)) * 100;

        track.style.left = minPercent + '%';
        track.style.width = (maxPercent - minPercent) + '%';
    }

    function updateInputs() {
        const min = parseInt(sliderMin.value) || minValue;
        const max = parseInt(sliderMax.value) || maxValue;

        inputMin.value = min + ' ₽';
        inputMax.value = max + ' ₽';

        if (hiddenMin) hiddenMin.value = min;
        if (hiddenMax) hiddenMax.value = max;

        updateTrack();
    }

    function parsePrice(value) {
        const parsed = parseInt(value.toString().replace(/\s/g, '').replace(/[^\d]/g, ''));
        return isNaN(parsed) ? minValue : parsed;
    }

    // Функция для управления z-index при пересечении ползунков
    function updateZIndex(activeSlider) {
        const min = parseInt(sliderMin.value);
        const max = parseInt(sliderMax.value);
        const distance = Math.abs(max - min);
        const threshold = (maxValue - minValue) * 0.02; // 2% от диапазона

        // Если ползунки близко друг к другу, меняем z-index
        if (distance < threshold) {
            if (activeSlider === 'min') {
                sliderMin.style.zIndex = '5';
                sliderMax.style.zIndex = '4';
            } else {
                sliderMax.style.zIndex = '5';
                sliderMin.style.zIndex = '3';
            }
        } else {
            // Иначе возвращаем стандартные значения
            sliderMin.style.zIndex = '3';
            sliderMax.style.zIndex = '4';
        }
    }

    // Обработчики для слайдеров
    sliderMin.addEventListener('mousedown', function () {
        updateZIndex('min');
    });

    sliderMin.addEventListener('touchstart', function () {
        updateZIndex('min');
    });

    sliderMin.addEventListener('input', function () {
        let min = parseInt(this.value);
        const max = parseInt(sliderMax.value);

        if (min > max - minDifference) {
            min = max - minDifference;
            this.value = min;
        }

        updateZIndex('min');
        updateInputs();
    });

    sliderMax.addEventListener('mousedown', function () {
        updateZIndex('max');
    });

    sliderMax.addEventListener('touchstart', function () {
        updateZIndex('max');
    });

    sliderMax.addEventListener('input', function () {
        let max = parseInt(this.value);
        const min = parseInt(sliderMin.value);

        if (max < min + minDifference) {
            max = min + minDifference;
            this.value = max;
        }

        updateZIndex('max');
        updateInputs();
    });

    // Обработчики для текстовых полей
    inputMin.addEventListener('focus', function () {
        // При фокусе убираем знак рубля и оставляем только число
        this.value = this.value.replace(/\D/g, '');
    });

    inputMin.addEventListener('input', function () {
        // При вводе убираем все нецифровые символы
        this.value = this.value.replace(/\D/g, '');
    });

    inputMin.addEventListener('blur', function () {
        let value = parsePrice(this.value);
        const max = parseInt(sliderMax.value);
        const minVal = minValue;
        const maxVal = maxValue;

        if (value < minVal) value = minVal;
        if (value > max - minDifference) value = max - minDifference;
        if (value > maxVal) value = maxVal;

        sliderMin.value = value;
        // Добавляем знак рубля при потере фокуса
        this.value = value + ' ₽';
        updateZIndex('min');
        updateInputs();
    });

    inputMax.addEventListener('focus', function () {
        // При фокусе убираем знак рубля и оставляем только число
        this.value = this.value.replace(/\D/g, '');
    });

    inputMax.addEventListener('input', function () {
        // При вводе убираем все нецифровые символы
        this.value = this.value.replace(/\D/g, '');
    });

    inputMax.addEventListener('blur', function () {
        let value = parsePrice(this.value);
        const min = parseInt(sliderMin.value);
        const minVal = minValue;
        const maxVal = maxValue;

        if (value < min + minDifference) value = min + minDifference;
        if (value < minVal) value = minVal;
        if (value > maxVal) value = maxVal;

        sliderMax.value = value;
        // Добавляем знак рубля при потере фокуса
        this.value = value + ' ₽';
        updateZIndex('max');
        updateInputs();
    });

    // Инициализация
    updateInputs();
    updateZIndex('max'); // Устанавливаем начальный z-index
}

// Экспорт функции
if (typeof window !== 'undefined') {
    window.initPriceSlider = initPriceSlider;
}

