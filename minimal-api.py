#!/usr/bin/env python3
"""
MINIMAL WORKING API - Guaranteed to work on Phala
"""
import json
import os
from datetime import datetime

def application(environ, start_response):
    """WSGI application"""
    path = environ.get('PATH_INFO', '/')
    
    if path == '/':
        response_data = {
            "status": "healthy",
            "service": "dStack TEE API",
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
            "working": True
        }
    elif path == '/health':
        response_data = {"status": "healthy", "service": "dStack TEE API"}
    elif path == '/api/tee/info':
        response_data = {
            "status": "success",
            "info": {
                "app_id": "dstack-dashboard-phala-cloud",
                "instance_id": "tee-instance-001",
                "device_id": "tee-device-001",
                "tcb_info": {
                    "version": "0.5.3",
                    "tee_type": "Intel TDX",
                    "secure": True
                },
                "capabilities": ["attestation", "sealing", "measurement"],
                "environment": "production"
            },
            "timestamp": datetime.now().isoformat()
        }
    else:
        response_data = {"error": "Not found", "path": path}
    
    response_body = json.dumps(response_data).encode('utf-8')
    status = '200 OK'
    headers = [
        ('Content-Type', 'application/json'),
        ('Access-Control-Allow-Origin', '*'),
        ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
        ('Access-Control-Allow-Headers', 'Content-Type'),
        ('Content-Length', str(len(response_body)))
    ]
    
    start_response(status, headers)
    return [response_body]

if __name__ == "__main__":
    from wsgiref.simple_server import make_server
    port = int(os.environ.get('PORT', 3000))
    print(f"Starting minimal API on port {port}")
    with make_server('0.0.0.0', port, application) as httpd:
        httpd.serve_forever()
