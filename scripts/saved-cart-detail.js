// Функционал для saved_cart_detail.html: перетаскивание товаров и работа с чекбоксами
// Логика "Выбрать все" работает только внутри своей категории

(function() {
    'use strict';

    // Инициализация drag and drop для товаров внутри категории
    function initDragAndDrop() {
        const categoryItems = document.querySelectorAll('.cart_category__items');
        
        categoryItems.forEach(itemsContainer => {
            // В saved_cart_detail.html перемещаем .cart_category__item__dropdown элементы
            const dropdowns = itemsContainer.querySelectorAll('.cart_category__item__dropdown');
            
            // Если есть dropdown элементы, работаем с ними
            if (dropdowns.length > 0) {
                dropdowns.forEach(dropdown => {
                    // Находим handle в основном товаре внутри dropdown
                    const mainItem = dropdown.querySelector('.cart_category__item');
                    if (!mainItem) return;
                    
                    const dragHandle = mainItem.querySelector('.btn__moving');
                    if (!dragHandle) return;
                    
                    // Делаем весь dropdown перетаскиваемым через handle
                    dragHandle.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        // Закрываем все раскрытые списки при начале перетаскивания
                        closeAllDropdowns();
                        startDrag(dropdown, itemsContainer, e);
                    });
                    
                    // Для touch устройств
                    dragHandle.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        // Закрываем все раскрытые списки при начале перетаскивания
                        closeAllDropdowns();
                        const touch = e.touches[0];
                        startDrag(dropdown, itemsContainer, {
                            clientY: touch.clientY,
                            clientX: touch.clientX,
                            pageY: touch.pageY,
                            pageX: touch.pageX
                        });
                    });
                    
                });

                // Инициализируем drag-and-drop для вложенных товаров внутри content
                initNestedDragAndDrop(itemsContainer);
            }
        });
    }

    // Инициализация drag-and-drop для вложенных товаров внутри .cart_category__item__content
    function initNestedDragAndDrop(container) {
        const contentContainers = container.querySelectorAll('.cart_category__item__content');
        
        contentContainers.forEach(contentContainer => {
            // Очищаем старые обработчики, чтобы избежать дублирования
            const nestedItems = contentContainer.querySelectorAll('.cart_category__item');
            
            nestedItems.forEach(item => {
                const dragHandle = item.querySelector('.btn__moving');
                if (!dragHandle) return;
                
                // Удаляем старые обработчики, если они есть
                if (item._nestedDragHandlers) {
                    dragHandle.removeEventListener('mousedown', item._nestedDragHandlers.mousedown);
                    dragHandle.removeEventListener('touchstart', item._nestedDragHandlers.touchstart);
                }
                
                // Создаем новые обработчики
                const mousedownHandler = (e) => {
                    e.preventDefault();
                    startNestedDrag(item, contentContainer, e);
                };
                
                const touchstartHandler = (e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    startNestedDrag(item, contentContainer, {
                        clientY: touch.clientY,
                        clientX: touch.clientX,
                        pageY: touch.pageY,
                        pageX: touch.pageX
                    });
                };
                
                // Сохраняем ссылки на обработчики для последующего удаления
                item._nestedDragHandlers = {
                    mousedown: mousedownHandler,
                    touchstart: touchstartHandler
                };
                
                // Делаем вложенный товар перетаскиваемым внутри своего content контейнера
                dragHandle.addEventListener('mousedown', mousedownHandler);
                dragHandle.addEventListener('touchstart', touchstartHandler);
            });
        });
    }

    let draggedNestedElement = null;
    let isNestedDragging = false;

    function startNestedDrag(item, contentContainer, event) {
        // Добавляем класс на body для блокировки всех элементов
        document.body.classList.add('is-dragging');
        
        // Сохраняем исходный контейнер - вложенный элемент можно перемещать только внутри своего content контейнера
        item._originalContainer = contentContainer;
        
        // Сохраняем начальную позицию элемента
        const rect = item.getBoundingClientRect();
        const clientX = event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : 0);
        const clientY = event.clientY || (event.touches && event.touches[0] ? event.touches[0].clientY : 0);
        
        item._startX = clientX;
        item._startY = clientY;
        item._offsetX = clientX - rect.left;
        item._offsetY = clientY - rect.top;
        
        draggedNestedElement = item;
        isNestedDragging = true;
        initNestedDrag(item, contentContainer);
    }

    function initNestedDrag(item, contentContainer) {
        // Сначала удаляем все старые placeholders в этом контейнере
        const oldPlaceholders = contentContainer.querySelectorAll('.cart_category__item--placeholder, .cart_category_item--placeholder');
        oldPlaceholders.forEach(ph => {
            try {
                ph.remove();
            } catch (e) {
                // Игнорируем ошибки
            }
        });
        
        // Сохраняем оригинальные стили
        const rect = item.getBoundingClientRect();
        item._originalLeft = rect.left;
        item._originalTop = rect.top;
        item._originalWidth = rect.width;
        item._originalHeight = rect.height;
        
        // Добавляем класс для визуального эффекта
        item.classList.add('cart_category__item--dragging');
        
        // Устанавливаем фиксированную позицию для следования за курсором
        item.style.position = 'fixed';
        item.style.left = rect.left + 'px';
        item.style.top = rect.top + 'px';
        item.style.width = rect.width + 'px';
        item.style.margin = '0';
        item.style.zIndex = '10000';
        
        // Создаем placeholder для сохранения места
        const placeholder = document.createElement('div');
        placeholder.className = 'cart_category__item cart_category__item--placeholder';
        placeholder.style.width = rect.width + 'px';
        placeholder.style.height = rect.height + 'px';
        placeholder.style.visibility = 'hidden';
        placeholder.style.pointerEvents = 'none';
        item._placeholder = placeholder;
        contentContainer.insertBefore(placeholder, item);
        
        // Обработчики для перемещения
        const moveHandler = (e) => {
            if (!isNestedDragging) return;
            e.preventDefault();
            e.stopPropagation();
            
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            
            // Обновляем позицию элемента для следования за курсором
            item.style.left = (clientX - item._offsetX) + 'px';
            item.style.top = (clientY - item._offsetY) + 'px';
            
            // Определяем новую позицию
            handleNestedDragMove(clientY, contentContainer);
        };
        
        const endHandler = (e) => {
            if (!isNestedDragging) return;
            e.preventDefault();
            e.stopPropagation();
            endNestedDrag();
        };
        
        // Используем passive: false для предотвращения скролла во время drag
        document.addEventListener('mousemove', moveHandler, { passive: false });
        document.addEventListener('mouseup', endHandler);
        document.addEventListener('touchmove', moveHandler, { passive: false });
        document.addEventListener('touchend', endHandler);
        document.addEventListener('touchcancel', endHandler);
        
        // Сохраняем обработчики для последующего удаления
        draggedNestedElement._nestedMoveHandler = moveHandler;
        draggedNestedElement._nestedEndHandler = endHandler;
    }

    function handleNestedDragMove(clientY, contentContainer) {
        if (!draggedNestedElement || !draggedNestedElement._placeholder) return;
        
        // Вложенный элемент можно перемещать только внутри исходного content контейнера
        const originalContainer = draggedNestedElement._originalContainer;
        if (!originalContainer || contentContainer !== originalContainer) {
            return; // Не позволяем перемещать в другой контейнер
        }
        
        // Удаляем все лишние placeholders в контейнере (кроме текущего)
        const allPlaceholders = contentContainer.querySelectorAll('.cart_category__item--placeholder');
        allPlaceholders.forEach(ph => {
            if (ph !== draggedNestedElement._placeholder) {
                try {
                    ph.remove();
                } catch (e) {
                    // Игнорируем ошибки
                }
            }
        });
        
        // Исключаем draggedElement и placeholder из поиска
        const items = Array.from(contentContainer.querySelectorAll('.cart_category__item:not(.cart_category__item--dragging):not(.cart_category__item--placeholder)'));
        
        if (items.length === 0) return;
        
        let targetItem = null;
        let insertBefore = false;
        
        // Находим позицию для элемента по вертикали
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const rect = item.getBoundingClientRect();
            const itemMiddle = rect.top + rect.height / 2;
            
            if (clientY < itemMiddle - 15) {
                targetItem = item;
                insertBefore = true;
                break;
            } else if (clientY > itemMiddle + 15) {
                targetItem = item;
                insertBefore = false;
            }
        }
        
        // Перемещаем placeholder для визуального отображения будущей позиции
        if (targetItem) {
            const placeholder = draggedNestedElement._placeholder;
            const currentPlaceholderNext = placeholder.nextSibling;
            
            if (insertBefore) {
                if (currentPlaceholderNext !== targetItem) {
                    contentContainer.insertBefore(placeholder, targetItem);
                }
            } else {
                const targetNextSibling = targetItem.nextSibling;
                if (currentPlaceholderNext !== targetNextSibling) {
                    if (targetNextSibling) {
                        contentContainer.insertBefore(placeholder, targetNextSibling);
                    } else {
                        contentContainer.appendChild(placeholder);
                    }
                }
            }
        } else {
            // Если не нашли позицию, перемещаем placeholder в конец
            const placeholder = draggedNestedElement._placeholder;
            if (placeholder.nextSibling !== null) {
                contentContainer.appendChild(placeholder);
            }
        }
    }

    function endNestedDrag() {
        if (!draggedNestedElement) return;
        
        // Убираем класс блокировки с body
        document.body.classList.remove('is-dragging');
        
        // Восстанавливаем оригинальные стили
        const item = draggedNestedElement;
        const originalContainer = item._originalContainer || item.closest('.cart_category__item__content');
        
        item.style.position = '';
        item.style.left = '';
        item.style.top = '';
        item.style.width = '';
        item.style.margin = '';
        item.style.zIndex = '';
        
        // Перемещаем элемент на место placeholder ТОЛЬКО если он в исходном контейнере
        const placeholder = item._placeholder;
        if (placeholder) {
            // Проверяем, что placeholder находится в исходном контейнере
            if (placeholder.parentNode === originalContainer) {
                placeholder.parentNode.insertBefore(item, placeholder);
            } else {
                // Если placeholder в другом контейнере, возвращаем элемент в исходный контейнер
                // и удаляем placeholder
                if (!originalContainer.contains(item)) {
                    originalContainer.appendChild(item);
                }
            }
            // Всегда удаляем placeholder
            if (placeholder.parentNode) {
                placeholder.remove();
            }
        }
        
        // Убеждаемся, что элемент находится в правильном контейнере
        if (originalContainer && !originalContainer.contains(item)) {
            originalContainer.appendChild(item);
        }
        
        // Убираем класс для визуального эффекта
        item.classList.remove('cart_category__item--dragging');
        
        // Удаляем обработчики перемещения
        if (item._nestedMoveHandler) {
            document.removeEventListener('mousemove', item._nestedMoveHandler);
            document.removeEventListener('touchmove', item._nestedMoveHandler);
        }
        if (item._nestedEndHandler) {
            document.removeEventListener('mouseup', item._nestedEndHandler);
            document.removeEventListener('touchend', item._nestedEndHandler);
            document.removeEventListener('touchcancel', item._nestedEndHandler);
        }
        
        // Очищаем ссылки на обработчики и данные
        delete item._nestedMoveHandler;
        delete item._nestedEndHandler;
        delete item._placeholder;
        delete item._originalContainer;
        delete item._startX;
        delete item._startY;
        delete item._offsetX;
        delete item._offsetY;
        delete item._originalLeft;
        delete item._originalTop;
        delete item._originalWidth;
        delete item._originalHeight;
        
        draggedNestedElement = null;
        isNestedDragging = false;
        
        // Агрессивная очистка всех placeholders во всех контейнерах
        cleanupAllPlaceholders();
        cleanupAllPlaceholders(); // Двойной вызов для гарантии
        
        // Дополнительная очистка с задержками для гарантии
        requestAnimationFrame(() => {
            cleanupAllPlaceholders();
            cleanupEmptyContentContainers();
        });
        
        setTimeout(() => {
            cleanupAllPlaceholders();
            cleanupEmptyContentContainers();
        }, 0);
        
        setTimeout(() => {
            cleanupAllPlaceholders();
            cleanupEmptyContentContainers();
        }, 10);
        
        setTimeout(() => {
            cleanupAllPlaceholders();
            cleanupEmptyContentContainers();
        }, 50);
    }

    let draggedElement = null;
    let isDragging = false;

    function startDrag(dropdown, container, event) {
        // Добавляем класс на body для блокировки всех элементов
        document.body.classList.add('is-dragging');
        
        // Сохраняем исходный контейнер категории - элемент можно перемещать только внутри него
        dropdown._originalContainer = container;
        
        // Сохраняем начальную позицию элемента
        const rect = dropdown.getBoundingClientRect();
        const clientX = event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : 0);
        const clientY = event.clientY || (event.touches && event.touches[0] ? event.touches[0].clientY : 0);
        
        dropdown._startX = clientX;
        dropdown._startY = clientY;
        dropdown._offsetX = clientX - rect.left;
        dropdown._offsetY = clientY - rect.top;
        
        // Начинаем drag сразу при нажатии на handle
        draggedElement = dropdown;
        isDragging = true;
        initDrag(dropdown, container);
    }

    // Функция закрытия всех раскрытых списков
    function closeAllDropdowns() {
        const allDropdowns = document.querySelectorAll('.cart_category__item__dropdown');
        allDropdowns.forEach(dropdown => {
            dropdown.classList.remove('is-open');
        });
    }

    function initDrag(dropdown, container) {
        // Сначала удаляем все старые placeholders в этом контейнере
        const oldPlaceholders = container.querySelectorAll('.cart_category__item--placeholder, .cart_category__item__dropdown.cart_category__item--placeholder, .cart_category_item--placeholder, .cart_category_item_dropdown.cart_category_item--placeholder');
        oldPlaceholders.forEach(ph => {
            try {
                ph.remove();
            } catch (e) {
                // Игнорируем ошибки
            }
        });
        
        // Сохраняем оригинальные стили
        const rect = dropdown.getBoundingClientRect();
        dropdown._originalLeft = rect.left;
        dropdown._originalTop = rect.top;
        dropdown._originalWidth = rect.width;
        dropdown._originalHeight = rect.height;
        
        // Добавляем класс для визуального эффекта
        dropdown.classList.add('cart_category__item__dropdown--dragging');
        
        // Устанавливаем фиксированную позицию для следования за курсором
        dropdown.style.position = 'fixed';
        dropdown.style.left = rect.left + 'px';
        dropdown.style.top = rect.top + 'px';
        dropdown.style.width = rect.width + 'px';
        dropdown.style.margin = '0';
        dropdown.style.zIndex = '10000';
        
        // Создаем placeholder для сохранения места
        const placeholder = document.createElement('div');
        placeholder.className = 'cart_category__item__dropdown cart_category__item--placeholder';
        placeholder.style.width = rect.width + 'px';
        placeholder.style.height = rect.height + 'px';
        placeholder.style.visibility = 'hidden';
        placeholder.style.pointerEvents = 'none';
        dropdown._placeholder = placeholder;
        container.insertBefore(placeholder, dropdown);
        
        // Обработчики для перемещения
        const moveHandler = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            e.stopPropagation();
            
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            
            // Обновляем позицию элемента для следования за курсором
            dropdown.style.left = (clientX - dropdown._offsetX) + 'px';
            dropdown.style.top = (clientY - dropdown._offsetY) + 'px';
            
            // Определяем новую позицию
            handleDragMove(clientY, container, clientX);
        };
        
        const endHandler = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            e.stopPropagation();
            endDrag(container);
        };
        
        // Используем passive: false для предотвращения скролла во время drag
        document.addEventListener('mousemove', moveHandler, { passive: false });
        document.addEventListener('mouseup', endHandler);
        document.addEventListener('touchmove', moveHandler, { passive: false });
        document.addEventListener('touchend', endHandler);
        document.addEventListener('touchcancel', endHandler);
        
        // Сохраняем обработчики для последующего удаления
        draggedElement._moveHandler = moveHandler;
        draggedElement._endHandler = endHandler;
    }

    function handleDragMove(clientY, container, clientX) {
        if (!draggedElement || !draggedElement._placeholder) return;
        
        // Элемент можно перемещать только внутри исходного контейнера категории
        const originalContainer = draggedElement._originalContainer;
        if (!originalContainer || container !== originalContainer) {
            return; // Не позволяем перемещать в другую категорию
        }
        
        // Удаляем все лишние placeholders в контейнере (кроме текущего)
        const allPlaceholders = container.querySelectorAll('.cart_category__item--placeholder, .cart_category__item__dropdown.cart_category__item--placeholder');
        allPlaceholders.forEach(ph => {
            if (ph !== draggedElement._placeholder) {
                try {
                    ph.remove();
                } catch (e) {
                    // Игнорируем ошибки
                }
            }
        });
        
        // Исключаем draggedElement и placeholder из поиска
        const dropdowns = Array.from(container.querySelectorAll('.cart_category__item__dropdown:not(.cart_category__item__dropdown--dragging):not(.cart_category__item--placeholder)'));
        
        if (dropdowns.length === 0) return;
        
        let targetDropdown = null;
        let insertBefore = false;
        
        // Находим позицию для элемента по вертикали
        for (let i = 0; i < dropdowns.length; i++) {
            const dropdown = dropdowns[i];
            const rect = dropdown.getBoundingClientRect();
            const itemMiddle = rect.top + rect.height / 2;
            
            if (clientY < itemMiddle - 15) {
                targetDropdown = dropdown;
                insertBefore = true;
                break;
            } else if (clientY > itemMiddle + 15) {
                targetDropdown = dropdown;
                insertBefore = false;
            }
        }
        
        // Перемещаем placeholder для визуального отображения будущей позиции
        if (targetDropdown) {
            const placeholder = draggedElement._placeholder;
            const currentPlaceholderNext = placeholder.nextSibling;
            
            if (insertBefore) {
                if (currentPlaceholderNext !== targetDropdown) {
                    container.insertBefore(placeholder, targetDropdown);
                }
            } else {
                const targetNextSibling = targetDropdown.nextSibling;
                if (currentPlaceholderNext !== targetNextSibling) {
                    if (targetNextSibling) {
                        container.insertBefore(placeholder, targetNextSibling);
                    } else {
                        container.appendChild(placeholder);
                    }
                }
            }
        } else {
            // Если не нашли позицию, перемещаем placeholder в конец
            const placeholder = draggedElement._placeholder;
            if (placeholder.nextSibling !== null) {
                container.appendChild(placeholder);
            }
        }
    }

    function endDrag(container) {
        if (!draggedElement) return;
        
        // Убираем класс блокировки с body
        document.body.classList.remove('is-dragging');
        
        // Восстанавливаем оригинальные стили
        const dropdown = draggedElement;
        const originalContainer = dropdown._originalContainer || container;
        
        dropdown.style.position = '';
        dropdown.style.left = '';
        dropdown.style.top = '';
        dropdown.style.width = '';
        dropdown.style.margin = '';
        dropdown.style.zIndex = '';
        
        // Перемещаем элемент на место placeholder ТОЛЬКО если он в исходном контейнере
        const placeholder = dropdown._placeholder;
        if (placeholder) {
            // Проверяем, что placeholder находится в исходном контейнере
            if (placeholder.parentNode === originalContainer) {
                placeholder.parentNode.insertBefore(dropdown, placeholder);
            } else {
                // Если placeholder в другом контейнере, возвращаем элемент в исходный контейнер
                // и удаляем placeholder
                if (!originalContainer.contains(dropdown)) {
                    originalContainer.appendChild(dropdown);
                }
            }
            // Всегда удаляем placeholder
            if (placeholder.parentNode) {
                placeholder.remove();
            }
        }
        
        // Убеждаемся, что элемент находится в правильном контейнере
        if (originalContainer && !originalContainer.contains(dropdown)) {
            originalContainer.appendChild(dropdown);
        }
        
        // Убираем класс для визуального эффекта
        dropdown.classList.remove('cart_category__item__dropdown--dragging');
        
        // Удаляем обработчики перемещения
        if (dropdown._moveHandler) {
            document.removeEventListener('mousemove', dropdown._moveHandler);
            document.removeEventListener('touchmove', dropdown._moveHandler);
        }
        if (dropdown._endHandler) {
            document.removeEventListener('mouseup', dropdown._endHandler);
            document.removeEventListener('touchend', dropdown._endHandler);
            document.removeEventListener('touchcancel', dropdown._endHandler);
        }
        
        // Очищаем ссылки на обработчики и данные
        delete dropdown._moveHandler;
        delete dropdown._endHandler;
        delete dropdown._placeholder;
        delete dropdown._originalContainer;
        delete dropdown._startX;
        delete dropdown._startY;
        delete dropdown._offsetX;
        delete dropdown._offsetY;
        delete dropdown._originalLeft;
        delete dropdown._originalTop;
        delete dropdown._originalWidth;
        delete dropdown._originalHeight;
        
        draggedElement = null;
        isDragging = false;
        
        // Агрессивная очистка всех placeholders во всех контейнерах
        cleanupAllPlaceholders();
        cleanupAllPlaceholders(); // Двойной вызов для гарантии
        
        // Дополнительная очистка с задержками для гарантии
        requestAnimationFrame(() => {
            cleanupAllPlaceholders();
            cleanupEmptyContentContainers();
        });
        
        setTimeout(() => {
            cleanupAllPlaceholders();
            cleanupEmptyContentContainers();
        }, 0);
        
        setTimeout(() => {
            cleanupAllPlaceholders();
            cleanupEmptyContentContainers();
        }, 10);
        
        setTimeout(() => {
            cleanupAllPlaceholders();
            cleanupEmptyContentContainers();
        }, 50);
    }

    // Универсальная функция для удаления всех placeholders
    function cleanupAllPlaceholders() {
        const mainContainer = document.querySelector('.cart_section-container');
        if (!mainContainer) return;
        
        // Список всех возможных селекторов для placeholder элементов
        const placeholderSelectors = [
            '.cart_category__item--placeholder',
            '.cart_category__item__dropdown.cart_category__item--placeholder',
            '.cart_category_item--placeholder', // Вариант с одним подчеркиванием
            '.cart_category_item_dropdown.cart_category_item--placeholder', // Вариант с одним подчеркиванием
            '[class*="placeholder"]' // Любой элемент с placeholder в классе
        ];
        
        // Собираем все возможные placeholder элементы в Set для избежания дубликатов
        const allPlaceholders = new Set();
        
        placeholderSelectors.forEach(selector => {
            try {
                const elements = mainContainer.querySelectorAll(selector);
                elements.forEach(el => allPlaceholders.add(el));
            } catch (e) {
                // Игнорируем ошибки селектора
            }
        });
        
        // Удаляем все найденные placeholder элементы
        allPlaceholders.forEach(placeholder => {
            // Проверяем, что это действительно placeholder
            const hasPlaceholderClass = 
                placeholder.classList.contains('cart_category__item--placeholder') ||
                placeholder.classList.contains('cart_category_item--placeholder');
            
            const isDropdownPlaceholder = 
                (placeholder.classList.contains('cart_category__item__dropdown') && hasPlaceholderClass) ||
                (placeholder.classList.contains('cart_category_item_dropdown') && hasPlaceholderClass);
            
            if (hasPlaceholderClass || isDropdownPlaceholder) {
                try {
                    if (placeholder.parentNode) {
                        placeholder.parentNode.removeChild(placeholder);
                    } else {
                        placeholder.remove();
                    }
                } catch (e) {
                    try {
                        placeholder.remove();
                    } catch (e2) {
                        // Игнорируем ошибки удаления
                    }
                }
            }
        });
        
        // Дополнительная проверка: ищем все элементы с visibility: hidden и pointer-events: none в контейнерах категорий
        // Это может быть placeholder, который не был правильно помечен классом
        const categoryContainers = mainContainer.querySelectorAll('.cart_category__items, .cart_category_items');
        categoryContainers.forEach(container => {
            const allChildren = Array.from(container.children);
            allChildren.forEach(child => {
                const style = window.getComputedStyle(child);
                // Если элемент скрыт и не интерактивен - это скорее всего placeholder
                if (style.visibility === 'hidden' && style.pointerEvents === 'none') {
                    // Проверяем, что это не обычный элемент товара (должен иметь класс placeholder)
                    if (child.classList.contains('cart_category__item--placeholder') ||
                        child.classList.contains('cart_category_item--placeholder') ||
                        (child.classList.contains('cart_category__item__dropdown') && child.classList.contains('cart_category__item--placeholder')) ||
                        (child.classList.contains('cart_category_item_dropdown') && child.classList.contains('cart_category_item--placeholder'))) {
                        try {
                            child.remove();
                        } catch (e) {
                            // Игнорируем ошибки
                        }
                    }
                }
            });
        });
    }
    
    // Функция для удаления пустых контейнеров content и dropdown
    function cleanupEmptyContentContainers() {
        const mainContainer = document.querySelector('.cart_section-container');
        if (!mainContainer) return;
        
        let hasChanges = true;
        let iterations = 0;
        const maxIterations = 10; // Защита от бесконечного цикла
        
        // Повторяем очистку до тех пор, пока есть изменения
        while (hasChanges && iterations < maxIterations) {
            hasChanges = false;
            iterations++;
            
            // ШАГ 1: Удаляем все пустые content контейнеры
            const contentContainers = Array.from(mainContainer.querySelectorAll('.cart_category__item__content'));
            contentContainers.forEach(content => {
                // Проверяем, есть ли внутри реальные элементы (исключая placeholders)
                const items = Array.from(content.querySelectorAll('.cart_category__item')).filter(item => 
                    !item.classList.contains('cart_category__item--placeholder')
                );
                
                // Если контейнер пустой, удаляем его
                if (items.length === 0) {
                    try {
                        content.remove();
                        hasChanges = true;
                    } catch (e) {
                        // Игнорируем ошибки
                    }
                }
            });
            
            // ШАГ 2: Удаляем все пустые dropdown контейнеры
            const allDropdowns = Array.from(mainContainer.querySelectorAll('.cart_category__item__dropdown'));
            allDropdowns.forEach(dropdown => {
                // Проверяем основной товар - это первый .cart_category__item, который является прямым потомком dropdown
                const children = Array.from(dropdown.children);
                let mainItem = null;
                for (let child of children) {
                    if (child.classList.contains('cart_category__item') && 
                        !child.classList.contains('cart_category__item--placeholder') &&
                        !child.classList.contains('cart_category__item__content')) {
                        mainItem = child;
                        break;
                    }
                }
                
                // Проверяем вложенные товары в content
                const content = dropdown.querySelector('.cart_category__item__content');
                const nestedItems = content ? Array.from(content.querySelectorAll('.cart_category__item')).filter(item => 
                    !item.classList.contains('cart_category__item--placeholder')
                ) : [];
                
                // Если нет основного товара И нет вложенных товаров, удаляем dropdown
                if (!mainItem && nestedItems.length === 0) {
                    try {
                        dropdown.remove();
                        hasChanges = true;
                    } catch (e) {
                        // Игнорируем ошибки
                    }
                }
            });
        }
        
        // Финальная проверка: удаляем все оставшиеся пустые элементы
        const finalContentContainers = Array.from(mainContainer.querySelectorAll('.cart_category__item__content'));
        finalContentContainers.forEach(content => {
            const items = Array.from(content.querySelectorAll('.cart_category__item')).filter(item => 
                !item.classList.contains('cart_category__item--placeholder')
            );
            if (items.length === 0) {
                try {
                    content.remove();
                } catch (e) {
                    // Игнорируем ошибки
                }
            }
        });
        
        const finalDropdowns = Array.from(mainContainer.querySelectorAll('.cart_category__item__dropdown'));
        finalDropdowns.forEach(dropdown => {
            const children = Array.from(dropdown.children);
            let mainItem = null;
            for (let child of children) {
                if (child.classList.contains('cart_category__item') && 
                    !child.classList.contains('cart_category__item--placeholder') &&
                    !child.classList.contains('cart_category__item__content')) {
                    mainItem = child;
                    break;
                }
            }
            const content = dropdown.querySelector('.cart_category__item__content');
            const nestedItems = content ? Array.from(content.querySelectorAll('.cart_category__item')).filter(item => 
                !item.classList.contains('cart_category__item--placeholder')
            ) : [];
            if (!mainItem && nestedItems.length === 0) {
                try {
                    dropdown.remove();
                } catch (e) {
                    // Игнорируем ошибки
                }
            }
        });
    }

    // Работа с чекбоксами
    function initCheckboxes() {
        // Обработка чекбоксов товаров (всех, включая вложенные в content)
        const itemCheckboxes = document.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]');
        itemCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleCheckboxChange);
        });
        
        // Обработка "Выбрать все" - для каждой категории отдельно
        const selectAllCheckboxes = document.querySelectorAll('.cart_choose_all input[type="checkbox"]');
        selectAllCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleSelectAll);
        });
        
        // Инициализация счетчика и состояния родительских чекбоксов
        updateSelectedCount();
        updateParentCheckboxesState();
        updateSelectAllState();
    }

    // Обработка изменения чекбокса с учетом родитель-дочерних связей
    function handleCheckboxChange(e) {
        const checkbox = e.target;
        const item = checkbox.closest('.cart_category__item');
        if (!item) return;
        
        const dropdown = item.closest('.cart_category__item__dropdown');
        if (!dropdown) {
            // Если это обычный товар без dropdown, просто обновляем состояние
            updateCheckboxState();
            return;
        }
        
        const mainItem = dropdown.querySelector(':scope > .cart_category__item');
        const content = dropdown.querySelector('.cart_category__item__content');
        const isMainItem = (item === mainItem);
        
        if (isMainItem) {
            // Если изменен родительский чекбокс, обновляем все дочерние
            if (content) {
                const nestedCheckboxes = content.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]');
                nestedCheckboxes.forEach(nestedCheckbox => {
                    nestedCheckbox.checked = checkbox.checked;
                });
            }
        } else {
            // Если изменен дочерний чекбокс, обновляем родительский
            updateParentCheckboxFromNested(dropdown);
        }
        
        updateCheckboxState();
    }

    // Обновление родительского чекбокса на основе дочерних
    function updateParentCheckboxFromNested(dropdown) {
        const mainItem = dropdown.querySelector(':scope > .cart_category__item');
        if (!mainItem) return;
        
        const parentCheckbox = mainItem.querySelector('.label_choose input[type="checkbox"]');
        if (!parentCheckbox) return;
        
        const content = dropdown.querySelector('.cart_category__item__content');
        if (!content) {
            // Если нет вложенных элементов, просто обновляем общее состояние
            return;
        }
        
        const nestedCheckboxes = content.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]');
        if (nestedCheckboxes.length === 0) return;
        
        const checkedNestedCount = content.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]:checked').length;
        
        if (checkedNestedCount > 0) {
            // Если хоть один дочерний выбран, выбираем родительский
            parentCheckbox.checked = true;
            parentCheckbox.indeterminate = checkedNestedCount < nestedCheckboxes.length;
        } else {
            // Если все дочерние сняты, снимаем родительский
            parentCheckbox.checked = false;
            parentCheckbox.indeterminate = false;
        }
    }

    // Обновление всех родительских чекбоксов
    function updateParentCheckboxesState() {
        const container = document.querySelector('.cart_section-container');
        if (!container) return;
        
        const dropdowns = container.querySelectorAll('.cart_category__item__dropdown');
        dropdowns.forEach(dropdown => {
            updateParentCheckboxFromNested(dropdown);
        });
    }

    // Управление модалкой подтверждения удаления
    let deleteCallback = null;
    let modalDelete = null;
    let modalDeleteMessage = null;
    let modalDeleteCancel = null;
    let modalDeleteConfirm = null;
    let modalDeleteClose = null;

    function initDeleteModal() {
        modalDelete = document.querySelector('.modal_overlay[data-modal-id="modal-delete-confirm"]');
        modalDeleteMessage = document.querySelector('.modal_delete-message');
        modalDeleteCancel = document.querySelector('.modal_delete-cancel');
        modalDeleteConfirm = document.querySelector('.modal_delete-confirm');
        modalDeleteClose = modalDelete ? modalDelete.querySelector('.modal_close') : null;

        // Инициализация обработчиков модалки
        if (modalDeleteCancel) {
            modalDeleteCancel.addEventListener('click', closeDeleteModal);
        }
        
        if (modalDeleteConfirm) {
            modalDeleteConfirm.addEventListener('click', () => {
                if (deleteCallback) {
                    deleteCallback();
                    closeDeleteModal();
                }
            });
        }
        
        if (modalDeleteClose) {
            modalDeleteClose.addEventListener('click', closeDeleteModal);
        }
        
        // Закрытие при клике вне модалки
        if (modalDelete) {
            document.addEventListener('click', (e) => {
                if (modalDelete && modalDelete.classList.contains('is-open') && 
                    !e.target.closest('.modal_content')) {
                    closeDeleteModal();
                }
            });
        }
    }

    function openDeleteModal(message, callback) {
        if (!modalDelete || !modalDeleteMessage) {
            console.error('Модалка удаления не найдена');
            return;
        }
        
        deleteCallback = callback;
        modalDeleteMessage.textContent = message;
        modalDelete.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
    }

    function closeDeleteModal() {
        if (!modalDelete) return;
        
        modalDelete.classList.remove('is-open');
        deleteCallback = null;
        if (typeof unlockScroll === 'function') {
            unlockScroll();
        }
    }

    // Удаление товаров - используем делегирование событий
    let deleteItemsInitialized = false;
    function initDeleteItems() {
        const container = document.querySelector('.cart_section-container');
        if (!container || deleteItemsInitialized) return;
        
        // Используем делегирование событий для удаления отдельных товаров
        container.addEventListener('click', (e) => {
            const deleteButton = e.target.closest('.cart_category__item__trash');
            if (deleteButton) {
                e.preventDefault();
                e.stopPropagation();
                // В saved_cart_detail.html товар может быть вложен, поэтому ищем ближайший .cart_category__item
                const item = deleteButton.closest('.cart_category__item');
                if (item) {
                    openDeleteModal('Удалить товар из подборки?', () => {
                        deleteItem(item);
                    });
                }
            }
        });
        
        deleteItemsInitialized = true;
    }

    function deleteItem(item) {
        if (!item) return;
        
        // Если элемент находится в процессе drag, завершаем drag
        if (item.classList.contains('cart_category__item--dragging') || 
            item.classList.contains('cart_category__item__dropdown--dragging')) {
            const container = item.closest('.cart_category__items');
            if (container) {
                if (item.classList.contains('cart_category__item__dropdown--dragging')) {
                    endDrag(container);
                } else {
                    const contentContainer = item.closest('.cart_category__item__content');
                    if (contentContainer) {
                        endNestedDrag();
                    }
                }
            }
        }
        
        // Удаляем placeholder, если он существует
        if (item._placeholder && item._placeholder.parentNode) {
            item._placeholder.remove();
        }
        
        // Сохраняем ссылки на категорию и dropdown до удаления
        const category = item.closest('.cart_category');
        const dropdown = item.closest('.cart_category__item__dropdown');
        
        // Если это основной товар в dropdown, удаляем весь dropdown
        if (dropdown) {
            // Находим основной товар - первый .cart_category__item, который является прямым потомком dropdown
            const mainItem = dropdown.querySelector(':scope > .cart_category__item');
            
            if (item === mainItem) {
                // Это основной товар - удаляем весь dropdown
                // Удаляем placeholder dropdown, если он существует
                if (dropdown._placeholder && dropdown._placeholder.parentNode) {
                    dropdown._placeholder.remove();
                }
                dropdown.remove();
            } else {
                // Это вложенный товар - удаляем только его
                item.remove();
                
                // Сразу проверяем и удаляем пустой content контейнер, если он стал пустым
                const content = dropdown.querySelector('.cart_category__item__content');
                if (content) {
                    const nestedItems = Array.from(content.querySelectorAll('.cart_category__item')).filter(item => 
                        !item.classList.contains('cart_category__item--placeholder')
                    );
                    if (nestedItems.length === 0) {
                        // Если вложенных товаров не осталось, удаляем content контейнер
                        try {
                            content.remove();
                        } catch (e) {
                            try {
                                if (content.parentNode) {
                                    content.parentNode.removeChild(content);
                                }
                            } catch (e2) {
                                // Игнорируем ошибки удаления
                            }
                        }
                    }
                }
                
                // Проверяем, не стал ли dropdown пустым после удаления вложенного товара
                const children = Array.from(dropdown.children);
                let mainItemAfter = null;
                for (let child of children) {
                    if (child.classList.contains('cart_category__item') && 
                        !child.classList.contains('cart_category__item--placeholder') &&
                        !child.classList.contains('cart_category__item__content')) {
                        mainItemAfter = child;
                        break;
                    }
                }
                const remainingContent = dropdown.querySelector('.cart_category__item__content');
                const remainingNestedItems = remainingContent ? Array.from(remainingContent.querySelectorAll('.cart_category__item')).filter(item => 
                    !item.classList.contains('cart_category__item--placeholder')
                ) : [];
                
                // Если нет основного товара и нет вложенных товаров, удаляем dropdown
                if (!mainItemAfter && remainingNestedItems.length === 0) {
                    try {
                        dropdown.remove();
                    } catch (e) {
                        // Игнорируем ошибки
                    }
                }
            }
        } else {
            // Если dropdown не найден, удаляем сам элемент
            item.remove();
        }
        
        // Удаляем все оставшиеся placeholders во всех контейнерах (на случай, если они остались)
        cleanupAllPlaceholders();
        
        // Удаляем пустые контейнеры content - вызываем несколько раз для гарантии
        cleanupEmptyContentContainers();
        cleanupEmptyContentContainers();
        
        // Обновляем счетчик и состояние чекбоксов
        updateSelectedCount();
        updateSelectAllState();
        
        // Проверяем, не осталась ли категория пустой
        if (category) {
            // Проверяем наличие dropdown элементов
            const remainingDropdowns = category.querySelectorAll('.cart_category__item__dropdown');
            // Проверяем наличие обычных элементов товаров
            const remainingItems = category.querySelectorAll('.cart_category__item:not(.cart_category__item--placeholder)');
            
            // Удаляем категорию только если нет ни dropdown, ни обычных товаров
            if (remainingDropdowns.length === 0 && remainingItems.length === 0) {
                // Удаляем всю категорию, если товаров не осталось
                category.remove();
            }
        }
        
        // Переинициализируем drag and drop для оставшихся элементов
        initDragAndDrop();
        initDropdownAccordion();
        
        // Агрессивная очистка с несколькими задержками для гарантии удаления всех пустых контейнеров
        requestAnimationFrame(() => {
            cleanupAllPlaceholders();
            cleanupEmptyContentContainers();
        });
        
        setTimeout(() => {
            cleanupAllPlaceholders();
            cleanupEmptyContentContainers();
        }, 0);
        
        setTimeout(() => {
            cleanupAllPlaceholders();
            cleanupEmptyContentContainers();
        }, 10);
        
        setTimeout(() => {
            cleanupAllPlaceholders();
            cleanupEmptyContentContainers();
        }, 50);
        
        setTimeout(() => {
            cleanupAllPlaceholders();
            cleanupEmptyContentContainers();
        }, 100);
    }

    function updateCheckboxState() {
        // Обновляем состояние всех родительских чекбоксов
        updateParentCheckboxesState();
        updateSelectedCount();
        updateSelectAllState();
    }

    // Обработка "Выбрать все" - работает только внутри своей категории
    function handleSelectAll(e) {
        const isChecked = e.target.checked;
        // Находим категорию, в которой находится этот чекбокс "Выбрать все"
        const category = e.target.closest('.cart_category');
        if (!category) return;
        
        // Находим все чекбоксы товаров верхнего уровня только в этой категории
        const itemsContainer = category.querySelector('.cart_category__items');
        if (!itemsContainer) return;
        
        const itemCheckboxes = getTopLevelCheckboxes(itemsContainer);
        itemCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            // Если это основной товар в dropdown, обновляем и вложенные товары
            const item = checkbox.closest('.cart_category__item');
            if (item) {
                const dropdown = item.closest('.cart_category__item__dropdown');
                if (dropdown) {
                    const mainItem = dropdown.querySelector(':scope > .cart_category__item');
                    if (item === mainItem) {
                        // Это основной товар - обновляем вложенные
                        const content = dropdown.querySelector('.cart_category__item__content');
                        if (content) {
                            const nestedCheckboxes = content.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]');
                            nestedCheckboxes.forEach(nestedCheckbox => {
                                nestedCheckbox.checked = isChecked;
                            });
                        }
                    }
                }
            }
        });
        
        // Обновляем состояние родительских чекбоксов в dropdown
        updateParentCheckboxesState();
        
        // Обновляем счетчик только для этой категории
        updateSelectedCount();
        
        // Обновляем состояние чекбокса "Выбрать все" только для этой категории
        updateSelectAllState();
    }

    // Вспомогательная функция для фильтрации чекбоксов верхнего уровня
    function getTopLevelCheckboxes(container) {
        const allCheckboxes = container.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]');
        return Array.from(allCheckboxes).filter(checkbox => {
            const item = checkbox.closest('.cart_category__item');
            if (!item) return false;
            // Исключаем товары, которые находятся внутри .cart_category__item__content (подкатегории)
            const content = item.closest('.cart_category__item__content');
            return !content; // Возвращаем true только если товар НЕ в content
        });
    }

    // Обновление состояния чекбокса "Выбрать все" - для каждой категории отдельно
    function updateSelectAllState() {
        const container = document.querySelector('.cart_section-container');
        if (!container) return;
        
        // Находим все категории
        const categories = container.querySelectorAll('.cart_category');
        
        categories.forEach(category => {
            // Находим чекбокс "Выбрать все" в этой категории
            const selectAllCheckbox = category.querySelector('.cart_choose_all input[type="checkbox"]');
            if (!selectAllCheckbox) return;
            
            // Находим все чекбоксы товаров верхнего уровня только в этой категории
            const itemsContainer = category.querySelector('.cart_category__items');
            if (!itemsContainer) return;
            
            const itemCheckboxes = getTopLevelCheckboxes(itemsContainer);
            const checkedCount = itemCheckboxes.filter(cb => cb.checked).length;
            const totalCount = itemCheckboxes.length;
            
            // Обновляем состояние чекбокса "Выбрать все" только для этой категории
            selectAllCheckbox.checked = totalCount > 0 && checkedCount === totalCount;
            selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < totalCount;
        });
    }

    // Обновление счетчика выбранных товаров - для каждой категории отдельно
    function updateSelectedCount() {
        const container = document.querySelector('.cart_section-container');
        if (!container) return;
        
        // Находим все категории
        const categories = container.querySelectorAll('.cart_category');
        
        categories.forEach(category => {
            // Находим счетчик в этой категории
            const countElement = category.querySelector('.choose-count');
            if (!countElement) return;
            
            // Находим все чекбоксы товаров верхнего уровня только в этой категории
            const itemsContainer = category.querySelector('.cart_category__items');
            if (!itemsContainer) return;
            
            // Подсчитываем количество выбранных товаров верхнего уровня только в этой категории
            const topLevelCheckboxes = getTopLevelCheckboxes(itemsContainer);
            const checkedCount = topLevelCheckboxes.filter(cb => cb.checked).length;
            
            // Обновляем счетчик только для этой категории
            countElement.textContent = checkedCount;
        });
        
        // Показываем/скрываем кнопки внизу в зависимости от общего количества выбранных товаров верхнего уровня
        const allTopLevelCheckboxes = getTopLevelCheckboxes(container);
        const totalCheckedCount = allTopLevelCheckboxes.filter(cb => cb.checked).length;
        updateCartButtonsVisibility(totalCheckedCount);
    }

    function updateCartButtonsVisibility(checkedCount) {
        const cartBtns = document.querySelector('.cart-btns');
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

    // Инициализация аккордеона для раскрытия/сворачивания списков
    let accordionInitialized = false;
    function initDropdownAccordion() {
        const container = document.querySelector('.cart_section-container');
        if (!container) return;

        // Используем делегирование событий для кнопок раскрытия
        // Добавляем обработчик только один раз
        if (!accordionInitialized) {
            container.addEventListener('click', handleDropdownClick);
            accordionInitialized = true;
        }
    }

    // Обработчик клика для раскрытия/сворачивания dropdown
    function handleDropdownClick(e) {
        const dropButton = e.target.closest('.cart_category__item__drop');
        if (dropButton) {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdown = dropButton.closest('.cart_category__item__dropdown');
            if (!dropdown) return;
            
            const content = dropdown.querySelector('.cart_category__item__content');
            if (!content) return;
            
            const isCurrentlyOpen = dropdown.classList.contains('is-open');
            
            // Закрываем все другие dropdown
            closeAllDropdowns();
            
            // Если текущий был закрыт, открываем его
            if (!isCurrentlyOpen) {
                dropdown.classList.add('is-open');
                
                // Прокручиваем к верхнему элементу dropdown, чтобы он был вверху экрана
                const mainItem = dropdown.querySelector('.cart_category__item');
                if (mainItem) {
                    // Небольшая задержка для применения класса is-open и начала анимации
                    setTimeout(() => {
                        mainItem.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start',
                            inline: 'nearest'
                        });
                    }, 50);
                }
                
                // Переинициализируем drag-and-drop для вложенных элементов
                const itemsContainer = dropdown.closest('.cart_category__items');
                if (itemsContainer) {
                    // Небольшая задержка для анимации открытия
                    setTimeout(() => {
                        initNestedDragAndDrop(itemsContainer);
                    }, 100);
                }
            }
        }
    }

    // Инициализация при загрузке страницы
    function init() {
        if (document.querySelector('.cart_section')) {
            // Очищаем все placeholders при загрузке (на случай, если они остались)
            cleanupAllPlaceholders();
            cleanupEmptyContentContainers();
            cleanupEmptyContentContainers(); // Двойной вызов для гарантии
            
            initDeleteModal();
            initDropdownAccordion();
            initDragAndDrop();
            initCheckboxes();
            initDeleteItems();
            // Инициализируем видимость кнопок при загрузке
            updateSelectedCount();
        }
    }

    // Запуск при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

