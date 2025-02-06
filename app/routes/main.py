from flask import Blueprint, render_template
from app.utils.file_handler import FileHandler
from collections import defaultdict

main = Blueprint('main', __name__)
file_handler = FileHandler()

@main.route('/')
def index():
    # 加载数据
    history_watches = file_handler.load_data('history_watch.json')
    daily_watches = file_handler.load_data('daily_watch.json')
    
    # 统计数据
    stats = calculate_stats(history_watches, daily_watches)
    
    # 获取排行榜数据
    rankings = get_rankings(history_watches)
    
    return render_template('index.html',
                         stats=stats,
                         rankings=rankings,
                         tags=get_all_tags(history_watches))

def calculate_stats(history_watches, daily_watches):
    """计算统计数据"""
    rated_watches = [w for w in history_watches if w.get('rating')]
    return {
        'total_history': len(history_watches),
        'total_daily': len(daily_watches),
        'total_tags': len(get_all_tags(history_watches)),
        'avg_rating': sum(w['rating'] for w in rated_watches) / len(rated_watches) if rated_watches else 0
    }

def get_rankings(history_watches):
    """获取排行榜数据"""
    return {
        'top_rated': sorted(
            [w for w in history_watches if w.get('rating')],
            key=lambda x: x['rating'],
            reverse=True
        )[:10],
        'recent': sorted(
            [w for w in history_watches if w.get('end_date')],
            key=lambda x: x['end_date'],
            reverse=True
        )[:10]
    }

def get_all_tags(history_watches):
    """获取所有标签"""
    tags = set()
    for watch in history_watches:
        tags.update(watch.get('tags', []))
    return sorted(tags)