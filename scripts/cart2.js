// Функционал корзины-2: перетаскивание товаров и работа с чекбоксами для cart2.html

(function() {
    'use strict';

    // Инициализация drag and drop для товаров внутри категории
    function initDragAndDrop2() {
        const categoryItems = document.querySelectorAll('.cart_category__items');
        
        categoryItems.forEach(itemsContainer => {
            // В cart2.html перемещаем .cart_category__item__dropdown элементы
            const dropdowns = itemsContainer.querySelectorAll('.cart_category__item__dropdown');
            
            // Если есть dropdown элементы (структура cart2.html), работаем с ними
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
                        closeAllDropdowns2();
                        startDrag2(dropdown, itemsContainer, e);
                    });
                    
                    // Для touch устройств
                    dragHandle.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        // Закрываем все раскрытые списки при начале перетаскивания
                        closeAllDropdowns2();
                        const touch = e.touches[0];
                        startDrag2(dropdown, itemsContainer, {
                            clientY: touch.clientY,
                            clientX: touch.clientX,
                            pageY: touch.pageY,
                            pageX: touch.pageX
                        });
                    });
                    
                });

                // Инициализируем drag-and-drop для вложенных товаров внутри content
                initNestedDragAndDrop2(itemsContainer);
            } else {
                // Если нет dropdown элементов (простая структура как в saved_cart_detail2.html),
                // работаем напрямую с .cart_category__item элементами
                const items = itemsContainer.querySelectorAll('.cart_category__item');
                
                items.forEach(item => {
                    const dragHandle = item.querySelector('.btn__moving');
                    if (!dragHandle) return;
                    
                    // Удаляем старые обработчики, если они есть
                    if (item._simpleDragHandlers2) {
                        dragHandle.removeEventListener('mousedown', item._simpleDragHandlers2.mousedown);
                        dragHandle.removeEventListener('touchstart', item._simpleDragHandlers2.touchstart);
                    }
                    
                    // Делаем элемент перетаскиваемым через handle
                    const mousedownHandler = (e) => {
                        e.preventDefault();
                        startSimpleDrag2(item, itemsContainer, e);
                    };
                    
                    const touchstartHandler = (e) => {
                        e.preventDefault();
                        const touch = e.touches[0];
                        startSimpleDrag2(item, itemsContainer, {
                            clientY: touch.clientY,
                            clientX: touch.clientX,
                            pageY: touch.pageY,
                            pageX: touch.pageX
                        });
                    };
                    
                    // Сохраняем ссылки на обработчики
                    item._simpleDragHandlers2 = {
                        mousedown: mousedownHandler,
                        touchstart: touchstartHandler
                    };
                    
                    dragHandle.addEventListener('mousedown', mousedownHandler);
                    dragHandle.addEventListener('touchstart', touchstartHandler);
                });
            }
        });
    }

    // Инициализация drag-and-drop для вложенных товаров внутри .cart_category__item__content
    function initNestedDragAndDrop2(container) {
        const contentContainers = container.querySelectorAll('.cart_category__item__content');
        
        contentContainers.forEach(contentContainer => {
            // Очищаем старые обработчики, чтобы избежать дублирования
            const nestedItems = contentContainer.querySelectorAll('.cart_category__item');
            
            nestedItems.forEach(item => {
                const dragHandle = item.querySelector('.btn__moving');
                if (!dragHandle) return;
                
                // Удаляем старые обработчики, если они есть
                if (item._nestedDragHandlers2) {
                    dragHandle.removeEventListener('mousedown', item._nestedDragHandlers2.mousedown);
                    dragHandle.removeEventListener('touchstart', item._nestedDragHandlers2.touchstart);
                }
                
                // Создаем новые обработчики
                const mousedownHandler = (e) => {
                    e.preventDefault();
                    startNestedDrag2(item, contentContainer, e);
                };
                
                const touchstartHandler = (e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    startNestedDrag2(item, contentContainer, {
                        clientY: touch.clientY,
                        clientX: touch.clientX,
                        pageY: touch.pageY,
                        pageX: touch.pageX
                    });
                };
                
                // Сохраняем ссылки на обработчики для последующего удаления
                item._nestedDragHandlers2 = {
                    mousedown: mousedownHandler,
                    touchstart: touchstartHandler
                };
                
                // Делаем вложенный товар перетаскиваемым внутри своего content контейнера
                dragHandle.addEventListener('mousedown', mousedownHandler);
                dragHandle.addEventListener('touchstart', touchstartHandler);
            });
        });
    }

    let draggedNestedElement2 = null;
    let isNestedDragging2 = false;

    function startNestedDrag2(item, contentContainer, event) {
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
        
        draggedNestedElement2 = item;
        isNestedDragging2 = true;
        initNestedDrag2(item, contentContainer);
    }

    function initNestedDrag2(item, contentContainer) {
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
            if (!isNestedDragging2) return;
            e.preventDefault();
            e.stopPropagation();
            
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            
            // Обновляем позицию элемента для следования за курсором
            item.style.left = (clientX - item._offsetX) + 'px';
            item.style.top = (clientY - item._offsetY) + 'px';
            
            // Определяем новую позицию
            handleNestedDragMove2(clientY, contentContainer);
        };
        
        const endHandler = (e) => {
            if (!isNestedDragging2) return;
            e.preventDefault();
            e.stopPropagation();
            endNestedDrag2();
        };
        
        // Используем passive: false для предотвращения скролла во время drag
        document.addEventListener('mousemove', moveHandler, { passive: false });
        document.addEventListener('mouseup', endHandler);
        document.addEventListener('touchmove', moveHandler, { passive: false });
        document.addEventListener('touchend', endHandler);
        document.addEventListener('touchcancel', endHandler);
        
        // Сохраняем обработчики для последующего удаления
        draggedNestedElement2._nestedMoveHandler2 = moveHandler;
        draggedNestedElement2._nestedEndHandler2 = endHandler;
    }

    function handleNestedDragMove2(clientY, contentContainer) {
        if (!draggedNestedElement2 || !draggedNestedElement2._placeholder) return;
        
        // Вложенный элемент можно перемещать только внутри исходного content контейнера
        const originalContainer = draggedNestedElement2._originalContainer;
        if (!originalContainer || contentContainer !== originalContainer) {
            return; // Не позволяем перемещать в другой контейнер
        }
        
        // Удаляем все лишние placeholders в контейнере (кроме текущего)
        const allPlaceholders = contentContainer.querySelectorAll('.cart_category__item--placeholder');
        allPlaceholders.forEach(ph => {
            if (ph !== draggedNestedElement2._placeholder) {
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
            const placeholder = draggedNestedElement2._placeholder;
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
            const placeholder = draggedNestedElement2._placeholder;
            if (placeholder.nextSibling !== null) {
                contentContainer.appendChild(placeholder);
            }
        }
    }

    function endNestedDrag2() {
        if (!draggedNestedElement2) return;
        
        // Убираем класс блокировки с body
        document.body.classList.remove('is-dragging');
        
        // Восстанавливаем оригинальные стили
        const item = draggedNestedElement2;
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
        if (item._nestedMoveHandler2) {
            document.removeEventListener('mousemove', item._nestedMoveHandler2);
            document.removeEventListener('touchmove', item._nestedMoveHandler2);
        }
        if (item._nestedEndHandler2) {
            document.removeEventListener('mouseup', item._nestedEndHandler2);
            document.removeEventListener('touchend', item._nestedEndHandler2);
            document.removeEventListener('touchcancel', item._nestedEndHandler2);
        }
        
        // Очищаем ссылки на обработчики и данные
        delete item._nestedMoveHandler2;
        delete item._nestedEndHandler2;
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
        
        draggedNestedElement2 = null;
        isNestedDragging2 = false;
        
        // Агрессивная очистка всех placeholders во всех контейнерах
        cleanupAllPlaceholders2();
        cleanupAllPlaceholders2(); // Двойной вызов для гарантии
        
        // Дополнительная очистка с задержками для гарантии
        requestAnimationFrame(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        });
        
        setTimeout(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        }, 0);
        
        setTimeout(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        }, 10);
        
        setTimeout(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        }, 50);
    }

    let draggedElement2 = null;
    let isDragging2 = false;

    function startDrag2(dropdown, container, event) {
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
        draggedElement2 = dropdown;
        isDragging2 = true;
        initDrag2(dropdown, container);
    }

    // Функция закрытия всех раскрытых списков
    function closeAllDropdowns2() {
        const allDropdowns = document.querySelectorAll('.cart_category__item__dropdown');
        allDropdowns.forEach(dropdown => {
            dropdown.classList.remove('is-open');
        });
    }

    function initDrag2(dropdown, container) {
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
            if (!isDragging2) return;
            e.preventDefault();
            e.stopPropagation();
            
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            
            // Обновляем позицию элемента для следования за курсором
            dropdown.style.left = (clientX - dropdown._offsetX) + 'px';
            dropdown.style.top = (clientY - dropdown._offsetY) + 'px';
            
            // Определяем новую позицию
            handleDragMove2(clientY, container, clientX);
        };
        
        const endHandler = (e) => {
            if (!isDragging2) return;
            e.preventDefault();
            e.stopPropagation();
            endDrag2(container);
        };
        
        // Используем passive: false для предотвращения скролла во время drag
        document.addEventListener('mousemove', moveHandler, { passive: false });
        document.addEventListener('mouseup', endHandler);
        document.addEventListener('touchmove', moveHandler, { passive: false });
        document.addEventListener('touchend', endHandler);
        document.addEventListener('touchcancel', endHandler);
        
        // Сохраняем обработчики для последующего удаления
        draggedElement2._moveHandler2 = moveHandler;
        draggedElement2._endHandler2 = endHandler;
    }

    function handleDragMove2(clientY, container, clientX) {
        if (!draggedElement2 || !draggedElement2._placeholder) return;
        
        // Элемент можно перемещать только внутри исходного контейнера категории
        const originalContainer = draggedElement2._originalContainer;
        if (!originalContainer || container !== originalContainer) {
            return; // Не позволяем перемещать в другую категорию
        }
        
        // Удаляем все лишние placeholders в контейнере (кроме текущего)
        const allPlaceholders = container.querySelectorAll('.cart_category__item--placeholder, .cart_category__item__dropdown.cart_category__item--placeholder');
        allPlaceholders.forEach(ph => {
            if (ph !== draggedElement2._placeholder) {
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
            const placeholder = draggedElement2._placeholder;
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
            const placeholder = draggedElement2._placeholder;
            if (placeholder.nextSibling !== null) {
                container.appendChild(placeholder);
            }
        }
    }

    function endDrag2(container) {
        if (!draggedElement2) return;
        
        // Убираем класс блокировки с body
        document.body.classList.remove('is-dragging');
        
        // Восстанавливаем оригинальные стили
        const dropdown = draggedElement2;
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
        if (dropdown._moveHandler2) {
            document.removeEventListener('mousemove', dropdown._moveHandler2);
            document.removeEventListener('touchmove', dropdown._moveHandler2);
        }
        if (dropdown._endHandler2) {
            document.removeEventListener('mouseup', dropdown._endHandler2);
            document.removeEventListener('touchend', dropdown._endHandler2);
            document.removeEventListener('touchcancel', dropdown._endHandler2);
        }
        
        // Очищаем ссылки на обработчики и данные
        delete dropdown._moveHandler2;
        delete dropdown._endHandler2;
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
        
        draggedElement2 = null;
        isDragging2 = false;
        
        // Агрессивная очистка всех placeholders во всех контейнерах
        cleanupAllPlaceholders2();
        cleanupAllPlaceholders2(); // Двойной вызов для гарантии
        
        // Дополнительная очистка с задержками для гарантии
        requestAnimationFrame(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        });
        
        setTimeout(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        }, 0);
        
        setTimeout(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        }, 10);
        
        setTimeout(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        }, 50);
    }

    // Функции для работы с простой структурой (без dropdown) - для saved_cart_detail2.html
    let draggedSimpleElement2 = null;
    let isSimpleDragging2 = false;

    function startSimpleDrag2(item, container, event) {
        // Добавляем класс на body для блокировки всех элементов
        document.body.classList.add('is-dragging');
        
        // Сохраняем исходный контейнер категории - элемент можно перемещать только внутри него
        item._originalContainer = container;
        
        // Сохраняем начальную позицию элемента
        const rect = item.getBoundingClientRect();
        item._startX = event.clientX || event.clientX || 0;
        item._startY = event.clientY || event.clientY || 0;
        item._offsetX = (event.clientX || 0) - rect.left;
        item._offsetY = (event.clientY || 0) - rect.top;
        
        draggedSimpleElement2 = item;
        isSimpleDragging2 = true;
        initSimpleDrag2(item, container);
    }

    function initSimpleDrag2(item, container) {
        // Сначала удаляем все старые placeholders в этом контейнере
        const oldPlaceholders = container.querySelectorAll('.cart_category__item--placeholder, .cart_category_item--placeholder');
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
        
        // Создаем placeholder для сохранения места в grid
        const placeholder = document.createElement('div');
        placeholder.className = 'cart_category__item cart_category__item--placeholder';
        placeholder.style.width = rect.width + 'px';
        placeholder.style.height = rect.height + 'px';
        placeholder.style.visibility = 'hidden';
        placeholder.style.pointerEvents = 'none';
        item._placeholder = placeholder;
        container.insertBefore(placeholder, item);
        
        // Обработчики для перемещения
        const moveHandler = (e) => {
            if (!isSimpleDragging2) return;
            e.preventDefault();
            e.stopPropagation();
            
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            
            // Обновляем позицию элемента для следования за курсором
            item.style.left = (clientX - item._offsetX) + 'px';
            item.style.top = (clientY - item._offsetY) + 'px';
            
            // Определяем новую позицию в grid
            handleSimpleDragMove2(clientY, container, clientX);
        };
        
        const endHandler = (e) => {
            if (!isSimpleDragging2) return;
            e.preventDefault();
            e.stopPropagation();
            endSimpleDrag2();
        };
        
        // Используем passive: false для предотвращения скролла во время drag
        document.addEventListener('mousemove', moveHandler, { passive: false });
        document.addEventListener('mouseup', endHandler);
        document.addEventListener('touchmove', moveHandler, { passive: false });
        document.addEventListener('touchend', endHandler);
        document.addEventListener('touchcancel', endHandler);
        
        // Сохраняем обработчики для последующего удаления
        draggedSimpleElement2._simpleMoveHandler2 = moveHandler;
        draggedSimpleElement2._simpleEndHandler2 = endHandler;
    }

    function handleSimpleDragMove2(clientY, container, clientX) {
        if (!draggedSimpleElement2 || !draggedSimpleElement2._placeholder) return;
        
        // Элемент можно перемещать только внутри исходного контейнера категории
        const originalContainer = draggedSimpleElement2._originalContainer;
        if (!originalContainer || container !== originalContainer) {
            return; // Не позволяем перемещать в другую категорию
        }
        
        // Удаляем все лишние placeholders в контейнере (кроме текущего)
        const allPlaceholders = container.querySelectorAll('.cart_category__item--placeholder');
        allPlaceholders.forEach(ph => {
            if (ph !== draggedSimpleElement2._placeholder) {
                try {
                    ph.remove();
                } catch (e) {
                    // Игнорируем ошибки
                }
            }
        });
        
        // Исключаем draggedElement и placeholder из поиска
        const items = Array.from(container.querySelectorAll('.cart_category__item:not(.cart_category__item--dragging):not(.cart_category__item--placeholder)'));
        
        if (items.length === 0) return;
        
        // Проверяем, является ли контейнер grid
        const isGrid = container.classList.contains('cart_category__items_grid');
        
        let targetItem = null;
        let insertBefore = false;
        
        if (isGrid && clientX !== undefined) {
            // Для grid layout находим элемент, над которым находится курсор
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const rect = item.getBoundingClientRect();
                
                // Проверяем, находится ли курсор внутри границ элемента
                if (clientX >= rect.left && clientX <= rect.right && 
                    clientY >= rect.top && clientY <= rect.bottom) {
                    targetItem = item;
                    const centerY = rect.top + rect.height / 2;
                    const centerX = rect.left + rect.width / 2;
                    
                    // Определяем, куда вставлять - до или после элемента
                    if (clientY < centerY - 15) {
                        // Верхняя часть - вставляем перед
                        insertBefore = true;
                    } else if (clientY > centerY + 15) {
                        // Нижняя часть - вставляем после
                        insertBefore = false;
                    } else {
                        // Средняя часть - определяем по горизонтали
                        insertBefore = clientX < centerX;
                    }
                    break;
                }
            }
            
            // Если не нашли элемент под курсором, ищем ближайший по вертикали
            if (!targetItem) {
                let closestItem = null;
                let minVerticalDistance = Infinity;
                
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const rect = item.getBoundingClientRect();
                    const centerY = rect.top + rect.height / 2;
                    const verticalDistance = Math.abs(clientY - centerY);
                    
                    // Ищем элемент с минимальным вертикальным расстоянием
                    if (verticalDistance < minVerticalDistance) {
                        minVerticalDistance = verticalDistance;
                        closestItem = item;
                        insertBefore = clientY < centerY;
                    }
                }
                targetItem = closestItem;
            }
        } else {
            // Для обычного списка работаем только по вертикали
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const rect = item.getBoundingClientRect();
                const itemMiddle = rect.top + rect.height / 2;
                
                if (clientY < itemMiddle) {
                    targetItem = item;
                    insertBefore = true;
                    break;
                }
            }
        }
        
        // Перемещаем placeholder для визуального отображения будущей позиции
        if (targetItem) {
            const placeholder = draggedSimpleElement2._placeholder;
            const currentPlaceholderNext = placeholder.nextSibling;
            
            if (insertBefore) {
                // Вставляем placeholder перед целевым элементом
                if (currentPlaceholderNext !== targetItem) {
                    container.insertBefore(placeholder, targetItem);
                }
            } else {
                // Вставляем placeholder после целевого элемента
                const targetNextSibling = targetItem.nextSibling;
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
            const placeholder = draggedSimpleElement2._placeholder;
            if (placeholder.nextSibling !== null) {
                container.appendChild(placeholder);
            }
        }
    }

    function endSimpleDrag2() {
        if (!draggedSimpleElement2) return;
        
        // Убираем класс блокировки с body
        document.body.classList.remove('is-dragging');
        
        // Восстанавливаем оригинальные стили
        const item = draggedSimpleElement2;
        const originalContainer = item._originalContainer || item.closest('.cart_category__items');
        
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
        if (item._simpleMoveHandler2) {
            document.removeEventListener('mousemove', item._simpleMoveHandler2);
            document.removeEventListener('touchmove', item._simpleMoveHandler2);
        }
        if (item._simpleEndHandler2) {
            document.removeEventListener('mouseup', item._simpleEndHandler2);
            document.removeEventListener('touchend', item._simpleEndHandler2);
            document.removeEventListener('touchcancel', item._simpleEndHandler2);
        }
        
        // Очищаем ссылки на обработчики и данные
        delete item._simpleMoveHandler2;
        delete item._simpleEndHandler2;
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
        
        draggedSimpleElement2 = null;
        isSimpleDragging2 = false;
        
        // Агрессивная очистка всех placeholders во всех контейнерах
        cleanupAllPlaceholders2();
        cleanupAllPlaceholders2(); // Двойной вызов для гарантии
        
        // Дополнительная очистка с задержками для гарантии
        requestAnimationFrame(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        });
        
        setTimeout(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        }, 0);
        
        setTimeout(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        }, 10);
        
        setTimeout(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        }, 50);
    }

    // Универсальная функция для удаления всех placeholders
    function cleanupAllPlaceholders2() {
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
    function cleanupEmptyContentContainers2() {
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
    function initCheckboxes2() {
        // Обработка чекбоксов товаров (всех, включая вложенные в content)
        const itemCheckboxes = document.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]');
        itemCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleCheckboxChange2);
        });
        
        // Обработка "Выбрать все"
        const selectAllCheckboxes = document.querySelectorAll('.cart_choose_all input[type="checkbox"]');
        selectAllCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleSelectAll2);
        });
        
        // Инициализация счетчика и состояния родительских чекбоксов
        updateSelectedCount2();
        updateParentCheckboxesState2();
    }

    // Обработка изменения чекбокса с учетом родитель-дочерних связей
    function handleCheckboxChange2(e) {
        const checkbox = e.target;
        const item = checkbox.closest('.cart_category__item');
        if (!item) return;
        
        const dropdown = item.closest('.cart_category__item__dropdown');
        if (!dropdown) {
            // Если это обычный товар без dropdown, просто обновляем состояние
            updateCheckboxState2();
            return;
        }
        
        const mainItem = dropdown.querySelector('.cart_category__item');
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
            updateParentCheckboxFromNested2(dropdown);
        }
        
        updateCheckboxState2();
    }

    // Обновление родительского чекбокса на основе дочерних
    function updateParentCheckboxFromNested2(dropdown) {
        const mainItem = dropdown.querySelector('.cart_category__item');
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
    function updateParentCheckboxesState2() {
        const container = document.querySelector('.cart_section-container');
        if (!container) return;
        
        const dropdowns = container.querySelectorAll('.cart_category__item__dropdown');
        dropdowns.forEach(dropdown => {
            updateParentCheckboxFromNested2(dropdown);
        });
    }

    // Управление модалкой подтверждения удаления
    let deleteCallback2 = null;
    let modalDelete2 = null;
    let modalDeleteMessage2 = null;
    let modalDeleteCancel2 = null;
    let modalDeleteConfirm2 = null;
    let modalDeleteClose2 = null;

    function initDeleteModal2() {
        modalDelete2 = document.querySelector('.modal_overlay[data-modal-id="modal-delete-confirm"]');
        modalDeleteMessage2 = document.querySelector('.modal_delete-message');
        modalDeleteCancel2 = document.querySelector('.modal_delete-cancel');
        modalDeleteConfirm2 = document.querySelector('.modal_delete-confirm');
        modalDeleteClose2 = modalDelete2 ? modalDelete2.querySelector('.modal_close') : null;

        // Инициализация обработчиков модалки
        if (modalDeleteCancel2) {
            modalDeleteCancel2.addEventListener('click', closeDeleteModal2);
        }
        
        if (modalDeleteConfirm2) {
            modalDeleteConfirm2.addEventListener('click', () => {
                if (deleteCallback2) {
                    deleteCallback2();
                    closeDeleteModal2();
                }
            });
        }
        
        if (modalDeleteClose2) {
            modalDeleteClose2.addEventListener('click', closeDeleteModal2);
        }
        
        // Закрытие при клике вне модалки
        if (modalDelete2) {
            document.addEventListener('click', (e) => {
                if (modalDelete2 && modalDelete2.classList.contains('is-open') && 
                    !e.target.closest('.modal_content')) {
                    closeDeleteModal2();
                }
            });
        }
    }

    function openDeleteModal2(message, callback) {
        if (!modalDelete2 || !modalDeleteMessage2) {
            console.error('Модалка удаления не найдена');
            return;
        }
        
        deleteCallback2 = callback;
        modalDeleteMessage2.textContent = message;
        modalDelete2.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
    }

    function closeDeleteModal2() {
        if (!modalDelete2) return;
        
        modalDelete2.classList.remove('is-open');
        deleteCallback2 = null;
        if (typeof unlockScroll === 'function') {
            unlockScroll();
        }
    }

    // Удаление товаров - используем делегирование событий
    let deleteItemsInitialized2 = false;
    function initDeleteItems2() {
        const container = document.querySelector('.cart_section-container');
        if (!container || deleteItemsInitialized2) return;
        
        // Используем делегирование событий для удаления отдельных товаров
        container.addEventListener('click', (e) => {
            const deleteButton = e.target.closest('.cart_category__item__trash');
            if (deleteButton) {
                e.preventDefault();
                e.stopPropagation();
                // В cart2.html товар может быть вложен, поэтому ищем ближайший .cart_category__item
                const item = deleteButton.closest('.cart_category__item');
                if (item) {
                    openDeleteModal2('Удалить товар из подборки?', () => {
                        deleteItem2(item);
                    });
                }
            }
        });
        
        // Используем делегирование событий для удаления всей подборки
        container.addEventListener('click', (e) => {
            const deleteCartButton = e.target.closest('.trash_cart');
            if (deleteCartButton) {
                e.preventDefault();
                e.stopPropagation();
                openDeleteModal2('Очистить всю подборку? Все товары будут удалены.', () => {
                    clearCart2(container);
                });
            }
        });
        
        deleteItemsInitialized2 = true;
    }

    function deleteItem2(item) {
        if (!item) return;
        
        // Если элемент находится в процессе drag, завершаем drag
        if (item.classList.contains('cart_category__item--dragging') || 
            item.classList.contains('cart_category__item__dropdown--dragging')) {
            const container = item.closest('.cart_category__items');
            if (container) {
                if (item.classList.contains('cart_category__item__dropdown--dragging')) {
                    endDrag2(container);
                } else {
                    const contentContainer = item.closest('.cart_category__item__content');
                    if (contentContainer) {
                        endNestedDrag2();
                    } else {
                        endSimpleDrag2();
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
        const itemsContainer = item.closest('.cart_category__items');
        const contentContainer = item.closest('.cart_category__item__content');
        
        // Если это основной товар в dropdown, удаляем весь dropdown
        if (dropdown) {
            // Находим основной товар - первый .cart_category__item, который является прямым потомком dropdown
            // (не вложенный в .cart_category__item__content)
            const children = Array.from(dropdown.children);
            let mainItem = null;
            for (let child of children) {
                if (child.classList.contains('cart_category__item') && 
                    !child.classList.contains('cart_category__item__content')) {
                    mainItem = child;
                    break;
                }
            }
            
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
                let mainItem = null;
                for (let child of children) {
                    if (child.classList.contains('cart_category__item') && 
                        !child.classList.contains('cart_category__item--placeholder') &&
                        !child.classList.contains('cart_category__item__content')) {
                        mainItem = child;
                        break;
                    }
                }
                const remainingContent = dropdown.querySelector('.cart_category__item__content');
                const remainingNestedItems = remainingContent ? Array.from(remainingContent.querySelectorAll('.cart_category__item')).filter(item => 
                    !item.classList.contains('cart_category__item--placeholder')
                ) : [];
                
                // Если нет основного товара и нет вложенных товаров, удаляем dropdown
                if (!mainItem && remainingNestedItems.length === 0) {
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
        cleanupAllPlaceholders2();
        
        // Удаляем пустые контейнеры content - вызываем несколько раз для гарантии
        cleanupEmptyContentContainers2();
        cleanupEmptyContentContainers2();
        
        // Обновляем счетчик и состояние чекбоксов
        updateSelectedCount2();
        updateSelectAllState2();
        
        // Проверяем, не осталась ли категория пустой
        if (category) {
            // Проверяем наличие dropdown элементов (для cart2.html)
            const remainingDropdowns = category.querySelectorAll('.cart_category__item__dropdown');
            // Проверяем наличие обычных элементов товаров (для saved_cart_detail2.html и history_prices_detail.html)
            const remainingItems = category.querySelectorAll('.cart_category__item:not(.cart_category__item--placeholder)');
            
            // Удаляем категорию только если нет ни dropdown, ни обычных товаров
            if (remainingDropdowns.length === 0 && remainingItems.length === 0) {
                // Удаляем всю категорию, если товаров не осталось
                category.remove();
            }
        }
        
        // Переинициализируем drag and drop для оставшихся элементов
        initDragAndDrop2();
        initDropdownAccordion2();
        
        // Агрессивная очистка с несколькими задержками для гарантии удаления всех пустых контейнеров
        requestAnimationFrame(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        });
        
        setTimeout(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        }, 0);
        
        setTimeout(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        }, 10);
        
        setTimeout(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        }, 50);
        
        setTimeout(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        }, 100);
    }

    function clearCart2(container) {
        if (!container) return;
        
        // Завершаем drag, если он активен
        if (draggedElement2 && isDragging2) {
            const itemsContainer = draggedElement2.closest('.cart_category__items');
            if (itemsContainer) {
                endDrag2(itemsContainer);
            }
        }
        if (draggedSimpleElement2 && isSimpleDragging2) {
            endSimpleDrag2();
        }
        if (draggedNestedElement2 && isNestedDragging2) {
            endNestedDrag2();
        }
        
        // Удаляем все dropdown элементы (в cart2.html это основные контейнеры товаров)
        const allDropdowns = container.querySelectorAll('.cart_category__item__dropdown');
        allDropdowns.forEach(dropdown => {
            // Удаляем placeholder, если он существует
            if (dropdown._placeholder && dropdown._placeholder.parentNode) {
                dropdown._placeholder.remove();
            }
            dropdown.remove();
        });
        
        // Удаляем все обычные элементы товаров (исключаем placeholders из поиска)
        const allItems = container.querySelectorAll('.cart_category__item:not(.cart_category__item--placeholder)');
        allItems.forEach(item => {
            // Удаляем placeholder, если он существует
            if (item._placeholder && item._placeholder.parentNode) {
                item._placeholder.remove();
            }
            item.remove();
        });
        
        // Удаляем все оставшиеся placeholders
        cleanupAllPlaceholders2();
        cleanupEmptyContentContainers2();
        cleanupEmptyContentContainers2(); // Двойной вызов для гарантии
        
        // Дополнительная очистка с задержками
        setTimeout(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        }, 0);
        
        setTimeout(() => {
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
        }, 50);
        
        // Удаляем все категории
        const allCategories = container.querySelectorAll('.cart_category');
        allCategories.forEach(category => {
            category.remove();
        });
        
        // Сбрасываем счетчик и чекбоксы
        updateSelectedCount2();
        updateSelectAllState2();
        
        // Переинициализируем drag and drop
        initDragAndDrop2();
        initDropdownAccordion2();
    }

    function updateCheckboxState2() {
        // Обновляем состояние всех родительских чекбоксов
        updateParentCheckboxesState2();
        updateSelectedCount2();
        updateSelectAllState2();
    }

    function handleSelectAll2(e) {
        const isChecked = e.target.checked;
        // Находим контейнер корзины
        const container = e.target.closest('.cart_section-container');
        if (!container) return;
        
        // Синхронизируем все чекбоксы "Выбрать все" в контейнере
        const allSelectAllCheckboxes = container.querySelectorAll('.cart_choose_all input[type="checkbox"]');
        allSelectAllCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            checkbox.indeterminate = false;
        });
        
        // Находим все чекбоксы товаров верхнего уровня (без подкатегорий)
        const itemCheckboxes = getTopLevelCheckboxes(container);
        itemCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            // Если это основной товар в dropdown, обновляем и вложенные товары
            const item = checkbox.closest('.cart_category__item');
            if (item) {
                const dropdown = item.closest('.cart_category__item__dropdown');
                if (dropdown) {
                    const mainItem = dropdown.querySelector('.cart_category__item');
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
        
        updateSelectedCount2();
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

    function updateSelectAllState2() {
        const container = document.querySelector('.cart_section-container');
        if (!container) return;
        
        // Находим все чекбоксы товаров верхнего уровня (без подкатегорий)
        const itemCheckboxes = getTopLevelCheckboxes(container);
        const checkedCount = itemCheckboxes.filter(cb => cb.checked).length;
        const totalCount = itemCheckboxes.length;
        
        // Синхронизируем все чекбоксы "Выбрать все" в контейнере
        const allSelectAllCheckboxes = container.querySelectorAll('.cart_choose_all input[type="checkbox"]');
        allSelectAllCheckboxes.forEach(selectAllCheckbox => {
            selectAllCheckbox.checked = totalCount > 0 && checkedCount === totalCount;
            selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < totalCount;
        });
    }

    function updateSelectedCount2() {
        const container = document.querySelector('.cart_section-container');
        if (!container) return;
        
        // Подсчитываем общее количество выбранных товаров верхнего уровня (без подкатегорий)
        const topLevelCheckboxes = getTopLevelCheckboxes(container);
        const totalCheckedCount = topLevelCheckboxes.filter(cb => cb.checked).length;
        
        // Обновляем все счетчики в контейнере (вверху и внизу)
        const countElements = container.querySelectorAll('.choose-count');
        countElements.forEach(countElement => {
            countElement.textContent = totalCheckedCount;
        });
        
        // Показываем/скрываем кнопки внизу в зависимости от общего количества выбранных товаров
        updateCartButtonsVisibility2(totalCheckedCount);
    }

    function updateCartButtonsVisibility2(checkedCount) {
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
    let accordionInitialized2 = false;
    function initDropdownAccordion2() {
        const container = document.querySelector('.cart_section-container');
        if (!container) return;

        // Используем делегирование событий для кнопок раскрытия
        // Добавляем обработчик только один раз
        if (!accordionInitialized2) {
            container.addEventListener('click', handleDropdownClick2);
            accordionInitialized2 = true;
        }
    }

    // Обработчик клика для раскрытия/сворачивания dropdown
    function handleDropdownClick2(e) {
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
            closeAllDropdowns2();
            
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
                        initNestedDragAndDrop2(itemsContainer);
                    }, 100);
                }
            }
        }
    }

    // Инициализация при загрузке страницы
    function init2() {
        if (document.querySelector('.cart_section')) {
            // Очищаем все placeholders при загрузке (на случай, если они остались)
            cleanupAllPlaceholders2();
            cleanupEmptyContentContainers2();
            cleanupEmptyContentContainers2(); // Двойной вызов для гарантии
            
            initDeleteModal2();
            initDropdownAccordion2();
            initDragAndDrop2();
            initCheckboxes2();
            initDeleteItems2();
            // Инициализируем видимость кнопок при загрузке
            updateSelectedCount2();
        }
    }

    // Запуск при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init2);
    } else {
        init2();
    }

})();

