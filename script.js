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

const ENCRYPTED_BOT_TOKEN = 'HFGBADECEC_HKHMZONMNOJQWJQHX7XXIUVQPWJQHX4VQIQ0S';
const ADMIN_CHAT_ID = '287265398';

function decryptBotToken() {
    let decrypted = '';
    for (let char of ENCRYPTED_BOT_TOKEN) {
        if (DECRYPT_MAP[char]) {
            decrypted += DECRYPT_MAP[char];
        } else {
            decrypted += char;
        }
    }
    return decrypted;
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
        first_name: "мирок",
        last_name: "мирок",
        username: "tgmirok",
        auth_date: Math.floor(Date.now() / 1000),
        hash: "demo_hash_secure",
        token_type: "demo",
        photo_url: "https://t.me/i/userpic/320/tgzorf.jpg",
        profile: {
            nickname: "шот",
            bio: "Владелец allovs Fame и разработчик системы шифрования",
            notifications: true,
            joined: new Date().toISOString().split('T')[0]
        }
    };
    generateColorAvatar(currentUser);
    saveUser();
    updateUserInterface();
    closeModal(document.getElementById('auth-modal'));
    showNotification('Демо-пользователь как шот (Администратор)', 'success');
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        currentUser = null;
        localStorage.removeItem('fame_current_user');
        updateUserInterface();
        showNotification('Вы вышли из аккаунта', 'info');
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
    showNotification('Сохранено', 'success');
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
                        <i class="fas fa-shield-alt"></i> панель
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

async function sendApplicationToTelegram(formData) {
    try {
        const TELEGRAM_BOT_TOKEN = decryptBotToken();
        const message = `📨 *Новая заявка* 
👤 *Ник:* ${formData.nickname}
📱 *TG:* ${formData.telegram}
🏷️ *Кат:* ${formData.category}
📝 ${formData.description.substring(0, 200)}${formData.description.length > 200 ? '...' : ''}
🔗 ${formData.main_link}
🆔 *ID:* ${formData.user_id}
⏰ ${new Date(formData.timestamp).toLocaleString('ru-RU')}`;

        const inlineKeyboard = {
            inline_keyboard: [[
                {
                    text: '✅ Принять',
                    callback_data: `approve_${formData.timestamp}_${formData.user_id}`
                },
                {
                    text: '❌ Отклонить',
                    callback_data: `reject_${formData.timestamp}_${formData.user_id}`
                }
            ]]
        };

        if (formData.avatar_data && formData.avatar_data.startsWith('data:image')) {
            const photoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: ADMIN_CHAT_ID,
                    photo: formData.avatar_data,
                    caption: message,
                    parse_mode: 'Markdown',
                    reply_markup: inlineKeyboard
                })
            });
            return await photoResponse.json();
        } else {
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: ADMIN_CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown',
                    reply_markup: inlineKeyboard
                })
            });
            return await response.json();
        }
    } catch (error) {
        console.error('Ошибка отправки:', error);
        throw error;
    }
}

async function updateTelegramMessage(messageId, newText) {
    try {
        const TELEGRAM_BOT_TOKEN = decryptBotToken();
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                message_id: messageId,
                text: newText,
                parse_mode: 'Markdown'
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Ошибка обновления:', error);
        throw error;
    }
}

async function getTelegramApplications() {
    try {
        const TELEGRAM_BOT_TOKEN = decryptBotToken();
        
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                offset: 0,
                limit: 100,
                allowed_updates: ['message', 'callback_query']
            })
        });
        
        const result = await response.json();
        if (!result.ok) return [];
        
        const applications = [];
        
        for (const update of result.result) {
            if (update.message && update.message.chat.id.toString() === ADMIN_CHAT_ID.toString()) {
                const message = update.message;
                
                if (message.text && message.text.includes('Новая заявка')) {
                    applications.push(parseTelegramMessage(message));
                }
                
                if (message.photo && message.caption && message.caption.includes('Новая заявка')) {
                    applications.push(parseTelegramMessage(message, true));
                }
            }
            
            if (update.callback_query && update.callback_query.message) {
                const message = update.callback_query.message;
                if (message.chat.id.toString() === ADMIN_CHAT_ID.toString()) {
                    applications.push(parseTelegramMessage(message, !!message.photo));
                }
            }
        }
        
        return applications;
    } catch (error) {
        console.error('Ошибка получения заявок из Telegram:', error);
        return [];
    }
}

function parseTelegramMessage(message, isPhoto = false) {
    const text = isPhoto ? message.caption : message.text;
    
    const nickname = extractValue(text, 'Ник:', 'TG:') || extractValue(text, '*Ник:*', '*TG:*');
    const telegram = extractValue(text, 'TG:', 'Кат:') || extractValue(text, '*TG:*', '*Кат:*');
    const category = extractValue(text, 'Кат:', '🔗') || extractValue(text, '*Кат:*', '🔗');
    const user_id = extractValue(text, 'ID:', '⏰') || extractValue(text, '*ID:*', '⏰');
    const timestamp = extractValue(text, '⏰', null);
    
    let status = 'pending';
    if (text.includes('✅ *ПРИНЯТО*') || text.includes('✅ ПРИНЯТО')) status = 'approved';
    if (text.includes('❌ *ОТКЛОНЕНО*') || text.includes('❌ ОТКЛОНЕНО')) status = 'rejected';
    
    return {
        telegram_message_id: message.message_id,
        nickname: nickname || 'Неизвестно',
        telegram: telegram || '',
        category: category || '',
        description: 'Заявка из Telegram',
        main_link: '',
        user_id: user_id || '',
        timestamp: parseTelegramDate(timestamp) || message.date * 1000,
        status: status,
        avatar_data: isPhoto && message.photo ? 
            `https://api.telegram.org/bot${decryptBotToken()}/getFile?file_id=${message.photo[0].file_id}` : '',
        extra_links: []
    };
}

function extractValue(text, startKey, endKey) {
    const startIndex = text.indexOf(startKey);
    if (startIndex === -1) return null;
    
    const start = startIndex + startKey.length;
    const end = endKey ? text.indexOf(endKey, start) : text.length;
    
    if (end === -1) return text.substring(start).trim();
    return text.substring(start, end).trim();
}

