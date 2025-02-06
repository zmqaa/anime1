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


@daily.route('/api/daily_watch/<int:record_id>', methods=['DELETE'])
def delete_daily_watch(record_id):
    try:
        daily_watches = file_handler.load_data('daily_watch.json')

        # 找到并删除记录
        updated_watches = [w for w in daily_watches if w.get('id') != record_id]

        if len(updated_watches) == len(daily_watches):
            return jsonify({'error': '记录不存在'}), 404

        file_handler.save_data('daily_watch.json', updated_watches)
        return jsonify({'message': '记录已删除'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500