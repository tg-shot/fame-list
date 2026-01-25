let currentUser = null;
const ADMIN_ID = '287265398';

const ENCRYPT_MAP = {
    '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E',
    '6': 'F', '7': 'G', '8': 'H', '9': 'I', '0': 'J',
    'a': 'K', 'b': 'L', 'c': 'M', 'd': 'N', 'e': 'O',
    'f': 'P', 'g': 'Q', 'h': 'R', 'i': 'S', 'j': 'T',
    'k': 'U', 'l': 'V', 'm': 'W', 'n': 'X', 'o': 'Y',
    'p': 'Z', 'q': '1', 'r': '2', 's': '3', 't': '4',
    'u': '5', 'v': '6', 'w': '7', 'x': '8', 'y': '9',
    'z': '0'
};

const DECRYPT_MAP = {};
for (const [key, value] of Object.entries(ENCRYPT_MAP)) {
    DECRYPT_MAP[value] = key;
    DECRYPT_MAP[value.toLowerCase()] = key;
}

function encryptText(text) {
    let encrypted = "";
    for (let char of text) {
        const lowerChar = char.toLowerCase();
        if (ENCRYPT_MAP[lowerChar]) {
            let encryptedChar = ENCRYPT_MAP[lowerChar];
            if (char === char.toUpperCase() && char !== char.toLowerCase()) {
                encrypted += encryptedChar.toUpperCase();
            } else {
                encrypted += encryptedChar;
            }
        } else {
            encrypted += char;
        }
    }
    return encrypted;
}

function decryptText(encryptedText) {
    let decrypted = "";
    for (let char of encryptedText) {
        if (DECRYPT_MAP[char]) {
            let decryptedChar = DECRYPT_MAP[char];
            if (char === char.toUpperCase() && char !== char.toLowerCase()) {
                decrypted += decryptedChar.toUpperCase();
            } else {
                decrypted += decryptedChar;
            }
        } else {
            decrypted += char;
        }
    }
    return decrypted;
}

function decodeSecureToken(encodedToken) {
    try {
        const decoded = atob(encodedToken);
        const decrypted = decryptText(decoded);
        const userData = JSON.parse(decrypted);
        return userData;
    } catch (error) {
        console.error('Ошибка декодирования защищенного токена:', error);
        try {
            const decrypted = decryptText(encodedToken);
            const parts = decrypted.split('_');
            if (parts.length >= 2) {
                return {
                    id: parts[0],
                    username: parts[1] || '',
                    first_name: parts[2] || '',
                    last_name: parts[3] || '',
                    timestamp: parts[4] || new Date().toISOString()
                };
            }
        } catch (e) {
            console.error('Ошибка обработки старого формата:', e);
        }
        return null;
    }
}

function testEncryption() {
    console.log('Тестирование системы шифрования:');
    const testCases = [
        { input: '287265398', expected: 'BHGBFECIH' },
        { input: 'tooIku', expected: '4YYIU5' },
        { input: 'test123', expected: '4O34ABC' },
        { input: 'hello', expected: 'ROVVY' }
    ];
    
    testCases.forEach(test => {
        const encrypted = encryptText(test.input);
        const passed = encrypted === test.expected;
        console.log(`"${test.input}" → "${encrypted}" ${passed ? '✅' : '❌'}`);
    });
    
    const fullExample = '287265398_tooIku_шот_';
    const encryptedFull = encryptText(fullExample);
    console.log(`Пример: "${fullExample}" → "${encryptedFull}"`);
    console.log(`Совпадает: ${encryptedFull === 'BHGBFECIH_4YYIU5_шот_' ? '✅' : '❌'}`);
}

