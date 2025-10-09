# build-to-dist.ps1
# -----------------
# 1) Verify environment variables
$envPath = ".env"
if (!(Test-Path $envPath)) {
  Write-Host "Missing .env file in project root."
  exit 1
}

$requiredKeys = @("DATABASE_URL", "JWT_SECRET")
$envContent = Get-Content $envPath | Where-Object { $_ -match "=" }

foreach ($key in $requiredKeys) {
  if (-not ($envContent -match "^$key\s*=")) {
    Write-Host "Missing required key in .env: $key"
    exit 1
  }
}

Write-Host "Environment variables verified."

# 2) Build NestJS
Write-Host "Building NestJS project..."
npm run build

if ($LASTEXITCODE -ne 0) {
  Write-Host "Build failed."
  exit 1
}

# 3) Commit build to main
Write-Host "Committing build to main branch..."
git add .
git add dist -f
git commit -m "Nest build commit"
git push origin main

# 4) Switch to dist branch
Write-Host "Switching to dist branch..."
git checkout dist

# 5) Copy dist folder and necessary files from main
Write-Host "Copying build artifacts..."
git checkout main -- dist
git checkout main -- prisma/schema.prisma
git checkout main -- package.json
git checkout main -- .env.example

# 6) Commit and push to dist
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git add -f dist prisma/schema.prisma package.json .env.example
git commit -m "Deploy from latest main ($timestamp)"
git push origin dist

# 7) Switch back to main
Write-Host "Switching back to main..."
git checkout main

Write-Host "Deployment completed."
git status
