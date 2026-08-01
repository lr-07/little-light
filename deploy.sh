#!/bin/bash

echo "🌙 Little Light Deployment Script"
echo "================================="

echo ""
echo "1. Installing dependencies..."
npm install -g wrangler

echo ""
echo "2. Logging in to Cloudflare..."
wrangler login

echo ""
echo "3. Deploying Worker API..."
cd "$(dirname "$0")"
wrangler deploy

echo ""
echo "4. Getting Worker URL..."
WORKER_URL=$(wrangler whoami | grep "Account ID")
echo "Worker deployed! URL: $WORKER_URL"

echo ""
echo "5. Configuring API key..."
wrangler secret put DEEPSEEK_API_KEY

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to Cloudflare Dashboard -> Pages"
echo "2. Create new project -> Connect to Git"
echo "3. Select your GitHub repo"
echo "4. Set custom domain to little.apay.eu.cc"
echo "5. Add DNS CNAME record: little -> your-project.pages.dev"