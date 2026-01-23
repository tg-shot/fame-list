// ============================================
// СИСТЕМА АВТОРИЗАЦИИ ЧЕРЕЗ TELEGRAM БОТА
// ============================================

// Текущий пользователь
let currentUser = null;

// Базовый URL бота
const BOT_URL = 'https://t.me/nooIshy_bot';

// Функции авторизации
function initAuthSystem() {
    console.log('Инициализация системы авторизации...');
    
    // Проверяем токен из URL
    checkUrlToken();
    
    // Проверяем, есть ли сохраненный пользователь
    const savedUser = localStorage.getItem('fame_current_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateUserInterface();
        } catch (e) {
            console.error('Ошибка загрузки пользователя:', e);
            localStorage.removeItem('fame_current_user');
        }
    }
    
    // Кнопка входа
    const authBtn = document.getElementById('auth-btn');
    if (authBtn) {
        authBtn.addEventListener('click', openAuthModal);
    }
    
    // Кнопка входа через Telegram
    const telegramLoginBtn = document.getElementById('telegram-login-btn');
    if (telegramLoginBtn) {
        telegramLoginBtn.addEventListener('click', openBotForAuth);
    }
    
    // Кнопка входа по токену
    const tokenSubmitBtn = document.getElementById('token-submit-btn');
    if (tokenSubmitBtn) {
        tokenSubmitBtn.addEventListener('click', loginWithToken);
    }
    
    // Демо-вход
    const demoLoginBtn = document.getElementById('demo-login-btn');
    if (demoLoginBtn) {
        demoLoginBtn.addEventListener('click', demoLogin);
    }
    
    // Кнопка выхода
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Кнопка выхода в боковом меню
    const sideLogout = document.getElementById('side-logout');
    if (sideLogout) {
        sideLogout.addEventListener('click', logout);
    }
    
    // Мой профиль
    const myProfileBtn = document.getElementById('my-profile-btn');
    if (myProfileBtn) {
        myProfileBtn.addEventListener('click', showMyProfile);
    }
    
    const sideMyProfile = document.getElementById('side-my-profile');
    if (sideMyProfile) {
        sideMyProfile.addEventListener('click', showMyProfile);
    }
    
    // Настройки профиля
    const settingsProfileBtn = document.getElementById('settings-profile-btn');
    if (settingsProfileBtn) {
        settingsProfileBtn.addEventListener('click', openProfileSettings);
    }
    
    const sideSettings = document.getElementById('side-settings');
    if (sideSettings) {
        sideSettings.addEventListener('click', openProfileSettings);
    }
    
    // Сохранение настроек
    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfileSettings);
    }
}

// Проверка токена из URL
function checkUrlToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        console.log('Найден токен в URL:', token);
        verifyTokenWithBot(token);
        
        // Убираем токен из URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
}

// Открытие бота для авторизации
function openBotForAuth() {
    // Генерируем уникальный идентификатор сессии
    const sessionId = 'auth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Сохраняем sessionId для проверки
    localStorage.setItem('auth_session_id', sessionId);
    
    // Создаем ссылку на бота с параметрами
    const botLink = `${BOT_URL}?start=${sessionId}`;
    
    // Открываем QR код и ссылку
    showQRCode(botLink);
    
    // Запускаем проверку авторизации
    startAuthPolling(sessionId);
}

