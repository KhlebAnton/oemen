// Модалка списка бронирований
const btnsModalReserv = document.querySelectorAll('[data-modal-btn="reserve"]');
const modalReserv = document.querySelector('.modal_overlay[data-modal-id="modal-reserv-list"]');
const closeBtnModalReserv = modalReserv ? modalReserv.querySelector('.modal_close') : null;
const searchReservInput = document.querySelector('.search_reserv');
const searchButtonReserv = document.querySelector('[data-modal-id="modal-reserv-list"] .modal_serach-container .btn_primary');
const reservItems = document.querySelectorAll('.modal_serach-reserv__item');
const reservContainer = document.querySelector('.modal_serach-reserv__container');

function openModalReserv() {
    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }
    
    if (modalReserv) {
        modalReserv.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
    }
}

function closeModalReserv() {
    setTimeout(() => {
        if (searchReservInput) {
            searchReservInput.value = '';
        }
        filterReserv();
    }, 300);

    if (modalReserv) {
        modalReserv.classList.remove('is-open');
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
}

function filterReserv() {
    if (!searchReservInput || !reservContainer) return;

    const searchText = searchReservInput.value.toLowerCase().trim();
    let foundItems = 0;

    let existingMessage = reservContainer.querySelector('.no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    reservItems.forEach(item => {
        const span = item.querySelector('.reserve_item__title');
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
        showNoResultsMessageReserv();
    }
}

function showNoResultsMessageReserv() {
    if (!reservContainer) return;

    const message = document.createElement('div');
    message.className = 'no-results-message';
    message.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #666;">
            <div style="font-size: 16px; margin-bottom: 5px;">Бронь не найдена</div>
            <div style="font-size: 14px;">Попробуйте изменить запрос</div>
        </div>
    `;

    reservContainer.appendChild(message);
}

// Инициализация
if (btnsModalReserv.length > 0) {
    btnsModalReserv.forEach(btn => {
        btn.addEventListener('click', () => {
            openModalReserv();
        });
    });
}

if (closeBtnModalReserv) {
    closeBtnModalReserv.addEventListener('click', closeModalReserv);
}

document.addEventListener('click', (e) => {
    if (modalReserv && modalReserv.classList.contains('is-open') && !e.target.closest('.modal_content') && !e.target.closest('.client-wrapper') && !e.target.closest('[data-modal-btn="reserve"]')) {
        closeModalReserv();
    }
});

if (searchButtonReserv) {
    searchButtonReserv.addEventListener('click', filterReserv);
}

if (searchReservInput) {
    searchReservInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            filterReserv();
        }
    });

    searchReservInput.addEventListener('search', function () {
        if (this.value === '') {
            filterReserv();
        }
    });
}

// Экспорт функций
if (typeof window !== 'undefined') {
    window.openModalReserv = openModalReserv;
    window.closeModalReserv = closeModalReserv;
}

