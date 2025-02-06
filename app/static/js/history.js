// 历史追番记录相关的JavaScript功能
class HistoryAnimeTracker {
    constructor() {
        this.form = document.getElementById('historyWatchForm');
        this.recordsList = document.getElementById('historyRecords');
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadRecords();
        this.initTagsInput();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    initTagsInput() {
        const tagsInput = document.getElementById('tags');
        tagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const tag = tagsInput.value.trim();
                if (tag) {
                    this.addTag(tag);
                    tagsInput.value = '';
                }
            }
        });
    }

    addTag(tag) {
        const tagsContainer = document.getElementById('tagsContainer');
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.innerHTML = `
            ${tag}
            <button type="button" class="tag-remove">&times;</button>
        `;

        tagElement.querySelector('.tag-remove').addEventListener('click', () => {
            tagElement.remove();
        });

        tagsContainer.appendChild(tagElement);
    }

    getTags() {
        return Array.from(document.querySelectorAll('.tag'))
            .map(tag => tag.textContent.trim().replace('×', ''));
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = {
            anime_name: document.getElementById('anime_name').value,
            start_date: document.getElementById('start_date').value,
            end_date: document.getElementById('end_date').value || null,
            tags: this.getTags(),
            rating: parseFloat(document.getElementById('rating').value) || null,
            notes: document.getElementById('notes').value
        };

        try {
            const response = await fetch('/api/history_watch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.form.reset();
                document.getElementById('tagsContainer').innerHTML = '';
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
            const response = await fetch('/api/history_watch');
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
                <p>开始时间：${record.start_date}</p>
                ${record.end_date ? `<p>结束时间：${record.end_date}</p>` : ''}
                ${record.tags.length ? `<p>标签：${record.tags.join(', ')}</p>` : ''}
                ${record.rating ? `<p>评分：${record.rating}</p>` : ''}
                ${record.notes ? `<p>笔记：${record.notes}</p>` : ''}
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
    new HistoryAnimeTracker();
});