// Показать QR код
function showQRCode(botLink) {
    // Создаем QR код
    const qrCodeDiv = document.getElementById('qrcode');
    if (qrCodeDiv) {
        qrCodeDiv.innerHTML = '';
        
        // Простой QR код (можно заменить на библиотеку)
        qrCodeDiv.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 10px;">
                    <i class="fab fa-telegram" style="font-size: 48px; color: #0088cc;"></i>
                </div>
                <div style="font-size: 12px; color: #333; word-break: break-all; font-family: monospace;">
                    ${botLink.substring(0, 30)}...
                </div>
            </div>
        `;
    }
    
    // Устанавливаем ссылку
    const telegramLink = document.getElementById('telegram-link');
    if (telegramLink) {
        telegramLink.href = botLink;
        telegramLink.textContent = botLink;
        telegramLink.target = '_blank';
    }
    
    // Открываем модальное окно
    openModal('qr-modal');
    closeModal(document.getElementById('auth-modal'));
}

// Запуск опроса авторизации
function startAuthPolling(sessionId) {
    let attempts = 0;
    const maxAttempts = 60; // 60 попыток (30 секунд)
    
    const pollInterval = setInterval(() => {
        attempts++;
        
        // Проверяем, есть ли токен в localStorage
        const token = localStorage.getItem(`auth_token_${sessionId}`);
        
        if (token) {
            clearInterval(pollInterval);
            console.log('Токен получен:', token);
            
            // Удаляем временные данные
            localStorage.removeItem(`auth_token_${sessionId}`);
            localStorage.removeItem('auth_session_id');
            
            // Закрываем QR модалку
            closeModal(document.getElementById('qr-modal'));
            
            // Проверяем токен
            verifyTokenWithBot(token);
            
            showNotification('Авторизация успешна!', 'success');
        } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            showNotification('Время ожидания истекло. Попробуйте снова.', 'error');
            closeModal(document.getElementById('qr-modal'));
        }
    }, 500); // Проверка каждые 500ms
}

// Проверка токена через бота
async function verifyTokenWithBot(token) {
    try {
        // В реальной реализации здесь был бы запрос к вашему серверу
        // Для демонстрации эмулируем ответ
        
        console.log('Проверка токена:', token);
        
        // Имитируем задержку сети
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Демо-ответ (в реальности нужно делать запрос к вашему бэкенду)
        const mockResponse = {
            success: true,
            user: {
                id: Math.floor(Math.random() * 1000000) + 100000,
                first_name: "Telegram",
                last_name: "User",
                username: "telegram_user",
                auth_date: Math.floor(Date.now() / 1000),
                hash: token
            }
        };
        
        if (mockResponse.success) {
            currentUser = mockResponse.user;
            
            // Добавляем профиль по умолчанию
            if (!currentUser.profile) {
                currentUser.profile = {
                    nickname: currentUser.first_name + ' ' + (currentUser.last_name || ''),
                    bio: 'Пользователь из Telegram',
                    category: '',
                    notifications: true,
                    joined: new Date().toISOString().split('T')[0]
                };
            }
            
            // Генерируем аватар
            generateColorAvatar(currentUser);
            
            saveUser();
            updateUserInterface();
            
            showNotification('Добро пожаловать!', 'success');
        } else {
            showNotification('Ошибка авторизации. Попробуйте снова.', 'error');
        }
        
    } catch (error) {
        console.error('Ошибка проверки токена:', error);
        showNotification('Ошибка соединения с сервером', 'error');
    }
}

// Вход по токену вручную
function loginWithToken() {
    const tokenInput = document.getElementById('token-input');
    const token = tokenInput.value.trim();
    
    if (!token) {
        showNotification('Введите токен', 'error');
        return;
    }
    
    verifyTokenWithBot(token);
    tokenInput.value = '';
}

// Демо-вход
function demoLogin() {
    currentUser = {
        id: 123456789,
        first_name: "Демо",
        last_name: "Пользователь",
        username: "demo_user",
        auth_date: Math.floor(Date.now() / 1000),
        hash: "demo_hash",
        profile: {
            nickname: "Демо Пользователь",
            bio: "Это демо-аккаунт для тестирования функций сайта",
            category: "Медийки",
            notifications: true,
            joined: new Date().toISOString().split('T')[0]
        }
    };
    
    generateColorAvatar(currentUser);
    
    saveUser();
    updateUserInterface();
    closeModal(document.getElementById('auth-modal'));
    
    showNotification('Вы вошли как демо-пользователь!', 'success');
}

// Генерация цветного аватара
function generateColorAvatar(user) {
    if (!user.photo_url) {
        const name = user.first_name || user.profile?.nickname || 'User';
        const initials = name.charAt(0).toUpperCase();
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = colors[Math.abs(hash) % colors.length];
        
        user.generated_avatar = `
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="${color}" rx="50"/>
                <text x="50" y="55" text-anchor="middle" font-family="Arial" font-size="40" 
                      font-weight="bold" fill="#fff">${initials}</text>
            </svg>
        `;
    }
}

// Сохранение пользователя
function saveUser() {
    if (currentUser) {
        localStorage.setItem('fame_current_user', JSON.stringify(currentUser));
    }
}

// Обновление интерфейса
function updateUserInterface() {
    const authBtn = document.getElementById('auth-btn');
    const userProfile = document.getElementById('user-profile');
    const menuAuthSection = document.getElementById('menu-auth-section');
    
    if (currentUser) {
        if (authBtn) authBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'block';
        if (menuAuthSection) menuAuthSection.style.display = 'block';
        
        updateUserProfileData();
    } else {
        if (authBtn) authBtn.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
        if (menuAuthSection) menuAuthSection.style.display = 'none';
    }
}

// Обновление данных профиля
function updateUserProfileData() {
    if (!currentUser) return;
    
    const userName = document.getElementById('user-name');
    const dropdownName = document.getElementById('dropdown-name');
    const dropdownUsername = document.getElementById('dropdown-username');
    const dropdownId = document.getElementById('dropdown-id');
    
    const displayName = currentUser.profile?.nickname || 
                       `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 
                       'Пользователь';
    
    if (userName) userName.textContent = displayName;
    if (dropdownName) dropdownName.textContent = displayName;
    if (dropdownUsername) {
        dropdownUsername.textContent = currentUser.username ? `@${currentUser.username}` : '';
    }
    if (dropdownId) dropdownId.textContent = `ID: ${currentUser.id}`;
    
    updateUserAvatar();
}

// Обновление аватара
function updateUserAvatar() {
    if (!currentUser) return;
    
    const userAvatar = document.getElementById('user-avatar');
    const dropdownAvatar = document.getElementById('dropdown-avatar');
    
    if (currentUser.generated_avatar) {
        const avatarSrc = 'data:image/svg+xml;base64,' + btoa(currentUser.generated_avatar);
        if (userAvatar) userAvatar.src = avatarSrc;
        if (dropdownAvatar) dropdownAvatar.src = avatarSrc;
    } else if (currentUser.photo_url) {
        if (userAvatar) userAvatar.src = currentUser.photo_url;
        if (dropdownAvatar) dropdownAvatar.src = currentUser.photo_url;
    }
}

// Открытие модального окна авторизации
function openAuthModal() {
    openModal('auth-modal');
}

// Настройки профиля
function openProfileSettings() {
    if (!currentUser) {
        openAuthModal();
        return;
    }
    
    const nicknameInput = document.getElementById('profile-nickname');
    const bioInput = document.getElementById('profile-bio');
    const categorySelect = document.getElementById('profile-category');
    const notificationsCheckbox = document.getElementById('notifications-enabled');
    
    if (nicknameInput) {
        nicknameInput.value = currentUser.profile?.nickname || 
                            `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();
    }
    
    if (bioInput) {
        bioInput.value = currentUser.profile?.bio || '';
    }
    
    if (categorySelect) {
        categorySelect.value = currentUser.profile?.category || '';
    }
    
    if (notificationsCheckbox) {
        notificationsCheckbox.checked = currentUser.profile?.notifications !== false;
    }
    
    closeAllDropdowns();
    openModal('profile-settings-modal');
}

// Сохранение настроек
function saveProfileSettings() {
    if (!currentUser) return;
    
    const nicknameInput = document.getElementById('profile-nickname');
    const bioInput = document.getElementById('profile-bio');
    const categorySelect = document.getElementById('profile-category');
    const notificationsCheckbox = document.getElementById('notifications-enabled');
    
    if (!currentUser.profile) {
        currentUser.profile = {};
    }
    
    currentUser.profile.nickname = nicknameInput?.value.trim() || '';
    currentUser.profile.bio = bioInput?.value.trim() || '';
    currentUser.profile.category = categorySelect?.value || '';
    currentUser.profile.notifications = notificationsCheckbox?.checked || true;
    
    if (!currentUser.profile.joined) {
        currentUser.profile.joined = new Date().toISOString().split('T')[0];
    }
    
    saveUser();
    updateUserProfileData();
    
    closeModal(document.getElementById('profile-settings-modal'));
    showNotification('Настройки профиля сохранены!', 'success');
}

// Показать профиль
function showMyProfile() {
    if (!currentUser) {
        openAuthModal();
        return;
    }
    
    const container = document.getElementById('user-profile-container');
    if (!container) return;
    
    const displayName = currentUser.profile?.nickname || 
                       `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 
                       'Пользователь';
    
    const joinDate = currentUser.profile?.joined ? new Date(currentUser.profile.joined) : new Date();
    const formattedDate = joinDate.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    container.innerHTML = `
        <div class="user-profile-header">
            <div class="user-profile-avatar">
                ${currentUser.generated_avatar ? 
                    `<img src="data:image/svg+xml;base64,${btoa(currentUser.generated_avatar)}" alt="${displayName}">` : 
                    `<div style="width:100%;height:100%;background:#333;display:flex;align-items:center;justify-content:center;color:#fff;font-size:2rem;">${displayName.charAt(0)}</div>`
                }
            </div>
            
            <div class="user-profile-info">
                <h1>${displayName}</h1>
                <p><strong>Telegram:</strong> ${currentUser.username ? `@${currentUser.username}` : 'Не указан'}</p>
                <p><strong>ID:</strong> ${currentUser.id}</p>
                <p><strong>Категория:</strong> ${currentUser.profile?.category || 'Не указана'}</p>
                <p><strong>Дата регистрации:</strong> ${formattedDate}</p>
                
                <div class="user-profile-stats">
                    <div class="stat-box">
                        <span class="stat-number">0</span>
                        <span class="stat-label">Избранное</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-number">1</span>
                        <span class="stat-label">Профиль</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-number">1</span>
                        <span class="stat-label">Активность</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="user-profile-content">
            <h3>О себе</h3>
            <p class="user-profile-bio">${currentUser.profile?.bio || 'Пользователь еще не добавил информацию о себе.'}</p>
            
            <div class="profile-actions" style="margin-top: 30px;">
                <button class="action-btn" onclick="openProfileSettings()">
                    <i class="fas fa-edit"></i> Редактировать профиль
                </button>
                <button class="action-btn" onclick="showNotification('Функция в разработке', 'info')">
                    <i class="fas fa-star"></i> Избранное
                </button>
                <button class="action-btn" onclick="showNotification('Функция в разработке', 'info')">
                    <i class="fas fa-history"></i> История
                </button>
            </div>
        </div>
    `;
    
    switchSection('user-profile-section');
    closeAllDropdowns();
}

// Выход
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        currentUser = null;
        localStorage.removeItem('fame_current_user');
        updateUserInterface();
        showNotification('Вы вышли из системы', 'info');
        switchSection('main');
    }
}

