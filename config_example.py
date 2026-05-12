"""
HoneyDew Configuration Template
---------------------------------
Copy this file to config.py and fill in your values.
config.py is gitignored — never commit it.
"""

# RSE API
RSE_API_URL = 'https://rse-api.com:5003'
RSE_VERIFY_SSL = True

# HoneyDew app server
APP_PORT = 5010
APP_HOST = '0.0.0.0'
SECRET_KEY = 'change-me-to-a-random-secret'

# Default bid expiry in seconds (4 hours)
DEFAULT_BID_TTL = 14400

# Max distance in miles for nearby provider search
DEFAULT_MAX_DISTANCE = 25

LOG_LEVEL = 'INFO'

# Integration test credentials (used by int_tests.py only)
TEST_PASSWORD = 'TestPass123'
