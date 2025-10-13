# ----------------------------------------
# build-to-dist.ps1
# Automates NestJS build and deployment
# to "dist" branch (production build branch)
# ----------------------------------------

# --- 1) Check .env file and required keys ---
$envPath = ".env"
if (!(Test-Path $envPath)) {
  Write-Host "[ERROR] .env file missing in project root."
  exit 1
}

$envContent = Get-Content $envPath | Where-Object { $_ -match "=" }
$requiredKeys = @("DATABASE_URL", "JWT_SECRET")
foreach ($key in $requiredKeys) {
  if (-not ($envContent -match "^$key\s*=")) {
    Write-Host "[ERROR] Missing required key in .env: $key"
    exit 1
  }
}
Write-Host "✅ Environment variables verified."

# --- 2) Run Prisma steps (generate + migrate) ---
Write-Host "▶️ Running Prisma commands..."
npx prisma generate
npx prisma migrate deploy

if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERROR] Prisma commands failed. Exiting."
  exit 1
}

# --- 3) Build NestJS project ---
Write-Host "▶️ Building NestJS project..."
npm run build

if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERROR] Build failed. Exiting."
  exit 1
}
Write-Host "✅ Build completed successfully."

# --- 4) Commit build to main/master branch ---
Write-Host "💾 Committing dist folder to master..."
git add .
git add -f dist
git add -f prisma/schema.prisma
git add -f package.json
git add -f .env.example
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
git commit -m "NestJS build commit ($timestamp)"
git push origin master
Write-Host "✅ Changes pushed to master."

# --- 5) Ensure 'dist' branch exists safely ---
Write-Host "🔍 Checking if dist branch exists..."
git fetch origin
$distExists = git branch -r | Select-String "origin/dist"

if (-not $distExists) {
  Write-Host "🆕 Creating remote 'dist' branch..."
  git branch dist
  git push -u origin dist
} else {
  Write-Host "✅ 'dist' branch already exists."
}

# --- 6) Prepare worktree (temporary checkout of dist branch) ---
Write-Host "🧩 Preparing temporary worktree for dist..."
$worktreePath = "../dist-temp"
if (Test-Path $worktreePath) {
  Write-Host "🧹 Removing old temp worktree..."
  git worktree remove $worktreePath -f
}
git worktree add $worktreePath dist

# --- 7) Copy built files into dist worktree ---
Write-Host "📦 Copying build output to dist worktree..."
Copy-Item -Recurse -Force dist/* "$worktreePath/dist/"
Copy-Item -Force prisma/schema.prisma "$worktreePath/prisma/"
Copy-Item -Force package.json "$worktreePath/"
Copy-Item -Force .env.example "$worktreePath/"

# --- 8) Commit and push to dist branch ---
Set-Location $worktreePath
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "🚀 Committing and pushing dist build..."
git add -A
git commit -m "Deploy from latest master ($timestamp)"
git push origin dist

# --- 9) Cleanup and return to master ---
Set-Location "../gym-nest"
git worktree remove $worktreePath -f
Write-Host "🏁 Deployment completed successfully."
git status
