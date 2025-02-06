document.addEventListener('DOMContentLoaded', function() {
    const dailyWatchForm = document.getElementById('dailyWatchForm');
    const dateFilter = document.getElementById('dateFilter');
    
    loadDailyRecords();
    
    if (dailyWatchForm) {
        dailyWatchForm.addEventListener('submit', handleFormSubmit);
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', loadDailyRecords);
    }
});

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        anime_name: document.getElementById('anime_name').value,
        episode: parseInt(document.getElementById('episode').value)
    };
    
    fetch('/api/daily_watch', {
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
        document.getElementById('dailyWatchForm').reset();
        loadDailyRecords();
    })
    .catch(error => {
        alert('保存失败: ' + error.message);
    });
}

function loadDailyRecords() {
    const date = document.getElementById('dateFilter').value;
    
    fetch('/api/daily_watch')
        .then(response => response.json())
        .then(records => {
            const container = document.getElementById('dailyRecords');
            displayDailyRecords(container, records, date);
        })
        .catch(error => {
            console.error('加载记录失败:', error);
        });
}

function displayDailyRecords(container, records, filterDate) {
    // 如果有日期筛选，进行过滤
    if (filterDate) {
        records = records.filter(record => record.timestamp.startsWith(filterDate));
    }
    
    if (records.length === 0) {
        container.innerHTML = '<div class="no-records">暂无记录</div>';
        return;
    }
    
    const recordsHTML = records.map(record => `
        <div class="record-item" data-id="${record.id}">
            <div class="record-content">
                <div class="anime-info">
                    <span class="anime-name">${record.anime_name}</span>
                    <span class="episode">第 ${record.episode} 集</span>
                </div>
                <div class="timestamp">${record.timestamp}</div>
            </div>
            <button class="delete-btn" onclick="deleteRecord(${record.id})">
                删除
            </button>
        </div>
    `).join('');
    
    container.innerHTML = recordsHTML;
}

function deleteRecord(recordId) {
    if (!confirm('确定要删除这条记录吗？')) {
        return;
    }
    
    fetch(`/api/daily_watch/${recordId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        loadDailyRecords();
    })
    .catch(error => {
        alert('删除失败: ' + error.message);
    });
}