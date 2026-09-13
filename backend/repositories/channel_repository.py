from typing import List, Optional
from sqlalchemy.orm import Session
from models import Channel


class ChannelRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Channel]:
        """Fetch all e-commerce channels."""
        return self.db.query(Channel).all()

    def get_by_id(self, channel_id: str) -> Optional[Channel]:
        """Fetch a single channel by ID."""
        return self.db.query(Channel).filter(Channel.id == channel_id).first()

    def update_connection(
        self, channel_id: str, is_connected: bool, synced_at: Optional[str] = None
    ) -> Optional[Channel]:
        """Update channel connection status and last synced timestamp."""
        channel = self.get_by_id(channel_id)
        if not channel:
            return None

        channel.is_connected = is_connected
        if synced_at:
            channel.last_synced_at = synced_at

        self.db.commit()
        self.db.refresh(channel)
        return channel

    def sync_all(self, synced_at: str) -> List[Channel]:
        """Mark all connected channels as synced and clear pending orders."""
        channels = self.get_all()
        for channel in channels:
            if channel.is_connected:
                channel.last_synced_at = synced_at
                channel.pending_sync_orders = 0

        self.db.commit()
        return channels

    def sync_channel(self, channel_id: str, synced_at: str) -> Optional[Channel]:
        """Mark a specific channel as synced and clear pending orders."""
        channel = self.get_by_id(channel_id)
        if not channel:
            return None

        channel.last_synced_at = synced_at
        channel.pending_sync_orders = 0

        self.db.commit()
        self.db.refresh(channel)
        return channel
