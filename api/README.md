# Fake News Detection API

A powerful Python API built with FastAPI that uses machine learning to detect fake news in articles.

## Features

- **Decision Tree Classifier**: Interpretable model for clear decision paths
- **Random Forest Classifier**: Ensemble model for improved accuracy
- **TF-IDF Vectorization**: Advanced text feature extraction
- **Real-time Predictions**: Fast analysis with detailed explanations
- **Model Analytics**: Comprehensive performance metrics and visualizations
- **REST API**: Easy integration with frontend applications

## Quick Start

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Installation

1. Navigate to the API directory:

   ```bash
   cd api
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   python run.py
   ```

The API will be available at `http://localhost:8000`

### API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation powered by Swagger UI.

## API Endpoints

### POST /predict

Analyze a news article for fake news detection.

**Request Body:**

```json
{
  "title": "Article title",
  "text": "Full article text",
  "subject": "Article category (optional)"
}
```

**Response:**

```json
{
  "prediction": "FAKE" | "REAL",
  "confidence": 0.95,
  "probabilities": {
    "FAKE": 0.95,
    "REAL": 0.05
  },
  "analysis": {
    "decision_tree_prediction": "FAKE",
    "decision_tree_confidence": 0.92,
    "random_forest_prediction": "FAKE",
    "random_forest_confidence": 0.95,
    "top_features": [["feature1", 0.1], ["feature2", 0.08]],
    "text_length": 1500,
    "word_count": 250,
    "processed_text_preview": "processed text..."
  },
  "model_metrics": {...}
}
```

### GET /model-info

Get information about the trained models.

### GET /dataset-stats

Get statistics about the training dataset.

## Machine Learning Pipeline

### Data Preprocessing

1. **Text Cleaning**: Remove special characters, convert to lowercase
2. **Tokenization**: Split text into individual words
3. **Stop Word Removal**: Remove common words (the, and, is, etc.)
4. **Stemming**: Reduce words to their root form
5. **Feature Engineering**: Combine title, text, and subject

### Feature Extraction

- **TF-IDF Vectorization**: Convert text to numerical features
- **N-gram Analysis**: Capture word sequences (unigrams and bigrams)
- **Feature Selection**: Top 10,000 most important features

### Models

#### Decision Tree Classifier

- **Purpose**: Interpretable model for understanding decision logic
- **Parameters**:
  - max_depth=20
  - min_samples_split=10
  - min_samples_leaf=5
- **Advantages**: Clear decision paths, feature importance

#### Random Forest Classifier

- **Purpose**: Ensemble model for improved accuracy
- **Parameters**:
  - n_estimators=100
  - max_depth=20
  - min_samples_split=10
  - min_samples_leaf=5
- **Advantages**: Better generalization, reduced overfitting

### Model Evaluation

The models are evaluated using:

- **Accuracy**: Overall correctness
- **Precision**: True positives / (True positives + False positives)
- **Recall**: True positives / (True positives + False negatives)
- **F1-Score**: Harmonic mean of precision and recall
- **Confusion Matrix**: Detailed breakdown of predictions

## Dataset

The system trains on two CSV files:

- `../src/config/data/Fake.csv`: Fake news articles
- `../src/config/data/True.csv`: Real news articles

Each article contains:

- **title**: Article headline
- **text**: Full article content
- **subject**: Article category/topic
- **date**: Publication date

## Architecture

```
api/
├── main.py              # FastAPI application
├── run.py              # Server startup script
├── requirements.txt    # Python dependencies
├── models/
│   ├── __init__.py
│   └── fake_news_detector.py  # ML model implementation
└── saved_models/       # Trained model artifacts (created at runtime)
    ├── decision_tree_model.pkl
    ├── random_forest_model.pkl
    ├── vectorizer.pkl
    └── model_metrics.pkl
```

## Development

### Adding New Features

1. **New Models**: Add to `FakeNewsDetector` class in `models/fake_news_detector.py`
2. **New Endpoints**: Add to `main.py` with proper validation
3. **New Preprocessing**: Extend the `preprocess_text` method

### Performance Optimization

- Models are loaded once at startup
- TF-IDF vectorizer is reused for all predictions
- Feature extraction is optimized for speed

### Error Handling

The API includes comprehensive error handling:

- Input validation with Pydantic models
- Graceful handling of missing data
- Detailed error messages for debugging

## Monitoring

### Health Check

```bash
curl http://localhost:8000/
```

### Model Performance

```bash
curl http://localhost:8000/model-info
```

### Dataset Statistics

```bash
curl http://localhost:8000/dataset-stats
```

## Deployment

### Production Deployment

1. **Environment Variables**: Set up production configuration
2. **WSGI Server**: Use Gunicorn for production
3. **Reverse Proxy**: Configure Nginx for better performance
4. **Monitoring**: Set up logging and health checks

### Docker Deployment (Optional)

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "run.py"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License.
