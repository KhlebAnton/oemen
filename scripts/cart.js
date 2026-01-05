// Функционал корзины: перетаскивание товаров и работа с чекбоксами

(function() {
    'use strict';

    // Инициализация drag and drop для товаров внутри категории
    function initDragAndDrop() {
        const categoryItems = document.querySelectorAll('.cart_category__items');
        
        categoryItems.forEach(itemsContainer => {
            const items = itemsContainer.querySelectorAll('.cart_category__item');
            
            items.forEach(item => {
                const dragHandle = item.querySelector('.btn__moving');
                if (!dragHandle) return;
                
                // Делаем весь элемент перетаскиваемым через handle
                dragHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    startDrag(item, itemsContainer, e);
                });
                
                // Для touch устройств
                dragHandle.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    startDrag(item, itemsContainer, {
                        clientY: touch.clientY,
                        clientX: touch.clientX,
                        pageY: touch.pageY,
                        pageX: touch.pageX
                    });
                });
                
            });
        });
    }

    let draggedElement = null;
    let isDragging = false;

    function startDrag(item, container, event) {
        // Начинаем drag сразу при нажатии на handle
        draggedElement = item;
        isDragging = true;
        initDrag(item, container);
    }

    function initDrag(item, container) {
        
        // Добавляем класс для визуального эффекта
        item.classList.add('cart_category__item--dragging');
        
        // Обработчики для перемещения
        const moveHandler = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            handleDragMove(clientY, container);
        };
        
        const endHandler = (e) => {
            if (!isDragging) return;
            e.preventDefault();
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
        if (!draggedElement) return;
        
        // Исключаем draggedElement из поиска
        const items = Array.from(container.querySelectorAll('.cart_category__item:not(.cart_category__item--dragging)'));
        
        let nextSibling = null;
        
        // Находим позицию для элемента только по вертикали (вверх-вниз)
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const rect = item.getBoundingClientRect();
            const itemMiddle = rect.top + rect.height / 2;
            
            if (clientY < itemMiddle) {
                nextSibling = item;
                break;
            }
        }
        
        // Перемещаем сам элемент в новую позицию (только если позиция изменилась)
        if (nextSibling) {
            // Проверяем, что элемент еще не находится перед этим nextSibling
            if (draggedElement.nextSibling !== nextSibling) {
                container.insertBefore(draggedElement, nextSibling);
            }
        } else {
            // Если nextSibling не найден, элемент должен быть в конце
            if (draggedElement.nextSibling !== null) {
                container.appendChild(draggedElement);
            }
        }
    }

    function endDrag(container) {
        if (!draggedElement) return;
        
        // Убираем класс для визуального эффекта
        draggedElement.classList.remove('cart_category__item--dragging');
        
        // Удаляем обработчики
        if (draggedElement._moveHandler) {
            document.removeEventListener('mousemove', draggedElement._moveHandler);
            document.removeEventListener('touchmove', draggedElement._moveHandler);
        }
        if (draggedElement._endHandler) {
            document.removeEventListener('mouseup', draggedElement._endHandler);
            document.removeEventListener('touchend', draggedElement._endHandler);
            document.removeEventListener('touchcancel', draggedElement._endHandler);
        }
        
        // Очищаем ссылки на обработчики
        delete draggedElement._moveHandler;
        delete draggedElement._endHandler;
        
        draggedElement = null;
        isDragging = false;
    }

    // Работа с чекбоксами
    function initCheckboxes() {
        // Обработка чекбоксов товаров
        const itemCheckboxes = document.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]');
        itemCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateCheckboxState);
        });
        
        // Обработка "Выбрать все"
        const selectAllCheckboxes = document.querySelectorAll('.cart_choose_all input[type="checkbox"]');
        selectAllCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleSelectAll);
        });
        
        // Инициализация счетчика
        updateSelectedCount();
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
        
        // Используем делегирование событий для удаления всей подборки
        container.addEventListener('click', (e) => {
            const deleteCartButton = e.target.closest('.trash_cart');
            if (deleteCartButton) {
                e.preventDefault();
                e.stopPropagation();
                openDeleteModal('Очистить всю подборку? Все товары будут удалены.', () => {
                    clearCart(container);
                });
            }
        });
        
        deleteItemsInitialized = true;
    }

    function deleteItem(item) {
        if (!item) return;
        
        // Сохраняем ссылку на категорию до удаления
        const category = item.closest('.cart_category');
        
        // Удаляем элемент из DOM
        item.remove();
        
        // Обновляем счетчик и состояние чекбоксов
        updateSelectedCount();
        updateSelectAllState();
        
        // Проверяем, не осталась ли категория пустой
        if (category) {
            const remainingItems = category.querySelectorAll('.cart_category__item');
            if (remainingItems.length === 0) {
                // Удаляем всю категорию, если товаров не осталось
                category.remove();
            }
        }
        
        // Переинициализируем drag and drop для оставшихся элементов
        initDragAndDrop();
    }

    function clearCart(container) {
        if (!container) return;
        
        // Удаляем все товары
        const allItems = container.querySelectorAll('.cart_category__item');
        allItems.forEach(item => {
            item.remove();
        });
        
        // Удаляем все категории
        const allCategories = container.querySelectorAll('.cart_category');
        allCategories.forEach(category => {
            category.remove();
        });
        
        // Сбрасываем счетчик и чекбоксы
        updateSelectedCount();
        updateSelectAllState();
        
        // Переинициализируем drag and drop
        initDragAndDrop();
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
        const container = document.querySelector('.cart_section-container');
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
        const container = document.querySelector('.cart_section-container');
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

