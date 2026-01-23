// ============================================
// СИСТЕМА АВТОРИЗАЦИИ ЧЕРЕЗ TELEGRAM
// ============================================

// Текущий пользователь
let currentUser = null;

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
        processTelegramLogin(token);
        
        // Убираем токен из URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
}

// Вход по токену вручную
function loginWithToken() {
    const tokenInput = document.getElementById('token-input');
    const token = tokenInput.value.trim();
    
    if (!token) {
        showNotification('Введите токен из Telegram бота', 'error');
        return;
    }
    
    processTelegramLogin(token);
    tokenInput.value = '';
}

// Обработка логина через Telegram
function processTelegramLogin(token) {
    try {
        // Декодируем токен (формат: id_username_firstname_lastname)
        const parts = token.split('_');
        
        if (parts.length >= 2) {
            const userId = parts[0];
            const username = parts[1];
            const firstName = parts[2] || '';
            const lastName = parts[3] || '';
            
            currentUser = {
                id: userId,
                first_name: firstName,
                last_name: lastName,
                username: username,
                auth_date: Math.floor(Date.now() / 1000),
                hash: token,
                profile: {
                    nickname: firstName + (lastName ? ' ' + lastName : ''),
                    bio: '',
                    notifications: true,
                    joined: new Date().toISOString().split('T')[0]
                }
            };
            
            // Получаем реальный аватар из Telegram
            getTelegramAvatar(userId, username).then(avatarUrl => {
                if (avatarUrl) {
                    currentUser.photo_url = avatarUrl;
                }
                completeLogin();
            }).catch(() => {
                completeLogin();
            });
            
        } else {
            showNotification('Неверный формат токена', 'error');
        }
    } catch (error) {
        console.error('Ошибка обработки токена:', error);
        showNotification('Ошибка авторизации', 'error');
    }
}

// Получение аватара из Telegram
async function getTelegramAvatar(userId, username) {
    try {
        // Для реального аватара нужно использовать Telegram API
        // Пока возвращаем заглушку
        return `https://t.me/i/userpic/320/${username}.jpg`;
    } catch (error) {
        return null;
    }
}

// Завершение логина
function completeLogin() {
    // Генерируем аватар если нет фото
    generateColorAvatar(currentUser);
    
    saveUser();
    updateUserInterface();
    closeModal(document.getElementById('auth-modal'));
    
    showNotification('Успешный вход через Telegram!', 'success');
}

