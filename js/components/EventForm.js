class EventForm {
    constructor(onSubmit) {
        this.onSubmit = onSubmit;
        this.formElement = null;
        this.init();
    }

    init() {
        this.formElement = document.createElement('form');
        this.formElement.id = 'event-form';
        this.formElement.className = 'event-form';
        this.formElement.noValidate = true;
        
        // Current date in YYYY-MM-DD format for the date input min attribute
        const today = new Date().toISOString().split('T')[0];
        
        this.formElement.innerHTML = `
            <div class="form-group">
                <label for="event-title">Название мероприятия *</label>
                <input type="text" id="event-title" class="form-control" required 
                       placeholder="Введите название мероприятия">
                <div class="invalid-feedback">Пожалуйста, укажите название мероприятия</div>
            </div>
            
            <div class="form-group">
                <label for="event-description">Описание</label>
                <textarea id="event-description" class="form-control" rows="3" 
                         placeholder="Опишите ваше мероприятие"></textarea>
            </div>
            
            <div class="form-row">
                <div class="form-group col-md-6">
                    <label for="event-date">Дата *</label>
                    <input type="date" id="event-date" class="form-control" 
                           min="${today}" required>
                    <div class="invalid-feedback">Пожалуйста, выберите корректную дату</div>
                </div>
                
                <div class="form-group col-md-6">
                    <label for="event-time">Время *</label>
                    <input type="time" id="event-time" class="form-control" required>
                    <div class="invalid-feedback">Пожалуйста, укажите время</div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="event-location">Место проведения *</label>
                <div class="input-group">
                    <input type="text" id="event-location" class="form-control" 
                           placeholder="Где будет проходить мероприятие?" required>
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" type="button" id="btn-location">
                            🗺️
                        </button>
                    </div>
                    <div class="invalid-feedback">Пожалуйста, укажите место проведения</div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="event-max-attendees">Максимальное количество участников</label>
                <input type="number" id="event-max-attendees" class="form-control" 
                       min="1" placeholder="Не ограничено">
            </div>
            
            <div class="form-group form-check">
                <input type="checkbox" class="form-check-input" id="event-is-private">
                <label class="form-check-label" for="event-is-private">Приватное мероприятие</label>
            </div>
            
            <button type="submit" class="btn btn-primary btn-block">
                Создать мероприятие
            </button>
        `;

        // Add event listeners
        this.formElement.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Add Telegram location picker
        const locationButton = this.formElement.querySelector('#btn-location');
        if (locationButton && window.Telegram?.WebApp?.showPopup) {
            locationButton.addEventListener('click', this.handleLocationClick.bind(this));
        } else {
            locationButton.style.display = 'none';
        }
        
        // Add input validation on blur
        this.addInputValidation();
    }
    
    addInputValidation() {
        const inputs = this.formElement.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });
    }
    
    validateField(field) {
        if (!field.checkValidity()) {
            field.classList.add('is-invalid');
            return false;
        } else {
            field.classList.remove('is-invalid');
            return true;
        }
    }
    
    validateForm() {
        let isValid = true;
        const requiredFields = this.formElement.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Additional validation for date/time
        const dateInput = this.formElement.querySelector('#event-date');
        const timeInput = this.formElement.querySelector('#event-time');
        
        if (dateInput && timeInput) {
            const eventDate = new Date(`${dateInput.value}T${timeInput.value}`);
            const now = new Date();
            
            if (eventDate <= now) {
                dateInput.classList.add('is-invalid');
                timeInput.classList.add('is-invalid');
                this.showError('Дата и время мероприятия должны быть в будущем');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    handleSubmit(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        const formData = {
            title: document.getElementById('event-title').value.trim(),
            description: document.getElementById('event-description').value.trim(),
            date: document.getElementById('event-date').value,
            time: document.getElementById('event-time').value,
            datetime: new Date(`${document.getElementById('event-date').value}T${document.getElementById('event-time').value}`).toISOString(),
            location: document.getElementById('event-location').value.trim(),
            maxAttendees: document.getElementById('event-max-attendees').value || null,
            isPrivate: document.getElementById('event-is-private').checked,
            // Add Telegram user data if available
            createdBy: window.Telegram?.WebApp?.initDataUnsafe?.user || null,
            telegramChatId: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null
        };
        
        // Call the provided callback with form data
        if (typeof this.onSubmit === 'function') {
            this.onSubmit(formData);
        }
    }
    
    async handleLocationClick() {
        try {
            const result = await window.Telegram.WebApp.showPopup({
                title: 'Выбор местоположения',
                message: 'Хотите использовать текущее местоположение?',
                buttons: [
                    { id: 'current', type: 'default', text: 'Текущее местоположение' },
                    { id: 'select', type: 'default', text: 'Выбрать на карте' },
                    { type: 'cancel' }
                ]
            });
            
            if (result.button_id === 'current') {
                await this.getCurrentLocation();
            } else if (result.button_id === 'select') {
                this.showMapLocationPicker();
            }
        } catch (error) {
            console.error('Error showing location popup:', error);
        }
    }
    
    async getCurrentLocation() {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            });
            
            // In a real app, you would reverse geocode the coordinates to get an address
            const { latitude, longitude } = position.coords;
            const locationInput = document.getElementById('event-location');
            locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            
            // Show success message
            window.Telegram?.WebApp?.showPopup({
                title: 'Готово',
                message: 'Местоположение определено',
                buttons: [{ id: 'ok', type: 'ok' }]
            });
            
        } catch (error) {
            console.error('Error getting location:', error);
            this.showError('Не удалось определить местоположение');
        }
    }
    
    showMapLocationPicker() {
        // In a real app, you would integrate with a map service
        // For Telegram WebApp, you can use Telegram's built-in location picker
        if (window.Telegram?.WebApp?.showScanQrPopup) {
            window.Telegram.WebApp.showScanQrPopup(
                { text: 'Наведите камеру на QR-код с адресом' },
                (text) => {
                    const locationInput = document.getElementById('event-location');
                    locationInput.value = text;
                }
            );
        } else {
            // Fallback for browsers without Telegram WebApp
            alert('Пожалуйста, введите адрес вручную');
        }
    }
    
    showError(message) {
        if (window.Telegram?.WebApp?.showPopup) {
            window.Telegram.WebApp.showPopup({
                title: 'Ошибка',
                message: message,
                buttons: [{ id: 'ok', type: 'default' }]
            });
        } else {
            alert(message);
        }
    }
    
    render(container) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (container) {
            container.innerHTML = '';
            container.appendChild(this.formElement);
        }
        
        return this.formElement;
    }
    
    reset() {
        this.formElement.reset();
        this.formElement.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
    }
    
    showLoading(show) {
        const submitButton = this.formElement.querySelector('button[type="submit"]');
        if (submitButton) {
            if (show) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Создание...';
            } else {
                submitButton.disabled = false;
                submitButton.textContent = 'Создать мероприятие';
            }
        }
    }
}

export default EventForm;
