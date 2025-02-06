import json
import pandas as pd
from pathlib import Path


def convert_to_excel():
    data_dir = Path('data')
    json_file = data_dir / 'anime.json'
    excel_file = data_dir / 'anime.xlsx'

    if not json_file.exists():
        return

    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if not data['anime_list']:
        return

    df = pd.DataFrame(data['anime_list'])
    df['tags'] = df['tags'].apply(lambda x: ', '.join(x))
    df.to_excel(excel_file, index=False)