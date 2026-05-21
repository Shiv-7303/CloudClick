import pytest
from unittest.mock import patch, MagicMock
from services.usage import check_usage_limit, increment_usage
from app import PaymentRequired
from datetime import date, timedelta

@pytest.fixture
def mock_supabase():
    with patch('services.usage.get_supabase') as mock_get_supabase:
        mock_sb = MagicMock()
        mock_table = MagicMock()
        mock_select = MagicMock()
        mock_eq = MagicMock()
        
        mock_get_supabase.return_value = mock_sb
        mock_sb.table.return_value = mock_table
        mock_table.select.return_value = mock_select
        mock_select.eq.return_value = mock_eq
        
        yield mock_eq, mock_sb

def setup_mock_user(mock_eq, analyses_month, analyses_lifetime, last_reset):
    mock_result = MagicMock()
    mock_result.data = [{
        'analyses_used_this_month': analyses_month,
        'analyses_used_lifetime': analyses_lifetime,
        'last_reset_date': last_reset
    }]
    mock_eq.execute.return_value = mock_result

def test_free_user_zero_allowed(mock_supabase):
    mock_single, mock_sb = mock_supabase
    setup_mock_user(mock_single, 0, 0, date.today().isoformat())
    assert check_usage_limit('user123', 'free') == True

def test_free_user_one_blocked(mock_supabase):
    mock_single, mock_sb = mock_supabase
    setup_mock_user(mock_single, 1, 1, date.today().isoformat())
    with pytest.raises(PaymentRequired):
        check_usage_limit('user123', 'free')

def test_creator_19_allowed(mock_supabase):
    mock_single, mock_sb = mock_supabase
    setup_mock_user(mock_single, 19, 50, date.today().isoformat())
    assert check_usage_limit('user123', 'creator') == True

def test_creator_20_blocked(mock_supabase):
    mock_single, mock_sb = mock_supabase
    setup_mock_user(mock_single, 20, 51, date.today().isoformat())
    with pytest.raises(PaymentRequired):
        check_usage_limit('user123', 'creator')

def test_pro_39_allowed(mock_supabase):
    mock_single, mock_sb = mock_supabase
    setup_mock_user(mock_single, 39, 100, date.today().isoformat())
    assert check_usage_limit('user123', 'pro') == True

def test_pro_40_blocked(mock_supabase):
    mock_single, mock_sb = mock_supabase
    setup_mock_user(mock_single, 40, 100, date.today().isoformat())
    with pytest.raises(PaymentRequired):
        check_usage_limit('user123', 'pro')

def test_monthly_reset_applied_when_stale(mock_supabase):
    mock_single, mock_sb = mock_supabase
    last_month = (date.today().replace(day=1) - timedelta(days=1)).isoformat()
    setup_mock_user(mock_single, 40, 100, last_month)
    
    assert check_usage_limit('user123', 'pro') == True
    
    reset_call = mock_sb.table().update.call_args_list[0][0][0]
    assert reset_call['analyses_used_this_month'] == 0
    assert reset_call['last_reset_date'] == date.today().isoformat()

def test_counter_incremented_on_success(mock_supabase):
    mock_single, mock_sb = mock_supabase
    setup_mock_user(mock_single, 5, 20, date.today().isoformat())
    increment_usage('user123')
    update_call = mock_sb.table().update.call_args[0][0]
    assert update_call['analyses_used_this_month'] == 6
    assert update_call['analyses_used_lifetime'] == 21