// Закрытие выпадающих меню
function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
    });
}

// Уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? 'rgba(0, 170, 0, 0.9)' : 
                     type === 'error' ? 'rgba(255, 68, 68, 0.9)' : 
                     'rgba(102, 102, 102, 0.9)'};
        color: white;
        border-radius: 10px;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        margin: 0;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация...');
    
    // Инициализация авторизации
    initAuthSystem();
    
    // Инициализация навигации
    initNavigation();
    
    // Инициализация участников
    initMembers();
    
    // Инициализация снега
    initSnow();
    
    // Инициализация настроек
    initSettings();
    
    // Инициализация неон-контролов
    initNeonControls();
    
    // Инициализация модальных окон
    initModals();
    
    // Загрузка сохраненных настроек
    loadSavedSettings();
    
    // Инициализация динамического неона
    initDynamicNeon();
    
    // Инициализация аватаров
    initAllAvatars();
    
    // Закрытие выпадающих меню при клике вне их
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.profile-dropdown')) {
            closeAllDropdowns();
        }
    });
    
    // Обработчик для переключения выпадающего меню
    const profileToggle = document.getElementById('profile-toggle');
    if (profileToggle) {
        profileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = document.getElementById('dropdown-menu');
            if (dropdown) {
                dropdown.classList.toggle('show');
            }
        });
    }
});

// ... остальной код остается без изменений (initNavigation, initMembers, и т.д.)
// Добавьте сюда все остальные функции из предыдущего script.js которые не относятся к авторизации
// (они остаются без изменений)

// Краткая версия остальных функций:
function initNavigation() {
    // ... существующий код навигации ...
}

function initMembers() {
    // ... существующий код участников ...
}

// ... и все остальные функции ...

// Не забудьте добавить обработчик для input токена
document.getElementById('token-input')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        loginWithToken();
    }
});
const members = [
    {
        id: 1,
        nickname: "зорф",
        username: "@tgzorf",
        category: "Владелец",
        role: "Владелец",
        description: "Владелец зорф Fame. Вход 50 зв, галочка 30зв, закреп 50зв.",
        avatar: "img/avatar1.png",
        verified: true,
        pinned: true,
        project: "https://t.me/NoolShy",
        telegram: "tgzorf",
        price: "https://noolshy.github.io/market/",
        chat: "https://t.me/NOOLSHY_CHAT",
        market: "https://noolshy.github.io/market/",
        fameList: "https://noolshy.github.io/fame/",
        github: "https://github.com/noolshy",

        joinDate: "2026-01-08",
        activity: "Постоянная",
        posts: 150,
        followers: 2500,
        priceEntry: "50 зв",
        priceVerified: "30 зв",
        pricePinned: "50 зв",
        details: "Создатель и владелец NoolShy Fame. Занимаюсь развитием сообщества и модерацией. Отвечаю на вопросы по поводу добавления в список и других услуг.",
        skills: ["Администрирование", "Модерация", "Развитие сообщества"],
        socials: {
            telegram: "@tgzorf",
            project: "https://t.me/NOOLSHY",
            price: "https://noolshy.github.io/market/"
        }
    },
];

