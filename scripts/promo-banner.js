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
                    <button class="btn btn_primary promo-banner__position-btn">Удалить</button>
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
            addBtn.className = 'btn btn_primary promo-banner__position-btn';
            addBtn.textContent = 'Добавить';
            addBtn.disabled = true;
            
            positionDiv.appendChild(positionInput);
            positionDiv.appendChild(addBtn);
            positionColumn.appendChild(positionDiv);
            
            // Удаляем данные
            row.removeAttribute('data-banner-name');
            row.removeAttribute('data-banner-src');
            row.removeAttribute('data-banner-position');
            
            // Обновляем состояние строки
            updateRowState(row);
        }
        
        // Обновление состояния строки (disabled кнопки, required инпута)
        function updateRowState(row) {
            const bannerName = row.getAttribute('data-banner-name');
            const positionColumn = row.querySelector('[data-coloumn="Позиция"]');
            
            if (!positionColumn) return;
            
            const positionInput = positionColumn.querySelector('input[name="position"]');
            const addBtn = positionColumn.querySelector('.promo-banner__position-btn');
            
            if (bannerName) {
                // Баннер выбран - инпут обязателен, кнопка активна
                if (positionInput) {
                    positionInput.required = true;
                    positionInput.removeAttribute('readonly');
                    // Убираем класс ошибки при обновлении состояния
                    positionInput.classList.remove('is-err');
                }
                if (addBtn && addBtn.textContent.trim() === 'Добавить') {
                    addBtn.disabled = false;
                }
            } else {
                // Баннер не выбран - инпут не обязателен, кнопка disabled
                if (positionInput && !positionInput.hasAttribute('readonly')) {
                    positionInput.required = false;
                    positionInput.value = '';
                    // Убираем класс ошибки
                    positionInput.classList.remove('is-err');
                }
                if (addBtn && addBtn.textContent.trim() === 'Добавить') {
                    addBtn.disabled = true;
                }
            }
        }
        
        // Обработка ввода в поле позиции (убираем класс ошибки при вводе)
        if (bannerContainer) {
            bannerContainer.addEventListener('input', (e) => {
                const positionInput = e.target;
                if (positionInput && positionInput.name === 'position') {
                    // Убираем класс ошибки при вводе
                    positionInput.classList.remove('is-err');
                }
            });
        }
        
        // Функция для обновления обработчиков после изменения DOM
        function reinitBannerHandlers() {
            if (bannerContainer) {
                // Переинициализируем обработчики для новых элементов
                const allRows = bannerContainer.querySelectorAll('.promo-banner__row');
                allRows.forEach(row => {
                    if (row.classList.contains('promo-banner__top-row')) return;
                    
                    const deleteBtn = row.querySelector('.promo-banner__position-btn');
                    const deleteFileBtn = row.querySelector('.promo-banner__file_del');
                    
                    if (deleteBtn && deleteBtn.textContent.trim() === 'Удалить') {
                        // Удаляем старые обработчики и добавляем новые
                        const newDeleteBtn = deleteBtn.cloneNode(true);
                        deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
                        newDeleteBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeBannerRow(row);
                        });
                    }
                    
                    if (deleteFileBtn) {
                        const newDeleteFileBtn = deleteFileBtn.cloneNode(true);
                        deleteFileBtn.parentNode.replaceChild(newDeleteFileBtn, deleteFileBtn);
                        newDeleteFileBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeBannerRow(row);
                        });
                    }
                });
            }
        }
        
        // Обработка кнопок "Добавить"
        if (bannerContainer) {
            bannerContainer.addEventListener('click', (e) => {
                const addBtn = e.target.closest('.promo-banner__position-btn');
                if (addBtn && addBtn.textContent.trim() === 'Добавить') {
                    e.preventDefault();
                    e.stopPropagation(); // Предотвращаем закрытие модалки
                    const row = addBtn.closest('.promo-banner__row');
                    if (row) {
                        const positionInput = row.querySelector('input[name="position"]');
                        const bannerName = row.getAttribute('data-banner-name');
                        
                        if (positionInput && bannerName) {
                            const position = positionInput.value.trim();
                            
                            if (position && !isNaN(position)) {
                                // Убираем класс ошибки, если он был
                                positionInput.classList.remove('is-err');
                                convertRowToBannerState(row, bannerName, position);
                                // Обновляем обработчики после изменения DOM
                                setTimeout(() => {
                                    reinitBannerHandlers();
                                }, 0);
                            } else {
                                // Добавляем класс ошибки к инпуту
                                positionInput.classList.add('is-err');
                            }
                        } else {
                            alert('Сначала выберите баннер');
                        }
                    }
                }
            });
        }
        
        // Обработка кнопок "Удалить"
        if (bannerContainer) {
            bannerContainer.addEventListener('click', (e) => {
                const deleteBtn = e.target.closest('.promo-banner__position-btn');
                if (deleteBtn && deleteBtn.textContent.trim() === 'Удалить') {
                    e.preventDefault();
                    e.stopPropagation(); // Предотвращаем закрытие модалки
                    const row = deleteBtn.closest('.promo-banner__row');
                    if (row) {
                        removeBannerRow(row);
                    }
                }
                
                const deleteFileBtn = e.target.closest('.promo-banner__file_del');
                if (deleteFileBtn) {
                    e.preventDefault();
                    e.stopPropagation(); // Предотвращаем закрытие модалки
                    const row = deleteFileBtn.closest('.promo-banner__row');
                    if (row) {
                        // Проверяем, есть ли уже добавленная позиция
                        const positionBtn = row.querySelector('.promo-banner__position-btn');
                        if (positionBtn && positionBtn.textContent.trim() === 'Удалить') {
                            // Если позиция уже добавлена, удаляем всю строку
                            removeBannerRow(row);
                        } else {
                            // Если позиция не добавлена, удаляем только баннер
                            removeBannerOnly(row);
                        }
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
                
                // Если есть кнопка удаления, значит это строка с баннером
                if (deleteBtn && deleteBtn.textContent.trim() === 'Удалить') {
                    deleteBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        removeBannerRow(row);
                    });
                }
                
                if (deleteFileBtn) {
                    deleteFileBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        // Проверяем, есть ли уже добавленная позиция
                        const positionBtn = row.querySelector('.promo-banner__position-btn');
                        if (positionBtn && positionBtn.textContent.trim() === 'Удалить') {
                            // Если позиция уже добавлена, удаляем всю строку
                            removeBannerRow(row);
                        } else {
                            // Если позиция не добавлена, удаляем только баннер
                            removeBannerOnly(row);
                        }
                    });
                }
                
                // Инициализируем состояние строки
                updateRowState(row);
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

