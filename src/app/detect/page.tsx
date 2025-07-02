"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface PredictionResult {
  prediction: string;
  confidence: number;
  probabilities: {
    FAKE: number;
    REAL: number;
  };
  analysis: {
    text_length: number;
    word_count: number;
    source_credibility?: {
      score: number;
      factors: string[];
      category: string;
    };
    fact_checks_found?: number;
    fact_checks?: Array<{
      claim: string;
      rating: string;
      source: string;
      confidence: number;
    }>;
    pattern_analysis?: {
      patterns: string[];
      credibility_adjustment: number;
      total_patterns: number;
    };
    verification_method: string;
  };
  model_metrics: any;
  enhancement_details: {
    mode?: string;
    base_ml_confidence: number;
    source_credibility_score?: number;
    pattern_adjustment?: number;
    final_confidence?: number;
    enhancements_bypassed?: boolean;
  };
  explanation?: string;
}

export default function DetectPage() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState("");
  const [detectionMode, setDetectionMode] = useState<"enhanced" | "pure-ml">("enhanced");
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainMessage, setRetrainMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !text.trim()) {
      setError("Please provide both source/title and text for analysis.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const endpoint = detectionMode === "pure-ml" ? "/predict-pure-ml" : "/predict";
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          text: text.trim(),
          subject: "", // Empty subject since we removed the field
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze the article");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        "Error connecting to API. Please make sure the Python server is running on port 8000."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    setRetrainMessage("");

    try {
      const response = await fetch("http://localhost:8000/retrain-full-dataset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to retrain models");
      }

      const data = await response.json();
      setRetrainMessage("✅ Models retrained successfully with full dataset for maximum accuracy!");
    } catch (err) {
      setRetrainMessage("❌ Error retraining models. Please check the server.");
      console.error(err);
    } finally {
      setIsRetraining(false);
    }
  };

  const clearForm = () => {
    setTitle("");
    setText("");
    setResult(null);
    setError("");
    setRetrainMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link
              href="/"
              className="flex items-center space-x-2 text-white hover:text-blue-300 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FN</span>
              </div>
              <span className="text-white font-semibold text-xl">News Detective</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Analyze News Article</h1>
          <p className="text-white/70 text-lg">
            Paste your news article below for AI-powered fake news detection
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Input Form */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Article Input</h2>

            {/* Detection Mode Selector */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-3">Detection Mode</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setDetectionMode("enhanced")}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    detectionMode === "enhanced"
                      ? "bg-blue-600 text-white border-2 border-blue-500"
                      : "bg-white/10 text-white/70 border-2 border-white/20 hover:bg-white/20"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">Enhanced Mode</div>
                    <div className="text-xs mt-1 opacity-80">ML + Source + Pattern Analysis</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setDetectionMode("pure-ml")}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    detectionMode === "pure-ml"
                      ? "bg-green-600 text-white border-2 border-green-500"
                      : "bg-white/10 text-white/70 border-2 border-white/20 hover:bg-white/20"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">Pure ML Mode</div>
                    <div className="text-xs mt-1 opacity-80">99.8% Dataset Accuracy</div>
                  </div>
                </button>
              </div>
              <p className="text-white/60 text-sm mt-2">
                {detectionMode === "enhanced"
                  ? "Uses ML models + source credibility + pattern analysis for comprehensive verification"
                  : "Uses only your dataset-trained ML models (Decision Tree + Random Forest) with 99.8% accuracy"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-white font-medium mb-2">
                  Source or Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                  placeholder="Enter the source name or article title..."
                  required
                />
              </div>

              <div>
                <label htmlFor="text" className="block text-white font-medium mb-2">
                  Article Text *
                </label>
                <textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 resize-y"
                  placeholder="Paste the full article text here..."
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              {retrainMessage && (
                <div
                  className={`rounded-lg p-4 ${
                    retrainMessage.includes("✅")
                      ? "bg-green-500/20 border border-green-500/50"
                      : "bg-red-500/20 border border-red-500/50"
                  }`}
                >
                  <p className={retrainMessage.includes("✅") ? "text-green-200" : "text-red-200"}>
                    {retrainMessage}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    detectionMode === "enhanced"
                      ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 focus:ring-blue-400 text-white"
                      : "bg-green-600 hover:bg-green-700 disabled:bg-green-800 focus:ring-green-400 text-white"
                  } disabled:opacity-50`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </div>
                  ) : (
                    `Analyze Article (${detectionMode === "enhanced" ? "Enhanced" : "Pure ML"})`
                  )}
                </button>

                <button
                  type="button"
                  onClick={clearForm}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-200 border border-white/20"
                >
                  Clear
                </button>
              </div>

              {/* Model Management */}
              <div className="border-t border-white/10 pt-6 mt-6">
                <h3 className="text-white font-medium mb-3">Model Management</h3>
                <button
                  type="button"
                  onClick={handleRetrain}
                  disabled={isRetraining || isLoading}
                  className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                >
                  {isRetraining ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Retraining with Full Dataset...
                    </div>
                  ) : (
                    "Retrain Models with Full Dataset"
                  )}
                </button>
                <p className="text-white/60 text-sm mt-2">
                  Retrain the ML models using the complete 44k article dataset for maximum accuracy.
                  This will take a few minutes.
                </p>
              </div>
            </form>
          </div>

          {/* Results Panel */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Analysis Results</h2>

            {!result && !isLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <p className="text-white/60">Enter an article above to see the analysis results</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Prediction Result */}
                <div
                  className={`p-6 rounded-lg border-2 ${
                    result.prediction === "FAKE"
                      ? "bg-red-500/20 border-red-500/50"
                      : "bg-green-500/20 border-green-500/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Prediction: {result.prediction}
                      </h3>
                      <p className="text-white/70 text-sm mt-1">
                        {result.analysis?.verification_method || "Enhanced Multi-Source Analysis"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.prediction === "FAKE"
                          ? "bg-red-500 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {(result.confidence * 100).toFixed(1)}% confident
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-white/70 text-sm">Fake Probability</p>
                      <p className="text-lg font-semibold text-red-400">
                        {(result.probabilities.FAKE * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Real Probability</p>
                      <p className="text-lg font-semibold text-green-400">
                        {(result.probabilities.REAL * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Enhancement Details for Enhanced Mode */}
                  {result.enhancement_details &&
                    !result.enhancement_details.enhancements_bypassed && (
                      <div className="bg-black/30 rounded-lg p-4 mt-4">
                        <h4 className="text-white font-medium mb-3">Analysis Breakdown</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-white/70">Base ML Score:</p>
                            <p className="text-white font-medium">
                              {(result.enhancement_details.base_ml_confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-white/70">Source Score:</p>
                            <p className="text-white font-medium">
                              {result.enhancement_details.source_credibility_score
                                ? (
                                    result.enhancement_details.source_credibility_score * 100
                                  ).toFixed(1) + "%"
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-white/70">Pattern Impact:</p>
                            <p
                              className={`font-medium ${
                                (result.enhancement_details.pattern_adjustment ?? 0) >= 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {(result.enhancement_details.pattern_adjustment ?? 0) >= 0 ? "+" : ""}
                              {((result.enhancement_details.pattern_adjustment ?? 0) * 100).toFixed(
                                1
                              )}
                              %
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Pure ML Mode Indicator */}
                  {result.enhancement_details?.enhancements_bypassed && (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mt-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                        <div>
                          <p className="text-green-200 font-medium">Pure ML Dataset Analysis</p>
                          <p className="text-green-200/70 text-sm">
                            Using only ML models trained on your dataset (99.8% accuracy)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Detailed Explanation */}
                {result.explanation && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      Why This Classification?
                    </h3>
                    <div className="bg-black/20 rounded-lg p-4">
                      <p className="text-white/90 leading-relaxed">{result.explanation}</p>
                    </div>
                    <div className="mt-3 text-xs text-blue-300/70">
                      {detectionMode === "enhanced"
                        ? "Enhanced analysis combining ML models with source credibility and pattern detection"
                        : "Pure machine learning analysis based on 44,000 verified training articles"}
                    </div>
                  </div>
                )}

                {/* Source Credibility Analysis */}
                {result.analysis.source_credibility && (
                  <div className="bg-black/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Source Credibility Analysis
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Credibility Score:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-white/10 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                result.analysis.source_credibility.score >= 0.8
                                  ? "bg-green-400"
                                  : result.analysis.source_credibility.score >= 0.6
                                  ? "bg-yellow-400"
                                  : result.analysis.source_credibility.score >= 0.4
                                  ? "bg-orange-400"
                                  : "bg-red-400"
                              }`}
                              style={{
                                width: `${result.analysis.source_credibility.score * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span
                            className={`font-medium ${
                              result.analysis.source_credibility.score >= 0.8
                                ? "text-green-400"
                                : result.analysis.source_credibility.score >= 0.6
                                ? "text-yellow-400"
                                : result.analysis.source_credibility.score >= 0.4
                                ? "text-orange-400"
                                : "text-red-400"
                            }`}
                          >
                            {result.analysis.source_credibility.category}
                          </span>
                        </div>
                      </div>

                      {result.analysis.source_credibility.factors.length > 0 && (
                        <div>
                          <p className="text-white/70 text-sm mb-2">Credibility Factors:</p>
                          <ul className="space-y-1">
                            {result.analysis.source_credibility.factors.map((factor, index) => (
                              <li key={index} className="text-sm text-white/60 flex items-center">
                                <span className="w-1 h-1 bg-white/40 rounded-full mr-2"></span>
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Article Analysis */}
                <div className="bg-black/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Article Analysis</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/70">Text Length:</p>
                      <p className="text-white font-medium">
                        {result.analysis.text_length.toLocaleString()} characters
                      </p>
                    </div>
                    <div>
                      <p className="text-white/70">Word Count:</p>
                      <p className="text-white font-medium">
                        {result.analysis.word_count.toLocaleString()} words
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pattern Analysis & Fact Checks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pattern Analysis */}
                  {result.analysis.pattern_analysis && (
                    <div className="bg-black/20 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Content Pattern Analysis
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-white/70">Patterns Found:</span>
                          <span className="text-white font-medium">
                            {result.analysis.pattern_analysis.total_patterns}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Credibility Impact:</span>
                          <span
                            className={`font-medium ${
                              result.analysis.pattern_analysis.credibility_adjustment >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {result.analysis.pattern_analysis.credibility_adjustment >= 0
                              ? "+"
                              : ""}
                            {(
                              result.analysis.pattern_analysis.credibility_adjustment * 100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        {result.analysis.pattern_analysis.patterns.length > 0 && (
                          <div className="mt-3">
                            <p className="text-white/70 text-sm mb-2">Detected Patterns:</p>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {result.analysis.pattern_analysis.patterns.map((pattern, index) => (
                                <div key={index} className="text-sm text-white/60 flex items-start">
                                  <span className="w-1 h-1 bg-white/40 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                                  <span className="break-words">{pattern}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Fact Check Results */}
                  <div className="bg-black/20 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Fact Check Results</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Checks Found:</span>
                        <span className="text-white font-medium">
                          {result.analysis.fact_checks_found ?? 0}
                        </span>
                      </div>
                      {result.analysis.fact_checks && result.analysis.fact_checks.length > 0 ? (
                        <div className="space-y-2">
                          {result.analysis.fact_checks.map((check, index) => (
                            <div key={index} className="bg-black/30 rounded p-3">
                              <div className="flex justify-between items-start mb-1">
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded ${
                                    check.rating === "FALSE"
                                      ? "bg-red-500 text-white"
                                      : check.rating === "TRUE"
                                      ? "bg-green-500 text-white"
                                      : "bg-yellow-500 text-black"
                                  }`}
                                >
                                  {check.rating}
                                </span>
                                <span className="text-xs text-white/60">{check.source}</span>
                              </div>
                              <p className="text-sm text-white/80">{check.claim}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white/60 text-sm">
                          No similar claims found in fact-check databases
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
