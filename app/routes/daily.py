from flask import Blueprint, render_template, request, jsonify
from app.utils.file_handler import FileHandler
from app.models.anime import DailyWatch

daily = Blueprint('daily', __name__)
file_handler = FileHandler()

@daily.route('/daily')
def index():
    return render_template('daily.html')

@daily.route('/api/daily_watch', methods=['POST'])
def add_daily_watch():
    data = request.get_json()
    if not data or 'anime_name' not in data or 'episode' not in data:
        return jsonify({'error': '缺少必要数据'}), 400
    
    daily_watch = DailyWatch.from_dict(data)
    saved_data = file_handler.append_data(
        daily_watch.__dict__,
        'daily_watch.json'
    )
    return jsonify(saved_data)

@daily.route('/api/daily_watch', methods=['GET'])
def get_daily_watches():
    daily_watches = file_handler.load_data('daily_watch.json')
    # 按时间戳倒序排序
    daily_watches.sort(key=lambda x: x['timestamp'], reverse=True)
    return jsonify(daily_watches)