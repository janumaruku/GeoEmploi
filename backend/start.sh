#!/bin/bash

source lib/bin/activate
python -m scripts.seed
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
