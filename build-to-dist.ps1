# build-to-dist.ps1
<<<<<<< HEAD
# -----------------
# NestJS deploy script (same flow as Nuxt build-to-dist)
# - master branch = source
# - dist branch = build output

=======
>>>>>>> dist
param(
  [string]$SourceBranch = "master",
  [string]$DistBranch   = "dist",
  [switch]$UseNpm
)

$ErrorActionPreference = "Stop"

<<<<<<< HEAD
# 1) Verify .env
=======
# 1 Overenie .env
>>>>>>> dist
$envPath = ".env"
if (!(Test-Path $envPath)) {
  Write-Host ".env file is missing."
  exit 1
}

$requiredKeys = @("DATABASE_URL", "JWT_SECRET")
$envContent = Get-Content $envPath | Where-Object { $_ -match "=" }
<<<<<<< HEAD

=======
>>>>>>> dist
foreach ($key in $requiredKeys) {
  if (-not ($envContent -match "^$key\s*=")) {
    Write-Host "Missing required key in .env: $key"
    exit 1
  }
}
<<<<<<< HEAD

Write-Host "Environment variables verified."

# 2) Build Nest project
=======
Write-Host "Environment variables verified."

# 2 Prisma generate
Write-Host "Generating Prisma client..."
npx prisma generate

# 3 Build projektu
>>>>>>> dist
Write-Host "Building Nest project..."
if ($UseNpm) {
  npm run build
} else {
  pnpm run build
}

<<<<<<< HEAD
if ($LASTEXITCODE -ne 0) {
  Write-Host "Build failed."
  exit 1
}

# 3) Commit build to master
=======
# 4 Commit build do master
>>>>>>> dist
Write-Host "Committing build to $SourceBranch..."
git add .
git add dist -f
git commit -m "Nest build commit"
git push origin $SourceBranch

<<<<<<< HEAD
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
=======
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
>>>>>>> dist
git status
