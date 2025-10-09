param(
  [string]$SourceBranch = "master",
  [string]$DistBranch   = "dist"
)

$ErrorActionPreference = "Stop"

# 1) Verify .env
$envPath = ".env"
if (!(Test-Path $envPath)) {
  Write-Host ".env file is missing."
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

# 2) Build project
Write-Host "Building NestJS project..."
npm run build

if ($LASTEXITCODE -ne 0) {
  Write-Host "Build failed."
  exit 1
}

# 3) Commit build to master
Write-Host "Committing build to $SourceBranch..."
git add .
git add dist -f
git commit -m "Nest build commit"
git push origin $SourceBranch

# 4) Switch to dist branch
Write-Host "Switching to $DistBranch..."
git checkout $DistBranch

# 5) Copy build from master
Write-Host "Copying build artifacts..."
git checkout $SourceBranch -- dist
git checkout $SourceBranch -- prisma/schema.prisma
git checkout $SourceBranch -- package.json
git checkout $SourceBranch -- .env.example

# 6) Commit and push to dist
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git add -f dist prisma/schema.prisma package.json .env.example
git commit -m "Deploy from latest $SourceBranch ($timestamp)"
git push origin $DistBranch

# 7) Return to master
Write-Host "Switching back to $SourceBranch..."
git checkout $SourceBranch

Write-Host "Deployment completed."
git status
