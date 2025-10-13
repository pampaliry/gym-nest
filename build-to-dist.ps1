# ----------------------------------------
# build-to-dist.ps1
# Safe NestJS build and deploy to "dist" branch
# ----------------------------------------

# --- 1) Check .env file and required keys ---
$envPath = ".env"
if (!(Test-Path $envPath)) {
  Write-Host "[ERROR] .env file is missing in the project root."
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
Write-Host "Environment variables verified."

# --- 2) Run Prisma steps (generate + migrate) ---
Write-Host "Running Prisma commands..."
npx prisma generate
npx prisma migrate deploy

if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERROR] Prisma commands failed. Exiting."
  exit 1
}

# --- 3) Build NestJS project ---
Write-Host "Building NestJS project..."
npm run build

if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERROR] Build failed. Exiting."
  exit 1
}
Write-Host "Build completed successfully."

# --- 4) Commit build to master branch ---
Write-Host "Committing dist folder to master..."
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
git add .
git add -f dist
git add -f prisma/schema.prisma
git add -f package.json
git add -f .env.example
git commit -m "NestJS build commit ($timestamp)"
git push origin master
Write-Host "Changes pushed to master."

# --- 5) Ensure dist branch exists safely ---
Write-Host "Checking dist branch..."
git fetch origin

# Check if local dist branch exists, if not create it
$hasLocalDist = git branch --list dist
if (-not $hasLocalDist) {
  Write-Host "Creating local dist branch..."
  git branch dist
}

# Check if remote dist branch exists, if not push it
$hasRemoteDist = git ls-remote --heads origin dist
if (-not $hasRemoteDist) {
  Write-Host "Creating remote dist branch..."
  git push -u origin dist
} else {
  Write-Host "dist branch already exists."
}

# --- 6) Prepare worktree (temporary checkout of dist branch) ---
Write-Host "Preparing temporary worktree for dist..."
$worktreePath = "../dist-temp"
if (Test-Path $worktreePath) {
  Write-Host "Removing old temp worktree..."
  git worktree remove $worktreePath -f
}
git worktree add $worktreePath dist

# --- 7) Copy only production files into dist worktree ---
Write-Host "Copying production files to dist worktree..."
if (!(Test-Path "$worktreePath/dist")) { New-Item -ItemType Directory -Path "$worktreePath/dist" | Out-Null }
if (!(Test-Path "$worktreePath/prisma")) { New-Item -ItemType Directory -Path "$worktreePath/prisma" | Out-Null }

# copy only what is needed for deployment
Copy-Item -Recurse -Force dist/* "$worktreePath/dist/"
Copy-Item -Force prisma/schema.prisma "$worktreePath/prisma/"
Copy-Item -Force package.json "$worktreePath/"
if (Test-Path package-lock.json) { Copy-Item -Force package-lock.json "$worktreePath/" }
Copy-Item -Force .env.example "$worktreePath/"


# --- 8) Commit and push to dist branch ---
Set-Location $worktreePath
$deployTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
Write-Host "Committing and pushing dist build..."
git add -A
git commit -m "Deploy from latest master ($deployTime)"
git push origin dist

# --- 9) Cleanup and return to master ---
Set-Location "../gym-nest"
git worktree remove $worktreePath -f
Write-Host "Deployment completed successfully."
git status
