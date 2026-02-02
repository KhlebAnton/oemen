// Сортировка таблицы бронирований по колонкам
document.addEventListener('DOMContentLoaded', function() {
    const table = document.querySelector('.lk_table');
    if (!table) return;

    const tableContent = table.querySelector('.lk_table__content');
    const headerRow = table.querySelector('.lk_table-row__top');
    if (!tableContent || !headerRow) return;

    const sortButtons = headerRow.querySelectorAll('.arrow_text_down');
    
    // Объект для хранения состояния сортировки каждой колонки
    const sortStates = {};

    sortButtons.forEach((button, index) => {
        // Определяем название колонки по позиции в заголовке
        const headerColumns = headerRow.querySelectorAll('.lk_table__column');
        const columnIndex = Array.from(headerColumns).indexOf(button.closest('.lk_table__column'));
        
        // Получаем название из первой строки данных по индексу
        let columnName = '';
        const firstRow = tableContent.querySelector('.lk_table-row');
        if (firstRow) {
            const column = firstRow.querySelectorAll('.lk_table__column')[columnIndex];
            if (column) {
                columnName = column.getAttribute('data-column') || '';
            }
        }

        if (!columnName) return;

        // Инициализируем состояние сортировки для этой колонки
        sortStates[columnName] = {
            direction: null, // null, 'asc', 'desc'
            button: button
        };

        // Добавляем обработчик клика на весь элемент (включая псевдоэлемент ::after со стрелкой)
        button.style.cursor = 'pointer';
        // Делаем весь элемент кликабельным, включая псевдоэлемент
        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');
        
        // Обработчик клика
        const handleClick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            sortTable(columnName);
        };
        
        button.addEventListener('click', handleClick);
        
        // Обработчик нажатия Enter для доступности
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                sortTable(columnName);
            }
        });
    });

    // Автоматическая сортировка по колонке "Кол-во позиций оставшихся дней" при загрузке
    const defaultSortColumn = 'Кол-во позиций оставшихся дней';
    if (sortStates[defaultSortColumn]) {
        // Устанавливаем начальное направление сортировки (по убыванию)
        sortStates[defaultSortColumn].direction = 'desc';
        // Применяем сортировку без переключения направления
        applySort(defaultSortColumn, 'desc');
    }

    function sortTable(columnName) {
        const rows = Array.from(tableContent.querySelectorAll('.lk_table-row'));
        if (rows.length === 0) return;

        // Получаем текущее состояние сортировки
        const sortState = sortStates[columnName];
        if (!sortState) return;

        // Сохраняем состояние видимости каждой строки перед сортировкой
        rows.forEach(row => {
            const displayValue = row.style.display;
            row.setAttribute('data-display-before-sort', displayValue || '');
        });

        // Переключаем направление сортировки
        if (sortState.direction === null || sortState.direction === 'desc') {
            sortState.direction = 'asc';
        } else {
            sortState.direction = 'desc';
        }

        // Сбрасываем состояние сортировки для других колонок
        Object.keys(sortStates).forEach(key => {
            if (key !== columnName) {
                sortStates[key].direction = null;
            }
        });

        // Применяем сортировку
        applySort(columnName, sortState.direction);
    }

    function applySort(columnName, direction) {
        const rows = Array.from(tableContent.querySelectorAll('.lk_table-row'));
        if (rows.length === 0) return;

        // Сохраняем состояние видимости каждой строки перед сортировкой
        rows.forEach(row => {
            const displayValue = row.style.display;
            row.setAttribute('data-display-before-sort', displayValue || '');
        });

        // Обновляем состояние сортировки
        const sortState = sortStates[columnName];
        if (sortState) {
            sortState.direction = direction;
        }

        // Сбрасываем состояние сортировки для других колонок
        Object.keys(sortStates).forEach(key => {
            if (key !== columnName) {
                sortStates[key].direction = null;
            }
        });

        // Сортируем строки
        rows.sort((a, b) => {
            const columnA = a.querySelector(`[data-column="${columnName}"]`);
            const columnB = b.querySelector(`[data-column="${columnName}"]`);

            if (!columnA || !columnB) return 0;

            let valueA = columnA.textContent.trim();
            let valueB = columnB.textContent.trim();

            // Специальная обработка для разных типов данных
            let comparison = 0;

            // Для дат (формат DD.MM.YYYY) или кол-во оставшихся дней (может быть дата или число)
            if (columnName === 'Дата завершения брони' || columnName === 'Кол-во оставшихся дней' || columnName === 'Кол-во позиций оставшихся дней') {
                // Проверяем, есть ли исходная дата в data-атрибуте (для таймера)
                const timerElementA = columnA.querySelector('.date_book_timer');
                const timerElementB = columnB.querySelector('.date_book_timer');
                
                let dateStringA = valueA;
                let dateStringB = valueB;
                
                if (timerElementA && timerElementA.hasAttribute('data-original-date')) {
                    dateStringA = timerElementA.getAttribute('data-original-date');
                }
                if (timerElementB && timerElementB.hasAttribute('data-original-date')) {
                    dateStringB = timerElementB.getAttribute('data-original-date');
                }
                
                // Проверяем, является ли значение датой или числом
                if (dateStringA.match(/^\d{2}\.\d{2}\.\d{4}$/) || dateStringB.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
                    // Это дата
                    const dateA = parseDate(dateStringA);
                    const dateB = parseDate(dateStringB);
                    comparison = dateA - dateB;
                } else {
                    // Это число дней
                    const numA = parseNumber(dateStringA);
                    const numB = parseNumber(dateStringB);
                    comparison = numA - numB;
                }
            }
            // Для чисел (Кол-во, Кол-во позиций, Сумма)
            else if (columnName === 'Кол-во' || columnName === 'Кол-во позиций' || columnName === 'Сумма') {
                const numA = parseNumber(valueA);
                const numB = parseNumber(valueB);
                comparison = numA - numB;
            }
            // Для текста (Клиент, Заказ)
            else {
                comparison = valueA.localeCompare(valueB, 'ru', { 
                    numeric: true, 
                    sensitivity: 'base' 
                });
            }

            // Применяем направление сортировки
            return direction === 'asc' ? comparison : -comparison;
        });

        // Перемещаем отсортированные строки в DOM и восстанавливаем видимость
        const fragment = document.createDocumentFragment();
        rows.forEach(row => {
            const savedDisplay = row.getAttribute('data-display-before-sort');
            row.style.display = savedDisplay === 'none' ? 'none' : (savedDisplay || '');
            row.removeAttribute('data-display-before-sort');
            fragment.appendChild(row);
        });
        tableContent.appendChild(fragment);

        // Обновляем визуальное состояние кнопок сортировки
        updateSortButtons();
    }

    function parseDate(dateString) {
        // Парсим дату в формате DD.MM.YYYY
        const parts = dateString.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // месяцы в JS начинаются с 0
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day).getTime();
        }
        return 0;
    }

    function parseNumber(value) {
        // Удаляем все нечисловые символы, кроме точки и запятой
        const cleaned = value.replace(/[^\d,.]/g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
    }

    function updateSortButtons() {
        Object.keys(sortStates).forEach(columnName => {
            const sortState = sortStates[columnName];
            const button = sortState.button;
            
            // Удаляем предыдущие классы сортировки
            button.classList.remove('sort-asc', 'sort-desc');
            
            // Добавляем класс в зависимости от направления
            if (sortState.direction === 'asc') {
                button.classList.add('sort-asc');
            } else if (sortState.direction === 'desc') {
                button.classList.add('sort-desc');
            }
        });
    }
});

