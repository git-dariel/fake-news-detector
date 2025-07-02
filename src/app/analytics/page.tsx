"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface ModelMetrics {
  "Decision Tree": {
    train_accuracy: number;
    test_accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    classification_report: string;
    confusion_matrix: number[][];
  };
  "Random Forest": {
    train_accuracy: number;
    test_accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    classification_report: string;
    confusion_matrix: number[][];
  };
}

interface DatasetStats {
  total_articles: number;
  fake_articles: number;
  real_articles: number;
  subjects: Record<string, number>;
  avg_text_length: number;
  avg_title_length: number;
  error?: string;
}

interface ModelInfo {
  models_trained: string[];
  vectorizer_features: number;
  training_samples: number;
  test_samples: number;
  metrics: ModelMetrics;
}

export default function AnalyticsPage() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [datasetStats, setDatasetStats] = useState<DatasetStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [modelResponse, datasetResponse] = await Promise.all([
        fetch("http://localhost:8000/metrics"),
        fetch("http://localhost:8000/dataset-stats"),
      ]);

      if (!modelResponse.ok || !datasetResponse.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const modelData = await modelResponse.json();
      const datasetData = await datasetResponse.json();

      // Handle the new enhanced API response format
      const enhancedModelInfo = {
        models_trained: ["Decision Tree", "Random Forest"],
        vectorizer_features: 5000, // Default value
        training_samples: 0, // Will be updated from base_model_metrics if available
        test_samples: 0, // Will be updated from base_model_metrics if available
        metrics: modelData.base_model_metrics || {},
      };

      setModelInfo(enhancedModelInfo);
      setDatasetStats(datasetData);
    } catch (err) {
      setError(
        "Error connecting to API. Please make sure the Python server is running on port 8000."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading analytics...</p>
        </div>
      </div>
    );
  }

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
              <span className="text-white font-semibold text-xl">Model Analytics</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Model Performance Analytics</h1>
          <p className="text-white/70 text-lg">
            Detailed insights into our machine learning models and dataset
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-8">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Dataset Overview */}
        {datasetStats && datasetStats.total_articles && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Dataset Overview</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {(datasetStats.total_articles || 0).toLocaleString()}
                </div>
                <div className="text-white/70">Total Articles</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">
                  {(datasetStats.fake_articles || 0).toLocaleString()}
                </div>
                <div className="text-white/70">Fake Articles</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {(datasetStats.real_articles || 0).toLocaleString()}
                </div>
                <div className="text-white/70">Real Articles</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">
                  {Math.round(datasetStats.avg_text_length || 0).toLocaleString()}
                </div>
                <div className="text-white/70">Avg. Text Length</div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State for Dataset */}
        {!datasetStats && !error && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Dataset Overview</h2>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-400 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <p className="text-white/60">Loading dataset statistics...</p>
                <p className="text-white/40 text-sm mt-2">Please wait while models initialize</p>
              </div>
            </div>
          </div>
        )}

        {/* Error State for Dataset */}
        {datasetStats?.error && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Dataset Overview</h2>
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-8 text-center">
              <p className="text-red-200">⚠️ Dataset not loaded yet</p>
              <p className="text-red-300/60 text-sm mt-2">
                Models are still initializing. Please refresh in a moment.
              </p>
            </div>
          </div>
        )}

        {/* Model Performance Comparison */}
        {modelInfo && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Model Performance Comparison</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {Object.entries(modelInfo.metrics).map(([modelName, metrics]) => (
                <div
                  key={modelName}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8"
                >
                  <h3 className="text-xl font-semibold text-white mb-6">{modelName}</h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Test Accuracy</span>
                      <span className="text-white font-semibold">
                        {formatPercentage(metrics.test_accuracy)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-400 h-2 rounded-full"
                        style={{ width: `${metrics.test_accuracy * 100}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Precision</span>
                      <span className="text-white font-semibold">
                        {formatPercentage(metrics.precision)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-400 h-2 rounded-full"
                        style={{ width: `${metrics.precision * 100}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Recall</span>
                      <span className="text-white font-semibold">
                        {formatPercentage(metrics.recall)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${metrics.recall * 100}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-white/70">F1-Score</span>
                      <span className="text-white font-semibold">
                        {formatPercentage(metrics.f1_score)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-400 h-2 rounded-full"
                        style={{ width: `${metrics.f1_score * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Confusion Matrix */}
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-white mb-4">Confusion Matrix</h4>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-green-500/20 border border-green-500/50 rounded p-3">
                        <div className="text-lg font-bold text-white">
                          {metrics.confusion_matrix[0][0]}
                        </div>
                        <div className="text-xs text-green-300">True Negatives</div>
                      </div>
                      <div className="bg-red-500/20 border border-red-500/50 rounded p-3">
                        <div className="text-lg font-bold text-white">
                          {metrics.confusion_matrix[0][1]}
                        </div>
                        <div className="text-xs text-red-300">False Positives</div>
                      </div>
                      <div className="bg-red-500/20 border border-red-500/50 rounded p-3">
                        <div className="text-lg font-bold text-white">
                          {metrics.confusion_matrix[1][0]}
                        </div>
                        <div className="text-xs text-red-300">False Negatives</div>
                      </div>
                      <div className="bg-green-500/20 border border-green-500/50 rounded p-3">
                        <div className="text-lg font-bold text-white">
                          {metrics.confusion_matrix[1][1]}
                        </div>
                        <div className="text-xs text-green-300">True Positives</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Information */}
        {modelInfo && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Training Information</h2>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Dataset Split</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">Training Samples</span>
                      <span className="text-white">
                        {modelInfo.training_samples?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Test Samples</span>
                      <span className="text-white">{modelInfo.test_samples?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Feature Engineering</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">TF-IDF Features</span>
                      <span className="text-white">
                        {modelInfo.vectorizer_features?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">N-gram Range</span>
                      <span className="text-white">(1, 2)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Models Trained</h3>
                  <div className="space-y-2">
                    {modelInfo.models_trained.map((model, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-white">{model}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subject Distribution */}
        {datasetStats && datasetStats.subjects && datasetStats.total_articles && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Subject Distribution</h2>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Top Subjects</h3>
                  <div className="space-y-3">
                    {Object.entries(datasetStats.subjects || {})
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 8)
                      .map(([subject, count], index) => {
                        const maxCount = Math.max(
                          ...Object.values(datasetStats.subjects || {})
                        ) as number;
                        return (
                          <div key={subject} className="flex justify-between items-center">
                            <span className="text-white/70 truncate flex-1 mr-4">{subject}</span>
                            <div className="flex items-center">
                              <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
                                <div
                                  className="bg-blue-400 h-2 rounded-full"
                                  style={{
                                    width: `${((count as number) / maxCount) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-white w-16 text-right">
                                {(count as number).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Dataset Balance</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/70">Fake News</span>
                        <span className="text-red-400">
                          {(
                            ((datasetStats.fake_articles || 0) /
                              (datasetStats.total_articles || 1)) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-red-400 h-3 rounded-full"
                          style={{
                            width: `${
                              ((datasetStats.fake_articles || 0) /
                                (datasetStats.total_articles || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/70">Real News</span>
                        <span className="text-green-400">
                          {(
                            ((datasetStats.real_articles || 0) /
                              (datasetStats.total_articles || 1)) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-green-400 h-3 rounded-full"
                          style={{
                            width: `${
                              ((datasetStats.real_articles || 0) /
                                (datasetStats.total_articles || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