// Демо-вход
function demoLogin() {
    currentUser = {
        id: 287265398,
        first_name: "Зорф",
        last_name: "",
        username: "tgzorf",
        auth_date: Math.floor(Date.now() / 1000),
        hash: "demo_hash",
        photo_url: "https://t.me/i/userpic/320/tgzorf.jpg",
        profile: {
            nickname: "Зорф",
            bio: "Владелец NoolShy Fame",
            notifications: true,
            joined: new Date().toISOString().split('T')[0]
        }
    };
    
    generateColorAvatar(currentUser);
    
    saveUser();
    updateUserInterface();
    closeModal(document.getElementById('auth-modal'));
    
    showNotification('Демо-вход как Зорф', 'success');
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
    
    if (currentUser.photo_url) {
        if (userAvatar) userAvatar.src = currentUser.photo_url;
        if (dropdownAvatar) dropdownAvatar.src = currentUser.photo_url;
    } else if (currentUser.generated_avatar) {
        const avatarSrc = 'data:image/svg+xml;base64,' + btoa(currentUser.generated_avatar);
        if (userAvatar) userAvatar.src = avatarSrc;
        if (dropdownAvatar) dropdownAvatar.src = avatarSrc;
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
    const notificationsCheckbox = document.getElementById('notifications-enabled');
    
    if (nicknameInput) {
        nicknameInput.value = currentUser.profile?.nickname || 
                            `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim();
    }
    
    if (bioInput) {
        bioInput.value = currentUser.profile?.bio || '';
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
    const notificationsCheckbox = document.getElementById('notifications-enabled');
    
    if (!currentUser.profile) {
        currentUser.profile = {};
    }
    
    currentUser.profile.nickname = nicknameInput?.value.trim() || '';
    currentUser.profile.bio = bioInput?.value.trim() || '';
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
                ${currentUser.photo_url ? 
                    `<img src="${currentUser.photo_url}" alt="${displayName}">` :
                    currentUser.generated_avatar ? 
                        `<img src="data:image/svg+xml;base64,${btoa(currentUser.generated_avatar)}" alt="${displayName}">` :
                        `<div class="avatar-fallback">${displayName.charAt(0)}</div>`
                }
            </div>
            
            <div class="user-profile-info">
                <h1>${displayName}</h1>
                <p><strong>Telegram ID:</strong> ${currentUser.id}</p>
                <p><strong>Username:</strong> @${currentUser.username || 'не указан'}</p>
                <p><strong>Дата регистрации:</strong> ${formattedDate}</p>
                
                <div class="user-profile-stats">
                    <div class="stat-box">
                        <span class="stat-number">👤</span>
                        <span class="stat-label">Профиль</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-number">✓</span>
                        <span class="stat-label">Верифицирован</span>
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
                <button class="action-btn" onclick="copyProfileLink('${currentUser.username || currentUser.id}')">
                    <i class="fas fa-share"></i> Поделиться профилем
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
// ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ
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

// Навигация
function initNavigation() {
    console.log('Инициализация навигации...');
    
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenu = document.getElementById('close-menu');
    const sideMenu = document.getElementById('side-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sideMenu.classList.add('active');
        });
    }
    
    if (closeMenu) {
        closeMenu.addEventListener('click', () => {
            sideMenu.classList.remove('active');
        });
    }
    
    const navTabs = document.querySelectorAll('.nav-tab');
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.section');
    
    function switchSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active-section');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active-section');
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
}

// Участники
const members = [
    {
        id: 1,
        nickname: "Зорф",
        username: "@tgzorf",
        category: "Владелец",
        role: "Владелец",
        description: "Владелец NoolShy Fame. Вход 50 зв, галочка 30зв, закреп 50зв.",
        avatar: "img/avatar1.png",
        verified: true,
        pinned: true,
        project: "https://t.me/NOOLSHY",
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
        details: "Создатель и владелец NoolShy Fame. Занимаюсь развитием сообщества и модерацией.",
        skills: ["Администрирование", "Модерация", "Развитие сообщества"],
        socials: {
            telegram: "@tgzorf",
            project: "https://t.me/NOOLSHY",
            price: "https://noolshy.github.io/market/"
        }
    },
];

function initMembers() {
    loadMembers();
    
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterMembers(this.dataset.category);
        });
    });
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchMembers(e.target.value.toLowerCase());
        });
    }
}

function loadMembers() {
    const container = document.getElementById('members-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    members.forEach(member => {
        const card = createMemberCard(member);
        container.appendChild(card);
    });
    
    document.querySelectorAll('.member-card').forEach(card => {
        card.addEventListener('click', function() {
            const memberId = this.dataset.id;
            showProfile(memberId);
        });
    });
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
        <div class="member-avatar">
            <img id="${avatarId}" 
                 src="img/avatar${member.id}.png" 
                 alt="${member.nickname}"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9IiMzMzMiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+${member.nickname.charAt(0)}</dGV4dD48L3N2Zz4='">
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
    
    return card;
}

function filterMembers(category) {
    const cards = document.querySelectorAll('.member-card');
    
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
            card.style.opacity = '1';
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
            card.style.opacity = '1';
        } else {
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

function showProfile(memberId) {
    const member = members.find(m => m.id == memberId);
    if (!member) return;
    
    const container = document.getElementById('profile-content');
    if (!container) return;
    
    let badgesHtml = '';
    if (member.scam) {
        badgesHtml += '<span class="badge scam">⚠️ Скам (Осторожно!)</span>';
    } else if (member.verified) {
        badgesHtml += '<span class="badge verified">✓ Верифицирован</span>';
    }
    if (member.pinned) badgesHtml += '<span class="badge pinned">📌 Закреплён</span>';
    badgesHtml += `<span class="badge category">${member.category}</span>`;
    
    const mainButtons = `
        <a href="https://t.me/${member.telegram}" class="action-btn telegram" target="_blank">
            <i class="fab fa-telegram"></i> Написать в ЛС
        </a>
        <a href="${member.project}" class="action-btn" target="_blank">
            <i class="fas fa-external-link-alt"></i> Основной канал
        </a>
        <button class="action-btn" onclick="copyProfileLink('${member.nickname}')">
            <i class="fas fa-share"></i> Поделиться
        </button>
    `;
    
    container.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">
                <img src="img/avatar${member.id}.png" alt="${member.nickname}"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9IiMzMzMiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+${member.nickname.charAt(0)}</dGV4dD48L3N2Zz4='">
            </div>
            
            <h1 class="profile-title">${member.nickname}</h1>
            <p class="profile-username">${member.username}</p>
            
            <div class="profile-badges">
                ${badgesHtml}
            </div>
            
            <div class="profile-actions">
                ${mainButtons}
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
            </div>
            
            <div class="profile-stats">
                <h3>Статистика</h3>
                <div class="stat-item">
                    <span class="stat-label">Статус:</span>
                    <span class="stat-value">${member.role}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Верификация:</span>
                    <span class="stat-value">${member.verified ? '✓ Подтверждён' : '✗ Не подтверждён'}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">ID:</span>
                    <span class="stat-value">${member.id}</span>
                </div>
            </div>
        </div>
    `;
    
    switchSection('profile-details');
}

// Снег
function initSnow() {
    const snowContainer = document.querySelector('.snow-container');
    if (!snowContainer) return;
    
    createSnowflakes();
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

// Настройки
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
}

// Неон
function initNeonControls() {
    const applyNeonBtn = document.getElementById('apply-neon');
    if (applyNeonBtn) {
        applyNeonBtn.addEventListener('click', function() {
            const color = document.getElementById('neon-color').value;
            const intensity = parseInt(document.getElementById('neon-intensity').value) / 100;
            const speed = parseInt(document.getElementById('neon-speed').value);
            
            applyNeonSettings(color, intensity, speed);
        });
    }
}

function applyNeonSettings(color, intensity, speed) {
    localStorage.setItem('fame_neon_color', color);
    localStorage.setItem('fame_neon_intensity', intensity);
    localStorage.setItem('fame_neon_speed', speed);
    
    initDynamicNeon();
}

function initDynamicNeon() {
    // Реализация неона
}

// Модальные окна
function initModals() {
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
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Загрузка настроек
function loadSavedSettings() {
    const savedTheme = localStorage.getItem('fame_theme') || 'black';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    const themeClasses = ['dark-theme', 'black-theme', 'red-theme', 'red-black-theme', 
                         'red-gray-theme', 'purple-theme', 'blue-theme', 'green-theme', 
                         'orange-theme', 'pink-theme'];
    
    document.body.classList.remove(...themeClasses);
    document.body.classList.add(theme + '-theme');
    
    localStorage.setItem('fame_theme', theme);
}

// Вспомогательные функции
function copyProfileLink(username) {
    const link = `https://t.me/NOOLSHY?text=Профиль%20${encodeURIComponent(username)}%20на%20NoolShy%20Fame`;
    navigator.clipboard.writeText(link).then(() => {
        alert('Ссылка на профиль скопирована в буфер обмена!');
    });
}

function initAllAvatars() {
    // Инициализация аватаров
}
