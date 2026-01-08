// Функциональность загрузки фото пользователя в личном кабинете
document.addEventListener('DOMContentLoaded', function() {
    const btnSetPhoto = document.querySelector('.btn_set_photo');
    const btnSetPhotoUpload = document.querySelector('.btn_set_photo__upload');
    const btnDelPhoto = document.querySelector('.btn_del_photo');
    const lkUserInfo = document.querySelector('.lk_user__info');
    const userPhotoImg = document.querySelector('.lk__user_img_wrapper img');
    
    // Сохраняем исходный путь к изображению
    const defaultPhotoSrc = userPhotoImg ? userPhotoImg.src : './images/user_photo.png';
    
    // Создаем скрытый input для выбора файла
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    // Обработчик клика на btn_set_photo - добавляем класс lk_img__upload
    if (btnSetPhoto && lkUserInfo) {
        btnSetPhoto.addEventListener('click', function(e) {
            e.stopPropagation();
            lkUserInfo.classList.add('lk_img__upload');
        });
    }
    
    // Обработчик клика на btn_set_photo__upload - открываем диалог выбора файла
    if (btnSetPhotoUpload) {
        btnSetPhotoUpload.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Добавляем input в DOM если его там нет
            if (!fileInput.parentNode) {
                document.body.appendChild(fileInput);
            }
            
            // Открываем диалог выбора файла
            fileInput.click();
        });
    }
    
    // Обработчик клика на btn_del_photo - удаляем элемент img
    if (btnDelPhoto) {
        btnDelPhoto.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Удаляем элемент img
            const imgWrapper = document.querySelector('.lk__user_img_wrapper');
            const currentImg = imgWrapper ? imgWrapper.querySelector('img') : null;
            
            if (currentImg) {
                currentImg.remove();
            }
            
            // Закрываем меню
            if (lkUserInfo) {
                lkUserInfo.classList.remove('lk_img__upload');
            }
        });
    }
    
    // Обработчик выбора файла
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (file && file.type.startsWith('image/')) {
            // Создаем FileReader для чтения файла
            const reader = new FileReader();
            
            reader.onload = function(event) {
                const imgWrapper = document.querySelector('.lk__user_img_wrapper');
                
                if (imgWrapper) {
                    // Проверяем, есть ли уже img элемент
                    let img = imgWrapper.querySelector('img');
                    
                    // Если img нет, создаем новый
                    if (!img) {
                        img = document.createElement('img');
                        img.alt = '';
                        imgWrapper.insertBefore(img, imgWrapper.firstChild);
                    }
                    
                    // Обновляем src изображения
                    img.src = event.target.result;
                }
                
                // Убираем класс lk_img__upload после загрузки
                if (lkUserInfo) {
                    lkUserInfo.classList.remove('lk_img__upload');
                }
            };
            
            reader.onerror = function() {
                console.error('Ошибка при чтении файла');
            };
            
            // Читаем файл как Data URL
            reader.readAsDataURL(file);
        } else {
            alert('Пожалуйста, выберите изображение');
        }
        
        // Очищаем input для возможности повторного выбора того же файла
        fileInput.value = '';
    });
    
    // Закрытие меню при клике вне кнопок
    document.addEventListener('click', function(e) {
        if (lkUserInfo && lkUserInfo.classList.contains('lk_img__upload')) {
            // Проверяем, что клик не по элементам меню
            const isClickInside = e.target.closest('.lk_user__info') || 
                                  e.target.closest('.btn_set_photo') ||
                                  e.target.closest('.btn_set_photo__upload') ||
                                  e.target.closest('.btn_del_photo') ||
                                  e.target === fileInput;
            
            if (!isClickInside) {
                lkUserInfo.classList.remove('lk_img__upload');
            }
        }
    });
});

