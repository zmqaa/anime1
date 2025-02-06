// 通用工具函数
const AnimeUtils = {
    /**
     * 格式化日期时间
     * @param {string} datetime - 日期时间字符串
     * @param {string} format - 输出格式 ('date' | 'time' | 'full')
     * @returns {string} 格式化后的日期时间
     */
    formatDateTime: (datetime, format = 'full') => {
        const date = new Date(datetime);
        const options = {
            date: { year: 'numeric', month: '2-digit', day: '2-digit' },
            time: { hour: '2-digit', minute: '2-digit' },
            full: {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }
        };

        return date.toLocaleString('zh-CN', options[format]);
    },

    /**
     * 防抖函数
     * @param {Function} func - 要执行的函数
     * @param {number} wait - 等待时间（毫秒）
     * @returns {Function} 防抖处理后的函数
     */
    debounce: (func, wait = 300) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 显示提示消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 ('success' | 'info' | 'warning' | 'danger')
     * @param {number} duration - 显示时长（毫秒）
     */
    showToast: (message, type = 'info', duration = 3000) => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} show`;
        toast.innerHTML = `
            <div class="toast-header">
                <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
                <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
            <div class="toast-body">${message}</div>
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    },

    /**
     * 验证表单数据
     * @param {Object} data - 表单数据
     * @param {Object} rules - 验证规则
     * @returns {Object} 验证结果 {isValid: boolean, errors: Array}
     */
    validateForm: (data, rules) => {
        const errors = [];
        let isValid = true;

        for (const [field, rule] of Object.entries(rules)) {
            if (rule.required && !data[field]) {
                errors.push(`${rule.label || field}不能为空`);
                isValid = false;
            }

            if (rule.min && data[field] < rule.min) {
                errors.push(`${rule.label || field}不能小于${rule.min}`);
                isValid = false;
            }

            if (rule.max && data[field] > rule.max) {
                errors.push(`${rule.label || field}不能大于${rule.max}`);
                isValid = false;
            }
        }

        return { isValid, errors };
    }
};

// 导出工具函数，使其可以在其他模块中使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimeUtils;
}