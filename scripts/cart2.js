// Функционал корзины-2: перетаскивание товаров и работа с чекбоксами для cart2.html

(function() {
    'use strict';

    // Инициализация drag and drop для товаров внутри категории
    function initDragAndDrop2() {
        const categoryItems = document.querySelectorAll('.cart_category__items');
        
        categoryItems.forEach(itemsContainer => {
            // В cart2.html перемещаем .cart_category__item__dropdown элементы
            const dropdowns = itemsContainer.querySelectorAll('.cart_category__item__dropdown');
            
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
        draggedNestedElement2 = item;
        isNestedDragging2 = true;
        initNestedDrag2(item, contentContainer);
    }

    function initNestedDrag2(item, contentContainer) {
        // Добавляем класс для визуального эффекта
        item.classList.add('cart_category__item--dragging');
        
        // Обработчики для перемещения
        const moveHandler = (e) => {
            if (!isNestedDragging2) return;
            e.preventDefault();
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            handleNestedDragMove2(clientY, contentContainer);
        };
        
        const endHandler = (e) => {
            if (!isNestedDragging2) return;
            e.preventDefault();
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
        if (!draggedNestedElement2) return;
        
        // Исключаем draggedElement из поиска
        const items = Array.from(contentContainer.querySelectorAll('.cart_category__item:not(.cart_category__item--dragging)'));
        
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
            if (draggedNestedElement2.nextSibling !== nextSibling) {
                contentContainer.insertBefore(draggedNestedElement2, nextSibling);
            }
        } else {
            if (draggedNestedElement2.nextSibling !== null) {
                contentContainer.appendChild(draggedNestedElement2);
            }
        }
    }

    function endNestedDrag2() {
        if (!draggedNestedElement2) return;
        
        // Убираем класс для визуального эффекта
        draggedNestedElement2.classList.remove('cart_category__item--dragging');
        
        // Удаляем обработчики
        if (draggedNestedElement2._nestedMoveHandler2) {
            document.removeEventListener('mousemove', draggedNestedElement2._nestedMoveHandler2);
            document.removeEventListener('touchmove', draggedNestedElement2._nestedMoveHandler2);
        }
        if (draggedNestedElement2._nestedEndHandler2) {
            document.removeEventListener('mouseup', draggedNestedElement2._nestedEndHandler2);
            document.removeEventListener('touchend', draggedNestedElement2._nestedEndHandler2);
            document.removeEventListener('touchcancel', draggedNestedElement2._nestedEndHandler2);
        }
        
        // Очищаем ссылки на обработчики
        delete draggedNestedElement2._nestedMoveHandler2;
        delete draggedNestedElement2._nestedEndHandler2;
        
        draggedNestedElement2 = null;
        isNestedDragging2 = false;
    }

    let draggedElement2 = null;
    let isDragging2 = false;

    function startDrag2(dropdown, container, event) {
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
        
        // Добавляем класс для визуального эффекта
        dropdown.classList.add('cart_category__item__dropdown--dragging');
        
        // Обработчики для перемещения
        const moveHandler = (e) => {
            if (!isDragging2) return;
            e.preventDefault();
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            handleDragMove2(clientY, container);
        };
        
        const endHandler = (e) => {
            if (!isDragging2) return;
            e.preventDefault();
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

    function handleDragMove2(clientY, container) {
        if (!draggedElement2) return;
        
        // Исключаем draggedElement из поиска
        const dropdowns = Array.from(container.querySelectorAll('.cart_category__item__dropdown:not(.cart_category__item__dropdown--dragging)'));
        
        let nextSibling = null;
        
        // Находим позицию для элемента только по вертикали (вверх-вниз)
        for (let i = 0; i < dropdowns.length; i++) {
            const dropdown = dropdowns[i];
            const rect = dropdown.getBoundingClientRect();
            const itemMiddle = rect.top + rect.height / 2;
            
            if (clientY < itemMiddle) {
                nextSibling = dropdown;
                break;
            }
        }
        
        // Перемещаем сам элемент в новую позицию (только если позиция изменилась)
        if (nextSibling) {
            // Проверяем, что элемент еще не находится перед этим nextSibling
            if (draggedElement2.nextSibling !== nextSibling) {
                container.insertBefore(draggedElement2, nextSibling);
            }
        } else {
            // Если nextSibling не найден, элемент должен быть в конце
            if (draggedElement2.nextSibling !== null) {
                container.appendChild(draggedElement2);
            }
        }
    }

    function endDrag2(container) {
        if (!draggedElement2) return;
        
        // Убираем класс для визуального эффекта
        draggedElement2.classList.remove('cart_category__item__dropdown--dragging');
        
        // Удаляем обработчики
        if (draggedElement2._moveHandler2) {
            document.removeEventListener('mousemove', draggedElement2._moveHandler2);
            document.removeEventListener('touchmove', draggedElement2._moveHandler2);
        }
        if (draggedElement2._endHandler2) {
            document.removeEventListener('mouseup', draggedElement2._endHandler2);
            document.removeEventListener('touchend', draggedElement2._endHandler2);
            document.removeEventListener('touchcancel', draggedElement2._endHandler2);
        }
        
        // Очищаем ссылки на обработчики
        delete draggedElement2._moveHandler2;
        delete draggedElement2._endHandler2;
        
        draggedElement2 = null;
        isDragging2 = false;
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
        
        // Сохраняем ссылки на категорию и dropdown до удаления
        const category = item.closest('.cart_category');
        const dropdown = item.closest('.cart_category__item__dropdown');
        
        // Если это основной товар в dropdown, удаляем весь dropdown
        if (dropdown) {
            const mainItem = dropdown.querySelector('.cart_category__item');
            if (item === mainItem) {
                // Это основной товар - удаляем весь dropdown
                dropdown.remove();
            } else {
                // Это вложенный товар - удаляем только его
                item.remove();
                
                // Проверяем, не осталось ли в dropdown только основной товар без вложенных
                const content = dropdown.querySelector('.cart_category__item__content');
                if (content) {
                    const nestedItems = content.querySelectorAll('.cart_category__item');
                    if (nestedItems.length === 0) {
                        // Если вложенных товаров не осталось, можно скрыть content или удалить dropdown
                        // В зависимости от требований, оставляем dropdown с основным товаром
                    }
                }
            }
        } else {
            // Если dropdown не найден, удаляем сам элемент
            item.remove();
        }
        
        // Обновляем счетчик и состояние чекбоксов
        updateSelectedCount2();
        updateSelectAllState2();
        
        // Проверяем, не осталась ли категория пустой
        if (category) {
            const remainingDropdowns = category.querySelectorAll('.cart_category__item__dropdown');
            if (remainingDropdowns.length === 0) {
                // Удаляем всю категорию, если товаров не осталось
                category.remove();
            }
        }
        
        // Переинициализируем drag and drop для оставшихся элементов
        initDragAndDrop2();
        initDropdownAccordion2();
    }

    function clearCart2(container) {
        if (!container) return;
        
        // Удаляем все dropdown элементы (в cart2.html это основные контейнеры товаров)
        const allDropdowns = container.querySelectorAll('.cart_category__item__dropdown');
        allDropdowns.forEach(dropdown => {
            dropdown.remove();
        });
        
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
        const container = e.target.closest('.cart_section-container');
        if (!container) return;
        
        // Синхронизируем все чекбоксы "Выбрать все"
        const allSelectAllCheckboxes = container.querySelectorAll('.cart_choose_all input[type="checkbox"]');
        allSelectAllCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            checkbox.indeterminate = false;
        });
        
        // Находим все чекбоксы товаров в этом контейнере (включая вложенные)
        const itemCheckboxes = container.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]');
        itemCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        
        updateSelectedCount2();
    }

    function updateSelectAllState2() {
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

    function updateSelectedCount2() {
        const container = document.querySelector('.cart_section-container');
        if (!container) return;
        
        const checkedCount = container.querySelectorAll('.cart_category__item .label_choose input[type="checkbox"]:checked').length;
        const countElements = container.querySelectorAll('.choose-count');
        
        countElements.forEach(element => {
            element.textContent = checkedCount;
        });
        
        // Показываем/скрываем кнопки внизу в зависимости от выбранных товаров
        updateCartButtonsVisibility2(checkedCount);
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
    function initDropdownAccordion2() {
        const container = document.querySelector('.cart_section-container');
        if (!container) return;

        // Используем делегирование событий для кнопок раскрытия
        container.addEventListener('click', (e) => {
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
        });
    }

    // Инициализация при загрузке страницы
    function init2() {
        if (document.querySelector('.cart_section')) {
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

