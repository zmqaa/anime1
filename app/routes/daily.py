from flask import Blueprint, render_template, request, jsonify
from app.utils.file_handler import FileHandler
from datetime import datetime
import traceback

bp = Blueprint('daily', __name__)
file_handler = FileHandler()


@bp.route('/daily')
def index():
    try:
        today_date = datetime.now().strftime('%Y-%m-%d')
        return render_template('daily.html', today_date=today_date)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/daily_watch', methods=['GET', 'POST'])
def handle_daily_watch():
    try:
        if request.method == 'POST':
            data = request.get_json()
            if not data:
                return jsonify({'error': '无效的请求数据'}), 400

            # 验证必填字段
            if not data.get('anime_name') or not data.get('episode'):
                return jsonify({'error': '动漫名称和集数为必填项'}), 400

            # 加载现有数据
            watches = file_handler.load_data('daily_watch.json')

            # 创建新记录
            watch_data = {
                'id': len(watches) + 1,
                'anime_name': data['anime_name'].strip(),
                'episode': int(data['episode']),
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }

            # 添加到列表并保存
            watches.append(watch_data)
            file_handler.save_data('daily_watch.json', watches)

            return jsonify({'message': '记录添加成功', 'data': watch_data})

        # GET 请求处理
        watches = file_handler.load_data('daily_watch.json')
        return jsonify(watches)

    except Exception as e:
        traceback.print_exc()  # 在服务器端打印错误信息
        return jsonify({'error': str(e)}), 500


@bp.route('/api/daily_watch/<int:record_id>', methods=['DELETE'])
def delete_daily_watch(record_id):
    try:
        watches = file_handler.load_data('daily_watch.json')

        # 找到并删除记录
        updated_watches = [w for w in watches if w.get('id') != record_id]

        if len(updated_watches) == len(watches):
            return jsonify({'error': '记录不存在'}), 404

        file_handler.save_data('daily_watch.json', updated_watches)
        return jsonify({'message': '记录已删除'})

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500