import os
import hmac
import hashlib
import requests
import jwt
from dotenv import load_dotenv
from db import get_supabase

# Load environment variables
load_dotenv()

def test_payment_upgrade():
    # 1. Get first user from DB
    sb = get_supabase()
    user_data = sb.table('users').select('id, email, tier').limit(1).execute()

    if not user_data.data:
        print("❌ No users found in database. Please login once via UI to create a user.")
        return

    USER_ID = user_data.data[0]['id']
    EMAIL = user_data.data[0]['email']
    CURRENT_TIER = user_data.data[0]['tier']
    
    TARGET_TIER = "pro"
    API_URL = "http://localhost:5000/api/payments/verify"

    print(f"[*] Found User: {EMAIL} (ID: {USER_ID})")
    print(f"[*] Current Tier: {CURRENT_TIER}")
    print(f"[*] Simulating successful Razorpay payment to upgrade to '{TARGET_TIER}'...")

    # 2. Generate Fake Razorpay Data & Valid Signature
    payment_id = "pay_test_123456"
    subscription_id = "sub_mock_654321"
    secret = os.environ.get("RAZORPAY_KEY_SECRET", "")
    
    if not secret:
        print("❌ RAZORPAY_KEY_SECRET not found in .env")
        return

    # Razorpay uses payment_id + "|" + subscription_id for subscription signatures
    msg = f"{payment_id}|{subscription_id}"
    signature = hmac.new(
        secret.encode('utf-8'),
        msg.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    # 3. Generate Valid NextAuth JWT
    jwt_secret = os.environ.get("NEXTAUTH_SECRET", "")
    if not jwt_secret:
        print("❌ NEXTAUTH_SECRET not found in .env")
        return
        
    token = jwt.encode(
        {"sub": USER_ID, "tier": CURRENT_TIER, "email": EMAIL},
        jwt_secret,
        algorithm="HS256"
    )

    # 4. Call the verify endpoint
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "razorpay_payment_id": payment_id,
        "razorpay_subscription_id": subscription_id,
        "razorpay_signature": signature,
        "tier": TARGET_TIER
    }

    print("\n[*] Sending request to /api/payments/verify...")
    try:
        response = requests.post(API_URL, json=payload, headers=headers)
        if response.status_code == 200:
            print("✅ API Request Successful!")
        else:
            print(f"❌ API Request Failed! Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Connection refused. Is the Flask server running on port 5000?")
        return
    except Exception as e:
        print(f"❌ Exception during API call: {e}")
        return

    # 5. Verify in Database
    print("\n[*] Verifying Database Updates...")
    user_record = sb.table('users').select('tier').eq('id', USER_ID).execute()
    sub_record = sb.table('subscriptions').select('status, tier, razorpay_subscription_id').eq('user_id', USER_ID).execute()

    # Reset tier for future tests
    sb.table('users').update({'tier': 'free'}).eq('id', USER_ID).execute()
    
    # Check user table
    if user_record.data and user_record.data[0]['tier'] == TARGET_TIER:
        print(f"✅ Users Table: Tier successfully updated to '{user_record.data[0]['tier']}'")
    else:
        print(f"❌ Users Table: Update failed. Current tier is '{user_record.data[0]['tier'] if user_record.data else 'Not Found'}'")

    # Check subscriptions table
    if sub_record.data:
        sub = sub_record.data[0]
        if sub['status'] == 'active' and sub['tier'] == TARGET_TIER and sub['razorpay_subscription_id'] == subscription_id:
            print(f"✅ Subscriptions Table: Record successfully created/updated!")
            print(f"   - Status: {sub['status']}")
            print(f"   - Tier: {sub['tier']}")
            print(f"   - Sub ID: {sub['razorpay_subscription_id']}")
        else:
            print(f"❌ Subscriptions Table: Record exists but data is incorrect: {sub}")
    else:
        print("❌ Subscriptions Table: No record found!")
        
    print("\n✅ Test Complete! (User tier has been reset to 'free' for further manual UI testing)")

if __name__ == "__main__":
    test_payment_upgrade()