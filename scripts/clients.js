// Функционал для страницы клиентов: раскрытие списка контактов

(function() {
    'use strict';

    function initClientsContacts() {
        const table = document.querySelector('[data-table="clients"]');
        if (!table) return;

        // Используем делегирование событий для обработки кликов на кнопки раскрытия
        table.addEventListener('click', function(e) {
            // Проверяем, что клик был по кнопке раскрытия контактов
            const contactsBtn = e.target.closest('.table_clients__contacts__btn');
            if (contactsBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                // Находим контейнер контактов
                const contactsContainer = contactsBtn.closest('.table_clients__contacts');
                if (contactsContainer) {
                    // Проверяем, был ли этот контейнер уже открыт
                    const wasOpen = contactsContainer.classList.contains('is-open');
                    
                    // Закрываем все открытые контейнеры
                    const allContactsContainers = table.querySelectorAll('.table_clients__contacts.is-open');
                    allContactsContainers.forEach(container => {
                        container.classList.remove('is-open');
                    });
                    
                    // Если кликнутый контейнер был закрыт, открываем его
                    if (!wasOpen) {
                        contactsContainer.classList.add('is-open');
                    }
                }
            }
        });
    }

    // Инициализация при загрузке страницы
    function init() {
        initClientsContacts();
    }

    // Запуск при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

