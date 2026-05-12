# HoneyDew

**Home services, simplified.**

HoneyDew is a demand-side web app for homeowners to post repair, cleaning, and maintenance jobs and get matched with local service providers through the [Robot Services Exchange](https://rse-api.com) (RSE) marketplace.

## How it works

1. Homeowner signs up and describes the job (category, details, address, budget)
2. HoneyDew submits a bid to the RSE API
3. RSE's LLM matching engine pairs the request with a qualified local provider
4. Homeowner tracks progress in their dashboard and rates the provider on completion

## Tech stack

- **Backend**: Flask (Python) — thin session layer + RSE API proxy
- **Frontend**: Vanilla HTML/CSS/JS — no build step required
- **Marketplace**: [RSE API](https://rse-api.com:5003/api_docs.html) — provides auth, matching, and job lifecycle

## Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure
cp config_example.py config.py
# edit config.py — set SECRET_KEY and optionally RSE_API_URL

# 3. Run
bash run.sh
# or: python api_server.py
```

Open `http://localhost:5010` in your browser.

## API reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/register | — | Create homeowner account |
| POST | /api/login | — | Sign in, store RSE token in session |
| POST | /api/logout | ✓ | Clear session |
| GET | /api/me | ✓ | Current user info |
| POST | /api/bids | ✓ | Post a new service request |
| GET | /api/bids | ✓ | List open requests |
| DELETE | /api/bids/:bid_id | ✓ | Cancel a request |
| GET | /api/jobs | ✓ | List active and completed jobs |
| POST | /api/jobs/:job_id/sign | ✓ | Mark complete and rate provider (1–5) |
| GET | /api/nearby?address= | — | Browse active providers near an address |

## Integration tests

```bash
# With server running:
python int_tests.py

# Against a deployed instance:
HD_URL=https://honeydew.example.com python int_tests.py
```

## Project structure

```
├── api_server.py      Flask app — pages + JSON API
├── rse_client.py      RSE API client (thin requests wrapper)
├── config_example.py  Config template (copy to config.py)
├── requirements.txt
├── run.sh
├── int_tests.py       Integration tests
├── index.html         Landing page
├── dashboard.html     Homeowner dashboard
├── post_job.html      Job posting form
├── job_detail.html    Single job view + rating
└── styles.css         Shared styles
```

## RSE API

HoneyDew uses these RSE endpoints:

- `POST /register` — creates a `demand`-type account
- `POST /login` — returns an access token
- `POST /submit_bid` — posts a service request with plain-English description
- `POST /cancel_bid` — withdraws an open request
- `GET /my_bids` — open requests for this account
- `GET /my_jobs` — matched and completed jobs
- `POST /sign_job` — rate the provider (1–5) to close the job
- `GET /nearby` — active providers near an address

RSE docs: https://rse-api.com:5003/api_docs.html
