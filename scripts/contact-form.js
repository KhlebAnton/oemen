// Валидация формы обратной связи
const contactForm = document.querySelector('.contact_form');

if (contactForm) {
    const nameInput = contactForm.querySelector('input[name="name"]');
    const phoneInput = contactForm.querySelector('input[name="phone"]');
    const themeInput = contactForm.querySelector('input[name="theme"]');
    const commentTextarea = contactForm.querySelector('textarea[name="comment"]');
    const submitButton = contactForm.querySelector('button[type="submit"], .btn_primary');
    
    // Функция для показа ошибки
    function showError(input, message) {
        const label = input.closest('.label_input');
        if (label) {
            const errorMsg = label.querySelector('.err-msg');
            if (errorMsg) {
                errorMsg.textContent = message;
                errorMsg.style.display = 'block';
            }
            input.classList.add('is-err');
        }
    }
    
    // Функция для скрытия ошибки
    function hideError(input) {
        const label = input.closest('.label_input');
        if (label) {
            const errorMsg = label.querySelector('.err-msg');
            if (errorMsg) {
                errorMsg.style.display = 'none';
            }
            input.classList.remove('is-err');
        }
    }
    
    // Валидация имени
    function validateName() {
        const value = nameInput.value.trim();
        if (!value) {
            showError(nameInput, 'Введите имя');
            return false;
        }
        if (value.length < 2) {
            showError(nameInput, 'Имя должно содержать минимум 2 символа');
            return false;
        }
        hideError(nameInput);
        return true;
    }
    
    // Валидация телефона
    function validatePhone() {
        const value = phoneInput.value.replace(/\D/g, '');
        if (!value || value.length === 0) {
            showError(phoneInput, 'Введите корректный номер');
            return false;
        }
        if (value.length !== 11 || value[0] !== '7') {
            showError(phoneInput, 'Введите корректный номер');
            return false;
        }
        hideError(phoneInput);
        return true;
    }
    
    // Валидация темы (необязательное поле)
    function validateTheme() {
        // Тема необязательна, но если заполнена, проверяем минимальную длину
        const value = themeInput ? themeInput.value.trim() : '';
        if (value && value.length < 2) {
            showError(themeInput, 'Тема должна содержать минимум 2 символа');
            return false;
        }
        if (themeInput) {
            hideError(themeInput);
        }
        return true;
    }
    
    // Обработчики событий для автоматического скрытия ошибок при вводе (только если ошибка уже показана)
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            if (this.classList.contains('is-err')) {
                validateName();
            }
        });
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            if (this.classList.contains('is-err')) {
                validatePhone();
            }
        });
    }
    
    if (themeInput) {
        themeInput.addEventListener('input', function() {
            if (this.classList.contains('is-err')) {
                validateTheme();
            }
        });
    }
    
    // Обработчик отправки формы
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Валидация всех полей
        const isNameValid = validateName();
        const isPhoneValid = validatePhone();
        const isThemeValid = validateTheme();
        
        if (isNameValid && isPhoneValid && isThemeValid) {
            // Если все поля валидны, показываем модальное окно успеха
            if (typeof openOkMsg === 'function') {
                // Очищаем форму
                contactForm.reset();
                // Убираем классы ошибок
                if (nameInput) hideError(nameInput);
                if (phoneInput) {
                    hideError(phoneInput);
                    phoneInput.value = ''; // Полностью очищаем поле телефона
                }
                if (themeInput) hideError(themeInput);
                if (commentTextarea) {
                    commentTextarea.value = '';
                }
                // Показываем модальное окно успеха
                openOkMsg('Сообщение отправлено');
            } else {
                console.error('Функция openOkMsg не найдена');
            }
        } else {
            // Прокручиваем к первой ошибке
            const firstError = contactForm.querySelector('.is-err');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
        }
    });
}

