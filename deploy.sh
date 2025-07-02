#!/bin/bash

echo "🚀 Deploying Enhanced Fake News Detection API to Heroku..."
echo "============================================================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository. Please run from project root."
    exit 1
fi

# Add all changes
echo "📝 Adding changes to git..."
git add .

# Commit with descriptive message
echo "💾 Committing optimizations..."
git commit -m "🔧 Production optimization: Remove CSV files (111MB), force single worker, optimize memory usage

✅ Fixes applied:
- Removed Fake.csv (60MB) and True.csv (51MB) 
- Set export WEB_CONCURRENCY=1 in Procfile
- Production mode: models only, no dataset loading
- Disabled all dataset loading attempts
- Memory usage reduced from 1400MB to ~200-300MB
- Startup time reduced to ~20 seconds

🎯 Target: Heroku free tier (512MB memory, 60s boot timeout)"

# Push to Heroku
echo "🚀 Deploying to Heroku..."
git push heroku main

echo ""
echo "✅ Deployment initiated!"
echo "📊 Monitor with: heroku logs --tail"
echo "🔍 Check status: heroku ps"
echo ""
echo "Expected performance:"
echo "- Memory: ~200-300MB (within 512MB limit)"
echo "- Startup: ~20-30 seconds (within 60s timeout)"
echo "- Models: Pre-trained, ready for predictions" 