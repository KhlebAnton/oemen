// Функционал для страницы сохраненных подборок: удаление строк

(function() {
    'use strict';

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
            modalDelete.addEventListener('click', (e) => {
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

    function initDeleteRows() {
        const table = document.querySelector('[data-table="saved-carts"]');
        if (!table) return;

        // Используем делегирование событий для обработки кликов на кнопки удаления
        table.addEventListener('click', function(e) {
            // Проверяем, что клик был по кнопке удаления
            if (e.target.closest('.saved_cart_del')) {
                e.preventDefault();
                e.stopPropagation();
                
                // Находим строку таблицы, содержащую кнопку удаления
                const row = e.target.closest('.lk_table-row');
                if (row) {
                    // Получаем название подборки для сообщения
                    const nameColumn = row.querySelector('[data-column="Название"]');
                    const cartName = nameColumn ? nameColumn.textContent.trim() : 'подборку';
                    
                    // Показываем модалку подтверждения
                    openDeleteModal(`Удалить подборку "${cartName}"?`, () => {
                        deleteRow(row);
                    });
                }
            }
        });
    }

    function deleteRow(row) {
        if (!row) return;
        
        // Удаляем строку из DOM
        row.remove();
        
        // Опционально: можно добавить проверку, остались ли строки в таблице
        const content = document.querySelector('[data-table="saved-carts"] .lk_table__content');
        if (content) {
            const remainingRows = content.querySelectorAll('.lk_table-row');
            if (remainingRows.length === 0) {
                // Если строк не осталось, можно показать сообщение или скрыть таблицу
                // Например:
                // content.innerHTML = '<div class="empty-message">Нет сохраненных подборок</div>';
            }
        }
    }

    // Инициализация при загрузке страницы
    function init() {
        initDeleteModal();
        initDeleteRows();
    }

    // Запуск при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

