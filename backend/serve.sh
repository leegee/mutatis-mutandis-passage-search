#!/usr/bin/env bash 

uv run uvicorn mutatis_mutandis.api:app --app-dir src --port 8000 --reload --reload-dir src