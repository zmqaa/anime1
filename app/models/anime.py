from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime

@dataclass
class DailyWatch:
    id: int
    anime_name: str
    episode: int
    date: str
    timestamp: str

    @classmethod
    def from_dict(cls, data: dict) -> 'DailyWatch':
        return cls(
            id=data.get('id', 0),
            anime_name=data['anime_name'],
            episode=data['episode'],
            date=data.get('date', datetime.now().strftime('%Y-%m-%d')),
            timestamp=data.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        )

@dataclass
class HistoryWatch:
    id: int
    anime_name: str
    start_date: str
    end_date: Optional[str]
    tags: List[str]
    rating: Optional[float]
    notes: Optional[str]
    timestamp: str

    @classmethod
    def from_dict(cls, data: dict) -> 'HistoryWatch':
        return cls(
            id=data.get('id', 0),
            anime_name=data['anime_name'],
            start_date=data['start_date'],
            end_date=data.get('end_date'),
            tags=data.get('tags', []),
            rating=data.get('rating'),
            notes=data.get('notes'),
            timestamp=data.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        )