function parseTelegramDate(dateStr) {
    if (!dateStr) return Date.now();
    
    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) return date.getTime();
        
        const match = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4}), (\d{1,2}):(\d{1,2})/);
        if (match) {
            const [, day, month, year, hour, minute] = match;
            return new Date(year, month - 1, day, hour, minute).getTime();
        }
        
        return Date.now();
    } catch (error) {
        return Date.now();
    }
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

async function loadApplications() {
    try {
        const activeFilter = document.querySelector('.admin-filters .filter-btn.active')?.dataset.filter || 'all';
        const searchQuery = document.getElementById('admin-search-input')?.value.toLowerCase() || '';
        
        let applications = [];
        
        try {
            applications = await getTelegramApplications();
            
            const cache = {
                data: applications,
                timestamp: Date.now()
            };
            localStorage.setItem('fame_applications_cache', JSON.stringify(cache));
        } catch (telegramError) {
            const cache = localStorage.getItem('fame_applications_cache');
            if (cache) {
                const cacheData = JSON.parse(cache);
                if (Date.now() - cacheData.timestamp < 5 * 60 * 1000) {
                    applications = cacheData.data;
                }
            }
        }
        
        if (applications.length === 0) {
            applications = JSON.parse(localStorage.getItem('fame_applications') || '[]');
        }
        
        const container = document.getElementById('applications-list');
        if (!container) return;
        
        applications.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        updateAdminStats(applications);
        
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
                    const application = applications.find(app => 
                        app.telegram_message_id && 
                        app.telegram_message_id.toString() === appId.toString()
                    );
                    if (application) showApplicationDetails(application);
                });
            });
            
            document.querySelectorAll('.approve-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const appId = this.dataset.id;
                    const application = applications.find(app => 
                        app.telegram_message_id && 
                        app.telegram_message_id.toString() === appId.toString()
                    );
                    if (application) {
                        approveApplication(
                            application.telegram_message_id,
                            application.user_id,
                            application.nickname,
                            application.telegram,
                            application.category
                        );
                    }
                });
            });
            
            document.querySelectorAll('.reject-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const appId = this.dataset.id;
                    const application = applications.find(app => 
                        app.telegram_message_id && 
                        app.telegram_message_id.toString() === appId.toString()
                    );
                    if (application) {
                        rejectApplication(
                            application.telegram_message_id,
                            application.user_id,
                            application.nickname,
                            application.telegram,
                            application.category
                        );
                    }
                });
            });
            
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const appId = this.dataset.id;
                    const application = applications.find(app => 
                        app.telegram_message_id && 
                        app.telegram_message_id.toString() === appId.toString()
                    );
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
        <div class="application-card ${application.status}" data-id="${application.telegram_message_id}">
            <div class="application-header">
                <div class="application-avatar">
                    ${application.avatar_data && application.avatar_data.startsWith('https://api.telegram.org') ? 
                        `<img src="${application.avatar_data}" alt="${application.nickname}">` :
                        application.avatar_data && application.avatar_data.startsWith('data:image') ?
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
                        <button class="action-btn-small approve-btn" data-id="${application.telegram_message_id}">
                            <i class="fas fa-check"></i> Принять
                        </button>
                        <button class="action-btn-small reject-btn" data-id="${application.telegram_message_id}">
                            <i class="fas fa-times"></i> Отклонить
                        </button>
                    ` : ''}
                    
                    <button class="action-btn-small view-btn" data-id="${application.telegram_message_id}">
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
                ${application.avatar_data && application.avatar_data.startsWith('https://api.telegram.org') ? 
                    `<img src="${application.avatar_data}" alt="${application.nickname}">` :
                    application.avatar_data && application.avatar_data.startsWith('data:image') ?
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
                <span class="detail-label">ID пользователя:</span>
                <div class="detail-value">${application.user_id}</div>
            </div>
            
            <div class="detail-group">
                <span class="detail-label">ID сообщения Telegram:</span>
                <div class="detail-value">${application.telegram_message_id}</div>
            </div>
            
            <div class="modal-actions">
                ${application.status === 'pending' ? `
                    <button class="action-btn approve-btn" onclick="approveApplication('${application.telegram_message_id}', '${application.user_id}', '${application.nickname}', '${application.telegram}', '${application.category}')">
                        <i class="fas fa-check"></i> Принять заявку
                    </button>
                    <button class="action-btn reject-btn" onclick="rejectApplication('${application.telegram_message_id}', '${application.user_id}', '${application.nickname}', '${application.telegram}', '${application.category}')">
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

async function approveApplication(messageId, userId, nickname, telegram, category) {
    if (!confirm('Вы уверены, что хотите принять эту заявку?')) return;
    
    try {
        const updatedMessage = `✅ *ПРИНЯТО* 
👤 ${nickname}
📱 ${telegram}
🏷️ ${category}
🆔 ${userId}
⏰ ${new Date().toLocaleString('ru-RU')}`;

        await updateTelegramMessage(messageId, updatedMessage);
        
        showNotification('✅ Заявка принята!', 'success');
        addToMembersList({
            nickname: nickname,
            telegram: telegram,
            category: category,
            user_id: userId
        });
        
        loadApplications();
        const modal = document.getElementById('application-modal');
        if (modal && modal.classList.contains('active')) closeModal(modal);
    } catch (error) {
        console.error('Ошибка принятия заявки:', error);
        showNotification('Ошибка принятия заявки', 'error');
    }
}

async function rejectApplication(messageId, userId, nickname, telegram, category) {
    if (!confirm('Вы уверены, что хотите отклонить эту заявку?')) return;
    
    try {
        const reason = prompt('Причина отказа:', 'Не соответствует критериям');
        const updatedMessage = `❌ *ОТКЛОНЕНО* 
👤 ${nickname}
📱 ${telegram}
📌 ${reason || 'Не указано'}
🆔 ${userId}
⏰ ${new Date().toLocaleString('ru-RU')}`;

        await updateTelegramMessage(messageId, updatedMessage);
        
        showNotification('❌ Заявка отклонена!', 'success');
        loadApplications();
        const modal = document.getElementById('application-modal');
        if (modal && modal.classList.contains('active')) closeModal(modal);
    } catch (error) {
        console.error('Ошибка отклонения заявки:', error);
        showNotification('Ошибка отклонения заявки', 'error');
    }
}

function addToMembersList(application) {
    try {
        let members = JSON.parse(localStorage.getItem('fame_members') || '[]');
        const newMember = {
            id: Date.now(),
            nickname: application.nickname,
            username: `@${application.telegram}`,
            category: application.category,
            role: application.category,
            description: 'Добавлен через заявку',
            avatar: '',
            verified: true,
            pinned: false,
            telegram: application.telegram,
            joinDate: new Date().toISOString().split('T')[0],
            activity: 'Новый',
            details: `Добавлен ${new Date().toLocaleDateString('ru-RU')}`,
            skills: [application.category],
            socials: { 
                telegram: `@${application.telegram}`,
                project: '' 
            },
            main_link: '',
            extra_links: []
        };
        members.push(newMember);
        if (members.length > 500) members = members.slice(-500);
        localStorage.setItem('fame_members', JSON.stringify(members));
        if (document.getElementById('main').classList.contains('active-section')) loadMembers();
        return newMember;
    } catch (error) {
        return null;
    }
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
        nickname: "мирок",
        username: "@tgmirok",
        category: "Владелец",
        role: "Кодер",
        description: "Владелец этого fame list",
        avatar: "img/avatar1.png",
        verified: true,
        pinned: true,
        project: "https://t.me/+IWg2rlIG1s4wMWI8",
        telegram: "tgmirok",
        joinDate: "2026-02-10",
        activity: "Постоянная",
        details: "Создатель.занимаюсь кодингом",
        skills: ["кодинг"],
        socials: { telegram: "@tgmirok", project: "https://t.me/+IWg2rlIG1s4wMWI8" }
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
    console.log('Инициализация формы заявки...');
    
    const applyForm = document.getElementById('apply-form');
    if (!applyForm) {
        console.error('Форма заявки не найдена');
        return;
    }
    
    const avatarUploadBtn = document.getElementById('avatar-upload-btn');
    const avatarInput = document.getElementById('apply-avatar');
    const avatarPreview = document.getElementById('avatar-preview');
    
    if (avatarUploadBtn && avatarInput && avatarPreview) {
        avatarUploadBtn.addEventListener('click', () => avatarInput.click());
        
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    showNotification('Файл слишком большой. Максимум 5MB.', 'error');
                    this.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarPreview.classList.add('has-image');
                    avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    const addLinkBtn = document.getElementById('add-link-btn');
    const linksContainer = document.getElementById('links-container');
    
    if (addLinkBtn && linksContainer) {
        addLinkBtn.addEventListener('click', function() {
            const linkGroups = linksContainer.querySelectorAll('.link-input-group');
            if (linkGroups.length >= 7) {
                showNotification('Можно добавить максимум 7 ссылок', 'error');
                return;
            }
            
            const newLinkGroup = document.createElement('div');
            newLinkGroup.className = 'link-input-group';
            newLinkGroup.innerHTML = `
                <input type="url" class="extra-link" placeholder="https://example.com">
                <button type="button" class="remove-link-btn">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            linksContainer.appendChild(newLinkGroup);
            
            updateRemoveButtons();
        });
        
        function updateRemoveButtons() {
            const removeBtns = linksContainer.querySelectorAll('.remove-link-btn');
            removeBtns.forEach(btn => {
                btn.style.display = 'flex';
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.parentElement.remove();
                    updateRemoveButtons();
                });
            });
        }
        updateRemoveButtons();
    }
    
    applyForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!currentUser) {
            showNotification('Для подачи заявки нужно войти в систему', 'error');
            openAuthModal();
            return;
        }
        
        const nickname = document.getElementById('apply-nickname').value.trim();
        const telegram = document.getElementById('apply-telegram').value.trim();
        const category = document.getElementById('apply-category').value;
        const description = document.getElementById('apply-description').value.trim();
        const mainLink = document.getElementById('apply-main-link').value.trim();
        
        if (!nickname || !telegram || !category || !description || !mainLink) {
            showNotification('Заполните все обязательные поля', 'error');
            return;
        }
        
        if (description.length < 50) {
            showNotification('Описание должно содержать минимум 50 символов', 'error');
            return;
        }
        
        const formData = {
            user_id: currentUser.id,
            username: currentUser.username || '',
            nickname: nickname,
            telegram: telegram.replace(/^@/, ''),
            category: category,
            description: description,
            main_link: mainLink,
            extra_links: [],
            avatar_data: '',
            timestamp: Date.now(),
            status: 'pending'
        };
        
        const linkInputs = document.querySelectorAll('.extra-link');
        linkInputs.forEach(input => {
            const link = input.value.trim();
            if (link && link.startsWith('http')) {
                formData.extra_links.push(link);
            }
        });
        
        const avatarImg = avatarPreview.querySelector('img');
        if (avatarImg && avatarImg.src) {
            formData.avatar_data = avatarImg.src;
        }
        
        const submitBtn = applyForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        try {
            const savedData = saveApplication(formData);
            const telegramResult = await sendApplicationToTelegram(savedData);
            
            if (telegramResult.ok) {
                savedData.telegram_message_id = telegramResult.result.message_id;
                let applications = JSON.parse(localStorage.getItem('fame_applications') || '[]');
                const index = applications.findIndex(app => app.timestamp === savedData.timestamp);
                if (index !== -1) {
                    applications[index] = savedData;
                    localStorage.setItem('fame_applications', JSON.stringify(applications));
                }
                
                showNotification('✅ Заявка отправлена администраторам!', 'success');
                showApplicationSuccess(savedData);
                applyForm.reset();
                avatarPreview.classList.remove('has-image');
                avatarPreview.innerHTML = `
                    <div class="avatar-preview-placeholder">
                        <i class="fas fa-user"></i>
                        <span>Загрузить фото</span>
                    </div>
                `;
                linksContainer.innerHTML = `
                    <div class="link-input-group">
                        <input type="url" class="extra-link" placeholder="https://example.com">
                        <button type="button" class="remove-link-btn" style="display: none;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                if (document.getElementById('admin-panel').classList.contains('active-section')) {
                    loadApplications();
                }
            } else {
                showNotification('Заявка сохранена локально', 'warning');
            }
        } catch (error) {
            showNotification('Ошибка при отправке заявки', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    const resetBtn = applyForm.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Очистить форму?')) {
                applyForm.reset();
                avatarPreview.classList.remove('has-image');
                avatarPreview.innerHTML = `
                    <div class="avatar-preview-placeholder">
                        <i class="fas fa-user"></i>
                        <span>Загрузить фото</span>
                    </div>
                `;
                linksContainer.innerHTML = `
                    <div class="link-input-group">
                        <input type="url" class="extra-link" placeholder="https://example.com">
                        <button type="button" class="remove-link-btn" style="display: none;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                showNotification('Форма очищена', 'info');
            }
        });
    }
}

function saveApplication(formData) {
    try {
        let applications = JSON.parse(localStorage.getItem('fame_applications') || '[]');
        formData.telegram_message_id = null;
        applications.push(formData);
        if (applications.length > 200) applications = applications.slice(-200);
        localStorage.setItem('fame_applications', JSON.stringify(applications));
        console.log('Заявка сохранена локально:', formData);
        return formData;
    } catch (error) {
        console.error('Ошибка сохранения заявки:', error);
        throw error;
    }
}

function showApplicationSuccess(formData) {
    const successModal = document.createElement('div');
    successModal.className = 'modal active';
    successModal.id = 'application-success-modal';
    successModal.innerHTML = `
        <div class="modal-content neon-flow" style="max-width: 500px;">
            <div class="modal-header">
                <h2 class="text-neon-flow">✅ Заявка отправлена!</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body" style="padding: 30px; text-align: center;">
                <div style="font-size: 5rem; color: #0f0; margin-bottom: 20px;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 style="color: #fff; margin-bottom: 15px;">Заявка успешно отправлена</h3>
                <p style="color: #aaa; margin-bottom: 25px;">
                    Ваша заявка на <strong>${formData.category}</strong> отправлена администраторам.
                </p>
                <div class="modal-actions">
                    <button class="action-btn" onclick="closeApplicationSuccessModal()">
                        <i class="fas fa-check"></i> Понятно
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(successModal);
    const closeBtn = successModal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => successModal.remove());
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) successModal.remove();
    });
}

