let tagChart, statusChart;

// 初始化图表
function initCharts(tagData, statusData) {
    const ctx1 = document.getElementById('tagChart').getContext('2d');
    const ctx2 = document.getElementById('statusChart').getContext('2d');

    if (tagChart) tagChart.destroy();
    if (statusChart) statusChart.destroy();

    const colors = [
        '#4F46E5', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6',
        '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
    ];

    tagChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: Object.keys(tagData),
            datasets: [{
                data: Object.values(tagData),
                backgroundColor: colors.slice(0, Object.keys(tagData).length)
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: '标签分布'
                }
            }
        }
    });

    statusChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: Object.keys(statusData),
            datasets: [{
                label: '数量',
                data: Object.values(statusData),
                backgroundColor: '#4F46E5'
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: '观看状态分布'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// 更新统计卡片
function updateStats(stats) {
    const statsHTML = `
        <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="text-gray-500">总记录数</h3>
            <p class="text-3xl font-bold">${stats.total}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="text-gray-500">平均评分</h3>
            <p class="text-3xl font-bold">${stats.avg_rating.toFixed(1)}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="text-gray-500">集数分布</h3>
            <p class="text-sm mt-1">1-12集: ${stats.episodes_distribution['0-12']}</p>
            <p class="text-sm mt-1">13-24集: ${stats.episodes_distribution['13-24']}</p>
            <p class="text-sm mt-1">25集以上: ${stats.episodes_distribution['25+']}</p>
        </div>
    `;
    document.getElementById('stats').innerHTML = statsHTML;
}

// 更新表格数据
function updateTable(data) {
    const tbody = document.getElementById('dataTable');
    tbody.innerHTML = data.anime_list.map(anime => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4">${anime.title}</td>
            <td class="px-6 py-4">${anime.tags.join(', ')}</td>
            <td class="px-6 py-4">${anime.rating}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-full text-sm
                    ${anime.status === '已看完' ? 'bg-green-100 text-green-800' : 
                     anime.status === '追番中' ? 'bg-blue-100 text-blue-800' : 
                     'bg-red-100 text-red-800'}">
                    ${anime.status}
                </span>
            </td>
            <td class="px-6 py-4">${anime.watch_date}</td>
        </tr>
    `).join('');
}

// 模态框控制
function openModal() {
    document.getElementById('addModal').classList.remove('hidden');
    document.getElementById('addModal').classList.add('flex');
}

function closeModal() {
    document.getElementById('addModal').classList.add('hidden');
    document.getElementById('addModal').classList.remove('flex');
}

// 表单提交
async function submitForm(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/add', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal();
            e.target.reset();
            await loadData();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('添加失败，请重试');
    }
}

// 加载数据
async function loadData() {
    try {
        const [dataResponse, statsResponse] = await Promise.all([
            fetch('/api/data'),
            fetch('/api/stats')
        ]);

        const data = await dataResponse.json();
        const stats = await statsResponse.json();

        updateTable(data);
        updateStats(stats);
        initCharts(stats.tag_distribution, stats.status_distribution);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// 初始化加载数据
document.addEventListener('DOMContentLoaded', loadData);

// 关闭模态框的点击事件
document.getElementById('addModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});