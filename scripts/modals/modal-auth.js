// Модалка авторизации
const modalAuth = document.querySelector('[data-modal-id="modal-auth"]');
const authFormNumber = document.querySelector('.auth__content_number');
const authFormCode = document.querySelector('.auth__content_code');
const phoneInput = authFormNumber ? authFormNumber.querySelector('input[name="phone"]') : null;
const codeInput = authFormCode ? authFormCode.querySelector('input[name="code"]') : null;
const btnSendPhone = authFormNumber ? authFormNumber.querySelector('.btn_primary') : null;
const btnConfirmCode = authFormCode ? authFormCode.querySelector('.btn_primary') : null;
const btnResendSms = authFormCode ? authFormCode.querySelector('.more_sms-btn') : null;
const timerSms = authFormCode ? authFormCode.querySelector('.timer_sms') : null;
const timeSms = authFormCode ? authFormCode.querySelector('.time-sms') : null;
const closeBtnModalAuth = modalAuth ? modalAuth.querySelector('.modal_close') : null;
const btnUser = document.querySelector('[data-btn="auth"]');

let authTimer = null;
let authTimerInterval = null;
let authTimerSeconds = 180; // 3 минуты
let currentPhoneNumber = ''; // Сохраняем номер телефона для авторизации

// Функция обновления атрибута data-auth в body
function updateAuthAttribute() {
    if (typeof getCookie === 'function') {
        const authPhone = getCookie('auth_user');
        const isAuth = authPhone && authPhone !== '';
        document.body.setAttribute('data-auth', isAuth ? 'true' : 'false');
    } else {
        document.body.setAttribute('data-auth', 'false');
    }
}

// Маска для телефона
function applyPhoneMask(input) {
    if (!input) return;
    
    input.addEventListener('input', function(e) {
        let value = this.value.replace(/\D/g, '');
        
        if (value.length === 0) {
            this.value = '+7 ';
            return;
        }
        
        if (value[0] !== '7' && value[0] !== '8') {
            value = '7' + value;
        }
        
        if (value[0] === '8') {
            value = '7' + value.slice(1);
        }
        
        let formatted = '+7 ';
        
        if (value.length > 1) {
            formatted += value.slice(1, 4);
        }
        if (value.length > 4) {
            formatted += ' ' + value.slice(4, 7);
        }
        if (value.length > 7) {
            formatted += '-' + value.slice(7, 9);
        }
        if (value.length > 9) {
            formatted += '-' + value.slice(9, 11);
        }
        
        this.value = formatted;
    });
    
    input.addEventListener('focus', function() {
        if (this.value === '') {
            this.value = '+7 ';
        }
    });
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && this.value === '+7 ') {
            e.preventDefault();
        }
    });
}

// Функция форматирования времени
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Функция запуска таймера
function startAuthTimer() {
    authTimerSeconds = 180; // 3 минуты
    
    if (timerSms) {
        timerSms.classList.add('is-active');
    }
    if (btnResendSms) {
        btnResendSms.classList.remove('is-active');
    }
    if (timeSms) {
        timeSms.textContent = formatTime(authTimerSeconds);
    }
    
    authTimerInterval = setInterval(() => {
        authTimerSeconds--;
        
        if (timeSms) {
            timeSms.textContent = formatTime(authTimerSeconds);
        }
        
        if (authTimerSeconds <= 0) {
            clearInterval(authTimerInterval);
            if (timerSms) {
                timerSms.classList.remove('is-active');
            }
            if (btnResendSms) {
                btnResendSms.classList.add('is-active');
            }
        }
    }, 1000);
}

// Функция остановки таймера
function stopAuthTimer() {
    if (authTimerInterval) {
        clearInterval(authTimerInterval);
        authTimerInterval = null;
    }
    if (timerSms) {
        timerSms.classList.remove('is-active');
    }
    if (btnResendSms) {
        btnResendSms.classList.remove('is-active');
    }
}

