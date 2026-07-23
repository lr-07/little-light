Write-Host "🌙 Little Light Deployment Script"
Write-Host "================================="

Write-Host ""
Write-Host "1. Setting up environment..."
$env:Path = "C:\nodejs\node-v20.17.0-win-x64;" + $env:Path
Write-Host "Node.js path added"

Write-Host ""
Write-Host "2. Installing Cloudflare Wrangler..."
npm install -g wrangler
Write-Host "Wrangler installed"

Write-Host ""
Write-Host "3. Logging in to Cloudflare..."
wrangler login

Write-Host ""
Write-Host "4. Deploying Worker API..."
Set-Location "d:\AI智能\产品文档\LittleLightV1"
wrangler deploy

Write-Host ""
Write-Host "5. Configuring API key..."
wrangler secret put DEEPSEEK_API_KEY

Write-Host ""
Write-Host "🎉 API Deployment complete!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Go to Cloudflare Dashboard -> Pages"
Write-Host "2. Create new project -> Upload assets"
Write-Host "3. Upload all files from the project directory"
Write-Host "4. Set custom domain to little.apay.eu.cc"