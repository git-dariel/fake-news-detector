import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix
from sklearn.pipeline import Pipeline
import joblib
import os
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer
import warnings
import ssl

# Download required NLTK data
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    print("Downloading NLTK punkt tokenizer...")
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    print("Downloading NLTK stopwords...")
    nltk.download('stopwords', quiet=True)

warnings.filterwarnings('ignore')

class FakeNewsDetector:
    def __init__(self):
        self.decision_tree_model = None
        self.random_forest_model = None
        self.vectorizer = None
        self.df = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.stemmer = PorterStemmer()
        self.stop_words = set(stopwords.words('english'))
        self.model_metrics = {}
        self.models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'saved_models')
        
    def _models_exist(self):
        """Check if pre-trained models exist"""
        required_files = [
            'decision_tree_model.pkl',
            'random_forest_model.pkl',
            'vectorizer.pkl',
            'model_metrics.pkl'
        ]
        
        for file in required_files:
            if not os.path.exists(os.path.join(self.models_dir, file)):
                return False
        return True
    
    def load_saved_models(self):
        """Load pre-trained models from disk"""
        try:
            print("Loading pre-trained models...")
            self.decision_tree_model = joblib.load(os.path.join(self.models_dir, 'decision_tree_model.pkl'))
            self.random_forest_model = joblib.load(os.path.join(self.models_dir, 'random_forest_model.pkl'))
            self.vectorizer = joblib.load(os.path.join(self.models_dir, 'vectorizer.pkl'))
            self.model_metrics = joblib.load(os.path.join(self.models_dir, 'model_metrics.pkl'))
            print("✅ Pre-trained models loaded successfully!")
            return True
        except Exception as e:
            print(f"❌ Error loading saved models: {e}")
            return False
    
    def initialize_models(self, fast_mode=True, load_dataset=False):
        """Initialize models - either load saved ones or train new ones"""
        if self._models_exist():
            print("Found existing trained models...")
            if self.load_saved_models():
                # Only load dataset if explicitly requested (for analytics)
                if load_dataset:
                    print("Loading dataset for analytics...")
                    if fast_mode:
                        self.load_and_prepare_data(sample_size=10000)
                    else:
                        self.load_and_prepare_data()
                else:
                    print("✅ Models loaded successfully! (Dataset not loaded for faster startup)")
                return True
        
        print("No pre-trained models found. Training new models...")
        if fast_mode:
            print("Using fast mode with 10,000 sample articles for quicker startup...")
            print("For full accuracy, retrain with the full dataset later.")
            self.load_and_prepare_data(sample_size=10000)
        else:
            print("This may take a few minutes for the first time...")
            self.load_and_prepare_data()
        
        self.train_models()
        return True
    
    def initialize_models_only(self):
        """Initialize models for production - only load saved models, no dataset"""
        if self._models_exist():
            print("Found existing trained models...")
            if self.load_saved_models():
                print("✅ Production models loaded successfully! (Dataset not loaded to save memory)")
                return True
        
        print("❌ No pre-trained models found. Please train models first.")
        print("For development, use initialize_models() instead.")
        return False
    
    def preprocess_text(self, text):
        """Preprocess text for feature extraction"""
        if pd.isna(text):
            return ""
        
        # Convert to lowercase
        text = str(text).lower()
        
        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords and stem
        tokens = [self.stemmer.stem(token) for token in tokens if token not in self.stop_words]
        
        return ' '.join(tokens)
    
    def load_and_prepare_data(self, sample_size=None):
        """Load and prepare the dataset"""
        # Get the directory where this script is located
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # Go up to the project root and then to the data directory
        project_root = os.path.dirname(os.path.dirname(current_dir))
        fake_csv_path = os.path.join(project_root, 'src', 'config', 'data', 'Fake.csv')
        true_csv_path = os.path.join(project_root, 'src', 'config', 'data', 'True.csv')
        
        try:
            # Load datasets
            fake_df = pd.read_csv(fake_csv_path)
            true_df = pd.read_csv(true_csv_path)
        except FileNotFoundError as e:
            print(f"Error: Could not find CSV files. Please check the paths:")
            print(f"Fake CSV: {fake_csv_path}")
            print(f"True CSV: {true_csv_path}")
            raise e
        except Exception as e:
            print(f"Error loading CSV files: {e}")
            raise e
        
        # Sample data for faster training if specified
        if sample_size:
            fake_df = fake_df.sample(n=min(sample_size//2, len(fake_df)), random_state=42)
            true_df = true_df.sample(n=min(sample_size//2, len(true_df)), random_state=42)
            print(f"Using sample of {len(fake_df) + len(true_df)} articles for faster training")
        
        # Add labels
        fake_df['label'] = 'FAKE'
        true_df['label'] = 'REAL'
        
        # Combine datasets
        self.df = pd.concat([fake_df, true_df], ignore_index=True)
        
        # Handle missing values
        self.df['title'] = self.df['title'].fillna('')
        self.df['text'] = self.df['text'].fillna('')
        self.df['subject'] = self.df['subject'].fillna('')
        
        # Create combined text feature
        self.df['combined_text'] = (
            self.df['title'] + ' ' + 
            self.df['text'] + ' ' + 
            self.df['subject']
        )
        
        # Preprocess the combined text
        self.df['processed_text'] = self.df['combined_text'].apply(self.preprocess_text)
        
        # Shuffle the dataset
        self.df = self.df.sample(frac=1, random_state=42).reset_index(drop=True)
        
        print(f"Dataset loaded: {len(self.df)} articles")
        print(f"Fake news: {len(self.df[self.df['label'] == 'FAKE'])}")
        print(f"Real news: {len(self.df[self.df['label'] == 'REAL'])}")
    
    def train_models(self):
        """Train Decision Tree and Random Forest models"""
        # Prepare features and target
        X = self.df['processed_text']
        y = self.df['label']
        
        # Split the data
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Create TF-IDF vectorizer with improved parameters
        self.vectorizer = TfidfVectorizer(
            max_features=15000,  # Increased from 10000 for more features
            min_df=3,           # Increased from 2 to reduce noise
            max_df=0.7,         # Reduced from 0.8 to exclude very common words
            ngram_range=(1, 3), # Increased to trigrams for better context
            sublinear_tf=True,  # Use sublinear TF scaling
            smooth_idf=True     # Smooth IDF weights
        )
        
        # Fit vectorizer and transform training data
        X_train_tfidf = self.vectorizer.fit_transform(self.X_train)
        X_test_tfidf = self.vectorizer.transform(self.X_test)
        
        # Train Decision Tree with improved parameters
        print("Training Decision Tree...")
        self.decision_tree_model = DecisionTreeClassifier(
            max_depth=25,          # Increased from 20
            min_samples_split=8,   # Reduced from 10 for more splits
            min_samples_leaf=3,    # Reduced from 5 for more detail
            max_features='sqrt',   # Use sqrt of features for better generalization
            random_state=42
        )
        self.decision_tree_model.fit(X_train_tfidf, self.y_train)
        
        # Train Random Forest with improved parameters
        print("Training Random Forest...")
        self.random_forest_model = RandomForestClassifier(
            n_estimators=200,      # Increased from 100 for better ensemble
            max_depth=30,          # Increased from 20 for more complexity
            min_samples_split=8,   # Reduced from 10
            min_samples_leaf=3,    # Reduced from 5
            max_features='sqrt',   # Better feature selection
            n_jobs=-1,            # Use all CPU cores
            random_state=42
        )
        self.random_forest_model.fit(X_train_tfidf, self.y_train)
        
        # Evaluate models
        self._evaluate_models(X_train_tfidf, X_test_tfidf)
        
        # Save models
        self._save_models()
    
    def _evaluate_models(self, X_train_tfidf, X_test_tfidf):
        """Evaluate both models and store metrics"""
        models = {
            'Decision Tree': self.decision_tree_model,
            'Random Forest': self.random_forest_model
        }
        
        self.model_metrics = {}
        
        for name, model in models.items():
            # Predictions
            y_train_pred = model.predict(X_train_tfidf)
            y_test_pred = model.predict(X_test_tfidf)
            
            # Calculate metrics
            train_accuracy = accuracy_score(self.y_train, y_train_pred)
            test_accuracy = accuracy_score(self.y_test, y_test_pred)
            precision = precision_score(self.y_test, y_test_pred, pos_label='FAKE')
            recall = recall_score(self.y_test, y_test_pred, pos_label='FAKE')
            f1 = f1_score(self.y_test, y_test_pred, pos_label='FAKE')
            
            self.model_metrics[name] = {
                'train_accuracy': float(train_accuracy),
                'test_accuracy': float(test_accuracy),
                'precision': float(precision),
                'recall': float(recall),
                'f1_score': float(f1),
                'classification_report': classification_report(self.y_test, y_test_pred),
                'confusion_matrix': confusion_matrix(self.y_test, y_test_pred).tolist()
            }
            
            print(f"\n{name} Results:")
            print(f"Train Accuracy: {train_accuracy:.4f}")
            print(f"Test Accuracy: {test_accuracy:.4f}")
            print(f"Precision: {precision:.4f}")
            print(f"Recall: {recall:.4f}")
            print(f"F1-Score: {f1:.4f}")
    
    def _save_models(self):
        """Save trained models and vectorizer"""
        os.makedirs(self.models_dir, exist_ok=True)
        
        joblib.dump(self.decision_tree_model, os.path.join(self.models_dir, 'decision_tree_model.pkl'))
        joblib.dump(self.random_forest_model, os.path.join(self.models_dir, 'random_forest_model.pkl'))
        joblib.dump(self.vectorizer, os.path.join(self.models_dir, 'vectorizer.pkl'))
        joblib.dump(self.model_metrics, os.path.join(self.models_dir, 'model_metrics.pkl'))
        
        print(f"Models saved successfully to: {self.models_dir}")
    
    def is_ready(self):
        """Check if models are loaded and ready for predictions"""
        return (self.decision_tree_model is not None and 
                self.random_forest_model is not None and 
                self.vectorizer is not None)
    
    def predict_single(self, title, text, subject=""):
        """Predict a single news article"""
        # Combine input text (handle empty subject gracefully)
        if subject and subject.strip():
            combined_text = f"{title} {text} {subject}"
        else:
            combined_text = f"{title} {text}"
        
        processed_text = self.preprocess_text(combined_text)
        
        # Transform using vectorizer
        text_tfidf = self.vectorizer.transform([processed_text])
        
        # Get predictions from both models
        dt_prediction = self.decision_tree_model.predict(text_tfidf)[0]
        dt_prob = self.decision_tree_model.predict_proba(text_tfidf)[0]
        
        rf_prediction = self.random_forest_model.predict(text_tfidf)[0]
        rf_prob = self.random_forest_model.predict_proba(text_tfidf)[0]
        
        # Use Random Forest as primary (usually more accurate)
        primary_prediction = rf_prediction
        primary_prob = rf_prob
        
        # Get feature importance for explanation
        feature_names = self.vectorizer.get_feature_names_out()
        rf_importance = self.random_forest_model.feature_importances_
        
        # Get top features
        top_indices = np.argsort(rf_importance)[-10:]
        top_features = [(feature_names[i], rf_importance[i]) for i in top_indices]
        
        # Create analysis
        analysis = {
            'decision_tree_prediction': dt_prediction,
            'decision_tree_confidence': float(max(dt_prob)),
            'random_forest_prediction': rf_prediction,
            'random_forest_confidence': float(max(rf_prob)),
            'top_features': [(feat, float(importance)) for feat, importance in top_features],
            'text_length': len(combined_text),
            'word_count': len(combined_text.split()),
            'processed_text_preview': processed_text[:200] + "..." if len(processed_text) > 200 else processed_text
        }
        
        return {
            'prediction': primary_prediction,
            'confidence': float(max(primary_prob)),
            'probabilities': {
                'FAKE': float(primary_prob[0] if self.random_forest_model.classes_[0] == 'FAKE' else primary_prob[1]),
                'REAL': float(primary_prob[1] if self.random_forest_model.classes_[0] == 'FAKE' else primary_prob[0])
            },
            'analysis': analysis,
            'model_metrics': self.model_metrics
        }
    
    def get_model_info(self):
        """Get information about trained models"""
        return {
            'models_trained': ['Decision Tree', 'Random Forest'],
            'vectorizer_features': self.vectorizer.max_features if self.vectorizer else None,
            'training_samples': len(self.X_train) if self.X_train is not None else None,
            'test_samples': len(self.X_test) if self.X_test is not None else None,
            'metrics': self.model_metrics
        }
    
    def get_dataset_stats(self):
        """Get statistics about the dataset"""
        if self.df is None:
            # Automatically load dataset when stats are requested
            try:
                print("Dataset not in memory, loading for stats...")
                self.load_and_prepare_data(sample_size=10000)  # Load sample for stats
            except Exception as e:
                print(f"Failed to load dataset: {e}")
                return {
                    'total_articles': 0,
                    'fake_articles': 0,
                    'real_articles': 0,
                    'subjects': {},
                    'avg_text_length': 0.0,
                    'avg_title_length': 0.0,
                    'error': f"Dataset loading failed: {str(e)}"
                }
        
        stats = {
            'total_articles': len(self.df),
            'fake_articles': len(self.df[self.df['label'] == 'FAKE']),
            'real_articles': len(self.df[self.df['label'] == 'REAL']),
            'subjects': self.df['subject'].value_counts().to_dict(),
            'avg_text_length': float(self.df['text'].str.len().mean()),
            'avg_title_length': float(self.df['title'].str.len().mean())
        }
        
        return stats
    
    def retrain_full_dataset(self):
        """Retrain models with the full dataset for maximum accuracy"""
        print("Retraining models with full dataset...")
        print("This will take several minutes but provide better accuracy...")
        self.load_and_prepare_data()  # Load full dataset
        self.train_models()
        print("✅ Full dataset training completed!")
        return True 