let currentTheme = 'black';
let currentNeonColor = '#808080';
let currentNeonIntensity = 0.5;
let currentNeonSpeed = 5;
let currentAnimatedBg = 'hooks';
let currentBgSpeed = 10;
let currentBgOpacity = 0.5;


document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация...');
    initNavigation();
    initMembers();
    initSnow();
    initSettings();
    initNeonControls();
    initModals();
    loadSavedSettings();
    initDynamicNeon();
    initAllAvatars();
    
});

function generateBgGrid() {
    const grid = document.querySelector('.animated-bg-grid');
    if (!grid) {
        console.log('Сетка фонов не найдена');
        return;
    }
    
    grid.innerHTML = '';
    
    allBackgrounds.forEach(bg => {
        const option = document.createElement('div');
        option.className = `animated-bg-option ${bg === currentAnimatedBg ? 'active' : ''}`;
        option.dataset.bg = bg;
        
        option.innerHTML = `
            <div class="bg-preview ${bg}-bg"></div>
            <span>${getBgName(bg)}</span>
        `;
        
        option.addEventListener('click', function() {
            document.querySelectorAll('.animated-bg-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            currentAnimatedBg = this.dataset.bg;
            console.log('Выбран фон:', currentAnimatedBg);
        });
        
        grid.appendChild(option);
    });
    console.log('Сетка фонов сгенерирована');
}


function getBgName(bg) {
    const names = {
        'particles': 'Частицы', 'waves': 'Волны', 'pulse': 'Пульсация',
        'hooks': 'Зацепки', 'circuit': 'Микросхемы', 'grid': 'Сетка',
        'dots': 'Точки', 'lines': 'Линии', 'hexagon': 'Шестиугольники',
        'triangles': 'Треугольники', 'squares': 'Квадраты', 'circles': 'Круги',
        'nebula': 'Туманность', 'galaxy': 'Галактика', 'cosmic': 'Космос',
        'stardust': 'Звёздная пыль', 'matrix': 'Матрица', 'cyberpunk': 'Киберпанк',
        'circuit2': 'Микросхема 2', 'glitch': 'Глитч', 'rain': 'Дождь',
        'fire': 'Огонь', 'water': 'Вода', 'wind': 'Ветер',
        'vortex': 'Воронка', 'spiral': 'Спираль', 'radar': 'Радар',
        'sonar': 'Сонар'
    };
    
    return names[bg] || bg;
}


function loadAvatarWithFallback(imgElement, src, nickname) {
    return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
            imgElement.src = src;
            imgElement.style.opacity = '1';
            resolve(true);
        };
        
        img.onerror = () => {
      
            const initial = nickname.charAt(0).toUpperCase();
            const color = generateColorFromNickname(nickname);
            
            const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="${color}" rx="50"/>
                    <text x="50" y="50" text-anchor="middle" dy="0.35em" 
                          font-family="Arial, sans-serif" font-size="40" 
                          font-weight="bold" fill="#fff">${initial}</text>
                </svg>
            `;
            
            imgElement.src = 'data:image/svg+xml;base64,' + btoa(svg);
            imgElement.style.opacity = '1';
            imgElement.classList.add('avatar-fallback');
            resolve(false);
        };
        
   
        imgElement.style.opacity = '0';
        if (imgElement.parentElement) {
            imgElement.parentElement.classList.add('loading');
        }
        
        setTimeout(() => img.src = src, 100);
        
        setTimeout(() => {
            if (imgElement.parentElement) {
                imgElement.parentElement.classList.remove('loading');
            }
            imgElement.style.opacity = '1';
        }, 2000);
    });
}


function generateColorFromNickname(nickname) {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    
    let hash = 0;
    for (let i = 0; i < nickname.length; i++) {
        hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}

function initNavigation() {
    console.log('Инициализация навигации...');
    
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenu = document.getElementById('close-menu');
    const sideMenu = document.getElementById('side-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sideMenu.classList.add('active');
            console.log('Меню открыто');
        });
    } else {
        console.error('Кнопка меню не найдена');
    }
    
    if (closeMenu) {
        closeMenu.addEventListener('click', () => {
            sideMenu.classList.remove('active');
            console.log('Меню закрыто');
        });
    }
    
   
    const navTabs = document.querySelectorAll('.nav-tab');
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.section');
    
    function switchSection(sectionId) {
        console.log('Переключение на секцию:', sectionId);
        
        sections.forEach(section => {
            section.classList.remove('active-section');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active-section');
            console.log('Секция активирована:', sectionId);
        } else {
            console.error('Секция не найдена:', sectionId);
        }
        
        navTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.section === sectionId) {
                tab.classList.add('active');
            }
        });
        
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            }
        });
    }
    
    navTabs.forEach(tab => {
        if (tab.dataset.section) {
            tab.addEventListener('click', () => {
                switchSection(tab.dataset.section);
            });
        }
    });
    
    menuItems.forEach(item => {
        if (item.dataset.section) {
            item.addEventListener('click', () => {
                switchSection(item.dataset.section);
                if (sideMenu) sideMenu.classList.remove('active');
            });
        }
    });
    
   
    const faqBtn = document.getElementById('faq-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const menuSettings = document.getElementById('menu-settings');
    const animatedBgBtn = document.getElementById('animated-bg-btn');
    const menuAnimatedBg = document.getElementById('menu-animated-bg');
    
    if (faqBtn) {
        faqBtn.addEventListener('click', () => {
            switchSection('faq-section');
        });
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            openModal('settings-modal');
        });
    }
    
    if (menuSettings) {
        menuSettings.addEventListener('click', () => {
            openModal('settings-modal');
            if (sideMenu) sideMenu.classList.remove('active');
        });
    }
    
    
    console.log('Навигация инициализирована');
}


function initAllAvatars() {
    console.log('Инициализация аватаров...');
    loadMembers();
}


function initMembers() {
    console.log('Инициализация участников...');
    loadMembers();
    
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const category = this.dataset.category;
                console.log('Фильтр:', category);
                filterMembers(category);
            });
        });
    } else {
        console.error('Кнопки фильтра не найдены');
    }
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('Поиск:', searchTerm);
            searchMembers(searchTerm);
        });
    } else {
        console.error('Поле поиска не найдено');
    }
}


function loadMembers() {
    const container = document.getElementById('members-container');
    if (!container) {
        console.error('Контейнер участников не найден');
        return;
    }
    
    container.innerHTML = '';
    
    if (members.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888; padding: 40px;">Нет участников для отображения</p>';
        console.log('Нет участников для отображения');
        return;
    }
    
    const sortedMembers = [...members].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        if (a.verified && !b.verified) return -1;
        if (!a.verified && b.verified) return 1;
        return 0;
    });
    
    sortedMembers.forEach(member => {
        const card = createMemberCard(member);
        container.appendChild(card);
    });
    
   
    document.querySelectorAll('.member-card').forEach(card => {
        card.addEventListener('click', function() {
            const memberId = this.dataset.id;
            console.log('Клик по участнику:', memberId);
            showProfile(memberId);
        });
    });
    
    console.log('Участники загружены:', sortedMembers.length);
}


function createMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'member-card';
    card.dataset.id = member.id;
    card.dataset.category = member.category;
    
    if (member.scam) card.classList.add('scam');
    else if (member.pinned) card.classList.add('pinned');
    if (member.verified && !member.scam) card.classList.add('verified');
  
    const avatarId = `avatar-${member.id}`;
    
card.innerHTML = `
    <div class="member-avatar" data-initial="${member.nickname.charAt(0).toUpperCase()}">
        <img id="${avatarId}" 
             src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9IiMzMzMzMzMiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiLz48dGV4dCB4PSI5MCIgeT0iNTAiIGR5PSIwLjM1ZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmZmYiPk48L3RleHQ+PC9zdmc+" 
             alt="${member.nickname}"
             loading="lazy">
    </div>
    
    <div class="member-info">
        <h3>${member.nickname} ${member.scam ? '⚠️' : (member.verified ? '✓' : '')}</h3>
        <div class="member-role">${member.role}</div>
        <p class="member-description">${member.description}</p>
        <div class="member-badges">
            ${member.scam ? '⚠️ ' : ''}${member.pinned ? '📍 ' : ''}${member.verified ? '✓ ' : ''}${member.category}
        </div>
    </div>
`;
    
  
    setTimeout(() => {
        const img = card.querySelector(`#${avatarId}`);
        if (img) {
            loadAvatarWithFallback(img, `img/avatar${member.id}.png`, member.nickname);
        }
    }, 10);
    
    return card;
}


