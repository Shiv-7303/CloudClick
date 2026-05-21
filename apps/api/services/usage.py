from flask import abort
from db import get_supabase
from app import PaymentRequired

LIMITS = {
    'free':    {'type': 'lifetime', 'limit': 1},
    'creator': {'type': 'monthly',  'limit': 20},
    'pro':     {'type': 'monthly',  'limit': 40},
}

def check_usage_limit(user_id: str, tier: str):
    """Checks if user has analyses left this month, resets if needed, but does NOT increment."""
    config = LIMITS.get(tier, LIMITS['free'])
    sb = get_supabase()

    result = sb.table('users').select(
        'analyses_used_this_month, analyses_used_lifetime, last_reset_date'
    ).eq('id', user_id).execute()

    if not result.data:
        abort(401, 'User not found. Please sign out and sign in again.')
    user = result.data[0]

    # Check monthly reset
    from datetime import date
    last_reset_str = user.get('last_reset_date')
    last_reset = date.fromisoformat(last_reset_str) if last_reset_str else date.min
    today = date.today()
    
    if last_reset.year < today.year or last_reset.month < today.month:
        sb.table('users').update({
            'analyses_used_this_month': 0,
            'last_reset_date': today.isoformat()
        }).eq('id', user_id).execute()
        user['analyses_used_this_month'] = 0

    # Check limit
    if config['type'] == 'lifetime':
        count = user.get('analyses_used_lifetime', 0)
    else:
        count = user.get('analyses_used_this_month', 0)

    if count >= config['limit']:
        raise PaymentRequired(f"You've used all {config['limit']} analyses on your {tier} plan.")
    
    return True

def increment_usage(user_id: str):
    """Actually increments the usage count after a successful analysis."""
    sb = get_supabase()
    
    result = sb.table('users').select(
        'analyses_used_this_month, analyses_used_lifetime'
    ).eq('id', user_id).execute()
    
    if not result.data:
        return
    user = result.data[0]
        
    update = {
        'analyses_used_this_month': user.get('analyses_used_this_month', 0) + 1,
        'analyses_used_lifetime': user.get('analyses_used_lifetime', 0) + 1
    }
    
    sb.table('users').update(update).eq('id', user_id).execute()
