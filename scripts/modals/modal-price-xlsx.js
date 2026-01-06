// Модалка выгрузки в .xlsx
const btnsModalSaveCartXlsx = document.querySelectorAll('[data-modal-btn="price-xlsx"]');
const modalSaveCartXlsx = document.querySelector('.modal_overlay[data-modal-id="modal-save-cart-xlsx"]');
const closeBtnModalSaveCartXlsx = modalSaveCartXlsx ? modalSaveCartXlsx.querySelector('.modal_close') : null;
const saveCartXlsxForm = modalSaveCartXlsx ? modalSaveCartXlsx.querySelector('.reserv_form') : null;

function openModalSaveCartXlsx() {
    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }

    if (modalSaveCartXlsx) {
        modalSaveCartXlsx.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
    }
}

function closeModalSaveCartXlsx() {
    if (modalSaveCartXlsx) {
        modalSaveCartXlsx.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
}

// Инициализация
if (btnsModalSaveCartXlsx.length > 0) {
    btnsModalSaveCartXlsx.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Проверяем, не заблокирована ли кнопка
            if (btn.classList.contains('btn--disabled')) {
                e.preventDefault();
                return;
            }
            openModalSaveCartXlsx();
        });
    });
}

if (closeBtnModalSaveCartXlsx) {
    closeBtnModalSaveCartXlsx.addEventListener('click', closeModalSaveCartXlsx);
}

// Закрытие при клике вне модалки
document.addEventListener('click', (e) => {
    if (modalSaveCartXlsx && modalSaveCartXlsx.classList.contains('is-open') && 
        !e.target.closest('.modal_content') && 
        !e.target.closest('[data-modal-btn="price-xlsx"]') &&
        !e.target.closest('.promo-banner__position-btn') &&
        !e.target.closest('.promo-banner__file_del') &&
        !e.target.closest('.promo-banner__file_btn')) {
        closeModalSaveCartXlsx();
    }
});

