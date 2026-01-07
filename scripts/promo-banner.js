// Функционал работы с баннерами в модалке выгрузки
(function() {
    'use strict';

    function initPromoBanner() {
        const modalXlsx = document.querySelector('[data-modal-id="modal-save-cart-xlsx"]');
        const modalBanner = document.querySelector('[data-modal-id="modal-save-cart-banner"]');
        
        if (!modalXlsx || !modalBanner) return;
        
        const bannerContainer = modalXlsx.querySelector('.promo-banner-container');
        const bannerItems = modalBanner.querySelectorAll('.promo-banner__item');
        const selectBannerBtn = modalBanner.querySelector('.btn_primary');
        const closeBannerModal = modalBanner.querySelector('.modal_close');
        const closeXlsxModal = modalXlsx.querySelector('.modal_close');
        
        let currentRow = null; // Текущая строка, для которой выбирается баннер
        let selectedBanner = null; // Выбранный баннер
        
        // Открытие модалки выбора баннера
        function openBannerModal(row) {
            currentRow = row;
            selectedBanner = null;
            
            // Сбрасываем активный баннер
            bannerItems.forEach(item => item.classList.remove('is-active'));
            
            if (modalBanner) {
                modalBanner.classList.add('is-open');
                if (typeof lockScroll === 'function') {
                    lockScroll();
                }
            }
        }
        
        // Закрытие модалки выбора баннера
        function closeBannerModalFunc() {
            if (modalBanner) {
                modalBanner.classList.remove('is-open');
            }
            if (typeof unlockScroll === 'function') {
                unlockScroll();
            }
            currentRow = null;
            selectedBanner = null;
        }
        
        // Выбор баннера в модалке
        bannerItems.forEach(item => {
            item.addEventListener('click', () => {
                bannerItems.forEach(i => i.classList.remove('is-active'));
                item.classList.add('is-active');
                selectedBanner = item;
            });
        });
        
        // Кнопка "Выбрать" в модалке баннеров
        if (selectBannerBtn) {
            selectBannerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (selectedBanner && currentRow) {
                    const bannerName = selectedBanner.getAttribute('data-promo_name');
                    const bannerImg = selectedBanner.querySelector('img');
                    const bannerSrc = bannerImg ? bannerImg.src : '';
                    
                    // Сохраняем ссылку на строку перед закрытием модалки
                    const rowToUpdate = currentRow;
                    
                    // Сохраняем данные баннера в строке
                    rowToUpdate.setAttribute('data-banner-name', bannerName);
                    rowToUpdate.setAttribute('data-banner-src', bannerSrc);
                    
                    // Показываем название баннера в строке (вместо кнопки "Выбрать")
                    const bannerColumn = rowToUpdate.querySelector('[data-coloumn="Баннер"]');
                    if (bannerColumn) {
                        // Полностью очищаем содержимое перед заменой
                        while (bannerColumn.firstChild) {
                            bannerColumn.removeChild(bannerColumn.firstChild);
                        }
                        
                        // Создаем новую структуру с названием баннера
                        const fileDiv = document.createElement('div');
                        fileDiv.className = 'promo-banner__file';
                        
                        const nameSpan = document.createElement('span');
                        nameSpan.className = 'promo-banner__file-name';
                        nameSpan.textContent = bannerName;
                        
                        const delDiv = document.createElement('div');
                        delDiv.className = 'promo-banner__file_del';
                        
                        fileDiv.appendChild(nameSpan);
                        fileDiv.appendChild(delDiv);
                        bannerColumn.appendChild(fileDiv);
                        
                        // Добавляем обработчик удаления для временного отображения
                        delDiv.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Удаляем только баннер
                            removeBannerOnly(rowToUpdate);
                        });
                    }
                    
                    // Обновляем состояние строки после выбора баннера
                    updateRowState(rowToUpdate);
                    
                    closeBannerModalFunc();
                }
            });
        }
        
        // Закрытие модалки баннеров
        if (closeBannerModal) {
            closeBannerModal.addEventListener('click', () => {
                closeBannerModalFunc();
            });
        }
        
        // Закрытие при клике вне модалки баннеров
        document.addEventListener('click', (e) => {
            if (modalBanner && modalBanner.classList.contains('is-open') && 
                !e.target.closest('.modal_content') && 
                !e.target.closest('.promo-banner__file_btn')) {
                closeBannerModalFunc();
            }
        });
        
        // Обработка кнопок "Выбрать" в форме
        if (bannerContainer) {
            bannerContainer.addEventListener('click', (e) => {
                const selectBtn = e.target.closest('.promo-banner__file_btn');
                if (selectBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const row = selectBtn.closest('.promo-banner__row');
                    if (row && !row.classList.contains('promo-banner__top-row')) {
                        openBannerModal(row);
                    }
                }
            });
        }
        
        // Превращение строки в состояние с баннером
        function convertRowToBannerState(row, bannerName, position) {
            const bannerColumn = row.querySelector('[data-coloumn="Баннер"]');
            const positionColumn = row.querySelector('[data-coloumn="Позиция"]');
            
            if (!bannerColumn || !positionColumn) return;
            
            // Сохраняем данные
            const bannerSrc = row.getAttribute('data-banner-src') || '';
            
            // Создаем структуру с баннером
            bannerColumn.innerHTML = `
                <div class="promo-banner__file">
                    <span class="promo-banner__file-name">${bannerName}</span>
                    <div class="promo-banner__file_del"></div>
                </div>
            `;
            
            positionColumn.innerHTML = `
                <div class="promo-banner__position">
                    <input type="number" placeholder="Позиция" name="position" required readonly value="${position}">
                    <button class="btn btn_primary promo-banner__position-btn promo-banner__position-btn--add" style="display: none;">Добавить</button>
                    <button class="btn btn_primary promo-banner__position-btn promo-banner__position-btn--delete">Удалить</button>
                </div>
            `;
            
            // Сохраняем данные в строке
            row.setAttribute('data-banner-name', bannerName);
            row.setAttribute('data-banner-position', position);
        }
        
        // Удаление только баннера (возврат кнопки "Выбрать", но позиция остается)
        function removeBannerOnly(row) {
            const bannerColumn = row.querySelector('[data-coloumn="Баннер"]');
            
            if (!bannerColumn) return;
            
            // Возвращаем кнопку "Выбрать"
            while (bannerColumn.firstChild) {
                bannerColumn.removeChild(bannerColumn.firstChild);
            }
            const selectBtn = document.createElement('button');
            selectBtn.className = 'btn btn_primary promo-banner__file_btn';
            selectBtn.setAttribute('data-coloumn', 'Баннер');
            selectBtn.textContent = 'Выбрать';
            bannerColumn.appendChild(selectBtn);
            
            // Удаляем данные баннера
            row.removeAttribute('data-banner-name');
            row.removeAttribute('data-banner-src');
            
            // Обновляем состояние строки
            updateRowState(row);
        }
        
        // Удаление строки с позицией (удаляется вся строка целиком)
        function removePositionOnly(row) {
            // ВАЖНО: удаляется ВСЯ строка целиком, а не только позиция
            if (!row || !row.parentNode) return; // Проверяем, что строка существует
            
            // Не удаляем заголовок
            if (row.classList.contains('promo-banner__top-row')) return;
            
            // Удаляем строку из DOM
            row.remove();
            
            // После удаления строки проверяем наличие пустой строки
            // Всегда должна быть хотя бы одна пустая строка
            ensureEmptyRow();
        }
        
        // Удаление строки с баннером (превращение обратно в форму добавления)
        function removeBannerRow(row) {
            const bannerColumn = row.querySelector('[data-coloumn="Баннер"]');
            const positionColumn = row.querySelector('[data-coloumn="Позиция"]');
            
            if (!bannerColumn || !positionColumn) return;
            
            // Превращаем обратно в форму добавления
            while (bannerColumn.firstChild) {
                bannerColumn.removeChild(bannerColumn.firstChild);
            }
            const selectBtn = document.createElement('button');
            selectBtn.className = 'btn btn_primary promo-banner__file_btn';
            selectBtn.setAttribute('data-coloumn', 'Баннер');
            selectBtn.textContent = 'Выбрать';
            bannerColumn.appendChild(selectBtn);
            
            while (positionColumn.firstChild) {
                positionColumn.removeChild(positionColumn.firstChild);
            }
            const positionDiv = document.createElement('div');
            positionDiv.className = 'promo-banner__position';
            
            const positionInput = document.createElement('input');
            positionInput.type = 'number';
            positionInput.placeholder = 'Позиция';
            positionInput.name = 'position';
            positionInput.value = '';
            
            const addBtn = document.createElement('button');
            addBtn.className = 'btn btn_primary promo-banner__position-btn promo-banner__position-btn--add';
            addBtn.textContent = 'Добавить';
            addBtn.disabled = false; // Кнопка всегда активна
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn_primary promo-banner__position-btn promo-banner__position-btn--delete';
            deleteBtn.textContent = 'Удалить';
            deleteBtn.style.display = 'none';
            
            positionDiv.appendChild(positionInput);
            positionDiv.appendChild(addBtn);
            positionDiv.appendChild(deleteBtn);
            positionColumn.appendChild(positionDiv);
            
            // Удаляем данные
            row.removeAttribute('data-banner-name');
            row.removeAttribute('data-banner-src');
            row.removeAttribute('data-banner-position');
            
            // Обновляем состояние строки
            updateRowState(row);
        }
        
        // Создание новой пустой строки
        function createNewRow() {
            if (!bannerContainer) return null;
            
            const newRow = document.createElement('div');
            newRow.className = 'promo-banner__row';
            
            const bannerWrapper = document.createElement('div');
            bannerWrapper.className = 'promo-banner__file_wrapper';
            bannerWrapper.setAttribute('data-coloumn', 'Баннер');
            
            const selectBtn = document.createElement('button');
            selectBtn.className = 'btn btn_primary promo-banner__file_btn';
            selectBtn.textContent = 'Выбрать';
            bannerWrapper.appendChild(selectBtn);
            
            const positionWrapper = document.createElement('div');
            positionWrapper.className = 'promo-banner__position__wrapper';
            positionWrapper.setAttribute('data-coloumn', 'Позиция');
            
            const positionDiv = document.createElement('div');
            positionDiv.className = 'promo-banner__position';
            
            const positionInput = document.createElement('input');
            positionInput.type = 'number';
            positionInput.placeholder = 'Позиция';
            positionInput.name = 'position';
            
            const addBtn = document.createElement('button');
            addBtn.className = 'btn btn_primary promo-banner__position-btn promo-banner__position-btn--add';
            addBtn.textContent = 'Добавить';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn_primary promo-banner__position-btn promo-banner__position-btn--delete';
            deleteBtn.textContent = 'Удалить';
            deleteBtn.style.display = 'none';
            
            positionDiv.appendChild(positionInput);
            positionDiv.appendChild(addBtn);
            positionDiv.appendChild(deleteBtn);
            positionWrapper.appendChild(positionDiv);
            
            newRow.appendChild(bannerWrapper);
            newRow.appendChild(positionWrapper);
            
            // Вставляем новую строку после последней строки (но не после заголовка)
            const allRows = bannerContainer.querySelectorAll('.promo-banner__row');
            const lastRow = allRows[allRows.length - 1];
            if (lastRow) {
                lastRow.parentNode.insertBefore(newRow, lastRow.nextSibling);
            } else {
                bannerContainer.appendChild(newRow);
            }
            
            // Инициализируем состояние новой строки
            updateRowState(newRow);
            
            return newRow;
        }
        
        // Проверка наличия пустой строки и создание при необходимости
        // ВАЖНО: всегда должна быть ровно ОДНА пустая строка
        function ensureEmptyRow() {
            if (!bannerContainer) return;
            
            const allRows = bannerContainer.querySelectorAll('.promo-banner__row');
            let emptyRowCount = 0;
            
            // Подсчитываем количество пустых строк
            allRows.forEach(row => {
                if (row.classList.contains('promo-banner__top-row')) return;
                
                // Пропускаем строки, которые были удалены из DOM
                if (!row.parentNode) return;
                
                const bannerName = row.getAttribute('data-banner-name');
                const positionInput = row.querySelector('input[name="position"]');
                const deleteBtn = row.querySelector('.promo-banner__position-btn--delete');
                
                // Строка пустая (доступна для редактирования), если:
                // - нет баннера И нет добавленной позиции (кнопка "Удалить" скрыта)
                // - ИЛИ есть значение в инпуте, но оно не readonly (можно редактировать)
                const hasAddedPosition = deleteBtn && deleteBtn.style.display !== 'none';
                const hasPositionValue = positionInput && positionInput.value && positionInput.value.trim() !== '';
                const isReadonly = positionInput && (positionInput.hasAttribute('readonly') || positionInput.readOnly);
                
                // Строка считается пустой, если можно добавить позицию или баннер
                if (!bannerName && !hasAddedPosition && (!hasPositionValue || !isReadonly)) {
                    emptyRowCount++;
                }
            });
            
            // Если нет пустой строки, создаем одну
            if (emptyRowCount === 0) {
                createNewRow();
            }
            // Если пустых строк больше одной, удаляем лишние (оставляем только последнюю)
            else if (emptyRowCount > 1) {
                const emptyRows = [];
                allRows.forEach(row => {
                    if (row.classList.contains('promo-banner__top-row')) return;
                    if (!row.parentNode) return;
                    
                    const bannerName = row.getAttribute('data-banner-name');
                    const positionInput = row.querySelector('input[name="position"]');
                    const deleteBtn = row.querySelector('.promo-banner__position-btn--delete');
                    
                    const hasAddedPosition = deleteBtn && deleteBtn.style.display !== 'none';
                    const hasPositionValue = positionInput && positionInput.value && positionInput.value.trim() !== '';
                    const isReadonly = positionInput && (positionInput.hasAttribute('readonly') || positionInput.readOnly);
                    
                    if (!bannerName && !hasAddedPosition && (!hasPositionValue || !isReadonly)) {
                        emptyRows.push(row);
                    }
                });
                
                // Удаляем все пустые строки кроме последней
                for (let i = 0; i < emptyRows.length - 1; i++) {
                    emptyRows[i].remove();
                }
            }
        }
        
        // Обновление состояния строки (disabled кнопки, required инпута)
        function updateRowState(row) {
            const bannerName = row.getAttribute('data-banner-name');
            const positionColumn = row.querySelector('[data-coloumn="Позиция"]');
            
            if (!positionColumn) return;
            
            const positionInput = positionColumn.querySelector('input[name="position"]');
            const addBtn = positionColumn.querySelector('.promo-banner__position-btn--add');
            
            // Кнопка "Добавить" всегда активна (можно добавлять позицию без баннера)
            if (addBtn) {
                addBtn.disabled = false;
                addBtn.removeAttribute('disabled');
            }
            
            if (bannerName) {
                // Баннер выбран - инпут обязателен
                if (positionInput && !positionInput.hasAttribute('readonly')) {
                    positionInput.required = true;
                    positionInput.removeAttribute('readonly');
                    positionInput.readOnly = false;
                    // Убираем класс ошибки при обновлении состояния
                    positionInput.classList.remove('is-err');
                }
            } else {
                // Баннер не выбран - инпут не обязателен
                if (positionInput && !positionInput.hasAttribute('readonly')) {
                    positionInput.required = false;
                    // Убираем класс ошибки
                    positionInput.classList.remove('is-err');
                }
            }
        }
        
        // Обработка ввода в поле позиции (убираем класс ошибки при вводе и активируем кнопку)
        if (bannerContainer) {
            bannerContainer.addEventListener('input', (e) => {
                const positionInput = e.target;
                if (positionInput && positionInput.name === 'position') {
                    // Убираем класс ошибки при вводе
                    positionInput.classList.remove('is-err');
                    
                    // Убеждаемся, что инпут редактируемый (если позиция была очищена)
                    if (positionInput.hasAttribute('data-position-cleared')) {
                        if (positionInput.hasAttribute('readonly')) {
                            positionInput.removeAttribute('readonly');
                        }
                        positionInput.readOnly = false;
                    }
                    
                    // Убираем класс ошибки с кнопки если был
                    const row = positionInput.closest('.promo-banner__row');
                    if (row) {
                        const addBtn = row.querySelector('.promo-banner__position-btn--add');
                        if (addBtn) {
                            addBtn.classList.remove('is-err');
                            // Активируем кнопку при вводе значения
                            addBtn.disabled = false;
                            addBtn.removeAttribute('disabled');
                        }
                    }
                }
            });
            
            // Защита от сброса значения при фокусе
            bannerContainer.addEventListener('focus', (e) => {
                const positionInput = e.target;
                if (positionInput && positionInput.name === 'position') {
                    if (positionInput.hasAttribute('data-position-cleared')) {
                        if (positionInput.hasAttribute('readonly')) {
                            positionInput.removeAttribute('readonly');
                        }
                        positionInput.readOnly = false;
                    }
                }
            }, true);
        }
        
        // Функция для обновления обработчиков после изменения DOM
        function reinitBannerHandlers() {
            if (bannerContainer) {
                // Переинициализируем обработчики для новых элементов
                const allRows = bannerContainer.querySelectorAll('.promo-banner__row');
                allRows.forEach(row => {
                    if (row.classList.contains('promo-banner__top-row')) return;
                    
                    const deleteBtn = row.querySelector('.promo-banner__position-btn--delete');
                    const deleteFileBtn = row.querySelector('.promo-banner__file_del');
                    
                    // Обработчики уже установлены через делегирование событий, не нужно переинициализировать
                    
                    if (deleteFileBtn) {
                        const newDeleteFileBtn = deleteFileBtn.cloneNode(true);
                        deleteFileBtn.parentNode.replaceChild(newDeleteFileBtn, deleteFileBtn);
                        newDeleteFileBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeBannerOnly(row);
                        });
                    }
                });
            }
        }
        
        // Обработка кнопок "Добавить" и "Удалить" позиции (отдельные кнопки)
        if (bannerContainer) {
            bannerContainer.addEventListener('click', (e) => {
                // Обработка кнопки "Удалить" позиции
                const deleteBtn = e.target.closest('.promo-banner__position-btn--delete');
                if (deleteBtn) {
                    e.preventDefault();
                    e.stopPropagation(); // Предотвращаем закрытие модалки
                    const row = deleteBtn.closest('.promo-banner__row');
                    if (row && row.parentNode) {
                        // ВАЖНО: Удаляется ВСЯ строка целиком!
                        removePositionOnly(row);
                        return;
                    }
                }
                
                // Обработка кнопки "Добавить" позиции
                const addBtn = e.target.closest('.promo-banner__position-btn--add');
                if (addBtn && !addBtn.disabled) {
                    e.preventDefault();
                    e.stopPropagation(); // Предотвращаем закрытие модалки
                    const row = addBtn.closest('.promo-banner__row');
                    if (row) {
                        const positionInput = row.querySelector('input[name="position"]');
                        const bannerName = row.getAttribute('data-banner-name');
                        
                        if (positionInput) {
                            // Проверяем, что инпут не readonly
                            if (positionInput.hasAttribute('readonly') || positionInput.readOnly) {
                                return;
                            }
                            
                            const position = positionInput.value.trim();
                            
                            if (position && !isNaN(position)) {
                                // Убираем класс ошибки, если он был
                                positionInput.classList.remove('is-err');
                                addBtn.classList.remove('is-err');
                                
                                // Удаляем флаг очистки позиции
                                positionInput.removeAttribute('data-position-cleared');
                                
                                // Если есть баннер, используем convertRowToBannerState
                                if (bannerName) {
                                    convertRowToBannerState(row, bannerName, position);
                                } else {
                                    // Если баннера нет, просто добавляем позицию
                                    // Делаем инпут readonly и показываем кнопку "Удалить"
                                    positionInput.setAttribute('readonly', 'true');
                                    positionInput.readOnly = true;
                                    addBtn.style.display = 'none';
                                    const deleteBtn = row.querySelector('.promo-banner__position-btn--delete');
                                    if (deleteBtn) {
                                        deleteBtn.style.display = '';
                                    }
                                    row.setAttribute('data-banner-position', position);
                                }
                                
                                // После добавления позиции создаем новую пустую строку
                                createNewRow();
                                
                                // Обновляем обработчики после изменения DOM
                                setTimeout(() => {
                                    reinitBannerHandlers();
                                }, 0);
                            } else {
                                // Добавляем класс ошибки к инпуту и кнопке
                                positionInput.classList.add('is-err');
                                addBtn.classList.add('is-err');
                            }
                        }
                        return;
                    }
                }
                
                // Обработка кнопки удаления баннера
                const deleteFileBtn = e.target.closest('.promo-banner__file_del');
                if (deleteFileBtn) {
                    e.preventDefault();
                    e.stopPropagation(); // Предотвращаем закрытие модалки
                    const row = deleteFileBtn.closest('.promo-banner__row');
                    if (row) {
                        // Удаляем только баннер
                        removeBannerOnly(row);
                    }
                }
            });
        }
        
        // Инициализация обработчиков для уже существующих строк с баннерами
        if (bannerContainer) {
            const allRows = bannerContainer.querySelectorAll('.promo-banner__row');
            allRows.forEach(row => {
                // Пропускаем заголовок
                if (row.classList.contains('promo-banner__top-row')) return;
                
                const deleteBtn = row.querySelector('.promo-banner__position-btn');
                const deleteFileBtn = row.querySelector('.promo-banner__file_del');
                
                // Обработчики уже установлены через делегирование событий, не нужно добавлять здесь
                
                // Инициализируем состояние строки
                updateRowState(row);
                
                // Убеждаемся, что кнопка "Добавить" активна и инпут редактируемый
                const addBtn = row.querySelector('.promo-banner__position-btn--add');
                const positionInput = row.querySelector('input[name="position"]');
                
                if (addBtn) {
                    addBtn.disabled = false;
                    addBtn.removeAttribute('disabled');
                }
                
                // Убеждаемся, что инпут редактируемый (если не readonly)
                if (positionInput && !positionInput.hasAttribute('readonly')) {
                    positionInput.readOnly = false;
                    positionInput.removeAttribute('readonly');
                }
            });
            
            // Проверяем наличие пустой строки при инициализации
            ensureEmptyRow();
        }
        
        // Обработчик открытия модалки xlsx - проверяем наличие пустой строки
        if (modalXlsx) {
            // Используем MutationObserver для отслеживания открытия модалки
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (modalXlsx.classList.contains('is-open')) {
                            // Модалка открыта - проверяем наличие пустой строки
                            ensureEmptyRow();
                        }
                    }
                });
            });
            
            observer.observe(modalXlsx, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }
    
    // Инициализация при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPromoBanner);
    } else {
        initPromoBanner();
    }
    
})();

