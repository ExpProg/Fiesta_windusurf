// Initialize Telegram WebApp
const tg = window.Telegram?.WebApp || {};

// Import components
import EventForm from './components/EventForm.js';

// Main App Class
class FiestaApp {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.initTelegramApp();
        this.loadEvents();
    }

    initElements() {
        // Main UI elements
        this.elements = {
            app: document.getElementById('app'),
            loading: document.getElementById('loading'),
            eventsList: document.getElementById('events-list'),
            eventDetails: document.getElementById('event-details'),
            userProfile: document.getElementById('user-profile'),
            
            // Navigation buttons
            btnEvents: document.getElementById('btn-events'),
            btnCreate: document.getElementById('btn-create'),
            btnProfile: document.getElementById('btn-profile')
        };
    }

    initEventListeners() {
        // Navigation
        this.elements.btnEvents.addEventListener('click', () => this.showView('events'));
        this.elements.btnCreate.addEventListener('click', () => this.showView('create'));
        this.elements.btnProfile.addEventListener('click', () => this.showView('profile'));
    }

    initTelegramApp() {
        // Expand the app to full height
        tg.expand();
        
        // Set theme colors based on Telegram theme
        if (tg.colorScheme === 'dark') {
            document.documentElement.style.setProperty('--background', '#18222d');
            document.documentElement.style.setProperty('--text-color', '#ffffff');
            document.documentElement.style.setProperty('--border-color', '#2f3a45');
        }
        
        // Set up back button
        tg.BackButton.hide();
        window.addEventListener('popstate', this.handleBackButton.bind(this));
    }

    async loadEvents() {
        try {
            this.showLoading(true);
            
            // In a real app, you would fetch events from your backend
            // const response = await fetch('/api/events');
            // const events = await response.json();
            
            // Mock data for demo
            const mockEvents = [
                {
                    id: 1,
                    title: 'Tech Meetup',
                    date: '2023-06-15T19:00',
                    location: 'Downtown Co-working Space',
                    description: 'Monthly tech meetup with guest speakers and networking.',
                    attendees: 24
                },
                {
                    id: 2,
                    title: 'Startup Pitch Night',
                    date: '2023-06-20T18:30',
                    location: 'Innovation Hub',
                    description: 'Local startups pitch their ideas to investors.',
                    attendees: 15
                }
            ];
            
            this.renderEvents(mockEvents);
        } catch (error) {
            console.error('Error loading events:', error);
            this.showError('Failed to load events. Please try again later.');
        } finally {
            this.showLoading(false);
        }
    }

    renderEvents(events) {
        if (!events || events.length === 0) {
            this.elements.eventsList.innerHTML = '<p class="text-center">No events found</p>';
            return;
        }

        this.elements.eventsList.innerHTML = events.map(event => `
            <div class="event-card" data-event-id="${event.id}">
                <div class="event-title">${event.title}</div>
                <div class="event-meta">
                    <span>📅 ${new Date(event.date).toLocaleDateString()}</span>
                    <span>👥 ${event.attendees}</span>
                </div>
                <div class="event-location">📍 ${event.location}</div>
            </div>
        `).join('');

        // Add click handlers to event cards
        document.querySelectorAll('.event-card').forEach(card => {
            card.addEventListener('click', (e) => this.showEventDetails(
                events.find(event => event.id.toString() === card.dataset.eventId)
            ));
        });
    }

    showEventDetails(event) {
        if (!event) return;
        
        this.elements.eventsList.style.display = 'none';
        this.elements.eventDetails.style.display = 'block';
        this.elements.eventDetails.innerHTML = `
            <button id="back-to-events" class="btn btn-link mb-3">← Back to Events</button>
            <h2>${event.title}</h2>
            <p><strong>📅 Date:</strong> ${new Date(event.date).toLocaleString()}</p>
            <p><strong>📍 Location:</strong> ${event.location}</p>
            <p><strong>👥 Attendees:</strong> ${event.attendees}</p>
            <div class="mt-3">
                <h3>Description</h3>
                <p>${event.description}</p>
            </div>
            <button class="btn btn-block mt-3">Join Event</button>
        `;

        // Add back button handler
        document.getElementById('back-to-events').addEventListener('click', () => {
            this.elements.eventDetails.style.display = 'none';
            this.elements.eventsList.style.display = 'grid';
        });
        
        // Show back button in Telegram
        tg.BackButton.show();
        tg.BackButton.onClick(() => {
            this.elements.eventDetails.style.display = 'none';
            this.elements.eventsList.style.display = 'grid';
            tg.BackButton.hide();
        });
    }

    showView(viewName) {
        // Reset active state for all buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        switch(viewName) {
            case 'events':
                this.elements.btnEvents.classList.add('active');
                // In a real app, you would handle view switching here
                break;
            case 'create':
                this.elements.btnCreate.classList.add('active');
                // Show create event form
                this.showCreateEventForm();
                break;
            case 'profile':
                this.elements.btnProfile.classList.add('active');
                // Show user profile
                this.showUserProfile();
                break;
        }
    }

    showCreateEventForm() {
        this.elements.eventsList.innerHTML = '<div id="create-event-container"></div>';
        
        // Initialize the event form
        const eventForm = new EventForm(async (formData) => {
            try {
                // Show loading state
                eventForm.showLoading(true);
                
                // In a real app, you would send this to your backend
                console.log('Submitting event:', formData);
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Show success message
                tg.showPopup?.({
                    title: 'Успех',
                    message: 'Мероприятие успешно создано!',
                    buttons: [{ id: 'ok', type: 'ok' }]
                });
                
                // Go back to events list
                this.loadEvents();
                this.showView('events');
            } catch (error) {
                console.error('Error creating event:', error);
                tg.showPopup?.({
                    title: 'Ошибка',
                    message: 'Не удалось создать мероприятие. Пожалуйста, попробуйте снова.',
                    buttons: [{ id: 'ok', type: 'default' }]
                });
            } finally {
                eventForm.showLoading(false);
            }
        });
        
        // Render the form
        eventForm.render('#create-event-container');
        
        // Set initial date/time to now + 1 hour
        const now = new Date();
        now.setHours(now.getHours() + 1);
        
        const dateInput = document.getElementById('event-date');
        const timeInput = document.getElementById('event-time');
        
        if (dateInput && timeInput) {
            dateInput.value = now.toISOString().split('T')[0];
            timeInput.value = now.toTimeString().substring(0, 5);
        }
    }

    // handleCreateEvent is now part of the EventForm component

    showUserProfile() {
        const user = tg.initDataUnsafe?.user || {
            first_name: 'User',
            last_name: '',
            username: 'user'
        };
        
        this.elements.eventsList.innerHTML = `
            <div class="user-profile-view">
                <div class="profile-header">
                    <div class="profile-avatar">${user.first_name[0]}${user.last_name?.[0] || ''}</div>
                    <h2>${user.first_name} ${user.last_name || ''}</h2>
                    <div class="username">@${user.username}</div>
                </div>
                <div class="profile-stats">
                    <div class="stat">
                        <div class="stat-value">12</div>
                        <div class="stat-label">Events</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">48</div>
                        <div class="stat-label">Attended</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">6</div>
                        <div class="stat-label">Hosted</div>
                    </div>
                </div>
                <div class="profile-actions">
                    <button class="btn btn-block mb-2">My Events</button>
                    <button class="btn btn-block btn-outline">Settings</button>
                </div>
            </div>
        `;
    }

    showLoading(show) {
        this.elements.loading.style.display = show ? 'block' : 'none';
    }

    showError(message) {
        tg.showPopup({
            title: 'Error',
            message: message,
            buttons: [{ id: 'ok', type: 'ok' }]
        });
    }


    handleBackButton() {
        if (this.elements.eventDetails.style.display === 'block') {
            this.elements.eventDetails.style.display = 'none';
            this.elements.eventsList.style.display = 'grid';
            tg.BackButton.hide();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FiestaApp();
});
