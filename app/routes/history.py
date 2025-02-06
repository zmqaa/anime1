from flask import Blueprint, render_template, request, jsonify
from app.models.anime import HistoryWatch
from app.utils.file_handler import FileHandler
from datetime import datetime
import traceback

bp = Blueprint('history', __name__)
file_handler = FileHandler()


@bp.route('/history')
def index():
    try:
        history_list = file_handler.load_data('history_watch.json')
        all_tags = set()
        for watch in history_list:
            all_tags.update(watch.get('tags', []))
        return render_template('history.html', history=history_list, all_tags=sorted(all_tags))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/history_watch', methods=['GET', 'POST'])
def handle_history_watch():
    try:
        if request.method == 'POST':
            data = request.get_json()

            # 验证数据
            if not data.get('anime_name') or not data.get('start_date'):
                return jsonify({'error': '动漫名称和开始日期为必填项'}), 400

            # 加载现有数据
            watches = file_handler.load_data('history_watch.json')

            # 添加新记录
            data['id'] = len(watches) + 1
            data['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            # 转换为 HistoryWatch 对象并验证
            watch = HistoryWatch.from_dict(data)

            # 添加到列表并保存
            watches.append(vars(watch))
            file_handler.save_data('history_watch.json', watches)

            return jsonify({'message': '记录添加成功', 'data': vars(watch)}), 200

        # GET 请求处理
        watches = file_handler.load_data('history_watch.json')
        return jsonify(watches)

    except Exception as e:
        traceback.print_exc()  # 在服务器控制台打印详细错误信息
        return jsonify({'error': str(e)}), 500