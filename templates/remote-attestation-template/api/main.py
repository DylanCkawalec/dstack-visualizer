#!/usr/bin/env python3
"""
FastAPI backend for dStack Remote Attestation Template
Provides Python-based TEE operations alongside the NextJS frontend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import asyncio
import os
from datetime import datetime
# Mock DStackSDK for demonstration
class DStackSDK:
    def __init__(self, api_key, endpoint):
        self.api_key = api_key
        self.endpoint = endpoint
    
    async def generate_attestation(self, data, nonce):
        return {"attestation_id": f"attest-{nonce}", "data": data}
    
    async def verify_attestation(self, attestation, expected_data):
        return {"verified": True, "attestation": attestation}
    
    async def get_tee_info(self):
        return {"type": "SGX", "version": "2.0"}
    
    async def get_measurements(self):
        return {"mrenclave": "mock-hash", "mrsigner": "mock-signer"}
    
    async def execute_in_tee(self, function, params):
        return {"result": f"executed-{function}"}
    
    async def get_security_status(self):
        return {"secure": True, "tee_enabled": True}
    
    async def get_tee_capabilities(self):
        return {"capabilities": ["attestation", "sealing"]}
import uvicorn

app = FastAPI(title="dStack Remote Attestation API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SDK
sdk = DStackSDK(
    api_key=os.getenv("DSTACK_API_KEY", "test-key"),
    endpoint=os.getenv("DSTACK_ENDPOINT", "https://api.dstack.network")
)

class AttestationRequest(BaseModel):
    data: str
    nonce: Optional[str] = None

class VerificationRequest(BaseModel):
    attestation_id: str
    expected_data: str

class TEEExecutionRequest(BaseModel):
    function: str
    params: Dict[str, Any]

@app.get("/")
async def root():
    return {
        "message": "dStack Remote Attestation API",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/attestation/generate")
async def generate_attestation(request: AttestationRequest):
    try:
        nonce = request.nonce or str(datetime.now().timestamp())
        result = await sdk.generate_attestation(
            data=request.data,
            nonce=nonce
        )
        return {
            "status": "success",
            "data": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/attestation/verify")
async def verify_attestation(request: VerificationRequest):
    try:
        result = await sdk.verify_attestation(
            attestation=request.attestation_id,
            expected_data=request.expected_data
        )
        return {
            "status": "success",
            "verified": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tee/info")
async def get_tee_info():
    try:
        info = await sdk.get_tee_info()
        return {
            "status": "success",
            "info": info,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tee/measurements")
async def get_measurements():
    try:
        measurements = await sdk.get_measurements()
        return {
            "status": "success",
            "measurements": measurements,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tee/execute")
async def execute_in_tee(request: TEEExecutionRequest):
    try:
        result = await sdk.execute_in_tee(
            function=request.function,
            params=request.params
        )
        return {
            "status": "success",
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/security/status")
async def get_security_status():
    try:
        status = await sdk.get_security_status()
        return {
            "status": "success",
            "security_status": status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/test/all")
async def test_all_apis():
    """Test all available dStack APIs"""
    results = []
    
    test_cases = [
        ("Generate Attestation", lambda: sdk.generate_attestation(data="test", nonce="123")),
        ("Get TEE Info", lambda: sdk.get_tee_info()),
        ("Get Measurements", lambda: sdk.get_measurements()),
        ("Get Security Status", lambda: sdk.get_security_status()),
        ("Get TEE Capabilities", lambda: sdk.get_tee_capabilities()),
    ]
    
    for name, test_func in test_cases:
        try:
            start = datetime.now()
            await test_func()
            duration = (datetime.now() - start).total_seconds() * 1000
            results.append({
                "test": name,
                "status": "passed",
                "duration_ms": duration
            })
        except Exception as e:
            results.append({
                "test": name,
                "status": "failed",
                "error": str(e)
            })
    
    passed = len([r for r in results if r["status"] == "passed"])
    failed = len([r for r in results if r["status"] == "failed"])
    
    return {
        "total_tests": len(results),
        "passed": passed,
        "failed": failed,
        "results": results,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