function initAuthSystem() {
    console.log('Инициализация системы авторизации с шифрованием...');
    testEncryption();
    checkUrlToken();
    
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
    
    const authBtn = document.getElementById('auth-btn');
    if (authBtn) authBtn.addEventListener('click', openAuthModal);
    
    const tokenSubmitBtn = document.getElementById('token-submit-btn');
    if (tokenSubmitBtn) tokenSubmitBtn.addEventListener('click', loginWithToken);
    
    const demoLoginBtn = document.getElementById('demo-login-btn');
    if (demoLoginBtn) demoLoginBtn.addEventListener('click', demoLogin);
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    const sideLogout = document.getElementById('side-logout');
    if (sideLogout) sideLogout.addEventListener('click', logout);
    
    const myProfileBtn = document.getElementById('my-profile-btn');
    if (myProfileBtn) myProfileBtn.addEventListener('click', showMyProfile);
    
    const sideMyProfile = document.getElementById('side-my-profile');
    if (sideMyProfile) sideMyProfile.addEventListener('click', showMyProfile);
    
    const settingsProfileBtn = document.getElementById('settings-profile-btn');
    if (settingsProfileBtn) settingsProfileBtn.addEventListener('click', openProfileSettings);
    
    const sideSettings = document.getElementById('side-settings');
    if (sideSettings) sideSettings.addEventListener('click', openProfileSettings);
    
    const adminPanelBtn = document.getElementById('admin-panel-btn');
    if (adminPanelBtn) adminPanelBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showAdminPanel();
    });
    
    const sideAdminPanel = document.getElementById('side-admin-panel');
    if (sideAdminPanel) sideAdminPanel.addEventListener('click', function(e) {
        e.preventDefault();
        showAdminPanel();
        const sideMenu = document.getElementById('side-menu');
        if (sideMenu) sideMenu.classList.remove('active');
    });
    
    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfileSettings);
    
    const profileToggle = document.getElementById('profile-toggle');
    if (profileToggle) {
        profileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = document.getElementById('dropdown-menu');
            if (dropdown) dropdown.classList.toggle('show');
        });
    }
    
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.profile-dropdown')) {
            closeAllDropdowns();
        }
    });
}

function isAdmin() {
    return currentUser && currentUser.id.toString() === ADMIN_ID;
}

function checkUrlToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        console.log('Найден токен в URL:', token.substring(0, 30) + '...');
        processTelegramLogin(token);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
}

function loginWithToken() {
    const tokenInput = document.getElementById('token-input');
    const token = tokenInput.value.trim();
    if (!token) {
        showNotification('Введите токен из Telegram бота', 'error');
        return;
    }
    console.log('Ввод токена:', token.substring(0, 30) + '...');
    processTelegramLogin(token);
    tokenInput.value = '';
}

function processTelegramLogin(token) {
    try {
        console.log('Обработка токена...');
        let userData = null;
        userData = decodeSecureToken(token);
        
        if (!userData) {
            const decrypted = decryptText(token);
            const parts = decrypted.split('_');
            if (parts.length >= 2) {
                userData = {
                    id: parts[0],
                    username: parts[1] || '',
                    first_name: parts[2] || '',
                    last_name: parts[3] || ''
                };
            } else {
                const oldParts = token.split('_');
                if (oldParts.length >= 2) {
                    userData = {
                        id: oldParts[0],
                        username: oldParts[1] || '',
                        first_name: oldParts[2] || '',
                        last_name: oldParts[3] || ''
                    };
                } else {
                    throw new Error('Неверный формат токена');
                }
            }
        }
        
        console.log('Данные пользователя:', userData);
        currentUser = {
            id: userData.id,
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            username: userData.username || '',
            auth_date: Math.floor(Date.now() / 1000),
            hash: token,
            token_type: userData.timestamp ? 'secure' : (decryptText(token) !== token ? 'encrypted' : 'plain'),
            profile: {
                nickname: (userData.first_name || '') + (userData.last_name ? ' ' + userData.last_name : ''),
                bio: '',
                notifications: true,
                joined: new Date().toISOString().split('T')[0]
            }
        };
        
        getTelegramAvatar(userData.id, userData.username).then(avatarUrl => {
            if (avatarUrl) currentUser.photo_url = avatarUrl;
            completeLogin();
        }).catch(() => {
            completeLogin();
        });
        
    } catch (error) {
        console.error('Ошибка обработки токена:', error);
        showNotification('Неверный формат токена. Получите новый через @noolshy_test_bot', 'error');
    }
}