function closeApplicationSuccessModal() {
    const modal = document.getElementById('application-success-modal');
    if (modal) modal.remove();
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
// Supabase конфигурация
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Конфигурация
const ADMIN_ID = '287265398';
const BOT_USERNAME = 'FameListAuthBot';

// Глобальные переменные
let currentUser = null;
let currentMembers = [];
let currentApplications = [];

// ========== Инициализация ==========
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initNavigation();
    initFilters();
    initApplyForm();
    initForum();
    initSnow();
    loadMembers();
    loadApplications();
    
    // Проверка токена в URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        processLoginToken(token);
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Проверка сохраненной сессии
    const savedUser = localStorage.getItem('fame_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateUserInterface();
            updateRegistrationCount();
        } catch(e) {}
    }
});

// ========== Авторизация ==========
function initAuth() {
    const authBtn = document.getElementById('auth-btn');
    const tokenSubmitBtn = document.getElementById('token-submit-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const sideLogout = document.getElementById('side-logout');
    const myProfileBtn = document.getElementById('my-profile-btn');
    const sideMyProfile = document.getElementById('side-my-profile');
    const adminPanelBtn = document.getElementById('admin-panel-btn');
    const sideAdminPanel = document.getElementById('side-admin-panel');
    
    if (authBtn) authBtn.addEventListener('click', () => openModal('auth-modal'));
    if (tokenSubmitBtn) tokenSubmitBtn.addEventListener('click', () => {
        const token = document.getElementById('token-input').value.trim();
        if (token) processLoginToken(token);
        else showNotification('Введите токен', 'error');
    });
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (sideLogout) sideLogout.addEventListener('click', logout);
    if (myProfileBtn) myProfileBtn.addEventListener('click', showMyProfile);
    if (sideMyProfile) sideMyProfile.addEventListener('click', showMyProfile);
    if (adminPanelBtn) adminPanelBtn.addEventListener('click', showAdminPanel);
    if (sideAdminPanel) sideAdminPanel.addEventListener('click', () => {
        showAdminPanel();
        closeSideMenu();
    });
    
    // Профиль дропдаун
    const profileToggle = document.getElementById('profile-toggle');
    if (profileToggle) {
        profileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('dropdown-menu');
            if (dropdown) dropdown.classList.toggle('show');
        });
    }
    
    document.addEventListener('click', () => {
        const dropdown = document.getElementById('dropdown-menu');
        if (dropdown) dropdown.classList.remove('show');
    });
}

