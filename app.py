from flask import Flask, render_template, request, jsonify
import json
import pandas as pd
from datetime import datetime
from pathlib import Path
import os
from converter import convert_to_excel

app = Flask(__name__)

# 确保数据目录存在
DATA_DIR = Path('data')
DATA_DIR.mkdir(exist_ok=True)
DATA_FILE = DATA_DIR / 'anime.json'
EXCEL_FILE = DATA_DIR / 'anime.xlsx'


def load_data():
    if not DATA_FILE.exists():
        return {"anime_list": []}
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"anime_list": []}


def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    convert_to_excel()  # 同时更新Excel


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/add', methods=['POST'])
def add_anime():
    data = request.json
    new_anime = {
        "id": datetime.now().strftime("%Y%m%d%H%M%S"),
        "title": data['title'],
        "tags": [tag.strip() for tag in data['tags'].split(',') if tag.strip()],
        "rating": float(data['rating']),
        "status": data['status'],
        "watch_date": data['watch_date'],
        "episodes": int(data['episodes']),
        "notes": data['notes']
    }

    db = load_data()
    db['anime_list'].append(new_anime)
    save_data(db)
    return jsonify({"status": "success"})


@app.route('/api/data')
def get_data():
    db = load_data()
    return jsonify(db)


@app.route('/api/stats')
def get_stats():
    db = load_data()
    if not db['anime_list']:
        return jsonify({
            "total": 0,
            "avg_rating": 0,
            "tag_distribution": {},
            "status_distribution": {},
            "episodes_distribution": {"0-12": 0, "13-24": 0, "25+": 0}
        })

    df = pd.DataFrame(db['anime_list'])

    # 计算标签分布
    all_tags = []
    for tags in df['tags']:
        all_tags.extend(tags)
    tag_counts = pd.Series(all_tags).value_counts().to_dict()

    stats = {
        "total": len(df),
        "avg_rating": float(df['rating'].mean()),
        "tag_distribution": tag_counts,
        "status_distribution": df['status'].value_counts().to_dict(),
        "episodes_distribution": {
            "0-12": len(df[df['episodes'] <= 12]),
            "13-24": len(df[(df['episodes'] > 12) & (df['episodes'] <= 24)]),
            "25+": len(df[df['episodes'] > 24])
        }
    }
    return jsonify(stats)


if __name__ == '__main__':
    app.run(debug=True)