async function getTelegramAvatar(userId, username) {
    try {
        if (username) {
            return `https://t.me/i/userpic/320/${username.replace('@', '')}.jpg`;
        }
        return null;
    } catch (error) {
        return null;
    }
}

function completeLogin() {
    generateColorAvatar(currentUser);
    saveUser();
    updateUserInterface();
    closeModal(document.getElementById('auth-modal'));
    const tokenType = currentUser.token_type === 'secure' ? 'защищенный' : 
                     currentUser.token_type === 'encrypted' ? 'зашифрованный' : 'обычный';
    showNotification(`Успешный вход! Использован ${tokenType} токен`, 'success');
}

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
        user.generated_avatar = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="${color}" rx="50"/><text x="50" y="55" text-anchor="middle" font-family="Arial" font-size="40" font-weight="bold" fill="#fff">${initials}</text></svg>`;
    }
}

function updateUserInterface() {
    const authBtn = document.getElementById('auth-btn');
    const userProfile = document.getElementById('user-profile');
    const menuAuthSection = document.getElementById('menu-auth-section');
    const adminPanelBtn = document.getElementById('admin-panel-btn');
    const sideAdminPanel = document.getElementById('side-admin-panel');
    
    if (currentUser) {
        if (authBtn) authBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'block';
        if (menuAuthSection) menuAuthSection.style.display = 'block';
        if (isAdmin()) {
            if (adminPanelBtn) adminPanelBtn.style.display = 'flex';
            if (sideAdminPanel) sideAdminPanel.style.display = 'flex';
        } else {
            if (adminPanelBtn) adminPanelBtn.style.display = 'none';
            if (sideAdminPanel) sideAdminPanel.style.display = 'none';
        }
        updateUserProfileData();
    } else {
        if (authBtn) authBtn.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
        if (menuAuthSection) menuAuthSection.style.display = 'none';
        if (adminPanelBtn) adminPanelBtn.style.display = 'none';
        if (sideAdminPanel) sideAdminPanel.style.display = 'none';
    }
}

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

function saveUser() {
    if (currentUser) {
        localStorage.setItem('fame_current_user', JSON.stringify(currentUser));
    }
}

function demoLogin() {
    currentUser = {
        id: 287265398,
        first_name: "Зорф",
        last_name: "",
        username: "tgzorf",
        auth_date: Math.floor(Date.now() / 1000),
        hash: "demo_hash_secure",
        token_type: "demo",
        photo_url: "https://t.me/i/userpic/320/tgzorf.jpg",
        profile: {
            nickname: "Зорф",
            bio: "Владелец dark Fame и разработчик системы шифрования",
            notifications: true,
            joined: new Date().toISOString().split('T')[0]
        }
    };
    generateColorAvatar(currentUser);
    saveUser();
    updateUserInterface();
    closeModal(document.getElementById('auth-modal'));
    showNotification('Демо-вход как Зорф (Администратор)', 'success');
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        currentUser = null;
        localStorage.removeItem('fame_current_user');
        updateUserInterface();
        showNotification('Вы вышли из системы', 'info');
        switchSection('main');
    }
}

function openAuthModal() {
    openModal('auth-modal');
}

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
    
    const isAdminUser = isAdmin();
    const tokenType = currentUser.token_type === 'secure' ? '🛡️ Защищенный' : 
                     currentUser.token_type === 'encrypted' ? '🔒 Зашифрованный' : 
                     currentUser.token_type === 'demo' ? '👑 Демо' : '🔑 Обычный';
    
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
                <div class="profile-badges">
                    ${isAdminUser ? '<span class="badge verified">👑 Администратор</span>' : ''}
                    <span class="badge" style="background: rgba(108, 99, 255, 0.2); color: #6c63ff;">${tokenType} токен</span>
                </div>
                <p><strong>Telegram ID:</strong> ${currentUser.id}</p>
                <p><strong>Username:</strong> @${currentUser.username || 'не указан'}</p>
                <p><strong>Дата регистрации:</strong> ${formattedDate}</p>
                
                <div class="user-profile-stats">
                    <div class="stat-box">
                        <span class="stat-number">🔐</span>
                        <span class="stat-label">Токен</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-number">${isAdminUser ? '👑' : '✓'}</span>
                        <span class="stat-label">${isAdminUser ? 'Админ' : 'Верифицирован'}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-number">🛡️</span>
                        <span class="stat-label">Шифрование</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="user-profile-content">
            <h3>О себе</h3>
            <p class="user-profile-bio">${currentUser.profile?.bio || 'Пользователь еще не добавил информацию о себе.'}</p>
            
            <div class="profile-settings-info" style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                <h4>🔐 Информация о токене:</h4>
                <p><strong>Тип:</strong> ${tokenType}</p>
                <p><strong>ID пользователя:</strong> ${currentUser.id}</p>
                <p><strong>Имя:</strong> ${currentUser.first_name || 'Не указано'}</p>
                <p><strong>Фамилия:</strong> ${currentUser.last_name || 'Не указана'}</p>
                <p><strong>Дата входа:</strong> ${new Date(currentUser.auth_date * 1000).toLocaleString('ru-RU')}</p>
            </div>
            
            <div class="profile-actions" style="margin-top: 30px;">
                <button class="action-btn" onclick="openProfileSettings()">
                    <i class="fas fa-edit"></i> Редактировать профиль
                </button>
                <button class="action-btn" onclick="copyProfileLink('${currentUser.username || currentUser.id}')">
                    <i class="fas fa-share"></i> Поделиться профилем
                </button>
                ${isAdminUser ? `
                    <button class="action-btn" onclick="showAdminPanel()">
                        <i class="fas fa-shield-alt"></i> Админ-панель
                    </button>
                ` : ''}
                <button class="action-btn" onclick="testMyToken()" style="background: rgba(108, 99, 255, 0.1); border-color: rgba(108, 99, 255, 0.3);">
                    <i class="fas fa-key"></i> Тест шифрования
                </button>
            </div>
        </div>
    `;
    
    switchSection('user-profile-section');
    closeAllDropdowns();
}

