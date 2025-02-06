import json
import os
from typing import List, Dict, Any
from datetime import datetime

class FileHandler:
    def __init__(self, data_dir: str = 'data'):
        self.data_dir = data_dir
        self._ensure_data_dir()

    def _ensure_data_dir(self) -> None:
        """确保数据目录存在"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)

    def _get_file_path(self, filename: str) -> str:
        """获取完整的文件路径"""
        return os.path.join(self.data_dir, filename)

    def load_data(self, filename: str) -> List[Dict[str, Any]]:
        """从JSON文件加载数据"""
        file_path = self._get_file_path(filename)
        if not os.path.exists(file_path):
            return []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return []

    def save_data(self, filename: str, data: List[Dict[str, Any]]) -> None:
        """保存数据到JSON文件"""
        file_path = self._get_file_path(filename)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def append_data(self, item: Dict[str, Any], filename: str) -> Dict[str, Any]:
        """向文件添加新数据"""
        data = self.load_data(filename)
        item['id'] = len(data) + 1
        item['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        data.append(item)
        self.save_data(data, filename)
        return item