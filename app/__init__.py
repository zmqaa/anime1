from flask import Flask
import os


def create_app():
    app = Flask(__name__,
                template_folder='../templates')  # 指定模板目录的相对路径

    # 基本配置
    app.config['SECRET_KEY'] = 'dev'

    # 注册所有路由
    from app.routes import init_app
    init_app(app)

    return app