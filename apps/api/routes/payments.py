import razorpay, os, hmac, hashlib, json
from flask import Blueprint, request, jsonify, abort, g
from middleware.auth import require_auth
from db import get_supabase
from app import limiter

payments_bp = Blueprint('payments', __name__)
rzp_client = razorpay.Client(auth=(
    os.environ.get('RAZORPAY_KEY_ID', ''),
    os.environ.get('RAZORPAY_KEY_SECRET', '')
))

PLAN_IDS = {
    'creator': os.environ.get('RAZORPAY_CREATOR_PLAN_ID'),
    'pro':     os.environ.get('RAZORPAY_PRO_PLAN_ID'),
}

@payments_bp.route('/payments/create-subscription', methods=['POST'])
@require_auth
@limiter.limit("10 per hour")
def create_subscription():
    data = request.get_json() or {}
    tier = data.get('tier')
    if tier not in ('creator', 'pro'):
        abort(400, 'Invalid tier. Must be creator or pro.')

    # Fetch user email
    sb = get_supabase()
    user_result = sb.table('users').select('email, name').eq('id', g.user_id).execute()
    if not user_result.data:
        abort(401, 'User not found')
    user = user_result.data[0]

    plan_id = PLAN_IDS.get(tier)
    
    # MOCK BEHAVIOR FOR LOCAL TESTING IF RAZORPAY IS NOT CONFIGURED
    if not plan_id or not os.environ.get('RAZORPAY_KEY_ID'):
        mock_sub_id = f'sub_mock_{tier}_12345'
        
        # Act as if the webhook fired: update user tier and create active subscription
        sb.table('users').update({'tier': tier}).eq('id', g.user_id).execute()
        sb.table('subscriptions').upsert({
            'user_id':                 g.user_id,
            'razorpay_subscription_id': mock_sub_id,
            'plan_id':                 plan_id or f'mock_plan_{tier}',
            'tier':                    tier,
            'status':                  'active',
        }, on_conflict='razorpay_subscription_id').execute()

        return jsonify({
            'subscription_id': mock_sub_id,
            'razorpay_key':    'mock_key',
            'name':            user.get('name', 'CloudClick User'),
            'email':           user['email'],
            'tier':            tier,
            'is_mock':         True
        })

    # Create Razorpay subscription
    subscription = rzp_client.subscription.create({
        'plan_id':        plan_id,
        'total_count':    120,           # up to 10 years billing cycles
        'quantity':       1,
        'customer_notify': 1,
        'notes': {
            'user_id': g.user_id,
            'tier':    tier,
            'email':   user['email'],
        }
    })

    return jsonify({
        'subscription_id': subscription['id'],
        'razorpay_key':    os.environ.get('RAZORPAY_KEY_ID', ''),
        'name':            user.get('name', 'CloudClick User'),
        'email':           user['email'],
        'tier':            tier,
    })

@payments_bp.route('/payments/verify', methods=['POST'])
@require_auth
def verify_payment():
    data = request.get_json() or {}
    payment_id = data.get('razorpay_payment_id')
    subscription_id = data.get('razorpay_subscription_id')
    signature = data.get('razorpay_signature')
    tier = data.get('tier')

    if not all([payment_id, subscription_id, signature, tier]):
        abort(400, 'Missing payment details')

    # MOCK BEHAVIOR: Bypass Razorpay API if this is a mock local transaction
    if subscription_id.startswith('sub_mock_'):
        sb = get_supabase()
        sb.table('users').update({'tier': tier}).eq('id', g.user_id).execute()
        sb.table('subscriptions').upsert({
            'user_id':                 g.user_id,
            'razorpay_subscription_id': subscription_id,
            'plan_id':                 f'mock_plan_{tier}',
            'tier':                    tier,
            'status':                  'active',
        }, on_conflict='razorpay_subscription_id').execute()
        return jsonify({'success': True, 'mock': True})

    try:
        # Verify signature
        rzp_client.utility.verify_subscription_payment_signature({
            'razorpay_payment_id': payment_id,
            'razorpay_subscription_id': subscription_id,
            'razorpay_signature': signature
        })
    except Exception as e:
        abort(400, f'Signature verification failed: {str(e)}')

    # Signature is valid, update database
    sb = get_supabase()
    
    # Update user tier
    sb.table('users').update({'tier': tier}).eq('id', g.user_id).execute()
    
    # Update or insert subscription
    sub = rzp_client.subscription.fetch(subscription_id)
    sb.table('subscriptions').upsert({
        'user_id':                 g.user_id,
        'razorpay_subscription_id': subscription_id,
        'plan_id':                 sub['plan_id'],
        'tier':                    tier,
        'status':                  'active',
    }, on_conflict='razorpay_subscription_id').execute()

    return jsonify({'success': True})

