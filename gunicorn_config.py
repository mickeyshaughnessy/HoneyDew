"""Gunicorn configuration for HoneyDew."""

bind             = "127.0.0.1:5010"
workers          = 2
worker_class     = "sync"
max_requests     = 1000
max_requests_jitter = 50
timeout          = 30
graceful_timeout = 30
keepalive        = 2

accesslog        = "-"
errorlog         = "-"
loglevel         = "info"

proc_name        = "honeydew"
daemon           = False
