# Fake News Detection System

A comprehensive fake news detection application built with Next.js frontend and Python machine learning backend. The system uses Decision Tree and Random Forest algorithms to analyze news articles and identify potential misinformation with detailed explanations.

![Fake News Detection](https://img.shields.io/badge/AI-Powered-blue) ![Next.js](https://img.shields.io/badge/Next.js-15.1.5-black) ![Python](https://img.shields.io/badge/Python-3.8+-green) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104-teal)

## 🚀 Features

### Frontend (Next.js)

- **Modern UI Design**: Sleek gradient backgrounds with blue, black, and white color scheme
- **Real-time Analysis**: Instant feedback on article authenticity
- **Interactive Dashboard**: Comprehensive analytics and model performance metrics
- **Responsive Design**: Optimized for desktop and mobile devices
- **Model Comparison**: Side-by-side comparison of Decision Tree and Random Forest predictions

### Backend (Python API)

- **Machine Learning Models**: Decision Tree and Random Forest classifiers
- **Advanced NLP**: TF-IDF vectorization with text preprocessing
- **Performance Metrics**: Accuracy, precision, recall, F1-score analysis
- **Feature Importance**: Explanation of key factors in predictions
- **RESTful API**: FastAPI with automatic documentation

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 15.1.5
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Language**: TypeScript

### Backend

- **Framework**: FastAPI
- **ML Libraries**: scikit-learn, pandas, numpy
- **NLP**: NLTK, TextBlob
- **Visualization**: matplotlib, seaborn, plotly

## 📋 Prerequisites

- Node.js 18.0 or higher
- Python 3.8 or higher
- npm or yarn package manager
- pip package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fake-new-detection-app
```

### 2. Setup Frontend (Next.js)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 3. Setup Backend (Python API)

```bash
# Navigate to API directory
cd api

# Install Python dependencies
pip install -r requirements.txt

# Start the API server
python run.py
```

The API will be available at `http://localhost:8000`

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000

## 📊 Dataset

The system uses two CSV datasets located in `src/config/data/`:

- **Fake.csv**: Collection of fake news articles
- **True.csv**: Collection of real news articles

Each article contains:

- `title`: Article headline
- `text`: Full article content
- `subject`: Article category
- `date`: Publication date

## 🧠 Machine Learning Pipeline

### Data Preprocessing

1. **Text Cleaning**: Remove special characters, normalize case
2. **Tokenization**: Split text into words
3. **Stop Word Removal**: Filter common words
4. **Stemming**: Reduce words to root form
5. **Feature Engineering**: Combine title, text, and subject

### Models

#### Decision Tree Classifier

- **Purpose**: Interpretable model with clear decision paths
- **Advantages**: Easy to understand, visualizable logic
- **Use Case**: Explaining why an article is classified as fake/real

#### Random Forest Classifier

- **Purpose**: Ensemble model for improved accuracy
- **Advantages**: Better generalization, feature importance ranking
- **Use Case**: Primary prediction model with higher accuracy

### Evaluation Metrics

- **Accuracy**: Overall correctness percentage
- **Precision**: Accuracy of fake news predictions
- **Recall**: Ability to identify all fake news
- **F1-Score**: Balanced measure of precision and recall

## 🎨 UI Design

### Landing Page

- **Hero Section**: Large title with gradient text effects
- **Feature Cards**: Three main capabilities with icons
- **Statistics**: Key performance metrics
- **Navigation**: Clean header with smooth transitions

### Detection Page

- **Input Form**: Source/title and article text fields
- **Results Panel**: Real-time analysis with confidence scores
- **Model Comparison**: Side-by-side Decision Tree vs Random Forest
- **Feature Analysis**: Top influential words and phrases

### Analytics Page

- **Dataset Overview**: Statistics about training data
- **Model Performance**: Detailed metrics comparison
- **Confusion Matrix**: Visual representation of model accuracy
- **Subject Distribution**: Analysis of article categories

## 🔧 API Endpoints

### POST /predict

Analyze a news article for authenticity.

**Request:**

```json
{
  "title": "Source name or article title",
  "text": "Full article content",
  "subject": ""
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
    "top_features": [["word1", 0.1], ["word2", 0.08]],
    "text_length": 1500,
    "word_count": 250
  }
}
```

### GET /model-info

Returns information about trained models and performance metrics.

### GET /dataset-stats

Provides statistics about the training dataset.

## 🏗️ Project Structure

```
fake-new-detection-app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── detect/
│   │   │   └── page.tsx          # Detection interface
│   │   ├── analytics/
│   │   │   └── page.tsx          # Analytics dashboard
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   └── config/
│       └── data/
│           ├── Fake.csv          # Fake news dataset
│           └── True.csv          # Real news dataset
├── api/
│   ├── main.py                   # FastAPI application
│   ├── run.py                    # Server startup script
│   ├── requirements.txt          # Python dependencies
│   ├── models/
│   │   └── fake_news_detector.py # ML model implementation
│   └── saved_models/             # Trained models (auto-generated)
├── package.json                  # Node.js dependencies
├── tailwind.config.js           # Tailwind configuration
└── README.md                     # Project documentation
```

## 🚀 Deployment

### Frontend Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### API Deployment

```bash
# Production server with Gunicorn
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

### Environment Variables

Create `.env` files for configuration:

**Frontend (.env.local):**

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend (.env):**

```
CORS_ORIGINS=http://localhost:3000
MODEL_PATH=./saved_models
```

## 📈 Performance

### Model Performance

- **Decision Tree**: ~90-95% accuracy
- **Random Forest**: ~95-98% accuracy
- **Prediction Speed**: <1 second per article
- **Training Time**: ~2-5 minutes on standard dataset

### System Performance

- **Frontend**: React 18 with Next.js optimizations
- **API**: FastAPI with async support
- **Memory Usage**: ~500MB for loaded models
- **Response Time**: <100ms for API calls

## 🧪 Testing

### Frontend Testing

```bash
npm run test
```

### Backend Testing

```bash
cd api
python -m pytest tests/
```

### Manual Testing

Use the built-in API documentation at `http://localhost:8000/docs` to test endpoints.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit changes: `git commit -m "Add feature"`
5. Push to branch: `git push origin feature-name`
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License. See LICENSE file for details.

## 📞 Support

For questions or issues:

1. Check the API documentation at `/docs`
2. Review this README for setup instructions
3. Open an issue on the repository

## 🙏 Acknowledgments

- Dataset providers for fake and real news articles
- scikit-learn team for machine learning tools
- Next.js and FastAPI communities for excellent frameworks
- Tailwind CSS for the beautiful styling system
