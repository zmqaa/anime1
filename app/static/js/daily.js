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
    
    // 获取并验证表单数据
    const animeName = document.getElementById('anime_name').value.trim();
    const episode = document.getElementById('episode').value;

    if (!animeName) {
        alert('请输入动漫名称');
        return;
    }
    if (!episode || episode < 1) {
        alert('请输入有效的集数');
        return;
    }

    const formData = {
        anime_name: animeName,
        episode: parseInt(episode)
    };

    fetch('/api/daily_watch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || '保存失败');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        // 清空表单
        document.getElementById('dailyWatchForm').reset();
        // 显示成功消息
        alert('记录添加成功！');
        // 重新加载记录列表
        loadDailyRecords();
    })
    .catch(error => {
        alert(error.message || '保存失败，请重试');
        console.error('Error:', error);
    });
}

function loadDailyRecords() {
    const date = document.getElementById('dateFilter').value;

    fetch('/api/daily_watch')
        .then(response => {
            if (!response.ok) {
                throw new Error('加载记录失败');
            }
            return response.json();
        })
        .then(records => {
            const container = document.getElementById('dailyRecords');
            displayDailyRecords(container, records, date);
        })
        .catch(error => {
            console.error('加载记录失败:', error);
            const container = document.getElementById('dailyRecords');
            container.innerHTML = '<div class="error-message">加载记录失败，请刷新页面重试</div>';
        });
}

function displayDailyRecords(container, records, filterDate) {
    // 如果有日期筛选，进行过滤
    if (filterDate) {
        records = records.filter(record => record.timestamp.startsWith(filterDate));
    }

    if (!records || records.length === 0) {
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
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || '删除失败');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        loadDailyRecords();
    })
    .catch(error => {
        alert(error.message || '删除失败，请重试');
        console.error('Error:', error);
    });
}