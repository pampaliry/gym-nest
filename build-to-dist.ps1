# build-to-dist.ps1
param(
  [string]$SourceBranch = "master",
  [string]$DistBranch   = "dist",
  [switch]$UseNpm
)

$ErrorActionPreference = "Stop"

# 1 Overenie .env
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

# 2 Prisma generate
Write-Host "Generating Prisma client..."
npx prisma generate

# 3 Build projektu
Write-Host "Building Nest project..."
if ($UseNpm) {
  npm run build
} else {
  pnpm run build
}

# 4 Commit build do master
Write-Host "Committing build to $SourceBranch..."
git add .
git add dist -f
git commit -m "Nest build commit"
git push origin $SourceBranch

# 4️⃣ Prepnutie na dist branch
Write-Host "Switching to $DistBranch..."
git checkout $DistBranch

# 5️⃣ Skopírovanie build výstupu zo source branch
Write-Host "Copying dist from $SourceBranch..."
git checkout $SourceBranch -- dist

# 6️⃣ Commit a push do dist
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git add -f dist
git commit -m "Deploy from latest $SourceBranch ($timestamp)"
git push origin $DistBranch

# 7️⃣ Návrat na master
Write-Host "Switching back to $SourceBranch..."
git checkout $SourceBranch

Write-Host "✅ Deployment completed."
git status