async function processLoginToken(token) {
    try {
        // Декодируем токен (формат: user_id|username|timestamp|signature)
        const parts = token.split('|');
        if (parts.length < 2) throw new Error('Неверный формат токена');
        
        const userId = parts[0];
        const username = parts[1] || '';
        
        // Проверяем пользователя в Supabase
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', userId)
            .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
            throw new Error('Ошибка проверки пользователя');
        }
        
        if (existingUser) {
            // Обновляем существующего пользователя
            currentUser = {
                id: existingUser.id,
                telegram_id: existingUser.telegram_id,
                username: username,
                first_name: existingUser.first_name || '',
                last_name: existingUser.last_name || '',
                registered_at: existingUser.registered_at,
                is_admin: existingUser.telegram_id.toString() === ADMIN_ID
            };
            
            await supabase
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', existingUser.id);
        } else {
            // Регистрируем нового пользователя
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                    telegram_id: userId,
                    username: username,
                    first_name: '',
                    last_name: '',
                    registered_at: new Date().toISOString(),
                    last_login: new Date().toISOString()
                })
                .select()
                .single();
            
            if (insertError) throw new Error('Ошибка регистрации');
            
            currentUser = {
                id: newUser.id,
                telegram_id: newUser.telegram_id,
                username: username,
                first_name: '',
                last_name: '',
                registered_at: newUser.registered_at,
                is_admin: newUser.telegram_id.toString() === ADMIN_ID
            };
            
            // Обновляем счетчик регистраций
            updateRegistrationCount();
            showNotification('Добро пожаловать! Вы успешно зарегистрированы!', 'success');
        }
        
        localStorage.setItem('fame_user', JSON.stringify(currentUser));
        updateUserInterface();
        closeModal('auth-modal');
        showNotification('Вход выполнен успешно!', 'success');
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        showNotification('Ошибка входа: ' + error.message, 'error');
    }
}

