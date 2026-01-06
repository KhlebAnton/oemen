// Обработка таймеров акций на странице sales.html

(function() {
    'use strict';

    // Функция парсинга даты из формата DD.MM.YYYY или DD.MM.YYYY HH:MM:SS или DD.MM.YYYY HH:MM
    // Использует локальное время браузера
    function parseDate(dateString) {
        // Разделяем дату и время
        const dateTimeParts = dateString.trim().split(' ');
        const datePart = dateTimeParts[0];
        const timePart = dateTimeParts[1] || null;
        
        // Парсим дату
        const dateParts = datePart.split('.');
        if (dateParts.length !== 3) {
            console.error('Неверный формат даты:', dateString);
            return null;
        }
        
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Месяцы в JS начинаются с 0
        const year = parseInt(dateParts[2], 10);
        
        // Парсим время, если оно указано
        let hours = 23;
        let minutes = 59;
        let seconds = 59;
        
        if (timePart) {
            const timeParts = timePart.split(':');
            if (timeParts.length >= 2) {
                hours = parseInt(timeParts[0], 10) || 23;
                minutes = parseInt(timeParts[1], 10) || 59;
                seconds = timeParts.length >= 3 ? (parseInt(timeParts[2], 10) || 59) : 59;
            }
        }
        
        // Создаем Date объект с локальным временем браузера
        // new Date(year, month, day, hours, minutes, seconds) автоматически использует локальный часовой пояс
        const localDate = new Date(year, month, day, hours, minutes, seconds);
        
        return localDate;
    }

    // Функция форматирования времени (обычный формат без секунд)
    function formatTimeRemaining(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            const remainingHours = hours % 24;
            return `${days} д. ${remainingHours} ч`;
        } else if (hours > 0) {
            const remainingMinutes = minutes % 60;
            return `${hours} ч ${remainingMinutes} м`;
        } else if (minutes > 0) {
            const remainingSeconds = seconds % 60;
            return `${minutes} м ${remainingSeconds} с`;
        } else {
            return `${seconds} с`;
        }
    }

    // Функция форматирования времени с секундами (детальный формат)
    function formatTimeRemainingWithSeconds(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (days > 0) {
            return `${days} д. ${hours} ч ${minutes} мин ${seconds} сек`;
        } else if (hours > 0) {
            return `${hours} ч ${minutes} мин ${seconds} сек`;
        } else if (minutes > 0) {
            return `${minutes} мин ${seconds} сек`;
        } else {
            return `${seconds} сек`;
        }
    }

    // Функция обновления таймера
    function updateTimer(timerElement, targetDate) {
        const now = new Date();
        const timeRemaining = targetDate - now;

        // Определяем формат таймера по наличию атрибута data-timer-second
        const hasSeconds = timerElement.hasAttribute('data-timer-second');

        if (timeRemaining <= 0) {
            // Время истекло
            if (hasSeconds) {
                // Для таймера с секундами: меняем текст на "Закончено" и добавляем класс is-disabled
                timerElement.textContent = 'Закончено';
                const priceDetailSection = timerElement.closest('.price_detail_section');
                if (priceDetailSection) {
                    priceDetailSection.classList.add('is-disabled');
                }
            } else {
                // Для обычного таймера: удаляем родительский элемент prices_item
                const pricesItem = timerElement.closest('.prices_item');
                if (pricesItem) {
                    pricesItem.remove();
                }
            }
            return false; // Останавливаем таймер
        }

        // Обновляем текст таймера в зависимости от формата
        if (hasSeconds) {
            timerElement.textContent = formatTimeRemainingWithSeconds(timeRemaining);
        } else {
            timerElement.textContent = formatTimeRemaining(timeRemaining);
        }
        
        return true; // Продолжаем таймер
    }

    // Инициализация таймеров
    function initTimers() {
        const timers = document.querySelectorAll('.sales_timer[data-time]');
        
        if (timers.length === 0) {
            return; // Нет таймеров на странице
        }

        const timerIntervals = [];

        timers.forEach((timerElement) => {
            const timeString = timerElement.getAttribute('data-time');
            if (!timeString) {
                return;
            }

            const targetDate = parseDate(timeString);
            if (!targetDate) {
                return;
            }

            // Проверяем, не истекла ли уже дата
            const now = new Date();
            if (targetDate <= now) {
                // Дата уже прошла
                const hasSeconds = timerElement.hasAttribute('data-timer-second');
                
                if (hasSeconds) {
                    // Для таймера с секундами: меняем текст на "Закончено" и добавляем класс is-disabled
                    timerElement.textContent = 'Закончено';
                    const priceDetailSection = timerElement.closest('.price_detail_section');
                    if (priceDetailSection) {
                        priceDetailSection.classList.add('is-disabled');
                    }
                } else {
                    // Для обычного таймера: удаляем элемент
                    const pricesItem = timerElement.closest('.prices_item');
                    if (pricesItem) {
                        pricesItem.remove();
                    }
                }
                return;
            }

            // Обновляем таймер сразу
            updateTimer(timerElement, targetDate);

            // Запускаем интервал обновления каждую секунду
            const intervalId = setInterval(() => {
                const shouldContinue = updateTimer(timerElement, targetDate);
                if (!shouldContinue) {
                    clearInterval(intervalId);
                }
            }, 1000);

            timerIntervals.push(intervalId);
        });

        // Очистка интервалов при выгрузке страницы
        window.addEventListener('beforeunload', () => {
            timerIntervals.forEach(intervalId => {
                clearInterval(intervalId);
            });
        });
    }

    // Инициализация при загрузке страницы
    function init() {
        if (document.querySelector('.sales_timer')) {
            initTimers();
        }
    }

    // Запуск при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

