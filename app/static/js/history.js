document.addEventListener('DOMContentLoaded', function() {
    const historyForm = document.getElementById('historyWatchForm');
    const sortBy = document.getElementById('sortBy');
    const filterTag = document.getElementById('filterTag');
    
    loadHistoryRecords();
    
    if (historyForm) {
        historyForm.addEventListener('submit', handleFormSubmit);
    }
    
    if (sortBy) {
        sortBy.addEventListener('change', loadHistoryRecords);
    }
    
    if (filterTag) {
        filterTag.addEventListener('change', loadHistoryRecords);
    }
});

function handleFormSubmit(e) {
    e.preventDefault();
    
    // 获取标签
    const tags = Array.from(document.querySelectorAll('.tag-item'))
        .map(tag => tag.dataset.value);
    
    const formData = {
        anime_name: document.getElementById('anime_name').value,
        start_date: document.getElementById('start_date').value,
        end_date: document.getElementById('end_date').value || null,
        tags: tags,
        rating: document.getElementById('rating').value || null,
        notes: document.getElementById('notes').value || ''
    };
    
    fetch('/api/history_watch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        document.getElementById('historyWatchForm').reset();
        document.getElementById('tagsContainer').innerHTML = '';
        loadHistoryRecords();
    })
    .catch(error => {
        alert('保存失败: ' + error.message);
    });
}

function loadHistoryRecords() {
    const sortBy = document.getElementById('sortBy').value;
    const filterTag = document.getElementById('filterTag').value;
    
    fetch('/api/history_watch')
        .then(response => response.json())
        .then(records => {
            const container = document.getElementById('historyRecords');
            displayHistoryRecords(container, records, sortBy, filterTag);
        })
        .catch(error => {
            console.error('加载记录失败:', error);
        });
}

function displayHistoryRecords(container, records, sortBy, filterTag) {
    // 标签筛选
    if (filterTag) {
        records = records.filter(record => 
            record.tags && record.tags.includes(filterTag)
        );
    }
    
    // 排序
    records.sort((a, b) => {
        if (sortBy === 'rating') {
            return (b.rating || 0) - (a.rating || 0);
        } else {
            const dateA = new Date(a[sortBy] || '1970-01-01');
            const dateB = new Date(b[sortBy] || '1970-01-01');
            return dateB - dateA;
        }
    });
    
    if (records.length === 0) {
        container.innerHTML = '<div class="no-records">暂无记录</div>';
        return;
    }
    
    const recordsHTML = records.map(record => `
        <div class="record-item" data-id="${record.id}">
            <div class="record-content">
                <div class="record-header">
                    <h3 class="anime-name">${record.anime_name}</h3>
                    ${record.rating ? `<span class="rating">${record.rating}分</span>` : ''}
                </div>
                <div class="dates">
                    <span>开始: ${record.start_date}</span>
                    ${record.end_date ? `<span>完成: ${record.end_date}</span>` : ''}
                </div>
                ${record.tags && record.tags.length ? `
                    <div class="tags">
                        ${record.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                ${record.notes ? `<div class="notes">${record.notes}</div>` : ''}
            </div>
            <button class="delete-btn" onclick="deleteHistoryRecord(${record.id})">
                删除
            </button>
        </div>
    `).join('');
    
    container.innerHTML = recordsHTML;
}

function deleteHistoryRecord(recordId) {
    if (!confirm('确定要删除这条记录吗？')) {
        return;
    }
    
    fetch(`/api/history_watch/${recordId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        loadHistoryRecords();
    })
    .catch(error => {
        alert('删除失败: ' + error.message);
    });
}