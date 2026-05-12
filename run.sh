#!/usr/bin/env bash
set -e

if [ ! -f config.py ]; then
  echo "config.py not found — copy config_example.py and fill in your values."
  exit 1
fi

python api_server.py