function testMyToken() {
    if (!currentUser || !currentUser.hash) {
        showNotification('Нет данных токена для теста', 'error');
        return;
    }
    
    const token = currentUser.hash;
    let result = '';
    
    if (currentUser.token_type === 'secure') {
        try {
            const decoded = atob(token);
            const decrypted = decryptText(decoded);
            result = `Защищенный токен → ${decrypted.substring(0, 50)}...`;
        } catch (e) {
            result = 'Ошибка декодирования защищенного токена';
        }
    } else if (currentUser.token_type === 'encrypted') {
        const decrypted = decryptText(token);
        result = `Зашифрованный: "${token}" → "${decrypted}"`;
    } else {
        result = `Обычный токен: "${token}"`;
    }
    
    alert(`Тест токена:\n\n${result}`);
}

function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
    });
}

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
        border-left: 4px solid ${type === 'success' ? '#0f0' : 
                       type === 'error' ? '#ff4444' : '#666'};
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
    
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
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
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function showAdminPanel() {
    if (!currentUser) {
        openAuthModal();
        return;
    }
    
    if (!isAdmin()) {
        showNotification('Доступ запрещен. Только для администратора.', 'error');
        return;
    }
    
    loadApplications();
    switchSection('admin-panel');
}

function loadApplications() {
    try {
        const applications = JSON.parse(localStorage.getItem('fame_applications') || '[]');
        const container = document.getElementById('applications-list');
        if (!container) return;
        
        applications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        updateAdminStats(applications);
        
        const activeFilter = document.querySelector('.admin-filters .filter-btn.active')?.dataset.filter || 'all';
        const searchQuery = document.getElementById('admin-search-input')?.value.toLowerCase() || '';
        
        const filteredApplications = applications.filter(app => {
            if (activeFilter !== 'all' && app.status !== activeFilter) return false;
            if (searchQuery) {
                const searchText = [
                    app.nickname,
                    app.telegram,
                    app.description,
                    app.category
                ].join(' ').toLowerCase();
                if (!searchText.includes(searchQuery)) return false;
            }
            return true;
        });
        
        if (filteredApplications.length === 0) {
            container.innerHTML = `
                <div class="no-applications">
                    <i class="fas fa-inbox"></i>
                    <h3>Заявки не найдены</h3>
                    <p>${searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Нет заявок для отображения'}</p>
                </div>
            `;
        } else {
            container.innerHTML = filteredApplications.map(application => createApplicationCard(application)).join('');
            
            document.querySelectorAll('.application-card').forEach(card => {
                card.addEventListener('click', function() {
                    const appId = this.dataset.id;
                    const application = applications.find(app => app.timestamp.toString() === appId);
                    if (application) showApplicationDetails(application);
                });
            });
            
            document.querySelectorAll('.approve-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const appId = this.dataset.id;
                    approveApplication(appId);
                });
            });
            
            document.querySelectorAll('.reject-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const appId = this.dataset.id;
                    rejectApplication(appId);
                });
            });
            
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const appId = this.dataset.id;
                    const application = applications.find(app => app.timestamp.toString() === appId);
                    if (application) showApplicationDetails(application);
                });
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
        showNotification('Ошибка загрузки заявок', 'error');
    }
}

