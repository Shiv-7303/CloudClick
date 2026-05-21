from supabase import create_client, Client
import os

_supabase: Client | None = None

def get_supabase() -> Client:
    """Returns Supabase client using service_role key (bypasses RLS)."""
    global _supabase
    if _supabase is None:
        _supabase = create_client(
            os.environ['SUPABASE_URL'],
            os.environ['SUPABASE_SERVICE_ROLE_KEY']
        )
    return _supabase
