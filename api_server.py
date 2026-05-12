"""
HoneyDew API Server
--------------------
Flask app — serves HTML pages and a JSON API that proxies to the RSE backend.
Sessions store the RSE access token server-side; no credentials touch the client.
"""

import logging
import flask
from flask import request, session, jsonify, redirect, url_for
from flask_cors import CORS

import config
import rse_client

logging.basicConfig(level=config.LOG_LEVEL)
logger = logging.getLogger(__name__)

app = flask.Flask(__name__, static_url_path='', static_folder='.')
app.secret_key = config.SECRET_KEY
CORS(app)

# ---------------------------------------------------------------------------
# Page routes
# ---------------------------------------------------------------------------

@app.route('/')
def index():
    return flask.send_file('index.html')


@app.route('/dashboard')
def dashboard():
    if 'token' not in session:
        return redirect('/')
    return flask.send_file('dashboard.html')


@app.route('/post_job')
def post_job_page():
    if 'token' not in session:
        return redirect('/')
    return flask.send_file('post_job.html')


@app.route('/job/<job_id>')
def job_detail_page(job_id):
    if 'token' not in session:
        return redirect('/')
    return flask.send_file('job_detail.html')


# ---------------------------------------------------------------------------
# Auth API
# ---------------------------------------------------------------------------

@app.route('/api/register', methods=['POST'])
def api_register():
    body = request.get_json(force=True)
    username = body.get('username', '').strip()
    password = body.get('password', '')
    if not username or not password:
        return jsonify(error='Username and password required'), 400

    data, status = rse_client.register(username, password)
    if status == 201:
        # Auto-login after registration
        tok_data, tok_status = rse_client.login(username, password)
        if tok_status == 200:
            session['token']    = tok_data['access_token']
            session['username'] = username
            return jsonify(ok=True), 200
    return jsonify(data), status


@app.route('/api/login', methods=['POST'])
def api_login():
    body = request.get_json(force=True)
    username = body.get('username', '').strip()
    password = body.get('password', '')

    data, status = rse_client.login(username, password)
    if status == 200:
        session['token']    = data['access_token']
        session['username'] = username
        return jsonify(ok=True), 200
    return jsonify(data), status


@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify(ok=True), 200


@app.route('/api/me')
def api_me():
    token = session.get('token')
    if not token:
        return jsonify(error='Not logged in'), 401
    data, status = rse_client.account(token)
    if status == 200:
        data['username'] = session.get('username')
    return jsonify(data), status


# ---------------------------------------------------------------------------
# Bids API
# ---------------------------------------------------------------------------

@app.route('/api/bids', methods=['GET'])
def api_my_bids():
    token = session.get('token')
    if not token:
        return jsonify(error='Not logged in'), 401
    data, status = rse_client.my_bids(token)
    return jsonify(data), status


@app.route('/api/bids', methods=['POST'])
def api_submit_bid():
    token = session.get('token')
    if not token:
        return jsonify(error='Not logged in'), 401

    body = request.get_json(force=True)
    category = body.get('category', '').strip()
    description = body.get('description', '').strip()
    price = body.get('price')
    address = body.get('address', '').strip()
    payment_method = body.get('payment_method', 'credit_card')

    if not all([category, description, price, address]):
        return jsonify(error='category, description, price, and address are required'), 400

    # Build a plain-English service description the RSE LLM matcher can parse
    service = f'{category}: {description}'

    data, status = rse_client.submit_bid(
        token=token,
        service=service,
        price=float(price),
        address=address,
        payment_method=payment_method,
    )
    return jsonify(data), status


@app.route('/api/bids/<bid_id>', methods=['DELETE'])
def api_cancel_bid(bid_id):
    token = session.get('token')
    if not token:
        return jsonify(error='Not logged in'), 401
    data, status = rse_client.cancel_bid(token, bid_id)
    return jsonify(data), status


# ---------------------------------------------------------------------------
# Jobs API
# ---------------------------------------------------------------------------

@app.route('/api/jobs', methods=['GET'])
def api_my_jobs():
    token = session.get('token')
    if not token:
        return jsonify(error='Not logged in'), 401
    data, status = rse_client.my_jobs(token)
    return jsonify(data), status


@app.route('/api/jobs/<job_id>/sign', methods=['POST'])
def api_sign_job(job_id):
    token = session.get('token')
    if not token:
        return jsonify(error='Not logged in'), 401
    body = request.get_json(force=True)
    rating = body.get('rating')
    if rating not in [1, 2, 3, 4, 5]:
        return jsonify(error='rating must be 1–5'), 400
    data, status = rse_client.sign_job(token, job_id, rating)
    return jsonify(data), status


# ---------------------------------------------------------------------------
# Discovery API
# ---------------------------------------------------------------------------

@app.route('/api/nearby')
def api_nearby():
    address = request.args.get('address', '').strip()
    if not address:
        return jsonify(error='address required'), 400
    data, status = rse_client.nearby(address)
    return jsonify(data), status


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    app.run(host=config.APP_HOST, port=config.APP_PORT, debug=True)
