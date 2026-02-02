// Таймер для дат бронирования - показывает количество дней до даты
document.addEventListener('DOMContentLoaded', function() {
    const timerElements = document.querySelectorAll('.date_book_timer');
    
    if (timerElements.length === 0) return;

    function parseDate(dateString) {
        // Парсим дату в формате DD.MM.YYYY
        const parts = dateString.trim().split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // месяцы в JS начинаются с 0
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }
        return null;
    }

    function calculateDaysUntil(targetDate) {
        const today = new Date();
        // Устанавливаем время на начало дня для точного расчета
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        
        // Вычисляем разницу в миллисекундах
        const diffTime = targetDate - today;
        // Конвертируем в дни
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    function formatDays(days) {
        if (days < 0) {
            return 'Просрочено';
        } else if (days === 0) {
            return '0';
        } else if (days === 1) {
            return '1';
        } else if (days >= 2 && days <= 4) {
            return `${days}`;
        } else {
            return `${days}`;
        }
    }

    timerElements.forEach(element => {
        const dateText = element.textContent.trim();
        const targetDate = parseDate(dateText);
        
        if (!targetDate) {
            console.warn('Не удалось распарсить дату:', dateText);
            return;
        }

        // Сохраняем исходную дату в data-атрибуте
        element.setAttribute('data-original-date', dateText);
        
        const daysUntil = calculateDaysUntil(targetDate);
        const formattedText = formatDays(daysUntil);
        
        // Обновляем текст
        element.textContent = formattedText;
        
        // Добавляем класс для красного цвета, если дней <= 10
        if (daysUntil <= 10 && daysUntil >= 0) {
            element.classList.add('date_book_timer--warning');
        } else if (daysUntil < 0) {
            element.classList.add('date_book_timer--expired');
        }
    });
});