function updateAdminStats(applications) {
    const stats = {
        pending: applications.filter(app => app.status === 'pending').length,
        approved: applications.filter(app => app.status === 'approved').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
        total: applications.length
    };
    
    document.getElementById('pending-count').textContent = stats.pending;
    document.getElementById('approved-count').textContent = stats.approved;
    document.getElementById('rejected-count').textContent = stats.rejected;
    document.getElementById('total-count').textContent = stats.total;
}

function createApplicationCard(application) {
    const statusClass = `status-${application.status}`;
    const statusText = {
        pending: 'Ожидает',
        approved: 'Принята',
        rejected: 'Отклонена'
    }[application.status] || 'Неизвестно';
    
    const date = new Date(application.timestamp).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const shortDescription = application.description.length > 100 
        ? application.description.substring(0, 100) + '...' 
        : application.description;
    
    const telegram = application.telegram.startsWith('@') 
        ? application.telegram 
        : `@${application.telegram}`;
    
    return `
        <div class="application-card ${application.status}" data-id="${application.timestamp}">
            <div class="application-header">
                <div class="application-avatar">
                    ${application.avatar_data ? 
                        `<img src="${application.avatar_data}" alt="${application.nickname}">` :
                        `<div style="width:100%;height:100%;background:#2a2a2a;display:flex;align-items:center;justify-content:center;color:#666;">
                            <i class="fas fa-user"></i>
                        </div>`
                    }
                </div>
                <div class="application-info">
                    <h3 class="application-name">
                        ${application.nickname}
                        <span class="application-category">${application.category}</span>
                    </h3>
                    <p class="application-telegram">
                        <i class="fab fa-telegram"></i> ${telegram}
                    </p>
                    <p class="application-description">${shortDescription}</p>
                    
                    ${application.extra_links && application.extra_links.length > 0 ? `
                        <div class="application-links">
                            <div class="link-badge">
                                <i class="fas fa-link"></i> ${application.extra_links.length} ссылок
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="application-footer">
                <div class="application-date">
                    <i class="far fa-clock"></i> ${date}
                </div>
                <div class="application-actions">
                    <span class="application-status ${statusClass}">${statusText}</span>
                    
                    ${application.status === 'pending' ? `
                        <button class="action-btn-small approve-btn" data-id="${application.timestamp}">
                            <i class="fas fa-check"></i> Принять
                        </button>
                        <button class="action-btn-small reject-btn" data-id="${application.timestamp}">
                            <i class="fas fa-times"></i> Отклонить
                        </button>
                    ` : ''}
                    
                    <button class="action-btn-small view-btn" data-id="${application.timestamp}">
                        <i class="fas fa-eye"></i> Просмотр
                    </button>
                </div>
            </div>
        </div>
    `;
}

function showApplicationDetails(application) {
    const modalBody = document.getElementById('application-modal-body');
    if (!modalBody) return;
    
    const date = new Date(application.timestamp).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const telegram = application.telegram.startsWith('@') 
        ? application.telegram 
        : `@${application.telegram}`;
    
    const statusText = {
        pending: 'Ожидает рассмотрения',
        approved: 'Принята',
        rejected: 'Отклонена'
    }[application.status] || 'Неизвестно';
    
    const statusColor = {
        pending: '#ff9900',
        approved: '#0f0',
        rejected: '#ff4444'
    }[application.status] || '#888';
    
    modalBody.innerHTML = `
        <div class="application-details">
            <div class="avatar-preview-large">
                ${application.avatar_data ? 
                    `<img src="${application.avatar_data}" alt="${application.nickname}">` :
                    `<div style="width:100%;height:100%;background:#2a2a2a;display:flex;align-items:center;justify-content:center;color:#666;font-size:3rem;">
                        <i class="fas fa-user"></i>
                    </div>`
                }
            </div>
            
            <div class="detail-group">
                <span class="detail-label">Статус:</span>
                <div class="detail-value" style="color: ${statusColor}; font-weight: bold;">${statusText}</div>
            </div>
            
            <div class="detail-group">
                <span class="detail-label">Никнейм:</span>
                <div class="detail-value">${application.nickname}</div>
            </div>
            
            <div class="detail-group">
                <span class="detail-label">Telegram:</span>
                <div class="detail-value">
                    <a href="https://t.me/${telegram.replace('@', '')}" target="_blank">
                        <i class="fab fa-telegram"></i> ${telegram}
                    </a>
                </div>
            </div>
            
            <div class="detail-group">
                <span class="detail-label">Категория:</span>
                <div class="detail-value">${application.category}</div>
            </div>
            
            <div class="detail-group">
                <span class="detail-label">Дата подачи:</span>
                <div class="detail-value">${date}</div>
            </div>
            
            <div class="detail-group">
                <span class="detail-label">Описание:</span>
                <div class="detail-value">${application.description}</div>
            </div>
            
            <div class="detail-group">
                <span class="detail-label">Основная ссылка:</span>
                <div class="detail-value">
                    <a href="${application.main_link}" target="_blank">${application.main_link}</a>
                </div>
            </div>
            
            ${application.extra_links && application.extra_links.length > 0 ? `
                <div class="detail-group">
                    <span class="detail-label">Дополнительные ссылки (${application.extra_links.length}):</span>
                    <div class="links-grid">
                        ${application.extra_links.map(link => `
                            <div class="link-item">
                                <a href="${link}" target="_blank">${link}</a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="detail-group">
                <span class="detail-label">ID пользователя:</span>
                <div class="detail-value">${application.user_id}</div>
            </div>
            
            <div class="modal-actions">
                ${application.status === 'pending' ? `
                    <button class="action-btn approve-btn" data-id="${application.timestamp}" onclick="approveApplication('${application.timestamp}')">
                        <i class="fas fa-check"></i> Принять заявку
                    </button>
                    <button class="action-btn reject-btn" data-id="${application.timestamp}" onclick="rejectApplication('${application.timestamp}')">
                        <i class="fas fa-times"></i> Отклонить заявку
                    </button>
                ` : ''}
                
                <button class="action-btn" onclick="closeModal(document.getElementById('application-modal'))">
                    <i class="fas fa-times"></i> Закрыть
                </button>
            </div>
        </div>
    `;
    
    openModal('application-modal');
}

function approveApplication(appId) {
    if (!confirm('Вы уверены, что хотите принять эту заявку?')) return;
    
    try {
        let applications = JSON.parse(localStorage.getItem('fame_applications') || '[]');
        const application = applications.find(app => app.timestamp.toString() === appId);
        
        if (application) {
            application.status = 'approved';
            localStorage.setItem('fame_applications', JSON.stringify(applications));
            showNotification('Заявка принята!', 'success');
            loadApplications();
            closeModal(document.getElementById('application-modal'));
            addApprovedMember(application);
        }
    } catch (error) {
        console.error('Ошибка принятия заявки:', error);
        showNotification('Ошибка принятия заявки', 'error');
    }
}

function rejectApplication(appId) {
    if (!confirm('Вы уверены, что хотите отклонить эту заявку?')) return;
    
    try {
        let applications = JSON.parse(localStorage.getItem('fame_applications') || '[]');
        const application = applications.find(app => app.timestamp.toString() === appId);
        
        if (application) {
            application.status = 'rejected';
            localStorage.setItem('fame_applications', JSON.stringify(applications));
            showNotification('Заявка отклонена!', 'success');
            loadApplications();
            closeModal(document.getElementById('application-modal'));
        }
    } catch (error) {
        console.error('Ошибка отклонения заявки:', error);
        showNotification('Ошибка отклонения заявки', 'error');
    }
}

function addApprovedMember(application) {
    console.log('Добавление участника:', application);
    showNotification(`${application.nickname} добавлен в список участников`, 'success');
}

function deleteRejectedApplications() {
    if (!confirm('Вы уверены, что хотите удалить все отклоненные заявки? Это действие нельзя отменить.')) return;
    
    try {
        let applications = JSON.parse(localStorage.getItem('fame_applications') || '[]');
        const filteredApplications = applications.filter(app => app.status !== 'rejected');
        const deletedCount = applications.length - filteredApplications.length;
        localStorage.setItem('fame_applications', JSON.stringify(filteredApplications));
        showNotification(`Удалено ${deletedCount} отклоненных заявок`, 'success');
        loadApplications();
    } catch (error) {
        console.error('Ошибка удаления заявок:', error);
        showNotification('Ошибка удаления заявок', 'error');
    }
}

function initAdminPanel() {
    console.log('Инициализация админ-панели...');
    
    document.querySelectorAll('.admin-filters .filter-btn').forEach(btn => {
        if (btn.id !== 'delete-rejected-btn') {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.admin-filters .filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                loadApplications();
            });
        }
    });
    
    const deleteRejectedBtn = document.getElementById('delete-rejected-btn');
    if (deleteRejectedBtn) {
        deleteRejectedBtn.addEventListener('click', deleteRejectedApplications);
    }
    
    const adminSearchInput = document.getElementById('admin-search-input');
    if (adminSearchInput) {
        adminSearchInput.addEventListener('input', function() {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                loadApplications();
            }, 300);
        });
    }
}

function initNavigation() {
    console.log('Инициализация навигации...');
    
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenu = document.getElementById('close-menu');
    const sideMenu = document.getElementById('side-menu');
    
    if (menuToggle) menuToggle.addEventListener('click', () => sideMenu.classList.add('active'));
    if (closeMenu) closeMenu.addEventListener('click', () => sideMenu.classList.remove('active'));
    
    const navTabs = document.querySelectorAll('.nav-tab');
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.section');
    
    function switchSection(sectionId) {
        sections.forEach(section => section.classList.remove('active-section'));
        const targetSection = document.getElementById(sectionId);
        if (targetSection) targetSection.classList.add('active-section');
        
        navTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.section === sectionId) tab.classList.add('active');
        });
        
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionId) item.classList.add('active');
        });
    }
    
    navTabs.forEach(tab => {
        if (tab.dataset.section) {
            tab.addEventListener('click', () => switchSection(tab.dataset.section));
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
    
    if (faqBtn) faqBtn.addEventListener('click', () => switchSection('faq-section'));
    if (settingsBtn) settingsBtn.addEventListener('click', () => openModal('settings-modal'));
    if (menuSettings) {
        menuSettings.addEventListener('click', () => {
            openModal('settings-modal');
            if (sideMenu) sideMenu.classList.remove('active');
        });
    }
}

const members = [
    {
        id: 1,
        nickname: "шот",
        username: "@metllos",
        category: "Владелец",
        role: "Кодер",
        description: "Владелец dark Fame",
        avatar: "img/avatar1.png",
        verified: true,
        pinned: true,
        project: "https://t.me/+fCRs1L3q7G8yYTg8",
        telegram: "metllos",
        forum: "https://t.me/+mAY-S9nUa_o2NDI0",
        joinDate: "2026-01-24",
        activity: "Постоянная",
        details: "Создатель и владелец dark Fame.занимаюсь кодингом",
        skills: ["кодинг"],
        socials: { telegram: "@metllos", forum: "https://t.me/+mAY-S9nUa_o2NDI0" }
    },
    {
        id: 2,
        nickname: "Виолетта",
        username: "@violettamap",
        category: "Владелец",
        role: "Владелец",
        description: "Владелец dark Fame",
        avatar: "img/avatar2.png",
        verified: true,
        pinned: true,
        project: "https://t.me/+M8N6Cah1socyY2Q6",
        telegram: "violettamap",
        joinDate: "2026-01-24",
        activity: "Постоянная",
        details: "Создатель и владелец dark Fame.занимаюсь развитием",
        skills: ["кодинг"],
        socials: { telegram: "@violettamap", project: "https://t.me/+M8N6Cah1socyY2Q6" }
    },
];

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
    
    return card;
}

function filterMembers(category) {
    const cards = document.querySelectorAll('.member-card');
    console.log('Фильтрация участников по категории:', category, 'найдено карточек:', cards.length);
    
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
            setTimeout(() => card.style.opacity = '1', 10);
        } else {
            card.style.opacity = '0';
            setTimeout(() => card.style.display = 'none', 300);
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
            setTimeout(() => card.style.opacity = '1', 10);
        } else {
            card.style.opacity = '0';
            setTimeout(() => card.style.display = 'none', 300);
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
                if (content.id === tabId) content.classList.add('active');
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
    localStorage.setItem('fame_neon_color', color);
    localStorage.setItem('fame_neon_intensity', intensity);
    localStorage.setItem('fame_neon_speed', speed);
    initDynamicNeon();
}

function initDynamicNeon() {
}

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

function copyProfileLink(username) {
    const link = `https://t.me/NOOLSHY?text=Профиль%20${encodeURIComponent(username)}%20на%20NoolShy%20Fame`;
    navigator.clipboard.writeText(link).then(() => {
        showNotification('Ссылка на профиль скопирована в буфер обмена!', 'success');
    });
}

function initAllAvatars() {
}

function switchSection(sectionId) {
    console.log('Переключение секции:', sectionId);
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active-section'));
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.add('active-section');
    
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.section === sectionId) tab.classList.add('active');
    });
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) item.classList.add('active');
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initApplyForm() {
}