function filterMembers(category) {
    const cards = document.querySelectorAll('.member-card');
    console.log('Фильтрация участников по категории:', category, 'найдено карточек:', cards.length);
    
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
            }, 10);
        } else {
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

function searchMembers(term) {
    const cards = document.querySelectorAll('.member-card');
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.category || 'all';
    
    cards.forEach(card => {
        const nickname = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('.member-description').textContent.toLowerCase();
        
        const matchesSearch = nickname.includes(term) || description.includes(term);
        const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
        
        if (matchesSearch && matchesFilter) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
            }, 10);
        } else {
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

function createSocialButton(icon, text, url, className = '') {
    if (!url) return '';
    return `
        <a href="${url}" class="action-btn ${className}" target="_blank">
            <i class="${icon}"></i> ${text}
        </a>
    `;
}


function showProfile(memberId) {
    const member = members.find(m => m.id == memberId);
    if (!member) {
        console.error('Участник не найден:', memberId);
        return;
    }
    
    const container = document.getElementById('profile-content');
    if (!container) {
        console.error('Контейнер профиля не найден');
        return;
    }
    
    const joinDate = new Date(member.joinDate);
    const formattedDate = joinDate.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
 
let badgesHtml = '';
if (member.scam) {
    badgesHtml += '<span class="badge scam">⚠️ Скам (Осторожно!)</span>';
} else if (member.verified) {
    badgesHtml += '<span class="badge verified">✓ Верифицирован</span>';
}
if (member.pinned) badgesHtml += '<span class="badge pinned">📌 Закреплён</span>';
badgesHtml += `<span class="badge category">${member.category}</span>`;
    

    let mainButtons = createSocialButton('fab fa-telegram', 'Написать в ЛС', `https://t.me/${member.telegram}`, 'telegram');
    if (member.project) mainButtons += createSocialButton('fas fa-external-link-alt', 'Основной канал', member.project, 'telegram');
    if (member.forum) mainButtons += createSocialButton('fas fa-userst', 'Форум', member.forum, 'telegram');
    if (member.chat) mainButtons += createSocialButton('fas fa-comments', 'Чат', member.chat, 'telegram');
    if (member.market) mainButtons += createSocialButton('fas fa-shopping-cart', 'Маркет', member.market);
    if (member.fameList) mainButtons += createSocialButton('fas fa-list', 'Фейм лист', member.fameList);
    if (member.github) mainButtons += createSocialButton('fab fa-github', 'GitHub', member.github);
    
  
    let extraButtons = '';
    
   
    const allPossibleLinks = {
        'price': {icon: 'fas fa-tag', text: 'Прайс'},
        'priceList': {icon: 'fas fa-tags', text: 'Прайс-лист'},
        'market': {icon: 'fas fa-shopping-cart', text: 'Маркет'},
        'tiktok': {icon: 'fab fa-tiktok', text: 'TikTok'},
        'youtube': {icon: 'fab fa-youtube', text: 'YouTube'},
        'yt': {icon: 'fab fa-youtube', text: 'YouTube'},
        'discord': {icon: 'fab fa-discord', text: 'Discord'},
        'vk': {icon: 'fab fa-vk', text: 'VK'},
        'gift': {icon: 'fas fa-gift', text: 'Подарок'},
        'website': {icon: 'fas fa-globe', text: 'Сайт'},
        'reputation': {icon: 'fas fa-star', text: 'Репутация'},
        'work': {icon: 'fas fa-briefcase', text: 'Ворк'},
        'forum': {icon: 'fas fa-users', text: 'Форум'},
        'def': {icon: 'fas fa-shield-alt', text: 'Деф'},
        'whitelist': {icon: 'fas fa-list', text: 'White List'},
        'blog': {icon: 'fas fa-blog', text: 'Блог'},
        'private': {icon: 'fas fa-lock', text: 'Приват'}
    };
    
    Object.keys(allPossibleLinks).forEach(key => {
        if (member[key]) {
            extraButtons += createSocialButton(allPossibleLinks[key].icon, allPossibleLinks[key].text, member[key]);
        }
    });
    

    const stats = {
        'Статус': member.role,
        'Верификация': member.verified ? '✓ Подтверждён' : '✗ Не подтверждён',
        'Закреп': member.pinned ? '📌 Включён' : '✗ Выключен',
        'Дата регистрации': formattedDate,
        'Активность': member.activity,
        'Подписчики': member.followers,
        'ID': member.id
    };
    
    if (member.priceEntry) stats['Цена входа'] = member.priceEntry;
    if (member.priceVerified) stats['Цена галочки'] = member.priceVerified;
    if (member.pricePinned) stats['Цена закрепа'] = member.pricePinned;
    
    let statsHtml = '';
    Object.entries(stats).forEach(([label, value]) => {
        if (value) {
            statsHtml += `
                <div class="stat-item">
                    <span class="stat-label">${label}:</span>
                    <span class="stat-value">${value}</span>
                </div>
            `;
        }
    });
    
    const profileAvatarId = `profile-avatar-${member.id}`;
    
    container.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar" data-initial="${member.nickname.charAt(0).toUpperCase()}">
                <img id="${profileAvatarId}" 
                     src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9IiMzMzMzMzMiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGR5PSIwLjM1ZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmZmYiPk48L3RleHQ+PC9zdmc+" 
                     alt="${member.nickname}"
                     loading="eager">
            </div>
            
            <h1 class="profile-title">${member.nickname}</h1>
            <p class="profile-username">${member.username}</p>
            
            <div class="profile-badges">
                ${badgesHtml}
            </div>
            
            <div class="profile-actions">
                ${mainButtons}
                <button class="action-btn" onclick="copyProfileLink('${member.nickname}')">
                    <i class="fas fa-share"></i> Поделиться
                </button>
            </div>
        </div>
        
        <div class="profile-content">
            <div class="profile-description">
                <h3>Описание</h3>
                <p>${member.description || 'Нет описания'}</p>
                
                ${member.details ? `
                    <h3 style="margin-top: 30px;">Детали</h3>
                    <p>${member.details}</p>
                ` : ''}
                
                ${member.skills && member.skills.length > 0 ? `
                    <h3 style="margin-top: 30px;">Навыки и специализация</h3>
                    <p>${member.skills.join(' • ')}</p>
                ` : ''}
                
                ${extraButtons ? `
                    <h3 style="margin-top: 30px;">Дополнительные ссылки</h3>
                    <div class="profile-actions">
                        ${extraButtons}
                    </div>
                ` : ''}
            </div>
            
            <div class="profile-stats">
                <h3>Статистика</h3>
                ${statsHtml}
            </div>
        </div>
    `;
    

    setTimeout(() => {
        const img = document.getElementById(profileAvatarId);
        if (img) {
            loadAvatarWithFallback(img, `img/avatar${member.id}.png`, member.nickname);
        }
    }, 10);
    
    switchSection('profile-details');
}


function initSnow() {
    const snowContainer = document.querySelector('.snow-container');
    if (!snowContainer) return;
    
    createSnowflakes();
    
    const snowToggle = document.getElementById('snow-effect');
    if (snowToggle) {
        snowToggle.addEventListener('change', function() {
            if (this.checked) {
                snowContainer.style.display = 'block';
                createSnowflakes();
            } else {
                snowContainer.style.display = 'none';
                snowContainer.innerHTML = '';
            }
        });
    }
}


function createSnowflakes() {
    const snowContainer = document.querySelector('.snow-container');
    if (!snowContainer) return;
    
    snowContainer.innerHTML = '';
    
    for (let i = 0; i < 60; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        const size = Math.random() * 4 + 2;
        const startX = Math.random() * 100;
        const duration = Math.random() * 5 + 5;
        const opacity = Math.random() * 0.5 + 0.3;
        
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.left = `${startX}vw`;
        snowflake.style.opacity = opacity;
        snowflake.style.animationDuration = `${duration}s`;
        snowflake.style.animationDelay = `${Math.random() * 5}s`;
        snowflake.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
        
        snowContainer.appendChild(snowflake);
    }
}


function initSettings() {
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab + '-tab';
            
            settingsTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    const themeOptions = document.querySelectorAll('.theme-option');
    
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            applyTheme(theme);
        });
    });
    
    const bgUpload = document.getElementById('bg-upload');
    const bgPreview = document.getElementById('bg-preview');
    
    if (bgUpload) {
        bgUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    bgPreview.innerHTML = `<img src="${e.target.result}" alt="Фон">`;
                    bgPreview.style.display = 'block';
                    
                    localStorage.setItem('fame_background', e.target.result);
                    document.body.style.backgroundImage = `url(${e.target.result})`;
                    document.body.style.backgroundSize = 'cover';
                    document.body.style.backgroundAttachment = 'fixed';
                    document.body.style.backgroundPosition = 'center';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    const neonFlowEffect = document.getElementById('neon-flow-effect');
    if (neonFlowEffect) {
        neonFlowEffect.addEventListener('change', function() {
            if (this.checked) {
                initDynamicNeon();
            } else {
                removeNeonFlow();
            }
        });
    }
}


function initNeonControls() {
    const neonColor = document.getElementById('neon-color');
    const neonIntensity = document.getElementById('neon-intensity');
    const neonSpeed = document.getElementById('neon-speed');
    const applyNeonBtn = document.getElementById('apply-neon');
    const intensityValue = document.getElementById('intensity-value');
    const speedValue = document.getElementById('speed-value');
    const colorPreview = document.getElementById('neon-color-preview');
    
    if (neonColor && colorPreview) {
        neonColor.addEventListener('input', function() {
            colorPreview.style.backgroundColor = this.value;
        });
        colorPreview.style.backgroundColor = neonColor.value;
    }
    
    if (neonIntensity && intensityValue) {
        neonIntensity.addEventListener('input', function() {
            intensityValue.textContent = this.value + '%';
        });
        intensityValue.textContent = neonIntensity.value + '%';
    }
    
    if (neonSpeed && speedValue) {
        const speedLabels = {
            1: 'Очень медленно',
            2: 'Медленно',
            3: 'Немного медленно',
            4: 'Ниже средней',
            5: 'Средняя',
            6: 'Выше средней',
            7: 'Быстро',
            8: 'Очень быстро',
            9: 'Супер быстро',
            10: 'Максимальная'
        };
        
        neonSpeed.addEventListener('input', function() {
            speedValue.textContent = speedLabels[this.value] || 'Средняя';
        });
        speedValue.textContent = speedLabels[neonSpeed.value] || 'Средняя';
    }
    
    if (applyNeonBtn) {
        applyNeonBtn.addEventListener('click', function() {
            const color = neonColor.value;
            const intensity = parseInt(neonIntensity.value) / 100;
            const speed = parseInt(neonSpeed.value);
            
            applyNeonSettings(color, intensity, speed);
        });
    }
}


function applyNeonSettings(color, intensity, speed) {
    currentNeonColor = color;
    currentNeonIntensity = intensity;
    currentNeonSpeed = speed;
    
    localStorage.setItem('fame_neon_color', color);
    localStorage.setItem('fame_neon_intensity', intensity);
    localStorage.setItem('fame_neon_speed', speed);
    
    initDynamicNeon();
}


function initDynamicNeon() {
    const oldStyle = document.getElementById('dynamic-neon-style');
    if (oldStyle) oldStyle.remove();
    
    const hex = currentNeonColor;
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    
    const duration = (11 - currentNeonSpeed) + 's';
    
    const style = document.createElement('style');
    style.id = 'dynamic-neon-style';
    
    style.textContent = `
        @keyframes neonFlow {
            0%, 100% { 
                box-shadow: 0 0 ${10 * currentNeonIntensity}px rgba(${r}, ${g}, ${b}, ${0.8 * currentNeonIntensity}),
                          0 0 ${20 * currentNeonIntensity}px rgba(${r}, ${g}, ${b}, ${0.6 * currentNeonIntensity}),
                          0 0 ${30 * currentNeonIntensity}px rgba(${r}, ${g}, ${b}, ${0.4 * currentNeonIntensity}),
                          inset 0 0 ${10 * currentNeonIntensity}px rgba(${r}, ${g}, ${b}, ${0.5 * currentNeonIntensity}); 
            }
            50% { 
                box-shadow: 0 0 ${15 * currentNeonIntensity}px rgba(${r}, ${g}, ${b}, ${0.9 * currentNeonIntensity}),
                          0 0 ${25 * currentNeonIntensity}px rgba(${r}, ${g}, ${b}, ${0.7 * currentNeonIntensity}),
                          0 0 ${35 * currentNeonIntensity}px rgba(${r}, ${g}, ${b}, ${0.5 * currentNeonIntensity}),
                          inset 0 0 ${15 * currentNeonIntensity}px rgba(${r}, ${g}, ${b}, ${0.6 * currentNeonIntensity}); 
            }
        }
        
        @keyframes textNeonFlow {
            0%, 100% { 
                text-shadow: 0 0 ${5 * currentNeonIntensity}px rgba(${r}, ${g}, ${b}, ${0.8 * currentNeonIntensity}),
                           0 0 ${10 * currentNeonIntensity}px rgba(${r}, ${g}, ${b}, ${0.6 * currentNeonIntensity}); 
            }
            50% { 
                text-shadow: 0 0 ${8 * currentNeonIntensity}px rgba(${r}, ${g}, ${b}, ${0.9 * currentNeonIntensity}),
                           0 0 ${15 * currentNeonIntensity}px rgba(${r}, ${g}, ${b}, ${0.7 * currentNeonIntensity}); 
            }
        }
        
        .neon-flow {
            animation: neonFlow ${duration} ease-in-out infinite !important;
        }
        
        .text-neon-flow {
            animation: textNeonFlow ${duration} ease-in-out infinite !important;
        }
    `;
    
    document.head.appendChild(style);
    
    const neonFlowEffect = document.getElementById('neon-flow-effect');
    if (neonFlowEffect && neonFlowEffect.checked) {
        applyNeonToElements();
    }
}


function applyNeonToElements() {
    document.querySelectorAll('.member-card').forEach(card => {
        card.classList.add('neon-flow');
    });
    
    document.querySelectorAll('.modal-content').forEach(modal => {
        modal.classList.add('neon-flow');
    });
    
    document.querySelectorAll('.upload-btn').forEach(btn => {
        btn.classList.add('neon-flow');
    });
    
    const profileHeader = document.querySelector('.profile-header');
    if (profileHeader) {
        profileHeader.classList.add('neon-flow');
    }
}

function removeNeonFlow() {
    document.querySelectorAll('.neon-flow').forEach(el => {
        el.classList.remove('neon-flow');
    });
    document.querySelectorAll('.text-neon-flow').forEach(el => {
        el.classList.remove('text-neon-flow');
    });
}

function initAnimatedBg() {
    const bgSpeed = document.getElementById('bg-speed');
    const bgOpacity = document.getElementById('bg-opacity');
    const applyBgBtn = document.getElementById('apply-animated-bg');
    
    if (bgSpeed) {
        bgSpeed.addEventListener('input', function() {
            currentBgSpeed = parseInt(this.value);
        });
    }
    
    if (bgOpacity) {
        bgOpacity.addEventListener('input', function() {
            currentBgOpacity = parseInt(this.value) / 100;
        });
    }
    
    if (applyBgBtn) {
        applyBgBtn.addEventListener('click', applyAnimatedBg);
    }
}


function applyAnimatedBg() {
    const bgElement = document.getElementById('animated-bg');
    if (!bgElement) return;

    allBackgrounds.forEach(bg => {
        bgElement.classList.remove(`${bg}-bg`);
    });
    
    
    bgElement.classList.add(`${currentAnimatedBg}-bg`);
    

    const speed = currentBgSpeed / 10;
    bgElement.style.animationDuration = `${20 / speed}s`;
    
    
    bgElement.style.opacity = currentBgOpacity;
    
 
    localStorage.setItem('fame_animated_bg', currentAnimatedBg);
    localStorage.setItem('fame_bg_speed', currentBgSpeed);
    localStorage.setItem('fame_bg_opacity', currentBgOpacity);
    
    console.log('Фон применен:', currentAnimatedBg);
}


function initModals() {
    console.log('Инициализация модальных окон...');
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            closeModal(this.closest('.modal'));
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });
    
    console.log('Модальные окна инициализированы');
}


function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Модальное окно открыто:', modalId);
    } else {
        console.error('Модальное окно не найдено:', modalId);
    }
}


function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        console.log('Модальное окно закрыто');
    }
}


function loadSavedSettings() {
    console.log('Загрузка сохраненных настроек...');
   
    const savedTheme = localStorage.getItem('fame_theme') || 'black'; 
    if (savedTheme) {
        const themeOption = document.querySelector(`.theme-option[data-theme="${savedTheme}"]`);
        if (themeOption) {
            themeOption.click();
        } else {
          
            applyTheme('black');
        }
    } else {
     
        applyTheme('black');
    }
    
   
    const savedBg = localStorage.getItem('fame_background');
    if (savedBg) {
        document.body.style.backgroundImage = `url(${savedBg})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundPosition = 'center';
    }
    
   
    const savedNeonColor = localStorage.getItem('fame_neon_color') || '#808080';
    const savedNeonIntensity = parseFloat(localStorage.getItem('fame_neon_intensity')) || 0.5;
    const savedNeonSpeed = parseInt(localStorage.getItem('fame_neon_speed')) || 5;
    
    const neonColor = document.getElementById('neon-color');
    const neonIntensity = document.getElementById('neon-intensity');
    const neonSpeed = document.getElementById('neon-speed');
    
    if (neonColor) neonColor.value = savedNeonColor;
    if (neonIntensity) neonIntensity.value = savedNeonIntensity * 100;
    if (neonSpeed) neonSpeed.value = savedNeonSpeed;
    
    applyNeonSettings(savedNeonColor, savedNeonIntensity, savedNeonSpeed);
         
    const savedNeonFlow = localStorage.getItem('fame_neon_flow');
    const neonFlowCheckbox = document.getElementById('neon-flow-effect');
    if (neonFlowCheckbox) {
        if (savedNeonFlow === 'disabled') {
            neonFlowCheckbox.checked = false;
            removeNeonFlow();
        } else {
            neonFlowCheckbox.checked = true;
        }
    }
    
   
    const savedSnow = localStorage.getItem('fame_snow');
    const snowCheckbox = document.getElementById('snow-effect');
    if (snowCheckbox) {
        if (savedSnow === 'disabled') {
            snowCheckbox.checked = false;
            const snowContainer = document.querySelector('.snow-container');
            if (snowContainer) snowContainer.style.display = 'none';
        } else {
            snowCheckbox.checked = true;
        }
    }
}

function applyTheme(theme) {
    currentTheme = theme;
    
    const themeClasses = ['dark-theme', 'black-theme', 'red-theme', 'red-black-theme', 
                         'red-gray-theme', 'purple-theme', 'blue-theme', 'green-theme', 
                         'orange-theme', 'pink-theme'];
    
    document.body.classList.remove(...themeClasses);
    document.body.classList.add(theme + '-theme');
    
    localStorage.setItem('fame_theme', theme);
}


window.copyProfileLink = function(username) {
    const link = `https://t.me/NOOLSHY?text=Профиль%20${encodeURIComponent(username)}%20на%20NoolShy%20Fame`;
    navigator.clipboard.writeText(link).then(() => {
        alert('Ссылка на профиль скопирована в буфер обмена!');
    });
};


document.getElementById('snow-effect')?.addEventListener('change', function() {
    localStorage.setItem('fame_snow', this.checked ? 'enabled' : 'disabled');
});

document.getElementById('neon-flow-effect')?.addEventListener('change', function() {
    localStorage.setItem('fame_neon_flow', this.checked ? 'enabled' : 'disabled');
    if (this.checked) {
        initDynamicNeon();
    } else {
        removeNeonFlow();
    }
});

function switchSection(sectionId) {
    console.log('Переключение секции:', sectionId);
    
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active-section');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active-section');
    }
    
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.section === sectionId) {
            tab.classList.add('active');
        }
    });
}
