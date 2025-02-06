// 统计和图表相关的JavaScript功能
class AnimeStats {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.loadStats();
        this.initSearch();
    }

    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();

            this.createMonthlyChart(data.monthly_stats);
            this.createTagsChart(data.tag_stats);
        } catch (error) {
            console.error('加载统计数据失败:', error);
        }
    }

    createMonthlyChart(monthlyStats) {
        const months = Object.keys(monthlyStats).sort();
        const counts = months.map(month => monthlyStats[month]);

        const ctx = document.getElementById('monthlyChart').getContext('2d');
        this.charts.monthly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: '每月观看集数',
                    data: counts,
                    borderColor: '#007bff',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '观看集数'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '月份'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
    }

    createTagsChart(tagStats) {
        const tags = Object.keys(tagStats);
        const counts = tags.map(tag => tagStats[tag]);

        const ctx = document.getElementById('tagsChart').getContext('2d');
        this.charts.tags = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: tags,
                datasets: [{
                    label: '按标签统计',
                    data: counts,
                    backgroundColor: '#28a745',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '动漫数量'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    initSearch() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchKeyword');
        const tagSelect = document.getElementById('searchTag');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }

        // 添加回车搜索支持
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        // 标签选择变化时自动搜索
        if (tagSelect) {
            tagSelect.addEventListener('change', () => this.performSearch());
        }
    }

    async performSearch() {
        const keyword = document.getElementById('searchKeyword').value;
        const tag = document.getElementById('searchTag').value;
        const resultsContainer = document.getElementById('searchResults');

        if (!keyword && !tag) {
            this.showMessage('请输入搜索关键词或选择标签', 'warning');
            return;
        }

        try {
            const response = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}&tag=${encodeURIComponent(tag)}`);
            const results = await response.json();

            if (results.length === 0) {
                resultsContainer.innerHTML = '<div class="alert alert-info">没有找到匹配的结果</div>';
                return;
            }

            this.displaySearchResults(results);
        } catch (error) {
            console.error('搜索失败:', error);
            this.showMessage('搜索时发生错误，请重试', 'danger');
        }
    }

    displaySearchResults(results) {
        const resultsContainer = document.getElementById('searchResults');

        const resultsHtml = results.map(anime => `
            <div class="card search-result">
                <div class="card-body">
                    <h4 class="card-title">${anime.anime_name}</h4>
                    ${anime.rating ? `<p class="card-text">评分：<span class="badge bg-primary">${anime.rating}</span></p>` : ''}
                    ${anime.tags && anime.tags.length ? `
                        <p class="card-text">标签：
                            ${anime.tags.map(tag => `
                                <span class="badge bg-secondary">${tag}</span>
                            `).join(' ')}
                        </p>
                    ` : ''}
                    <p class="card-text">
                        <small class="text-muted">
                            观看时间：${anime.start_date}
                            ${anime.end_date ? ` - ${anime.end_date}` : ''}
                        </small>
                    </p>
                </div>
            </div>
        `).join('');

        resultsContainer.innerHTML = resultsHtml;
    }

    showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);

        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }

    updateStats(stats) {
        // 更新统计卡片
        const statsElements = {
            totalHistory: document.getElementById('totalHistory'),
            totalDaily: document.getElementById('totalDaily'),
            totalTags: document.getElementById('totalTags'),
            avgRating: document.getElementById('avgRating')
        };

        if (statsElements.totalHistory) statsElements.totalHistory.textContent = stats.total_history;
        if (statsElements.totalDaily) statsElements.totalDaily.textContent = stats.total_daily;
        if (statsElements.totalTags) statsElements.totalTags.textContent = stats.total_tags;
        if (statsElements.avgRating) statsElements.avgRating.textContent = stats.avg_rating.toFixed(1);
    }

    // 更新排行榜
    updateRankings(rankings) {
        const topRatedList = document.getElementById('topRatedList');
        const recentList = document.getElementById('recentList');

        if (topRatedList) {
            topRatedList.innerHTML = rankings.top_rated.map((anime, index) => `
                <div class="ranking-item">
                    <span class="rank">${index + 1}</span>
                    <span class="title">${anime.anime_name}</span>
                    <span class="rating">${anime.rating}</span>
                </div>
            `).join('');
        }

        if (recentList) {
            recentList.innerHTML = rankings.recent.map(anime => `
                <div class="ranking-item">
                    <span class="date">${anime.end_date}</span>
                    <span class="title">${anime.anime_name}</span>
                </div>
            `).join('');
        }
    }

    // 定期刷新数据
    startAutoRefresh(interval = 300000) { // 默认5分钟刷新一次
        setInterval(() => {
            this.loadStats();
        }, interval);
    }
}

// 当文档加载完成时初始化统计功能
document.addEventListener('DOMContentLoaded', () => {
    const stats = new AnimeStats();
    stats.startAutoRefresh(); // 启动自动刷新
});