function saveApplication(formData) {
    try {
        let applications = JSON.parse(localStorage.getItem('fame_applications') || '[]');
        applications.push(formData);
        if (applications.length > 100) applications = applications.slice(-100);
        localStorage.setItem('fame_applications', JSON.stringify(applications));
        console.log('Заявка сохранена:', formData);
        showNotification('Заявка успешно сохранена и отправлена на модерацию!', 'success');
        return true;
    } catch (error) {
        console.error('Ошибка сохранения заявки:', error);
        showNotification('Ошибка при сохранении заявки', 'error');
        return false;
    }
}

function showApplicationSuccess(formData) {
}

function closeApplySuccessModal() {
}

function copyTelegramLink() {
    const link = 'https://t.me/NOOLSHY';
    navigator.clipboard.writeText(link).then(() => {
        showNotification('Ссылка скопирована в буфер обмена!', 'success');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация...');
    initAuthSystem();
    initNavigation();
    initMembers();
    initSnow();
    initSettings();
    initNeonControls();
    initModals();
    initApplyForm();
    initAdminPanel();
    loadSavedSettings();
    initDynamicNeon();
    initAllAvatars();
    
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.profile-dropdown')) {
            closeAllDropdowns();
        }
    });
    
    const profileToggle = document.getElementById('profile-toggle');
    if (profileToggle) {
        profileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = document.getElementById('dropdown-menu');
            if (dropdown) dropdown.classList.toggle('show');
        });
    }
    
    const applyBtnInFaq = document.querySelector('.apply-btn-large[data-section="apply"]');
    if (applyBtnInFaq) {
        applyBtnInFaq.addEventListener('click', function() {
            switchSection('apply');
        });
    }
});
