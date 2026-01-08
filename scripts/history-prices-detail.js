// Функционал для history_prices_detail.html: перетаскивание товаров и работа с чекбоксами
// Логика "Выбрать все" работает только внутри своей категории

(function() {
    'use strict';

    // Инициализация drag and drop для товаров внутри категории
    function initDragAndDrop() {
        const categoryItems = document.querySelectorAll('.cart_category__items');
        
        categoryItems.forEach(itemsContainer => {
            // Исключаем placeholders из инициализации
            const items = itemsContainer.querySelectorAll('.cart_category__item:not(.cart_category__item--placeholder)');
            
            items.forEach(item => {
                const dragHandle = item.querySelector('.btn__moving');
                if (!dragHandle) return;
                
                // Удаляем старые обработчики, если они есть (чтобы избежать дублирования)
                const newMouseHandler = (e) => {
                    e.preventDefault();
                    startDrag(item, itemsContainer, e);
                };
                const newTouchHandler = (e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    startDrag(item, itemsContainer, {
                        clientY: touch.clientY,
                        clientX: touch.clientX,
                        pageY: touch.pageY,
                        pageX: touch.pageX
                    });
                };
                
                // Удаляем старые обработчики, если они были сохранены
                if (dragHandle._mouseHandler) {
                    dragHandle.removeEventListener('mousedown', dragHandle._mouseHandler);
                }
                if (dragHandle._touchHandler) {
                    dragHandle.removeEventListener('touchstart', dragHandle._touchHandler);
                }
                
                // Сохраняем ссылки на обработчики
                dragHandle._mouseHandler = newMouseHandler;
                dragHandle._touchHandler = newTouchHandler;
                
                // Добавляем новые обработчики
                dragHandle.addEventListener('mousedown', newMouseHandler);
                dragHandle.addEventListener('touchstart', newTouchHandler);
            });
        });
    }

    let draggedElement = null;
    let isDragging = false;

    function startDrag(item, container, event) {
        // Добавляем класс на body для блокировки всех элементов
        document.body.classList.add('is-dragging');
        
        // Сохраняем исходный контейнер категории - элемент можно перемещать только внутри него
        item._originalContainer = container;
        
        // Сохраняем начальную позицию элемента
        const rect = item.getBoundingClientRect();
        item._startX = event.clientX || 0;
        item._startY = event.clientY || 0;
        item._offsetX = (event.clientX || 0) - rect.left;
        item._offsetY = (event.clientY || 0) - rect.top;
        
        // Начинаем drag сразу при нажатии на handle
        draggedElement = item;
        isDragging = true;
        initDrag(item, container);
    }

    function initDrag(item, container) {
        // Сначала удаляем все старые placeholders в этом контейнере
        const oldPlaceholders = container.querySelectorAll('.cart_category__item--placeholder');
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
        container.insertBefore(placeholder, item);
        
        // Обработчики для перемещения
        const moveHandler = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            e.stopPropagation();
            
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            
            // Обновляем позицию элемента для следования за курсором
            item.style.left = (clientX - item._offsetX) + 'px';
            item.style.top = (clientY - item._offsetY) + 'px';
            
            // Определяем новую позицию
            handleDragMove(clientY, container);
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

    function handleDragMove(clientY, container) {
        if (!draggedElement || !draggedElement._placeholder) return;
        
        // Элемент можно перемещать только внутри исходного контейнера категории
        const originalContainer = draggedElement._originalContainer;
        if (!originalContainer || container !== originalContainer) {
            return; // Не позволяем перемещать в другую категорию
        }
        
        // Удаляем все лишние placeholders в контейнере (кроме текущего)
        const allPlaceholders = container.querySelectorAll('.cart_category__item--placeholder');
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
        const items = Array.from(container.querySelectorAll('.cart_category__item:not(.cart_category__item--dragging):not(.cart_category__item--placeholder)'));
        
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
            const placeholder = draggedElement._placeholder;
            const currentPlaceholderNext = placeholder.nextSibling;
            
            if (insertBefore) {
                if (currentPlaceholderNext !== targetItem) {
                    container.insertBefore(placeholder, targetItem);
                }
            } else {
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
        const item = draggedElement;
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
        
        // Удаляем обработчики
        if (item._moveHandler) {
            document.removeEventListener('mousemove', item._moveHandler);
            document.removeEventListener('touchmove', item._moveHandler);
        }
        if (item._endHandler) {
            document.removeEventListener('mouseup', item._endHandler);
            document.removeEventListener('touchend', item._endHandler);
            document.removeEventListener('touchcancel', item._endHandler);
        }
        
        // Очищаем ссылки на обработчики и данные
        delete item._moveHandler;
        delete item._endHandler;
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
        
        draggedElement = null;
        isDragging = false;
        
        // Агрессивная очистка всех placeholders во всех контейнерах
        cleanupAllPlaceholders();
        cleanupAllPlaceholders(); // Двойной вызов для гарантии
        
        // Дополнительная очистка с задержками для гарантии
        requestAnimationFrame(() => {
            cleanupAllPlaceholders();
        });
        
        setTimeout(() => {
            cleanupAllPlaceholders();
        }, 0);
        
        setTimeout(() => {
            cleanupAllPlaceholders();
        }, 10);
        
        setTimeout(() => {
            cleanupAllPlaceholders();
        }, 50);
    }

    // Универсальная функция для удаления всех placeholders
    function cleanupAllPlaceholders() {
        const mainContainer = document.querySelector('.cart_section-container');
        if (!mainContainer) return;
        
        // Список всех возможных селекторов для placeholder элементов
        const placeholderSelectors = [
            '.cart_category__item--placeholder',
            '.cart_category_item--placeholder' // Вариант с одним подчеркиванием
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
            
            if (hasPlaceholderClass) {
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
    }

    // Работа с чекбоксами
    function initCheckboxes() {
        // Обработка чекбоксов товаров
        const itemCheckboxes = document.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]');
        itemCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleCheckboxChange);
        });
        
        // Обработка "Выбрать все" - для каждой категории отдельно
        const selectAllCheckboxes = document.querySelectorAll('.cart_choose_all input[type="checkbox"]');
        selectAllCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleSelectAll);
        });
        
        // Инициализация счетчика и состояния чекбоксов
        updateSelectedCount();
        updateSelectAllState();
    }

    // Обработка изменения чекбокса
    function handleCheckboxChange(e) {
        const checkbox = e.target;
        updateCheckboxState();
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
        if (item.classList.contains('cart_category__item--dragging')) {
            const container = item.closest('.cart_category__items');
            if (container) {
                endDrag(container);
            }
        }
        
        // Удаляем placeholder, если он существует
        if (item._placeholder && item._placeholder.parentNode) {
            item._placeholder.remove();
        }
        
        // Сохраняем ссылку на категорию до удаления
        const category = item.closest('.cart_category');
        
        // Удаляем элемент из DOM
        item.remove();
        
        // Удаляем все оставшиеся placeholders в контейнере (на случай, если они остались)
        cleanupAllPlaceholders();
        
        // Обновляем счетчик и состояние чекбоксов
        updateSelectedCount();
        updateSelectAllState();
        
        // Проверяем, не осталась ли категория пустой
        if (category) {
            const remainingItems = category.querySelectorAll('.cart_category__item:not(.cart_category__item--placeholder)');
            if (remainingItems.length === 0) {
                // Удаляем всю категорию, если товаров не осталось
                category.remove();
            }
        }
        
        // Переинициализируем drag and drop для оставшихся элементов
        initDragAndDrop();
        
        // Агрессивная очистка с несколькими задержками для гарантии удаления всех пустых контейнеров
        requestAnimationFrame(() => {
            cleanupAllPlaceholders();
        });
        
        setTimeout(() => {
            cleanupAllPlaceholders();
        }, 0);
        
        setTimeout(() => {
            cleanupAllPlaceholders();
        }, 10);
        
        setTimeout(() => {
            cleanupAllPlaceholders();
        }, 50);
        
        setTimeout(() => {
            cleanupAllPlaceholders();
        }, 100);
    }

    function updateCheckboxState() {
        updateSelectedCount();
        updateSelectAllState();
    }

    // Обработка "Выбрать все" - работает только внутри своей категории
    function handleSelectAll(e) {
        const isChecked = e.target.checked;
        // Находим категорию, в которой находится этот чекбокс "Выбрать все"
        const category = e.target.closest('.cart_category');
        if (!category) return;
        
        // Находим все чекбоксы товаров только в этой категории
        const itemsContainer = category.querySelector('.cart_category__items');
        if (!itemsContainer) return;
        
        const itemCheckboxes = itemsContainer.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]');
        itemCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        
        // Обновляем счетчик только для этой категории
        updateSelectedCount();
        
        // Обновляем состояние чекбокса "Выбрать все" только для этой категории
        updateSelectAllState();
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
            
            // Находим все чекбоксы товаров только в этой категории
            const itemsContainer = category.querySelector('.cart_category__items');
            if (!itemsContainer) return;
            
            const itemCheckboxes = itemsContainer.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]');
            const checkedCount = itemsContainer.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]:checked').length;
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
            
            // Находим все чекбоксы товаров только в этой категории
            const itemsContainer = category.querySelector('.cart_category__items');
            if (!itemsContainer) return;
            
            // Подсчитываем количество выбранных товаров только в этой категории
            const checkedCount = itemsContainer.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]:checked').length;
            
            // Обновляем счетчик только для этой категории
            countElement.textContent = checkedCount;
        });
        
        // Показываем/скрываем кнопки внизу в зависимости от общего количества выбранных товаров
        const totalCheckedCount = container.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]:checked').length;
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

    // Инициализация при загрузке страницы
    function init() {
        if (document.querySelector('.cart_section')) {
            // Очищаем все placeholders при загрузке (на случай, если они остались)
            cleanupAllPlaceholders();
            cleanupAllPlaceholders(); // Двойной вызов для гарантии
            
            initDeleteModal();
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