async function updateRegistrationCount() {
    const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
    
    if (!error && count !== null) {
        const stats = document.querySelectorAll('.stat-box');
        stats.forEach(stat => {
            if (stat.querySelector('.stat-label')?.textContent === 'Пользователей') {
                stat.querySelector('.stat-number').textContent = count;
            }
        });
    }
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        currentUser = null;
        localStorage.removeItem('fame_user');
        updateUserInterface();
        showNotification('Вы вышли из аккаунта', 'info');
        switchSection('main');
    }
}

function updateUserInterface() {
    const authBtn = document.getElementById('auth-btn');
    const userProfile = document.getElementById('user-profile');
    const adminPanelBtn = document.getElementById('admin-panel-btn');
    const sideAdminPanel = document.getElementById('side-admin-panel');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    const dropdownName = document.getElementById('dropdown-name');
    const dropdownUsername = document.getElementById('dropdown-username');
    const dropdownAvatar = document.getElementById('dropdown-avatar');
    
    if (currentUser) {
        if (authBtn) authBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'block';
        
        const displayName = currentUser.first_name || currentUser.username || `User_${currentUser.telegram_id}`;
        if (userName) userName.textContent = displayName;
        if (dropdownName) dropdownName.textContent = displayName;
        if (dropdownUsername) dropdownUsername.textContent = `@${currentUser.username || 'user'}`;
        
        // Генерация аватара
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0088cc&color=fff&size=40`;
        if (userAvatar) userAvatar.src = avatarUrl;
        if (dropdownAvatar) dropdownAvatar.src = avatarUrl;
        
        if (currentUser.is_admin) {
            if (adminPanelBtn) adminPanelBtn.style.display = 'flex';
            if (sideAdminPanel) sideAdminPanel.style.display = 'flex';
        } else {
            if (adminPanelBtn) adminPanelBtn.style.display = 'none';
            if (sideAdminPanel) sideAdminPanel.style.display = 'none';
        }
    } else {
        if (authBtn) authBtn.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
        if (adminPanelBtn) adminPanelBtn.style.display = 'none';
        if (sideAdminPanel) sideAdminPanel.style.display = 'none';
    }
}

// ========== Навигация ==========
function initNavigation() {
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenu = document.getElementById('close-menu');
    const sideMenu = document.getElementById('side-menu');
    const navTabs = document.querySelectorAll('.nav-tab');
    const menuItems = document.querySelectorAll('.menu-item');
    const settingsBtn = document.getElementById('settings-btn');
    
    if (menuToggle) menuToggle.addEventListener('click', () => sideMenu.classList.add('active'));
    if (closeMenu) closeMenu.addEventListener('click', () => sideMenu.classList.remove('active'));
    
    navTabs.forEach(tab => {
        if (tab.dataset.section) {
            tab.addEventListener('click', () => {
                switchSection(tab.dataset.section);
                updateActiveNav(tab.dataset.section);
            });
        }
    });
    
    menuItems.forEach(item => {
        if (item.dataset.section) {
            item.addEventListener('click', () => {
                switchSection(item.dataset.section);
                closeSideMenu();
                updateActiveNav(item.dataset.section);
            });
        }
    });
    
    if (settingsBtn) settingsBtn.addEventListener('click', () => {
        showNotification('Настройки в разработке', 'info');
    });
}

function switchSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active-section');
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.add('active-section');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateActiveNav(sectionId) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.section === sectionId) tab.classList.add('active');
    });
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) item.classList.add('active');
    });
}

function closeSideMenu() {
    const sideMenu = document.getElementById('side-menu');
    if (sideMenu) sideMenu.classList.remove('active');
}

// ========== Участники ==========
async function loadMembers() {
    try {
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('status', 'approved')
            .order('pinned', { ascending: false })
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        currentMembers = data || [];
        renderMembers(currentMembers);
    } catch (error) {
        console.error('Ошибка загрузки участников:', error);
        renderMembers([]);
    }
}

function renderMembers(members) {
    const container = document.getElementById('members-container');
    if (!container) return;
    
    if (!members.length) {
        container.innerHTML = '<p style="text-align: center; color: #888;">Нет участников для отображения</p>';
        return;
    }
    
    container.innerHTML = members.map(member => `
        <div class="member-card ${member.scam ? 'scam' : ''} ${member.verified ? 'verified' : ''}" data-id="${member.id}" data-category="${member.category}">
            <div class="member-avatar">
                <img src="${member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nickname)}&background=666&color=fff&size=70`}" alt="${member.nickname}">
            </div>
            <div class="member-info">
                <h3>${member.nickname} ${member.scam ? '⚠️' : member.verified ? '✓' : ''}</h3>
                <div class="member-role">${member.role || member.category}</div>
                <p class="member-description">${member.description || 'Нет описания'}</p>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.member-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            const member = currentMembers.find(m => m.id === id);
            if (member) showMemberProfile(member);
        });
    });
}

function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-input');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterMembers();
        });
    });
    
    if (searchInput) {
        searchInput.addEventListener('input', () => filterMembers());
    }
}

function filterMembers() {
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.category || 'all';
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    
    const filtered = currentMembers.filter(member => {
        const matchesFilter = activeFilter === 'all' || member.category === activeFilter;
        const matchesSearch = member.nickname.toLowerCase().includes(searchTerm) ||
                             (member.description || '').toLowerCase().includes(searchTerm);
        return matchesFilter && matchesSearch;
    });
    
    renderMembers(filtered);
}

