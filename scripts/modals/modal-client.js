// Модалка выбора клиента
const btnsModalClient = document.querySelectorAll('[data-modal-btn="client"]');
const modalClient = document.querySelector('.modal_overlay[data-modal-id="modal-client"]');
const closeBtnModalClient = modalClient ? modalClient.querySelector('.modal_close') : null;
const searchClientInput = document.querySelector('.search_client');
const searchButton = document.querySelector('.modal_serach-container .btn_primary');
const clientItems = document.querySelectorAll('.modal_serach-client__item');
const clientContainer = document.querySelector('.modal_serach-client__container');
const popupClient = document.querySelector('.client-popup');

function openModalClient() {
    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }

    if (modalClient) {
        modalClient.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
    }
}

function closeModalClient() {
    setTimeout(() => {
        if (searchClientInput) {
            searchClientInput.value = '';
        }
        filterClients();
    }, 300);

    if (modalClient) {
        modalClient.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
}

function filterClients() {
    if (!searchClientInput || !clientContainer) return;

    const searchText = searchClientInput.value.toLowerCase().trim();
    let foundItems = 0;

    let existingMessage = clientContainer.querySelector('.no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    clientItems.forEach(item => {
        const span = item.querySelector('span');
        if (!span) return;

        const clientName = span.textContent.toLowerCase();

        if (searchText === '' || clientName.includes(searchText)) {
            item.style.display = 'flex';
            foundItems++;
        } else {
            item.style.display = 'none';
        }
    });

    if (foundItems === 0 && searchText !== '') {
        showNoResultsMessage();
    }
}

function showNoResultsMessage() {
    if (!clientContainer) return;

    const message = document.createElement('div');
    message.className = 'no-results-message';
    message.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #666;">
            <div style="font-size: 16px; margin-bottom: 5px;">Клиенты не найдены</div>
            <div style="font-size: 14px;">Попробуйте изменить запрос</div>
        </div>
    `;

    clientContainer.appendChild(message);
}

function selectClient(clientName) {
    if (typeof setCookie === 'function') {
        setCookie('selected_client', clientName);
    }
    updateClientValues(clientName);
    closeModalClient();
    if (popupClient) {
        popupClient.style.display = 'none';
    }

    console.log('Выбран клиент:', clientName, 'Записано в куки');
}

function updateClientValues(clientName) {
    const clientValueElements = document.querySelectorAll('.client-value');
    clientValueElements.forEach(element => {
        element.textContent = clientName;
    });
}

function initClientSelection() {
    // Добавляем обработчики для кнопок выбора в модальном окне
    clientItems.forEach(item => {
        const selectBtn = item.querySelector('.modal_serach-client__item-btn');
        const span = item.querySelector('span');
        if (!span) return;

        const clientName = span.textContent.trim();

        if (selectBtn) {
            selectBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                selectClient(clientName);
            });
        }

        // Можно также выбрать клиента по клику на всю карточку
        item.addEventListener('click', function (e) {
            if (!e.target.classList.contains('modal_serach-client__item-btn')) {
                selectClient(clientName);
            }
        });
    });

    // Восстанавливаем выбранного клиента из куков при загрузке страницы
    if (typeof getCookie === 'function') {
        const savedClient = getCookie('selected_client');
        if (popupClient) {
            if (savedClient) {
                updateClientValues(savedClient);
                popupClient.style.display = 'none';
            } else {
                // Проверяем, был ли popup уже показан в этой сессии
                const popupShown = sessionStorage.getItem('client-popup-shown');
                if (!popupShown) {
                    popupClient.style.display = 'flex';
                    // Сохраняем в sessionStorage, что popup был показан
                    sessionStorage.setItem('client-popup-shown', 'true');
                    // Автоматически скрываем popup через 5 секунд
                    setTimeout(() => {
                        if (popupClient) {
                            popupClient.style.display = 'none';
                        }
                    }, 5000);
                } else {
                    // Если popup уже был показан в этой сессии, не показываем его
                    popupClient.style.display = 'none';
                }
            }
        }
    }
}

// Инициализация
if (btnsModalClient.length > 0) {
    btnsModalClient.forEach(btn => {
        btn.addEventListener('click', () => {
            openModalClient();
        });
    });
}

if (closeBtnModalClient) {
    closeBtnModalClient.addEventListener('click', closeModalClient);
}

document.addEventListener('click', (e) => {
    if (modalClient && modalClient.classList.contains('is-open') && !e.target.closest('.modal_content') && !e.target.closest('.client-wrapper') && !e.target.closest('[data-modal-btn="client"]')) {
        closeModalClient();
    }
});

if (searchButton) {
    searchButton.addEventListener('click', filterClients);
}

if (searchClientInput) {
    searchClientInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            filterClients();
        }
    });

    searchClientInput.addEventListener('search', function () {
        if (this.value === '') {
            filterClients();
        }
    });
}

// Экспорт функций для использования в других модулях
if (typeof window !== 'undefined') {
    window.openModalClient = openModalClient;
    window.closeModalClient = closeModalClient;
    window.initClientSelection = initClientSelection;
}

