// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;

// Основной класс приложения
class FiestaApp {
    constructor() {
        this.initApp();
    }

    initApp() {
        // Инициализация приложения
        tg.ready(() => {
            tg.expand();
            tg.enableClosingConfirmation();
            this.displayUserInfo();
        });

        // Инициализация обработчиков событий
        this.initEventListeners();
        
        // Загрузка списка событий
        this.loadEvents();
    }
    
    displayUserInfo() {
        const userInfo = tg.initDataUnsafe.user;
        console.log('User Info:', userInfo); // Добавим отладочный вывод
        if (userInfo) {
            const userInfoDiv = document.getElementById('user-info');
            userInfoDiv.textContent = `Пользователь: ${userInfo.first_name} ${userInfo.last_name || ''}`;
        } else {
            console.error('Не удалось получить информацию о пользователе');
        }
    }

    initEventListeners() {
        // Обработчик кнопки создания события
        document.getElementById('createEventBtn').addEventListener('click', () => {
            this.showCreateEventForm();
        });
    }
    
    loadEvents() {
        const eventsList = document.getElementById('eventsList');
        eventsList.innerHTML = '<div class="loading">Загрузка событий...</div>';
        
        // Здесь будет загрузка событий с сервера
        // Временная заглушка с тестовыми данными
        setTimeout(() => {
            const events = [
                {
                    id: 1,
                    title: 'Встреча в парке',
                    date: 'Сегодня, 19:00',
                    participants: 12,
                    maxParticipants: 20
                },
                {
                    id: 2,
                    title: 'Футбол на пляже',
                    date: 'Завтра, 18:00',
                    participants: 8,
                    maxParticipants: 10
                },
                {
                    id: 3,
                    title: 'Велосипедная прогулка',
                    date: 'Суббота, 10:00',
                    participants: 5,
                    maxParticipants: 15
                }
            ];
            
            this.displayEvents(events);
        }, 1000);
    }
    
    displayEvents(events) {
        const eventsList = document.getElementById('eventsList');
        
        if (events.length === 0) {
            eventsList.innerHTML = '<div class="no-events">Нет предстоящих событий</div>';
            return;
        }
        
        eventsList.innerHTML = events.map(event => `
            <div class="event-card" onclick="app.showEventDetails(${event.id})">
                <div class="event-title">${event.title}</div>
                <div class="event-meta">
                    <span>${event.date}</span>
                    <span>${event.participants}${event.maxParticipants ? `/${event.maxParticipants}` : ''} участников</span>
                </div>
            </div>
        `).join('');
    }
    
    showCreateEventForm() {
        // Показываем форму создания события
        tg.showPopup({
            title: 'Создать событие',
            message: 'Функция создания события будет доступна в следующем обновлении',
            buttons: [
                {id: 'ok', type: 'ok'}
            ]
        });
    }
    
    showEventDetails(eventId) {
        // Показываем детали события
        tg.showPopup({
            title: 'Детали события',
            message: 'Подробная информация о событии будет отображаться здесь',
            buttons: [
                {id: 'join', text: 'Присоединиться', type: 'default'},
                {id: 'cancel', type: 'cancel'}
            ]
        }, (buttonId) => {
            if (buttonId === 'join') {
                tg.showPopup({
                    title: 'Успех!',
                    message: 'Вы успешно присоединились к событию',
                    buttons: [
                        {id: 'ok', type: 'ok'}
                    ]
                });
            }
        });
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FiestaApp();
});
