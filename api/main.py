from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models.enhanced_fact_checker import EnhancedFactChecker

app = FastAPI(
    title="Enhanced Fake News Detection API",
    description="Advanced fake news detection using ML + source credibility + fact-checking APIs",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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
    """Initialize models on startup - load saved models or train new ones"""
    try:
        print("🚀 Starting Enhanced Fake News Detection API...")
        detector.base_detector.initialize_models()
        print("✅ Enhanced API is ready to serve requests!")
        print("📊 Features: ML + Source Credibility + Pattern Analysis + Fact-Check Integration")
    except FileNotFoundError as e:
        print(f"❌ Error: Dataset files not found: {e}")
        print("Please ensure the CSV files are in the correct location: src/config/data/")
        raise e
    except Exception as e:
        print(f"❌ Error during model initialization: {e}")
        raise e

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
            "metrics": "/metrics"
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
        return detector.base_detector.get_dataset_stats()
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