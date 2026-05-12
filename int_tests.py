#!/usr/bin/env python3
"""
HoneyDew integration tests — exercises the HoneyDew API server end-to-end.
Requires a running HoneyDew server (python api_server.py) and a reachable RSE backend.

Usage:
    python int_tests.py                    # default http://localhost:5010
    HD_URL=https://honeydew.example.com python int_tests.py
"""

import os
import sys
import uuid
import time
import requests

HD_URL   = os.environ.get('HD_URL', 'http://localhost:5010')
PASSWORD = os.environ.get('TEST_PASSWORD', 'TestPass123')


def run(name, fn):
    try:
        fn()
        print(f'  PASS  {name}')
    except AssertionError as e:
        print(f'  FAIL  {name}: {e}')
        sys.exit(1)


def session():
    s = requests.Session()
    s.headers.update({'Content-Type': 'application/json'})
    return s


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_register_and_login():
    s = session()
    username = f'hd_test_{uuid.uuid4().hex[:8]}'

    r = s.post(f'{HD_URL}/api/register', json={'username': username, 'password': PASSWORD})
    assert r.status_code == 200, f'register: {r.status_code} {r.text}'

    # Should be auto-logged-in; /api/me should work
    r = s.get(f'{HD_URL}/api/me')
    assert r.status_code == 200, f'me after register: {r.status_code} {r.text}'
    assert r.json().get('username') == username

    r = s.post(f'{HD_URL}/api/logout', json={})
    assert r.status_code == 200

    r = s.post(f'{HD_URL}/api/login', json={'username': username, 'password': PASSWORD})
    assert r.status_code == 200, f'login: {r.status_code} {r.text}'

    return s, username


def test_submit_and_cancel_bid(s):
    r = s.post(f'{HD_URL}/api/bids', json={
        'category':    'Plumbing repair',
        'description': 'Leaky kitchen faucet, dripping constantly',
        'address':     '123 Elm St, Denver, CO 80202',
        'price':       125,
    })
    assert r.status_code == 200, f'submit_bid: {r.status_code} {r.text}'
    bid_id = r.json().get('bid_id')
    assert bid_id, 'no bid_id returned'

    r = s.get(f'{HD_URL}/api/bids')
    assert r.status_code == 200
    bids = r.json().get('bids', [])
    assert any(b['bid_id'] == bid_id for b in bids), 'bid not found in /api/bids'

    r = s.delete(f'{HD_URL}/api/bids/{bid_id}')
    assert r.status_code == 200, f'cancel_bid: {r.status_code} {r.text}'

    r = s.get(f'{HD_URL}/api/bids')
    bids = r.json().get('bids', [])
    assert not any(b['bid_id'] == bid_id for b in bids), 'bid still present after cancel'


def test_my_jobs(s):
    r = s.get(f'{HD_URL}/api/jobs')
    assert r.status_code == 200, f'my_jobs: {r.status_code} {r.text}'
    assert 'jobs' in r.json()


def test_nearby():
    s = session()
    r = s.get(f'{HD_URL}/api/nearby', params={'address': '123 Elm St, Denver, CO 80202'})
    assert r.status_code == 200, f'nearby: {r.status_code} {r.text}'
    assert 'services' in r.json()


def test_validation():
    s = session()
    # Missing fields
    r = s.post(f'{HD_URL}/api/bids', json={})
    assert r.status_code == 401  # not logged in

    username = f'hd_val_{uuid.uuid4().hex[:8]}'
    s.post(f'{HD_URL}/api/register', json={'username': username, 'password': PASSWORD})

    r = s.post(f'{HD_URL}/api/bids', json={'category': 'Plumbing repair'})
    assert r.status_code == 400, f'incomplete bid should 400: {r.status_code}'

    r = s.post(f'{HD_URL}/api/jobs/nonexistent/sign', json={'rating': 6})
    assert r.status_code == 400, f'bad rating should 400: {r.status_code}'

    r = s.get(f'{HD_URL}/api/nearby')
    assert r.status_code == 400, f'missing address should 400: {r.status_code}'


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    print(f'Running HoneyDew integration tests against {HD_URL}\n')

    s, username = None, None

    def _reg_login():
        nonlocal s, username
        s, username = test_register_and_login()

    run('register + login + logout cycle', _reg_login)
    run('submit and cancel bid',           lambda: test_submit_and_cancel_bid(s))
    run('my_jobs endpoint',                lambda: test_my_jobs(s))
    run('nearby endpoint (unauthenticated)', test_nearby)
    run('input validation',                test_validation)

    print(f'\nAll tests passed.')
