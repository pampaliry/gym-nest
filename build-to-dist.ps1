# build-to-dist.ps1
# -----------------
# NestJS deploy script (same flow as Nuxt build-to-dist)
# - master branch = source
# - dist branch = build output

param(
  [string]$SourceBranch = "master",
  [string]$DistBranch   = "dist",
  [switch]$UseNpm
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

# 2) Build Nest project
Write-Host "Building Nest project..."
if ($UseNpm) {
  npm run build
} else {
  pnpm run build
}

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

# 5) Clean dist branch
Write-Host "Cleaning $DistBranch..."
Get-ChildItem -Force | Where-Object { $_.Name -notin @(".git", ".gitignore") } | Remove-Item -Recurse -Force

# 6) Copy artifacts from master
Write-Host "Copying build artifacts..."
git checkout $SourceBranch -- dist
git checkout $SourceBranch -- prisma/schema.prisma
git checkout $SourceBranch -- package.json
git checkout $SourceBranch -- .env.example

# 7) Commit and push
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git add -f dist prisma/schema.prisma package.json .env.example
git commit -m "Deploy from latest $SourceBranch ($timestamp)"
git push origin $DistBranch

# 8) Switch back
Write-Host "Switching back to $SourceBranch..."
git checkout $SourceBranch

Write-Host "Deployment completed."
git status
