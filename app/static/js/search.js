// 添加防抖功能
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// 初始化搜索功能
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchKeyword');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(search, 500));
    }
});

// 搜索函数
function search() {
    const keyword = document.getElementById('searchKeyword').value.trim();
    const searchResults = document.getElementById('searchResults');

    if (!keyword) {
        searchResults.innerHTML = '';
        return;
    }

    fetch('/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: keyword })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        displayResults(data);
    })
    .catch(error => {
        console.error('搜索错误:', error);
        searchResults.innerHTML = `<div class="search-error">搜索出现错误: ${error.message}</div>`;
    });
}

// 显示搜索结果
function displayResults(results) {
    const searchResults = document.getElementById('searchResults');

    if (!results.length) {
        searchResults.innerHTML = '<div class="no-results">未找到相关结果</div>';
        return;
    }

    const resultsHTML = results.map(anime => `
        <div class="search-result-item">
            <div class="anime-info">
                <span class="title">${anime.anime_name}</span>
                ${anime.rating ? `<span class="rating">${anime.rating}分</span>` : ''}
            </div>
            ${anime.tags && anime.tags.length ? `
                <div class="tags">
                    ${anime.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');

    searchResults.innerHTML = resultsHTML;
}