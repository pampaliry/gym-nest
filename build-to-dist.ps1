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

# 3) Commit build to master
Write-Host "Committing build to master branch..."
git add .
git add dist -f
git commit -m "Nest build commit"
git push origin master

# 4) Switch to dist branch
Write-Host "Switching to dist branch..."
git checkout dist

# 5) Copy dist and other required files from master
Write-Host "Copying build artifacts..."
git checkout master -- dist
git checkout master -- prisma/schema.prisma
git checkout master -- package.json
git checkout master -- .env.example

# 6) Commit and push to dist
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git add -f dist prisma/schema.prisma package.json .env.example
git commit -m "Deploy from latest master ($timestamp)"
git push origin dist

# 7) Switch back to master
Write-Host "Switching back to master..."
git checkout master

Write-Host "Deployment completed."
git status
