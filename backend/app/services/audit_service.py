from sqlalchemy.orm import Session
from app.models.models import AuditLog
from typing import Optional, Dict, Any

class AuditService:
    
    @staticmethod
    def log(
        db: Session,
        action: str,
        resource_type: str,
        user_id: Optional[str] = None,
        resource_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        try:
            log_entry = AuditLog(
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                ip_address=ip_address,
                metadata_json=metadata
            )
            db.add(log_entry)
            db.commit()
        except Exception:
            db.rollback()