// Функция открытия модалки авторизации
function openModalAuth() {
    // Закрываем все другие модалки
    if (typeof closeAllModals === 'function') {
        closeAllModals();
    }
    
    if (modalAuth) {
        // Сброс состояния
        if (authFormNumber) {
            authFormNumber.classList.remove('is-hidden');
        }
        if (authFormCode) {
            authFormCode.classList.remove('is-active');
        }
        if (phoneInput) {
            phoneInput.value = '';
        }
        if (codeInput) {
            codeInput.value = '';
            codeInput.classList.remove('is-err');
        }
        currentPhoneNumber = ''; // Сбрасываем номер телефона
        stopAuthTimer();
        
        modalAuth.classList.add('is-open');
        if (typeof lockScroll === 'function') {
            lockScroll();
        }
    }
}

// Функция закрытия модалки авторизации
function closeModalAuth() {
    if (modalAuth) {
        modalAuth.classList.remove('is-open');
        stopAuthTimer();
    }
    if (typeof unlockScroll === 'function') {
        unlockScroll();
    }
}

// Обработчик отправки телефона
if (btnSendPhone && authFormNumber) {
    authFormNumber.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (phoneInput) {
            const phone = phoneInput.value.replace(/\D/g, '');
            if (phone.length === 11 && phone[0] === '7') {
                // Сохраняем номер телефона
                currentPhoneNumber = phoneInput.value;
                // Переключаемся на форму кода
                authFormNumber.classList.add('is-hidden');
                if (authFormCode) {
                    authFormCode.classList.add('is-active');
                }
                // Запускаем таймер
                startAuthTimer();
                // Фокус на поле кода
                if (codeInput) {
                    setTimeout(() => codeInput.focus(), 100);
                }
            } else {
                phoneInput.classList.add('is-err');
            }
        }
    });
}

// Обработчик повторной отправки SMS
if (btnResendSms) {
    btnResendSms.addEventListener('click', function(e) {
        e.preventDefault();
        startAuthTimer();
    });
}

// Обработчик подтверждения кода
if (btnConfirmCode && authFormCode) {
    authFormCode.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (codeInput) {
            const code = codeInput.value.trim();
            if (code === '1234') {
                // Успешная авторизация - сохраняем номер телефона в куки
                if (currentPhoneNumber && typeof setCookie === 'function') {
                    setCookie('auth_user', currentPhoneNumber);
                }
                updateAuthAttribute(); // Обновляем атрибут data-auth
                closeModalAuth();
                console.log('Авторизация успешна');
            } else {
                codeInput.classList.add('is-err');
            }
        }
    });
}

// Обработчик ввода кода (убираем ошибку при вводе)
if (codeInput) {
    codeInput.addEventListener('input', function() {
        this.classList.remove('is-err');
    });
}

// Обработчик закрытия модалки
if (closeBtnModalAuth) {
    closeBtnModalAuth.addEventListener('click', closeModalAuth);
}

// Закрытие модалки при клике вне её
document.addEventListener('click', (e) => {
    if (modalAuth && modalAuth.classList.contains('is-open') && !e.target.closest('.modal_content') && !e.target.closest('[data-btn="auth"]')) {
        closeModalAuth();
    }
});

// Инициализация маски телефона
if (phoneInput) {
    applyPhoneMask(phoneInput);
}

// Обработчик кнопки пользователя для открытия авторизации
const authButtons = document.querySelectorAll('[data-btn="auth"]');
authButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (typeof getCookie === 'function') {
            const authPhone = getCookie('auth_user');
            if (!authPhone || authPhone === '') {
                e.preventDefault();
                openModalAuth();
            }
        }
    });
});

// Экспорт функций
if (typeof window !== 'undefined') {
    window.openModalAuth = openModalAuth;
    window.closeModalAuth = closeModalAuth;
    window.updateAuthAttribute = updateAuthAttribute;
}