@payments_bp.route('/payments/webhook', methods=['POST'])
def webhook():
    payload_bytes = request.get_data()
    signature = request.headers.get('X-Razorpay-Signature', '')
    webhook_secret = os.environ.get('RAZORPAY_WEBHOOK_SECRET', '')

    # Verify HMAC-SHA256 signature
    expected = hmac.new(
        webhook_secret.encode('utf-8'),
        payload_bytes,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        return jsonify({'error': 'Invalid signature'}), 401

    event = request.get_json()
    event_id   = event.get('id', '')
    event_type = event.get('event', '')

    sb = get_supabase()

    # Idempotency: store event first, skip if already seen
    try:
        sb.table('webhook_events').insert({
            'razorpay_event_id': event_id,
            'event_type':        event_type,
            'payload':           event,
        }).execute()
    except Exception:
        # Unique constraint violation = duplicate event
        return jsonify({'received': True, 'note': 'duplicate'}), 200

    # Process event
    try:
        process_razorpay_event(event_type, event, sb)
        sb.table('webhook_events').update({
            'processed': True,
            'processed_at': 'NOW()'
        }).eq('razorpay_event_id', event_id).execute()
    except Exception as e:
        sb.table('webhook_events').update({'error': str(e)}).eq('razorpay_event_id', event_id).execute()
        raise

    return jsonify({'received': True}), 200

def process_razorpay_event(event_type: str, event: dict, sb):
    subscription_data = event.get('payload', {}).get('subscription', {}).get('entity', {})
    notes = subscription_data.get('notes', {})
    user_id = notes.get('user_id')
    tier    = notes.get('tier')

    if not user_id:
        return  # Can't process without user_id

    if event_type == 'subscription.activated':
        # Update user tier
        sb.table('users').update({'tier': tier}).eq('id', user_id).execute()
        # Insert subscription record
        sb.table('subscriptions').upsert({
            'user_id':                 user_id,
            'razorpay_subscription_id': subscription_data['id'],
            'plan_id':                 subscription_data['plan_id'],
            'tier':                    tier,
            'status':                  'active',
            'current_period_start':    _epoch_to_iso(subscription_data.get('current_start')),
            'current_period_end':      _epoch_to_iso(subscription_data.get('current_end')),
            'charge_at':               _epoch_to_iso(subscription_data.get('charge_at')),
        }, on_conflict='razorpay_subscription_id').execute()

    elif event_type == 'subscription.charged':
        # Renewal — update period dates, ensure status active
        sb.table('subscriptions').update({
            'status':               'active',
            'current_period_start': _epoch_to_iso(subscription_data.get('current_start')),
            'current_period_end':   _epoch_to_iso(subscription_data.get('current_end')),
        }).eq('razorpay_subscription_id', subscription_data['id']).execute()

    elif event_type in ('subscription.cancelled', 'subscription.completed', 'subscription.expired'):
        # Downgrade to free
        sb.table('users').update({'tier': 'free'}).eq('id', user_id).execute()
        sb.table('subscriptions').update({
            'status': 'cancelled',
            'cancelled_at': 'NOW()'
        }).eq('razorpay_subscription_id', subscription_data['id']).execute()

    elif event_type == 'subscription.pending':
        # Payment failed — warn user (send email via Resend)
        sb.table('subscriptions').update({'status': 'pending'}).eq(
            'razorpay_subscription_id', subscription_data['id']).execute()

def _epoch_to_iso(epoch):
    if not epoch: return None
    from datetime import datetime, timezone
    return datetime.fromtimestamp(int(epoch), tz=timezone.utc).isoformat()

@payments_bp.route('/payments/subscription', methods=['GET'])
@require_auth
def get_subscription():
    sb = get_supabase()
    result = sb.table('subscriptions') \
        .select('*') \
        .eq('user_id', g.user_id) \
        .eq('status', 'active') \
        .order('created_at', desc=True) \
        .limit(1) \
        .execute()
    if result.data:
        return jsonify(result.data[0])
    return jsonify({'status': 'free'})

@payments_bp.route('/payments/cancel', methods=['POST'])
@require_auth
def cancel_subscription():
    sb = get_supabase()
    # Find active subscription
    result = sb.table('subscriptions') \
        .select('razorpay_subscription_id') \
        .eq('user_id', g.user_id) \
        .eq('status', 'active') \
        .limit(1) \
        .execute()
    
    if not result.data:
        abort(404, 'No active subscription found')
        
    sub_id = result.data[0]['razorpay_subscription_id']
    
    try:
        # Cancel in Razorpay immediately but let it run till end of cycle
        rzp_client.subscription.cancel(sub_id, {'cancel_at_cycle_end': 1})
    except Exception as e:
        abort(500, f'Razorpay cancellation failed: {str(e)}')
        
    # Update DB
    sb.table('subscriptions').update({'cancel_at_period_end': True}).eq('razorpay_subscription_id', sub_id).execute()
    
    return jsonify({'message': 'Subscription scheduled for cancellation'})

