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
    # 只获取有评分且评分不为 None 的记录
    rated_watches = [w for w in history_watches if w.get('rating') is not None and w['rating']]

    # 计算平均分
    total_rating = 0
    if rated_watches:
        valid_ratings = []
        for watch in rated_watches:
            try:
                rating = float(watch['rating'])
                if rating > 0:  # 确保评分是正数
                    valid_ratings.append(rating)
            except (ValueError, TypeError):
                continue

        if valid_ratings:
            total_rating = sum(valid_ratings) / len(valid_ratings)

    return {
        'total_history': len(history_watches),
        'total_daily': len(daily_watches),
        'total_tags': len(get_all_tags(history_watches)),
        'avg_rating': round(total_rating, 1)  # 保留一位小数
    }

def get_rankings(history_watches):
    """获取排行榜数据"""
    return {
        'top_rated': sorted(
            [w for w in history_watches if w.get('rating')],
            key=lambda x: x['rating'],
            reverse=False
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


# 在现有的导入语句中添加 request, jsonify
from flask import Blueprint, render_template, request, jsonify

@main.route('/api/search', methods=['POST'])
def search():
    try:
        data = request.get_json()
        keyword = data.get('keyword', '').lower()

        if not keyword:
            return jsonify([])

        # 加载所有历史记录
        history_watches = file_handler.load_data('history_watch.json')

        # 搜索标题和标签
        results = []
        for anime in history_watches:
            anime_name = anime.get('anime_name', '').lower()
            tags = [tag.lower() for tag in anime.get('tags', [])]

            # 如果关键词出现在标题或标签中
            if keyword in anime_name or any(keyword in tag for tag in tags):
                results.append({
                    'id': anime.get('id'),
                    'anime_name': anime.get('anime_name'),
                    'tags': anime.get('tags', []),
                    'rating': anime.get('rating')
                })

        return jsonify(results)

    except Exception as e:
        return jsonify({'error': str(e)}), 500