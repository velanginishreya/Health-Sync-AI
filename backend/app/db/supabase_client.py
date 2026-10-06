"""
Supabase REST API Client Integration
Provides direct access to Supabase PostgreSQL Database via Supabase REST API (v1)
using SUPABASE_URL and SUPABASE_KEY.
"""

import os
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://rfgmeongxaacoecikreo.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_v9QFL-Lg97w7loo0dPArLQ_63171tbD")
SUPABASE_REST_URL = os.getenv("SUPABASE_REST_URL", f"{SUPABASE_URL}/rest/v1/")

class SupabaseRESTClient:
    """
    Direct Supabase REST API Client for performing CRUD operations on Supabase PostgreSQL tables.
    """
    def __init__(self):
        self.base_url = SUPABASE_REST_URL.rstrip('/')
        self.headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def select(self, table: str, query_params: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
        """Fetch records from a Supabase PostgreSQL table."""
        url = f"{self.base_url}/{table}"
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.get(url, headers=self.headers, params=query_params or {})
                if res.status_code == 200:
                    return res.json()
        except Exception as e:
            print(f"[Supabase REST Client Error] {e}")
        return []

    def insert(self, table: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Insert a row into a Supabase PostgreSQL table."""
        url = f"{self.base_url}/{table}"
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, headers=self.headers, json=data)
                if res.status_code in [200, 201]:
                    records = res.json()
                    return records[0] if records else data
        except Exception as e:
            print(f"[Supabase REST Client Insert Error] {e}")
        return None

    def rpc(self, function_name: str, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Call a Supabase PgVector RPC function (e.g., match_patient_embeddings)."""
        url = f"{self.base_url}/rpc/{function_name}"
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, headers=self.headers, json=params)
                if res.status_code == 200:
                    return res.json()
        except Exception as e:
            print(f"[Supabase RPC Error] {e}")
        return []

    def upload_file_to_bucket(self, bucket_name: str, file_path: str, file_bytes: bytes, content_type: str = "application/pdf") -> Optional[str]:
        """
        Uploads a file directly to a Supabase Storage Bucket (e.g. 'data').
        Returns the public URL of the uploaded file on Supabase.
        """
        storage_url = f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/{bucket_name}/{file_path}"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": content_type,
            "x-upsert": "true"
        }
        try:
            with httpx.Client(timeout=30.0) as client:
                res = client.post(storage_url, headers=headers, content=file_bytes)
                if res.status_code in [200, 201]:
                    public_url = f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/public/{bucket_name}/{file_path}"
                    print(f"[Supabase Storage Upload Success] File uploaded to {public_url}")
                    return public_url
                else:
                    print(f"[Supabase Storage Upload Status {res.status_code}] {res.text}")
        except Exception as e:
            print(f"[Supabase Storage Upload Error] {e}")
        return None

supabase_client = SupabaseRESTClient()
