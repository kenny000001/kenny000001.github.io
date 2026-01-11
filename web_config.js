/**
 * 前端配置文件
 * 注意：不要在此文件中包含敏感信息
 * 实际API URL应该通过环境变量或构建过程注入
 */

// API基础URL（通过FRPC穿透后的HTTP地址）
// 注意：你的内网穿透地址是 https://kmno4_mysqlphp.owo.vin
window.API_BASE_URL = 'https://kmno4_mysqlphp.owo.vin/api';

// 网站配置
window.SITE_CONFIG = {
    name: 'KMnO4 MC服务器',
    version: '1.0.0',
    description: 'Minecraft服务器账户状态管理系统',
    
    // 页面配置
    pages: {
        index: 'index.html',
        status: 'status.html',
        download: 'download.html',
        account: 'account_status.html'
    },
    
    // 服务器信息
    server: {
        ip: 'nb.2.frp.one:50120',
        backupIp: 'sz.frp.one:47942',
        version: '1.20.1',
        qqGroup: '1078023378',
        apiUrl: 'https://kmno4_mysqlphp.owo.vin'
    },
    
    // 安全配置
    security: {
        minPasswordLength: 8,
        sessionTimeout: 3600, // 1小时
        tokenRefreshInterval: 300 // 5分钟
    }
};

// 工具函数
window.WebUtils = {
    /**
     * 获取API URL
     */
    getApiUrl(endpoint) {
        return `${window.API_BASE_URL}/${endpoint}`;
    },
    
    /**
     * 检查登录状态
     */
    checkLoginStatus() {
        return localStorage.getItem('loggedIn') === 'true';
    },
    
    /**
     * 安全存储数据
     */
    secureStorage: {
        set(key, value) {
            try {
                const encrypted = btoa(encodeURIComponent(JSON.stringify(value)));
                localStorage.setItem(`secure_${key}`, encrypted);
            } catch (e) {
                console.error('存储数据失败:', e);
            }
        },
        
        get(key) {
            try {
                const encrypted = localStorage.getItem(`secure_${key}`);
                if (!encrypted) return null;
                return JSON.parse(decodeURIComponent(atob(encrypted)));
            } catch (e) {
                console.error('读取数据失败:', e);
                return null;
            }
        },
        
        remove(key) {
            localStorage.removeItem(`secure_${key}`);
        }
    },
    
    /**
     * 显示加载动画
     */
    showLoading(selector = 'body') {
        const container = document.querySelector(selector);
        if (container) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            loadingDiv.id = 'global-loading';
            loadingDiv.innerHTML = `
                <div class="bg-white p-6 rounded-xl shadow-xl">
                    <div class="loading-spinner"></div>
                    <p class="mt-4 text-gray-700">加载中...</p>
                </div>
            `;
            container.appendChild(loadingDiv);
        }
    },
    
    /**
     * 隐藏加载动画
     */
    hideLoading() {
        const loadingDiv = document.getElementById('global-loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    },
    
    /**
     * 验证QQ号格式
     */
    validateQQ(qq) {
        const qqRegex = /^[1-9][0-9]{4,11}$/;
        return qqRegex.test(qq);
    },
    
    /**
     * 验证邮箱格式
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    /**
     * 检查密码强度
     */
    checkPasswordStrength(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        return {
            score: score,
            level: score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong',
            message: score <= 2 ? '密码较弱' : score <= 4 ? '密码中等' : '密码强'
        };
    },
    
    /**
     * 显示通知
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
        } border`;
        notification.innerHTML = `
            <div class="flex items-start">
                <i class="fas ${
                    type === 'success' ? 'fa-circle-check' :
                    type === 'error' ? 'fa-circle-exclamation' :
                    type === 'warning' ? 'fa-triangle-exclamation' :
                    'fa-circle-info'
                } mt-0.5 mr-3"></i>
                <div class="flex-1">${message}</div>
                <button onclick="this.parentElement.remove()" class="ml-4 text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 自动移除
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }
};

// 全局错误处理
window.addEventListener('error', function(e) {
    console.error('全局错误:', e.error);
    WebUtils.showNotification('系统发生错误，请刷新页面重试', 'error');
});

// API错误处理
window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && event.reason.message.includes('Failed to fetch')) {
        WebUtils.showNotification('网络连接失败，请检查网络或API服务器状态', 'error');
    }
});

// 页面加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 设置页面标题
    if (window.SITE_CONFIG) {
        document.title = `${window.SITE_CONFIG.name} - ${document.title}`;
    }
    
    // 检查HTTPS（生产环境）
    if (window.location.protocol === 'https:' && window.API_BASE_URL.startsWith('http:')) {
        console.warn('混合内容警告：HTTPS页面调用HTTP API');
        // 显示警告（可选）
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            console.warn('建议将API升级为HTTPS以避免浏览器安全警告');
        }
    }
});