// Обработка отправки формы
if (saveCartXlsxForm) {
    saveCartXlsxForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(saveCartXlsxForm);
        const nameCart = formData.get('name-cart');
        const theme = formData.get('name-cart_theme');
        
        // Валидация: проверяем, что для выгрузки нужны И баннер И добавленная позиция
        const bannerContainer = modalSaveCartXlsx ? modalSaveCartXlsx.querySelector('.promo-banner-container') : null;
        if (bannerContainer) {
            const rows = bannerContainer.querySelectorAll('.promo-banner__row');
            let hasError = false;
            let errorMessages = [];
            
            // Сначала убираем все подсветки ошибок
            rows.forEach(row => {
                if (row.classList.contains('promo-banner__top-row')) return;
                
                const positionInput = row.querySelector('input[name="position"]');
                const addBtn = row.querySelector('.promo-banner__position-btn--add');
                const deleteBtn = row.querySelector('.promo-banner__position-btn--delete');
                const bannerColumn = row.querySelector('[data-coloumn="Баннер"]');
                const bannerFile = bannerColumn ? bannerColumn.querySelector('.promo-banner__file') : null;
                
                if (positionInput) {
                    positionInput.classList.remove('is-err');
                }
                if (addBtn) {
                    addBtn.classList.remove('is-err');
                }
                if (deleteBtn) {
                    deleteBtn.classList.remove('is-err');
                }
                if (bannerFile) {
                    bannerFile.classList.remove('is-err');
                }
            });
            
            rows.forEach(row => {
                // Пропускаем заголовок
                if (row.classList.contains('promo-banner__top-row')) return;
                
                const bannerName = row.getAttribute('data-banner-name');
                const positionInput = row.querySelector('input[name="position"]');
                const deleteBtn = row.querySelector('.promo-banner__position-btn--delete');
                const addBtn = row.querySelector('.promo-banner__position-btn--add');
                const bannerColumn = row.querySelector('[data-coloumn="Баннер"]');
                const bannerFile = bannerColumn ? bannerColumn.querySelector('.promo-banner__file') : null;
                const bannerSelectBtn = bannerColumn ? bannerColumn.querySelector('.promo-banner__file_btn') : null;
                
                // Проверяем, есть ли добавленная позиция (кнопка "Удалить" видима)
                const hasAddedPosition = deleteBtn && deleteBtn.style.display !== 'none';
                
                // Проверяем, есть ли значение в инпуте, но кнопка еще "Добавить" (не нажата)
                const hasPositionValue = positionInput && positionInput.value && positionInput.value.trim() !== '';
                const isAddButtonVisible = addBtn && addBtn.style.display !== 'none';
                const needsToAddPosition = hasPositionValue && isAddButtonVisible;
                
                // Если есть баннер, но нет добавленной позиции - ошибка
                if (bannerName && !hasAddedPosition) {
                    hasError = true;
                    // Подсвечиваем инпут позиции
                    if (positionInput) {
                        positionInput.classList.add('is-err');
                    }
                    // Если есть значение в инпуте, но не нажата кнопка "Добавить" - подсвечиваем кнопку
                    if (needsToAddPosition && addBtn) {
                        addBtn.classList.add('is-err');
                        errorMessages.push('есть баннер, но позиция не добавлена (нужно нажать "Добавить")');
                    } else {
                        errorMessages.push('есть баннер без добавленной позиции');
                    }
                }
                // Если есть добавленная позиция, но нет баннера - ошибка
                else if (hasAddedPosition && !bannerName) {
                    hasError = true;
                    // Подсвечиваем баннер
                    if (bannerFile) {
                        bannerFile.classList.add('is-err');
                    } else if (bannerSelectBtn) {
                        bannerSelectBtn.classList.add('is-err');
                    }
                    errorMessages.push('есть добавленная позиция без баннера');
                }
                // Если есть значение в инпуте, но не нажата кнопка "Добавить" и нет баннера
                else if (needsToAddPosition && !bannerName) {
                    hasError = true;
                    // Подсвечиваем кнопку "Добавить"
                    if (addBtn) {
                        addBtn.classList.add('is-err');
                    }
                    errorMessages.push('есть значение позиции, но не нажата кнопка "Добавить"');
                }
            });
            
            if (hasError) {
                // Добавляем мигание к подсвеченным элементам
                rows.forEach(row => {
                    if (row.classList.contains('promo-banner__top-row')) return;
                    
                    const positionInput = row.querySelector('input[name="position"]');
                    const addBtn = row.querySelector('.promo-banner__position-btn--add');
                    const deleteBtn = row.querySelector('.promo-banner__position-btn--delete');
                    const bannerColumn = row.querySelector('[data-coloumn="Баннер"]');
                    const bannerFile = bannerColumn ? bannerColumn.querySelector('.promo-banner__file') : null;
                    const bannerSelectBtn = bannerColumn ? bannerColumn.querySelector('.promo-banner__file_btn') : null;
                    
                    // Добавляем класс мигания к элементам с ошибкой
                    // После мигания убираем класс is-err, чтобы элемент остался обычным
                    if (positionInput && positionInput.classList.contains('is-err')) {
                        positionInput.classList.add('is-blinking');
                        setTimeout(() => {
                            positionInput.classList.remove('is-blinking');
                            positionInput.classList.remove('is-err');
                        }, 2000);
                    }
                    if (addBtn && addBtn.classList.contains('is-err')) {
                        addBtn.classList.add('is-blinking');
                        setTimeout(() => {
                            addBtn.classList.remove('is-blinking');
                            addBtn.classList.remove('is-err');
                        }, 2000);
                    }
                    if (deleteBtn && deleteBtn.classList.contains('is-err')) {
                        deleteBtn.classList.add('is-blinking');
                        setTimeout(() => {
                            deleteBtn.classList.remove('is-blinking');
                            deleteBtn.classList.remove('is-err');
                        }, 2000);
                    }
                    if (bannerFile && bannerFile.classList.contains('is-err')) {
                        bannerFile.classList.add('is-blinking');
                        setTimeout(() => {
                            bannerFile.classList.remove('is-blinking');
                            bannerFile.classList.remove('is-err');
                        }, 2000);
                    }
                    if (bannerSelectBtn && bannerSelectBtn.classList.contains('is-err')) {
                        bannerSelectBtn.classList.add('is-blinking');
                        setTimeout(() => {
                            bannerSelectBtn.classList.remove('is-blinking');
                            bannerSelectBtn.classList.remove('is-err');
                        }, 2000);
                    }
                });
                
                return;
            }
        }
        
        // Здесь можно добавить логику выгрузки в .xlsx
        console.log('Выгрузка в .xlsx:', {
            name: nameCart,
            theme: theme
        });
        
        // Закрываем модалку после выгрузки
        closeModalSaveCartXlsx();
        
        // Показываем модалку скачивания (заглушка - будет заменена на реальный URL)
        if (typeof openModalSaveOk === 'function') {
            openModalSaveOk('./images/promo/1.jpg'); // Заглушка, заменить на реальный URL файла
        }
    });
}

// Экспорт функций для использования в других модулях
if (typeof window !== 'undefined') {
    window.openModalSaveCartXlsx = openModalSaveCartXlsx;
    window.closeModalSaveCartXlsx = closeModalSaveCartXlsx;
}