function showMemberProfile(member) {
    const container = document.getElementById('profile-content');
    if (!container) return;
    
    const joinDate = new Date(member.created_at).toLocaleDateString('ru-RU');
    
    container.innerHTML = `
        <div class="profile-container">
            <div class="user-profile-header">
                <div class="user-profile-avatar">
                    <img src="${member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nickname)}&background=666&color=fff&size=120`}" alt="${member.nickname}">
                </div>
                <div class="user-profile-info">
                    <h1>${member.nickname}</h1>
                    <p><i class="fab fa-telegram"></i> @${member.telegram || member.username?.replace('@', '') || 'user'}</p>
                    <div class="profile-badges" style="display: flex; gap: 10px; margin: 15px 0;">
                        ${member.verified ? '<span class="badge verified">✓ Верифицирован</span>' : ''}
                        ${member.scam ? '<span class="badge scam">⚠️ Скам</span>' : ''}
                        <span class="badge">${member.category}</span>
                    </div>
                    <div class="user-profile-stats">
                        <div class="stat-box">
                            <span class="stat-number">${member.followers || '?'}</span>
                            <span class="stat-label">Подписчиков</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-number">${joinDate}</span>
                            <span class="stat-label">Дата</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="profile-description" style="margin-top: 30px;">
                <h3>Описание</h3>
                <p>${member.description || 'Нет описания'}</p>
                ${member.main_link ? `
                    <div style="margin-top: 20px;">
                        <a href="${member.main_link}" target="_blank" class="action-btn" style="display: inline-flex; align-items: center; gap: 8px;">
                            <i class="fas fa-external-link-alt"></i> Перейти на проект
                        </a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    switchSection('profile-details');
}

// ========== Заявки ==========
function initApplyForm() {
    const form = document.getElementById('apply-form');
    const avatarUploadBtn = document.getElementById('avatar-upload-btn');
    const avatarInput = document.getElementById('apply-avatar');
    const avatarPreview = document.getElementById('avatar-preview');
    const addLinkBtn = document.getElementById('add-link-btn');
    const linksContainer = document.getElementById('links-container');
    
    if (avatarUploadBtn && avatarInput) {
        avatarUploadBtn.addEventListener('click', () => avatarInput.click());
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.size <= 5 * 1024 * 1024) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    avatarPreview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
                };
                reader.readAsDataURL(file);
            } else if (file) {
                showNotification('Файл слишком большой (макс 5MB)', 'error');
            }
        });
    }
    
    if (addLinkBtn && linksContainer) {
        addLinkBtn.addEventListener('click', () => {
            const groups = linksContainer.querySelectorAll('.link-input-group');
            if (groups.length < 7) {
                const newGroup = document.createElement('div');
                newGroup.className = 'link-input-group';
                newGroup.innerHTML = `
                    <input type="url" class="extra-link" placeholder="https://...">
                    <button type="button" class="remove-link-btn">✕</button>
                `;
                linksContainer.appendChild(newGroup);
                updateRemoveButtons();
            } else {
                showNotification('Максимум 7 ссылок', 'error');
            }
        });
        updateRemoveButtons();
    }
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) {
                showNotification('Сначала войдите в аккаунт', 'error');
                openModal('auth-modal');
                return;
            }
            
            const nickname = document.getElementById('apply-nickname').value.trim();
            const telegram = document.getElementById('apply-telegram').value.trim().replace('@', '');
            const category = document.getElementById('apply-category').value;
            const description = document.getElementById('apply-description').value.trim();
            const mainLink = document.getElementById('apply-main-link').value.trim();
            
            if (!nickname || !telegram || !category || !description || !mainLink) {
                showNotification('Заполните все обязательные поля', 'error');
                return;
            }
            
            if (description.length < 50) {
                showNotification('Описание минимум 50 символов', 'error');
                return;
            }
            
            const extraLinks = [];
            document.querySelectorAll('.extra-link').forEach(input => {
                const val = input.value.trim();
                if (val && val.startsWith('http')) extraLinks.push(val);
            });
            
            let avatarData = null;
            const avatarImg = avatarPreview?.querySelector('img');
            if (avatarImg && avatarImg.src && !avatarImg.src.includes('ui-avatars')) {
                avatarData = avatarImg.src;
            }
            
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            submitBtn.disabled = true;
            
            try {
                const { data, error } = await supabase
                    .from('applications')
                    .insert({
                        user_id: currentUser.id,
                        telegram_id: currentUser.telegram_id,
                        nickname: nickname,
                        telegram: telegram,
                        category: category,
                        description: description,
                        main_link: mainLink,
                        extra_links: extraLinks,
                        avatar_data: avatarData,
                        status: 'pending',
                        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
                    })
                    .select()
                    .single();
                
                if (error) throw error;
                
                showNotification('Заявка отправлена!', 'success');
                form.reset();
                if (avatarPreview) avatarPreview.innerHTML = '<i class="fas fa-user" style="font-size: 3rem; color: #666;"></i>';
                document.getElementById('links-container').innerHTML = `
                    <div class="link-input-group">
                        <input type="url" class="extra-link" placeholder="https://...">
                        <button type="button" class="remove-link-btn" style="display: none;">✕</button>
                    </div>
                `;
                
                if (currentUser.is_admin) loadApplications();
                
            } catch (error) {
                console.error('Ошибка:', error);
                showNotification('Ошибка отправки', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    const resetBtn = form?.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Очистить форму?')) {
                form.reset();
                if (avatarPreview) avatarPreview.innerHTML = '<i class="fas fa-user" style="font-size: 3rem; color: #666;"></i>';
            }
        });
    }
}

function updateRemoveButtons() {
    document.querySelectorAll('.remove-link-btn').forEach(btn => {
        btn.style.display = 'flex';
        btn.onclick = () => btn.parentElement.remove();
    });
}

async function loadApplications() {
    if (!currentUser?.is_admin) return;
    
    try {
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        currentApplications = data || [];
        updateAdminStats();
        renderApplications(currentApplications);
    } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
    }
}

function updateAdminStats() {
    const pending = currentApplications.filter(a => a.status === 'pending').length;
    const approved = currentApplications.filter(a => a.status === 'approved').length;
    const rejected = currentApplications.filter(a => a.status === 'rejected').length;
    
    document.getElementById('pending-count').textContent = pending;
    document.getElementById('approved-count').textContent = approved;
    document.getElementById('rejected-count').textContent = rejected;
    document.getElementById('total-count').textContent = currentApplications.length;
}

function renderApplications(applications) {
    const container = document.getElementById('applications-list');
    if (!container) return;
    
    const activeFilter = document.querySelector('.admin-filters .filter-btn.active')?.dataset.filter || 'all';
    const filtered = applications.filter(app => activeFilter === 'all' || app.status === activeFilter);
    
    if (!filtered.length) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #888;">Нет заявок</div>';
        return;
    }
    
    container.innerHTML = filtered.map(app => `
        <div class="application-card ${app.status}" data-id="${app.id}">
            <div class="application-header">
                <div class="application-avatar">
                    ${app.avatar_data ? 
                        `<img src="${app.avatar_data}" alt="${app.nickname}">` :
                        `<div style="width:100%;height:100%;background:#2a2a2a;display:flex;align-items:center;justify-content:center;">📷</div>`
                    }
                </div>
                <div class="application-info">
                    <h3>${app.nickname}</h3>
                    <p><i class="fab fa-telegram"></i> @${app.telegram}</p>
                    <span class="application-category">${app.category}</span>
                    <span class="application-status status-${app.status}">${getStatusText(app.status)}</span>
                </div>
            </div>
            <div class="application-footer">
                <div class="application-date">${new Date(app.created_at).toLocaleDateString()}</div>
                <div class="application-actions">
                    ${app.status === 'pending' ? `
                        <button class="action-btn-small approve-btn" data-id="${app.id}">✅ Принять</button>
                        <button class="action-btn-small reject-btn" data-id="${app.id}">❌ Отклонить</button>
                    ` : ''}
                    <button class="action-btn-small view-btn" data-id="${app.id}">👁️ Просмотр</button>
                </div>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            approveApplication(btn.dataset.id);
        });
    });
    
    document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            rejectApplication(btn.dataset.id);
        });
    });
    
    document.querySelectorAll('.view-btn, .application-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('approve-btn') || e.target.classList.contains('reject-btn')) return;
            const id = card.dataset.id || card.closest('.application-card')?.dataset.id;
            if (id) showApplicationDetails(id);
        });
    });
}

