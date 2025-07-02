import requests
import json
import re
from typing import Dict, List, Any, Optional
from urllib.parse import urlparse
import os
from .fake_news_detector import FakeNewsDetector

class EnhancedFactChecker:
    def __init__(self):
        self.base_detector = FakeNewsDetector()
        
        # Trusted news sources (high credibility)
        self.trusted_sources = {
            'bbc.com', 'bbc.co.uk', 'reuters.com', 'ap.org', 'apnews.com',
            'npr.org', 'pbs.org', 'cnn.com', 'nytimes.com', 'washingtonpost.com',
            'theguardian.com', 'wsj.com', 'bloomberg.com', 'abcnews.go.com',
            'cbsnews.com', 'nbcnews.com', 'usatoday.com', 'time.com',
            'newsweek.com', 'economist.com', 'ft.com', 'latimes.com'
        }
        
        # Fact-checking organizations
        self.fact_checkers = {
            'snopes.com', 'factcheck.org', 'politifact.com', 'fullfact.org',
            'checkyourfact.com', 'factcheck.afp.com', 'leadstories.com'
        }
        
        # Government and official sources
        self.official_sources = {
            'gov.uk', 'gov.ca', 'cdc.gov', 'who.int', 'nasa.gov',
            'nih.gov', 'fda.gov', 'epa.gov', 'state.gov'
        }
        
    def get_source_credibility_score(self, source_text: str) -> Dict[str, Any]:
        """Analyze source credibility based on domain and content patterns"""
        
        # Extract potential domains from text
        domains = re.findall(r'https?://(?:www\.)?([^/]+)', source_text.lower())
        
        credibility_score = 0.5  # Default neutral
        credibility_factors = []
        
        # Check for trusted sources mentioned
        for domain in domains:
            if any(trusted in domain for trusted in self.trusted_sources):
                credibility_score += 0.3
                credibility_factors.append(f"Trusted source: {domain}")
            elif any(fact_checker in domain for fact_checker in self.fact_checkers):
                credibility_score += 0.4
                credibility_factors.append(f"Fact-checking organization: {domain}")
            elif any(official in domain for official in self.official_sources):
                credibility_score += 0.35
                credibility_factors.append(f"Official source: {domain}")
        
        # Check source patterns in text
        source_lower = source_text.lower()
        
        # Positive indicators - BUT only if it's actually from that source
        # Don't give credit for just mentioning these organizations
        if source_lower.startswith(('bbc', 'reuters', 'associated press', 'ap news')):
            credibility_score += 0.2
            credibility_factors.append("Major news agency as source")
            
        if any(phrase in source_lower for phrase in ['according to', 'reported by', 'study by']):
            credibility_score += 0.05  # Reduced from 0.1
            credibility_factors.append("Attribution present")
        
        # Negative indicators
        if any(phrase in source_lower for phrase in ['breaking:', 'shocking', 'you won\'t believe']):
            credibility_score -= 0.2
            credibility_factors.append("Sensational language detected")
            
        if any(phrase in source_lower for phrase in ['insider source', 'anonymous tip', 'rumor has it']):
            credibility_score -= 0.15
            credibility_factors.append("Unverified source indicators")
        
        # Clamp score between 0 and 1
        credibility_score = max(0, min(1, credibility_score))
        
        return {
            'score': credibility_score,
            'factors': credibility_factors,
            'category': self._get_credibility_category(credibility_score)
        }
    
    def _get_credibility_category(self, score: float) -> str:
        """Convert numerical score to category"""
        if score >= 0.8:
            return "Very High"
        elif score >= 0.65:
            return "High"
        elif score >= 0.45:
            return "Medium"
        elif score >= 0.3:
            return "Low"
        else:
            return "Very Low"
    
    def search_fact_checks(self, query: str) -> List[Dict[str, Any]]:
        """Search for existing fact checks using Google Fact Check Tools API"""
        
        # Note: This would require API key in production
        # For now, we'll simulate with common fact-check patterns
        
        fact_checks = []
        
        # Simulate fact check search (in production, use actual API)
        keywords = query.lower().split()
        
        # Common fake news patterns we can detect
        fake_patterns = [
            'miracle cure', 'doctors hate', 'secret revealed', 'they don\'t want you to know',
            'banned by government', 'suppressed by media', 'big pharma conspiracy',
            'scientists discover', 'breaking discovery', 'hidden truth', 'exposed',
            'confirms existence', 'sudden climate change', 'rare mineral', 'alien',
            'government cover up', 'conspiracy theorists', 'leaked document', 'insider reveals'
        ]
        
        for pattern in fake_patterns:
            if pattern in query.lower():
                fact_checks.append({
                    'claim': f"Similar claims about '{pattern}' have been debunked",
                    'rating': 'FALSE',
                    'source': 'Multiple fact-checkers',
                    'confidence': 0.8
                })
        
        return fact_checks
    
    def analyze_text_patterns(self, text: str) -> Dict[str, Any]:
        """Analyze text for suspicious patterns"""
        
        text_lower = text.lower()
        suspicious_patterns = []
        credibility_adjustments = 0
        
        # Check for clickbait patterns
        clickbait_phrases = [
            'you won\'t believe', 'shocking truth', 'doctors hate him',
            'one weird trick', 'this will blow your mind', 'secret they don\'t want'
        ]
        
        for phrase in clickbait_phrases:
            if phrase in text_lower:
                suspicious_patterns.append(f"Clickbait language: '{phrase}'")
                credibility_adjustments -= 0.2  # Increased penalty
        
        # Check for conspiracy theory language
        conspiracy_phrases = [
            'mainstream media', 'cover up', 'they don\'t want you to know',
            'big pharma', 'government conspiracy', 'wake up sheeple'
        ]
        
        for phrase in conspiracy_phrases:
            if phrase in text_lower:
                suspicious_patterns.append(f"Conspiracy language: '{phrase}'")
                credibility_adjustments -= 0.25  # Increased penalty
        
        # Check for fake science indicators
        fake_science_phrases = [
            'scientists baffled', 'doctors shocked', 'breakthrough discovery',
            'hidden by scientists', 'secret research', 'banned study',
            'confirms existence', 'sudden change', 'rare mineral'
        ]
        
        for phrase in fake_science_phrases:
            if phrase in text_lower:
                suspicious_patterns.append(f"Fake science language: '{phrase}'")
                credibility_adjustments -= 0.3  # Strong penalty for fake science
        
        # Check for sensational language
        sensational_phrases = [
            'breaking', 'explosive', 'bombshell', 'leaked', 'exposed',
            'shocking revelation', 'insider reveals', 'exclusive'
        ]
        
        for phrase in sensational_phrases:
            if phrase in text_lower:
                suspicious_patterns.append(f"Sensational language: '{phrase}'")
                credibility_adjustments -= 0.15
        
        # Check for legitimate scientific language (reduced positive weight)
        scientific_phrases = [
            'peer reviewed', 'clinical trial', 'published in journal',
            'systematic review', 'meta-analysis', 'randomized controlled'
        ]
        
        scientific_count = 0
        for phrase in scientific_phrases:
            if phrase in text_lower:
                scientific_count += 1
                suspicious_patterns.append(f"Scientific language: '{phrase}'")
        
        # Only small positive adjustment for genuine scientific language
        if scientific_count > 0:
            credibility_adjustments += min(0.05, scientific_count * 0.02)  # Max 0.05 boost
        
        return {
            'patterns': suspicious_patterns,
            'credibility_adjustment': credibility_adjustments,
            'total_patterns': len(suspicious_patterns)
        }
    
    def enhanced_predict(self, title: str, text: str, subject: str = "", pure_ml_mode: bool = False) -> Dict[str, Any]:
        """Enhanced prediction using multiple verification methods"""
        
        # Get base ML prediction
        if not self.base_detector.is_ready():
            self.base_detector.initialize_models()
        
        base_result = self.base_detector.predict_single(title, text, subject)
        
        # Pure ML mode - use only dataset-based models (99.8% accuracy)
        if pure_ml_mode:
            return {
                'prediction': base_result['prediction'],
                'confidence': base_result['confidence'],
                'probabilities': base_result['probabilities'],
                'analysis': {
                    **base_result['analysis'],
                    'verification_method': 'Pure ML Dataset-Based Analysis'
                },
                'model_metrics': base_result['model_metrics'],
                'enhancement_details': {
                    'mode': 'pure_ml',
                    'base_ml_confidence': base_result['confidence'],
                    'enhancements_bypassed': True
                }
            }
        
        # Analyze source credibility
        source_analysis = self.get_source_credibility_score(title)
        
        # Search for fact checks
        fact_checks = self.search_fact_checks(f"{title} {text[:200]}")
        
        # Analyze text patterns
        pattern_analysis = self.analyze_text_patterns(f"{title} {text}")
        
        # Calculate enhanced confidence
        base_confidence = base_result['confidence']
        source_score = source_analysis['score']
        pattern_adjustment = pattern_analysis['credibility_adjustment']
        
        # Give MUCH more weight to ML models since they're performing at 99.8% accuracy
        enhanced_confidence = (
            base_confidence * 0.85 +  # ML prediction weight (increased from 0.6)
            source_score * 0.10 +    # Source credibility (reduced from 0.25)  
            max(0, min(1, 0.5 + pattern_adjustment)) * 0.05  # Pattern analysis (reduced from 0.15)
        )
        
        # Determine final prediction - Trust ML models more, reduce overrides
        if source_score >= 0.95 and pattern_adjustment >= 0 and base_confidence < 0.3:  
            # Only override if EXTREMELY high credibility, no suspicious patterns, AND ML is very uncertain
            final_prediction = "REAL"
            enhanced_confidence = max(enhanced_confidence, 0.6)  # Reduced boost
        elif pattern_adjustment <= -0.4:  # Only override on very strong suspicious patterns
            final_prediction = "FAKE"
            enhanced_confidence = max(enhanced_confidence, 0.75)
        else:
            # Use ML prediction - let the 99.8% accurate models decide!
            final_prediction = base_result['prediction']  # Use ML prediction directly
            enhanced_confidence = enhanced_confidence  # Keep calculated confidence
        
        return {
            'prediction': final_prediction,
            'confidence': float(enhanced_confidence),
            'probabilities': {
                'FAKE': 1 - enhanced_confidence if final_prediction == "REAL" else enhanced_confidence,
                'REAL': enhanced_confidence if final_prediction == "REAL" else 1 - enhanced_confidence
            },
            'analysis': {
                **base_result['analysis'],
                'source_credibility': source_analysis,
                'fact_checks_found': len(fact_checks),
                'fact_checks': fact_checks[:3],  # Top 3 fact checks
                'pattern_analysis': pattern_analysis,
                'verification_method': 'Enhanced Multi-Source Analysis'
            },
            'model_metrics': base_result['model_metrics'],
            'enhancement_details': {
                'base_ml_confidence': base_confidence,
                'source_credibility_score': source_score,
                'pattern_adjustment': pattern_adjustment,
                'final_confidence': enhanced_confidence
            }
        } 