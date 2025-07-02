#!/usr/bin/env python3
"""
Script to run the Fake News Detection API server
"""
import uvicorn

if __name__ == "__main__":
    print("Starting Fake News Detection API server...")
    print("Server will be available at: http://localhost:8000")
    print("API documentation: http://localhost:8000/docs")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 