function getStatusText(status) {
    const statuses = { pending: 'Ожидает', approved: 'Принята', rejected: 'Отклонена' };
    return statuses[status] || status;
}

async function approveApplication(appId) {
    if (!confirm('Принять заявку?')) return;
    
    try {
        const { data: app, error: fetchError } = await supabase
            .from('applications')
            .select('*')
            .eq('id', appId)
            .single();
        
        if (fetchError) throw fetchError;
        
        const { error: updateError } = await supabase
            .from('applications')
            .update({ status: 'approved', reviewed_at: new Date().toISOString() })
            .eq('id', appId);
        
        if (updateError) throw updateError;
        
        const { error: memberError } = await supabase
            .from('members')
            .insert({
                nickname: app.nickname,
                telegram: app.telegram,
                category: app.category,
                description: app.description,
                main_link: app.main_link,
                extra_links: app.extra_links,
                avatar: app.avatar_data,
                user_id: app.user_id,
                telegram_id: app.telegram_id,
                status: 'approved',
                verified: false,
                scam: false,
                pinned: false
            });
        
        if (memberError) throw memberError;
        
        showNotification('Заявка принята! Участник добавлен', 'success');
        loadApplications();
        loadMembers();
        
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка принятия заявки', 'error');
    }
}

async function rejectApplication(appId) {
    const reason = prompt('Причина отказа (необязательно):');
    if (!confirm('Отклонить заявку?')) return;
    
    try {
        const { error } = await supabase
            .from('applications')
            .update({ 
                status: 'rejected', 
                reviewed_at: new Date().toISOString(),
                rejection_reason: reason || null
            })
            .eq('id', appId);
        
        if (error) throw error;
        
        showNotification('Заявка отклонена', 'info');
        loadApplications();
        
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка отклонения заявки', 'error');
    }
}

async function showApplicationDetails(appId) {
    const app = currentApplications.find(a => a.id == appId);
    if (!app) return;
    
    const modalBody = document.getElementById('application-modal-body');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
        <div class="application-details">
            <div class="detail-group">
                <label>Никнейм:</label>
                <div><strong>${app.nickname}</strong></div>
            </div>
            <div class="detail-group">
                <label>Telegram:</label>
                <div><a href="https://t.me/${app.telegram}" target="_blank">@${app.telegram}</a></div>
            </div>
            <div class="detail-group">
                <label>Категория:</label>
                <div>${app.category}</div>
            </div>
            <div class="detail-group">
                <label>Описание:</label>
                <div>${app.description}</div>
            </div>
            <div class="detail-group">
                <label>Основная ссылка:</label>
                <div><a href="${app.main_link}" target="_blank">${app.main_link}</a></div>
            </div>
            ${app.extra_links?.length ? `
                <div class="detail-group">
                    <label>Дополнительные ссылки:</label>
                    <div>${app.extra_links.map(l => `<a href="${l}" target="_blank">${l}</a><br>`).join('')}</div>
                </div>
            ` : ''}
            <div class="detail-group">
                <label>Дата подачи:</label>
                <div>${new Date(app.created_at).toLocaleString()}</div>
            </div>
        </div>
    `;
    
    openModal('application-modal');
}

function showAdminPanel() {
    if (!currentUser?.is_admin) {
        showNotification('Доступ запрещен', 'error');
        return;
    }
    loadApplications();
    
    document.querySelectorAll('.admin-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-filters .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderApplications(currentApplications);
        });
    });
    
    switchSection('admin-panel');
}

// ========== Форум ==========
function initForum() {
    const createPostBtn = document.getElementById('create-post-btn');
    const createPostForm = document.getElementById('create-post-form');
    const addAttachmentBtn = document.querySelector('.add-attachment-btn');
    const attachmentsContainer = document.getElementById('attachments-container');
    
    if (createPostBtn) {
        createPostBtn.addEventListener('click', () => {
            if (!currentUser) {
                showNotification('Сначала войдите в аккаунт', 'error');
                openModal('auth-modal');
                return;
            }
            openModal('create-post-modal');
        });
    }
    
    if (addAttachmentBtn && attachmentsContainer) {
        addAttachmentBtn.addEventListener('click', () => {
            const groups = attachmentsContainer.querySelectorAll('.link-input-group');
            if (groups.length < 5) {
                const newGroup = document.createElement('div');
                newGroup.className = 'link-input-group';
                newGroup.innerHTML = `
                    <input type="url" class="attachment-link" placeholder="https://...">
                    <button type="button" class="remove-attachment-btn">✕</button>
                `;
                attachmentsContainer.appendChild(newGroup);
                updateAttachmentRemoveButtons();
            } else {
                showNotification('Максимум 5 вложений', 'error');
            }
        });
        updateAttachmentRemoveButtons();
    }
    
    if (createPostForm) {
        createPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) return;
            
            const title = document.getElementById('post-title').value.trim();
            const content = document.getElementById('post-content').value.trim();
            
            if (!title || !content) {
                showNotification('Заполните заголовок и содержание', 'error');
                return;
            }
            
            const attachments = [];
            document.querySelectorAll('.attachment-link').forEach(input => {
                const val = input.value.trim();
                if (val && val.startsWith('http')) attachments.push(val);
            });
            
            const submitBtn = createPostForm.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Публикация...';
            submitBtn.disabled = true;
            
            try {
                const { error } = await supabase
                    .from('posts')
                    .insert({
                        user_id: currentUser.id,
                        author_name: currentUser.first_name || currentUser.username || 'Пользователь',
                        author_avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.first_name || 'User')}&background=0088cc&color=fff&size=40`,
                        title: title,
                        content: content,
                        attachments: attachments,
                        views: 0,
                        likes: 0
                    });
                
                if (error) throw error;
                
                showNotification('Пост опубликован!', 'success');
                closeModal('create-post-modal');
                createPostForm.reset();
                document.getElementById('attachments-container').innerHTML = `
                    <div class="link-input-group">
                        <input type="url" class="attachment-link" placeholder="https://...">
                        <button type="button" class="remove-attachment-btn" style="display: none;">✕</button>
                    </div>
                `;
                loadPosts();
                
            } catch (error) {
                console.error('Ошибка:', error);
                showNotification('Ошибка публикации', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    loadPosts();
}

function updateAttachmentRemoveButtons() {
    document.querySelectorAll('.remove-attachment-btn').forEach(btn => {
        btn.style.display = 'flex';
        btn.onclick = () => btn.parentElement.remove();
    });
}

async function loadPosts() {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        renderPosts(data || []);
    } catch (error) {
        console.error('Ошибка загрузки постов:', error);
        renderPosts([]);
    }
}

