#!/usr/bin/env python3
"""
Simple test server to verify container networking
"""
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Simple test server is working!", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "test"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
