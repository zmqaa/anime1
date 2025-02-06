// 每日追番记录相关的JavaScript功能
class DailyAnimeTracker {
    constructor() {
        this.form = document.getElementById('dailyWatchForm');
        this.recordsList = document.getElementById('dailyRecords');
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadRecords();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = {
            anime_name: document.getElementById('anime_name').value,
            episode: parseInt(document.getElementById('episode').value)
        };

        try {
            const response = await fetch('/api/daily_watch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.form.reset();
                await this.loadRecords();
                this.showMessage('记录添加成功！', 'success');
            } else {
                throw new Error('提交失败');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showMessage('记录添加失败，请重试', 'danger');
        }
    }

    async loadRecords() {
        try {
            const response = await fetch('/api/daily_watch');
            const records = await response.json();
            this.displayRecords(records);
        } catch (error) {
            console.error('Error:', error);
            this.showMessage('加载记录失败', 'danger');
        }
    }

    displayRecords(records) {
        const recordsHtml = records.map(record => `
            <div class="card">
                <h3>${record.anime_name}</h3>
                <p>第 ${record.episode} 集</p>
                <p class="text-muted">${this.formatDateTime(record.timestamp)}</p>
            </div>
        `).join('');

        this.recordsList.innerHTML = recordsHtml;
    }

    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;

        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, this.form);

        setTimeout(() => alertDiv.remove(), 3000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new DailyAnimeTracker();
});