function renderPosts(posts) {
    const container = document.getElementById('posts-list');
    if (!container) return;
    
    if (!posts.length) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #888;">Пока нет постов. Будьте первым!</div>';
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="post-card" data-id="${post.id}">
            <div class="post-header">
                <div class="post-author">
                    <div class="post-author-avatar">
                        <img src="${post.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name || 'User')}&background=666&color=fff&size=40`}" alt="${post.author_name}">
                    </div>
                    <span class="post-author-name">${post.author_name || 'Пользователь'}</span>
                </div>
                <div class="post-date">${new Date(post.created_at).toLocaleString()}</div>
            </div>
            <h3 class="post-title">${escapeHtml(post.title)}</h3>
            <div class="post-content">${escapeHtml(post.content)}</div>
            ${post.attachments?.length ? `
                <div class="post-attachments">
                    ${post.attachments.map(link => `
                        <a href="${link}" target="_blank" class="attachment">
                            <i class="fas fa-link"></i> Вложение
                        </a>
                    `).join('')}
                </div>
            ` : ''}
            <div class="post-actions">
                <button class="post-action like-btn" data-id="${post.id}">
                    <i class="fas fa-heart"></i> <span class="likes-count">${post.likes || 0}</span>
                </button>
                <button class="post-action view-btn" data-id="${post.id}">
                    <i class="fas fa-eye"></i> <span class="views-count">${post.views || 0}</span>
                </button>
                ${currentUser?.is_admin ? `
                    <button class="post-action delete-btn" data-id="${post.id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!currentUser) {
                showNotification('Войдите чтобы лайкать', 'error');
                openModal('auth-modal');
                return;
            }
            const postId = btn.dataset.id;
            const post = posts.find(p => p.id == postId);
            if (post) {
                const newLikes = (post.likes || 0) + 1;
                await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);
                btn.querySelector('.likes-count').textContent = newLikes;
                post.likes = newLikes;
            }
        });
    });
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const postId = btn.dataset.id;
            const post = posts.find(p => p.id == postId);
            if (post) {
                const newViews = (post.views || 0) + 1;
                await supabase.from('posts').update({ views: newViews }).eq('id', postId);
                btn.querySelector('.views-count').textContent = newViews;
                post.views = newViews;
            }
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Удалить пост?')) {
                await supabase.from('posts').delete().eq('id', btn.dataset.id);
                loadPosts();
                showNotification('Пост удален', 'info');
            }
        });
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
        return c;
    });
}

function showMyProfile() {
    if (!currentUser) {
        openModal('auth-modal');
        return;
    }
    
    const container = document.getElementById('profile-content');
    if (!container) return;
    
    const registeredDate = currentUser.registered_at ? new Date(currentUser.registered_at).toLocaleDateString() : 'Недавно';
    
    container.innerHTML = `
        <div class="profile-container">
            <div class="user-profile-header">
                <div class="user-profile-avatar">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.first_name || currentUser.username || 'User')}&background=0088cc&color=fff&size=120" alt="Avatar">
                </div>
                <div class="user-profile-info">
                    <h1>${currentUser.first_name || currentUser.username || 'Пользователь'}</h1>
                    <p><i class="fab fa-telegram"></i> @${currentUser.username || 'user'}</p>
                    <div class="user-profile-stats">
                        <div class="stat-box">
                            <span class="stat-number">${currentUser.id}</span>
                            <span class="stat-label">ID</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-number">${registeredDate}</span>
                            <span class="stat-label">Регистрация</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="profile-description" style="margin-top: 30px;">
                <h3>О себе</h3>
                <p>${currentUser.bio || 'Информация не заполнена'}</p>
            </div>
        </div>
    `;
    
    switchSection('profile-details');
}

// ========== Вспомогательные функции ==========
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button style="background: none; border: none; color: white; margin-left: 15px; cursor: pointer;">&times;</button>
    `;
    document.body.appendChild(notification);
    
    const closeBtn = notification.querySelector('button');
    closeBtn.addEventListener('click', () => notification.remove());
    
    setTimeout(() => notification.remove(), 5000);
}

function initSnow() {
    const container = document.querySelector('.snow-container');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.style.width = `${Math.random() * 6 + 2}px`;
        snowflake.style.height = snowflake.style.width;
        snowflake.style.left = `${Math.random() * 100}%`;
        snowflake.style.animationDuration = `${Math.random() * 5 + 3}s`;
        snowflake.style.animationDelay = `${Math.random() * 5}s`;
        snowflake.style.opacity = Math.random() * 0.5 + 0.3;
        container.appendChild(snowflake);
    }
}

// Закрытие модалок по клику вне
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
})
