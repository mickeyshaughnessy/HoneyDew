"""
RSE API client — thin wrapper around the Robot Services Exchange HTTP API.
All methods return (data_dict, status_code).
"""

import time
import requests
import config

_BASE = config.RSE_API_URL
_SSL  = config.RSE_VERIFY_SSL


def _post(path, json=None, token=None):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    try:
        r = requests.post(f'{_BASE}{path}', json=json, headers=headers,
                          verify=_SSL, timeout=15)
        return r.json(), r.status_code
    except requests.exceptions.RequestException as e:
        return {'error': str(e)}, 503


def _get(path, params=None, token=None):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    try:
        r = requests.get(f'{_BASE}{path}', params=params, headers=headers,
                         verify=_SSL, timeout=15)
        return r.json(), r.status_code
    except requests.exceptions.RequestException as e:
        return {'error': str(e)}, 503


def register(username, password):
    return _post('/register', {'username': username, 'password': password,
                                'user_type': 'demand'})


def login(username, password):
    return _post('/login', {'username': username, 'password': password})


def account(token):
    return _get('/account', token=token)


def submit_bid(token, service, price, address,
               payment_method='credit_card', ttl=None):
    ttl = ttl or config.DEFAULT_BID_TTL
    return _post('/submit_bid', {
        'service':        service,
        'price':          price,
        'currency':       'USD',
        'payment_method': payment_method,
        'location_type':  'physical',
        'address':        address,
        'end_time':       int(time.time()) + ttl,
    }, token=token)


def cancel_bid(token, bid_id):
    return _post('/cancel_bid', {'bid_id': bid_id}, token=token)


def my_bids(token):
    return _get('/my_bids', token=token)


def my_jobs(token):
    return _get('/my_jobs', token=token)


def sign_job(token, job_id, rating):
    return _post('/sign_job', {'job_id': job_id, 'rating': rating}, token=token)


def nearby(address, max_distance=None):
    max_distance = max_distance or config.DEFAULT_MAX_DISTANCE
    return _get('/nearby', {'address': address, 'max_distance': max_distance})


def exchange_data():
    return _get('/exchange_data')
