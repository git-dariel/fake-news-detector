from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models.enhanced_fact_checker import EnhancedFactChecker
import os

# Environment configuration
PRODUCTION_MODE = os.getenv("PRODUCTION_MODE", "true").lower() == "true"
MEMORY_LIMIT = os.getenv("MEMORY_LIMIT", "512").lower()  # MB

app = FastAPI(
    title="Enhanced Fake News Detection API",
    description="Advanced fake news detection using ML + source credibility + fact-checking APIs",
    version="2.0.0"
)

# Enable CORS
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://fake-news-dev-db7d0723bbe5.herokuapp.com",
    os.getenv("FRONTEND_URL", "")  # Allow configurable frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in allowed_origins if origin],  # Filter out empty strings
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize enhanced detector
detector = EnhancedFactChecker()

class NewsInput(BaseModel):
    title: str
    text: str
    subject: str = ""  # Optional field with empty default

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    probabilities: dict
    analysis: dict
    model_metrics: dict
    enhancement_details: dict

@app.on_event("startup")
async def startup_event():
    """Initialize models on startup - optimized based on environment"""
    try:
        print("🚀 Starting Enhanced Fake News Detection API...")
        print(f"Production Mode: {PRODUCTION_MODE}")
        print(f"Memory Limit: {MEMORY_LIMIT}MB")
        
        if PRODUCTION_MODE:
            # Production mode: only load models, not dataset
            detector.base_detector.initialize_models_only()
            print("✅ Production mode: Models loaded without dataset to save memory")
        else:
            # Development mode: load models and dataset
            detector.base_detector.initialize_models(fast_mode=True)
            print("✅ Development mode: Models and sample dataset loaded")
            
        print("📊 Features: ML + Source Credibility + Pattern Analysis + Fact-Check Integration")
    except FileNotFoundError as e:
        print(f"❌ Warning: Dataset files not found: {e}")
        print("Attempting to continue with pre-trained models only...")
        # Don't raise the error, try to continue with pre-trained models
    except Exception as e:
        print(f"❌ Error during model initialization: {e}")
        print("Attempting to continue with basic functionality...")
        # Don't raise the error, try to continue with basic functionality

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Enhanced Fake News Detection API",
        "version": "2.0.0",
        "features": [
            "Machine Learning Classification",
            "Source Credibility Analysis", 
            "Pattern Recognition",
            "Fact-Check Integration",
            "Multi-Source Verification"
        ],
        "endpoints": {
            "predict": "/predict",
            "health": "/health",
            "metrics": "/metrics",
            "dataset-stats": "/dataset-stats",
            "load-dataset-for-analytics": "/load-dataset-for-analytics"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_ready": detector.base_detector.is_ready(),
        "features_active": [
            "Enhanced ML Detection",
            "Source Credibility Scoring",
            "Pattern Analysis",
            "Fact-Check Search"
        ]
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_news(news: NewsInput):
    """Enhanced prediction with multi-source verification"""
    try:
        if not detector.base_detector.is_ready():
            raise HTTPException(status_code=503, detail="Models are not ready yet. Please wait for initialization to complete.")
        
        result = detector.enhanced_predict(
            title=news.title,
            text=news.text,
            subject=news.subject
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-pure-ml", response_model=PredictionResponse)  
async def predict_pure_ml(news: NewsInput):
    """Pure ML prediction using only dataset-based models (99.8% accuracy)"""
    try:
        if not detector.base_detector.is_ready():
            raise HTTPException(status_code=503, detail="Models are not ready yet. Please wait for initialization to complete.")
        
        result = detector.enhanced_predict(
            title=news.title,
            text=news.text,
            subject=news.subject,
            pure_ml_mode=True
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metrics")
async def get_model_metrics():
    """Get model performance metrics"""
    try:
        if not detector.base_detector.is_ready():
            return {"error": "Models not loaded yet"}
        
        return {
            "base_model_metrics": detector.base_detector.model_metrics,
            "enhancement_features": {
                "trusted_sources": len(detector.trusted_sources),
                "fact_checkers": len(detector.fact_checkers),
                "official_sources": len(detector.official_sources)
            },
            "verification_methods": [
                "Machine Learning Classification",
                "Source Credibility Analysis",
                "Content Pattern Recognition", 
                "Fact-Check Database Search"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dataset-stats")
async def get_dataset_stats():
    """Get statistics about the training dataset"""
    try:
        stats = detector.base_detector.get_dataset_stats()
        if 'error' in stats:
            stats['note'] = "Dataset not loaded in production mode. Use /load-dataset-for-analytics to load it."
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/load-dataset-for-analytics") 
async def load_dataset_for_analytics():
    """Load dataset for analytics (not normally loaded in production)"""
    try:
        print("Loading dataset for analytics...")
        detector.base_detector.load_and_prepare_data(sample_size=10000)
        return {
            "message": "Dataset loaded successfully for analytics", 
            "status": "completed",
            "sample_size": 10000
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/retrain-full-dataset")
async def retrain_full_dataset():
    """Retrain models with the complete dataset for maximum accuracy"""
    try:
        detector.base_detector.retrain_full_dataset()
        return {"message": "Models retrained successfully with full dataset", "status": "completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 