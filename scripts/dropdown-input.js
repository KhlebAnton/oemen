// Универсальный dropdown с поиском и фильтрацией
(function() {
    'use strict';

    function initDropdownInputs() {
        const dropdowns = document.querySelectorAll('.dropdown_input');
        
        dropdowns.forEach(dropdown => {
            const top = dropdown.querySelector('.dropdown_input__top');
            const input = dropdown.querySelector('input');
            const list = dropdown.querySelector('.dropdown_input__list');
            const items = dropdown.querySelectorAll('.dropdown_input__list_item');
            
            if (!top || !input || !list || items.length === 0) return;
            
            let isOpen = false;
            const hasSearch = dropdown.classList.contains('dropdown-search');
            const wasReadonly = input.hasAttribute('readonly') && input.getAttribute('readonly') !== 'false';
            
            // Если нет класса dropdown-search, делаем input readonly
            if (!hasSearch && !wasReadonly) {
                input.setAttribute('readonly', 'true');
            }
            
            // Функция открытия/закрытия списка
            function toggleList() {
                isOpen = !isOpen;
                
                if (isOpen) {
                    dropdown.classList.add('is-open');
                    list.style.display = 'flex';
                    
                    // Убираем readonly при открытии если есть поиск
                    if (hasSearch) {
                        input.removeAttribute('readonly');
                        // Фокусируемся на input для поиска
                        setTimeout(() => input.focus(), 10);
                    } else {
                        // Если нет поиска, убираем фокус с input
                        input.blur();
                    }
                    
                    // Показываем все элементы при открытии
                    filterItems(hasSearch ? input.value : '');
                } else {
                    dropdown.classList.remove('is-open');
                    list.style.display = 'none';
                    
                    // Если значение не выбрано из списка, восстанавливаем из активного элемента
                    if (!isValueInList(input.value)) {
                        const activeItem = dropdown.querySelector('.dropdown_input__list_item.is-active');
                        if (activeItem) {
                            input.value = activeItem.textContent.trim();
                        }
                    }
                    
                    // Возвращаем readonly только если его не было изначально и нет поиска
                    if (!hasSearch && wasReadonly) {
                        input.setAttribute('readonly', 'true');
                    }
                }
            }
            
            // Проверка, есть ли значение в списке
            function isValueInList(value) {
                return Array.from(items).some(item => 
                    item.textContent.trim().toLowerCase() === value.toLowerCase()
                );
            }
            
            // Фильтрация элементов списка
            function filterItems(searchText) {
                const searchLower = searchText.toLowerCase().trim();
                let visibleCount = 0;
                
                items.forEach(item => {
                    const itemText = item.textContent.trim().toLowerCase();
                    if (searchLower === '' || itemText.includes(searchLower)) {
                        item.style.display = '';
                        visibleCount++;
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                // Показываем/скрываем список если нет результатов
                if (visibleCount === 0 && searchText.trim() !== '') {
                    list.classList.add('is-empty');
                } else {
                    list.classList.remove('is-empty');
                }
            }
            
            // Выбор элемента из списка
            function selectItem(item) {
                const value = item.textContent.trim();
                input.value = value;
                
                // Обновляем активный элемент
                items.forEach(i => i.classList.remove('is-active'));
                item.classList.add('is-active');
                
                // Закрываем список
                isOpen = false;
                dropdown.classList.remove('is-open');
                list.style.display = 'none';
                
                // Возвращаем readonly только если его не было изначально и нет поиска
                if (!hasSearch && wasReadonly) {
                    input.setAttribute('readonly', 'true');
                }
                
                // Убираем фокус с input
                input.blur();
                
                // Триггерим событие изменения
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
            // Флаг для предотвращения повторного открытия после выбора
            let isSelecting = false;
            
            // Обработчик клика на верхнюю часть
            top.addEventListener('click', (e) => {
                e.stopPropagation();
                // Не открываем если только что выбрали элемент
                if (!isSelecting) {
                    toggleList();
                }
                isSelecting = false;
            });
            
            // Обработчик клика на input - тоже открывает dropdown
            input.addEventListener('click', (e) => {
                e.stopPropagation();
                // Не открываем если только что выбрали элемент
                if (!isSelecting && !isOpen) {
                    toggleList();
                }
                isSelecting = false;
            });
            
            // Обработчик ввода текста для поиска (только если есть класс dropdown-search и список открыт)
            if (hasSearch) {
                input.addEventListener('input', (e) => {
                    // Фильтруем только если список уже открыт
                    if (isOpen) {
                        filterItems(e.target.value);
                    }
                });
            }
            
            // Обработчик клика на элементы списка
            items.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    isSelecting = true;
                    selectItem(item);
                    // Сбрасываем флаг через небольшую задержку
                    setTimeout(() => {
                        isSelecting = false;
                    }, 100);
                });
            });
            
            // Обработчик фокуса на input (только если есть поиск и список уже открыт)
            if (hasSearch) {
                input.addEventListener('focus', () => {
                    // Фокус работает только если список уже открыт через top
                    if (isOpen) {
                        // Убираем readonly при фокусе для поиска
                        input.removeAttribute('readonly');
                    }
                });
            }
            
            // Закрытие при клике вне dropdown
            document.addEventListener('click', (e) => {
                if (isOpen && !dropdown.contains(e.target)) {
                    isOpen = false;
                    dropdown.classList.remove('is-open');
                    list.style.display = 'none';
                    
                    // Восстанавливаем значение из активного элемента если input пустой
                    if (!input.value || !isValueInList(input.value)) {
                        const activeItem = dropdown.querySelector('.dropdown_input__list_item.is-active');
                        if (activeItem) {
                            input.value = activeItem.textContent.trim();
                        }
                    }
                    
                    // Возвращаем readonly только если его не было изначально и нет поиска
                    if (!hasSearch && wasReadonly) {
                        input.setAttribute('readonly', 'true');
                    }
                }
            });
            
            // Обработчик клавиатуры
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    isOpen = false;
                    dropdown.classList.remove('is-open');
                    list.style.display = 'none';
                } else if (e.key === 'Enter' && isOpen) {
                    e.preventDefault();
                    const visibleItems = Array.from(items).filter(item => 
                        item.style.display !== 'none'
                    );
                    if (visibleItems.length > 0) {
                        selectItem(visibleItems[0]);
                    }
                } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && isOpen) {
                    e.preventDefault();
                    const visibleItems = Array.from(items).filter(item => 
                        item.style.display !== 'none'
                    );
                    if (visibleItems.length > 0) {
                        const currentActive = dropdown.querySelector('.dropdown_input__list_item.is-active');
                        let currentIndex = visibleItems.indexOf(currentActive);
                        
                        if (e.key === 'ArrowDown') {
                            currentIndex = (currentIndex + 1) % visibleItems.length;
                        } else {
                            currentIndex = currentIndex <= 0 ? visibleItems.length - 1 : currentIndex - 1;
                        }
                        
                        items.forEach(i => i.classList.remove('is-active'));
                        visibleItems[currentIndex].classList.add('is-active');
                        visibleItems[currentIndex].scrollIntoView({ block: 'nearest' });
                    }
                }
            });
            
            // Инициализация: скрываем список по умолчанию
            list.style.display = 'none';
        });
    }
    
    // Инициализация при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDropdownInputs);
    } else {
        initDropdownInputs();
    }
    
})();

