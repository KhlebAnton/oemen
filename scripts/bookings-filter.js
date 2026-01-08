// Валидация и фильтрация формы бронирований
const bookingsFilterForm = document.querySelector('.bookings__filter');

if (bookingsFilterForm) {
    const clientInput = bookingsFilterForm.querySelector('input[name="name-cart_theme"]');
    const productInput = bookingsFilterForm.querySelector('input[name="product"]');
    const applyBtn = bookingsFilterForm.querySelector('.btn_primary');
    const resetBtn = bookingsFilterForm.querySelector('.btn_second');
    const tableContent = document.querySelector('.lk_table__content');
    const tableRows = tableContent ? tableContent.querySelectorAll('.lk_table-row') : [];

    // Функция для удаления класса ошибки
    function removeErrorClass() {
        if (clientInput) {
            clientInput.classList.remove('is-err');
        }
        if (productInput) {
            productInput.classList.remove('is-err');
        }
    }

    // Функция для добавления класса ошибки
    function addErrorClass() {
        if (clientInput) {
            clientInput.classList.add('is-err');
        }
        if (productInput) {
            productInput.classList.add('is-err');
        }
    }

    // Функция валидации
    function validateForm() {
        const clientValue = clientInput ? clientInput.value.trim() : '';
        const productValue = productInput ? productInput.value.trim() : '';

        // Проверяем, заполнено ли хотя бы одно поле
        if (!clientValue && !productValue) {
            addErrorClass();
            return false;
        }

        removeErrorClass();
        return true;
    }

    // Функция фильтрации таблицы
    function filterTable() {
        if (!tableContent || tableRows.length === 0) return;

        const clientValue = clientInput ? clientInput.value.trim().toLowerCase() : '';
        const productValue = productInput ? productInput.value.trim().toLowerCase() : '';

        let visibleCount = 0;

        tableRows.forEach(row => {
            let matchesClient = true;
            let matchesProduct = true;

            // Фильтрация по клиенту
            if (clientValue) {
                const clientColumn = row.querySelector('[data-column="Клиент"]');
                if (clientColumn) {
                    const clientText = clientColumn.textContent.trim().toLowerCase();
                    matchesClient = clientText.includes(clientValue);
                } else {
                    matchesClient = false;
                }
            }

            // Фильтрация по товару (название или артикул)
            if (productValue) {
                const productColumn = row.querySelector('[data-column="Товар"]');
                if (productColumn) {
                    // Получаем название товара
                    const productNameEl = productColumn.querySelector('.lk_table__product-name');
                    const productName = productNameEl ? productNameEl.textContent.trim().toLowerCase() : '';
                    
                    // Получаем артикул из data-article
                    const article = productColumn.getAttribute('data-article') || '';
                    const articleLower = article.toLowerCase();
                    
                    // Проверяем совпадение по названию или артикулу
                    matchesProduct = productName.includes(productValue) || articleLower.includes(productValue);
                } else {
                    matchesProduct = false;
                }
            }

            // Показываем строку только если она соответствует всем критериям фильтрации
            if (matchesClient && matchesProduct) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Показываем сообщение, если нет результатов
        showNoResultsMessage(visibleCount === 0 && (clientValue || productValue));
    }

    // Функция показа/скрытия сообщения об отсутствии результатов
    function showNoResultsMessage(show) {
        let noResultsMsg = document.querySelector('.bookings__no-results');
        
        if (show && !noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'bookings__no-results';
            noResultsMsg.textContent = 'По заданным критериям ничего не найдено';
            noResultsMsg.style.cssText = 'text-align: center; padding: 40px 20px; color: #666; font-size: 16px;';
            
            if (tableContent && tableContent.parentNode) {
                tableContent.parentNode.insertBefore(noResultsMsg, tableContent.nextSibling);
            }
        } else if (!show && noResultsMsg) {
            noResultsMsg.remove();
        }
    }

    // Функция сброса фильтра
    function resetFilter() {
        // Сбрасываем значения полей
        if (clientInput) {
            clientInput.value = '';
            
            // Сбрасываем активный элемент в dropdown клиента
            const dropdown = clientInput.closest('.dropdown_input');
            if (dropdown) {
                const activeItem = dropdown.querySelector('.dropdown_input__list_item.is-active');
                if (activeItem) {
                    activeItem.classList.remove('is-active');
                }
            }
        }
        if (productInput) {
            productInput.value = '';
        }
        
        // Убираем класс ошибки
        removeErrorClass();
        
        // Показываем все строки таблицы
        if (tableRows.length > 0) {
            tableRows.forEach(row => {
                row.style.display = '';
            });
        }
        
        // Скрываем сообщение об отсутствии результатов
        showNoResultsMessage(false);
    }

    // Обработчик отправки формы (кнопка "Применить фильтр")
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (!validateForm()) {
                return;
            }

            // Применяем фильтр к таблице
            filterTable();
        });
    }

    // Обработчик сброса формы (кнопка "Сбросить фильтр")
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetFilter();
        });
    }

    // Убираем класс ошибки при вводе в любое поле
    if (clientInput) {
        clientInput.addEventListener('input', () => {
            const clientValue = clientInput.value.trim();
            const productValue = productInput ? productInput.value.trim() : '';
            
            // Если хотя бы одно поле заполнено, убираем ошибку
            if (clientValue || productValue) {
                removeErrorClass();
            }
        });
    }

    if (productInput) {
        productInput.addEventListener('input', () => {
            const clientValue = clientInput ? clientInput.value.trim() : '';
            const productValue = productInput.value.trim();
            
            // Если хотя бы одно поле заполнено, убираем ошибку
            if (clientValue || productValue) {
                removeErrorClass();
            }
        });
    }

    // Обработка изменения значения в dropdown клиента
    if (clientInput) {
        clientInput.addEventListener('change', () => {
            // Убираем класс ошибки при выборе клиента
            const clientValue = clientInput.value.trim();
            const productValue = productInput ? productInput.value.trim() : '';
            
            if (clientValue || productValue) {
                removeErrorClass();
            }
        });
    }
}

