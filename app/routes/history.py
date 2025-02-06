from flask import Blueprint, render_template

bp = Blueprint('history', __name__, url_prefix='/history')

@bp.route('/')
def index():
    # 这里可以添加获取历史记录的逻辑
    history_list = []  # 这里应该是您的历史数据
    return render_template('history.html', history=history_list)

@bp.route('/user/<username>')
def user_history(username):
    # 获取特定用户的历史记录
    user_history = []  # 这里应该是特定用户的历史数据
    return render_template('history.html', history=user_history)