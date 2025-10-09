# build-to-dist.ps1

# --- 1) Check for .env and required variables ---
$envPath = ".env"
if (!(Test-Path $envPath)) {
  Write-Host ".env file is missing. Make sure it exists in the project root."
  exit 1
}

$envContent = Get-Content $envPath | Where-Object { $_ -match "=" }
$requiredKeys = @("DATABASE_URL", "JWT_SECRET")
foreach ($key in $requiredKeys) {
  if (-not ($envContent -match "^$key\s*=")) {
    Write-Host "Missing required key in .env: $key"
    exit 1
  }
}

Write-Host "Environment variables verified."

# --- 2) Prisma steps ---
Write-Host "Running Prisma commands..."
npx prisma generate
npx prisma migrate deploy

if ($LASTEXITCODE -ne 0) {
  Write-Host "Prisma commands failed. Exiting."
  exit 1
}

# --- 3) Build ---
Write-Host "Building NestJS project..."
npm run build

if ($LASTEXITCODE -ne 0) {
  Write-Host "Build failed. Exiting."
  exit 1
}

# --- 4) Commit build to main branch ---
Write-Host "Committing dist folder to main..."
git add .
git add -f dist
git add -f prisma/schema.prisma
git add -f package.json
git add -f .env.example
git commit -m "NestJS build commit"
git push origin master

# --- 5) Switch to dist branch ---
Write-Host "Switching to dist branch..."
git fetch origin
$distExists = git branch -r | Select-String "origin/dist"

if ($distExists) {
  Write-Host "Remote dist branch exists - checking out and cleaning..."
  git checkout dist 2>$null
  git reset --hard origin/dist
} else {
  Write-Host "Creating new dist branch from empty state..."
  git checkout --orphan dist
}

# --- Always clean branch before copying ---
Write-Host "Cleaning dist branch..."
git rm -rf . > $null 2>&1
Remove-Item * -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Dist branch cleaned."

# --- 6) Copy built output from master ---
Write-Host "Copying dist and related files from master..."
git checkout master -- dist
git checkout master -- prisma/schema.prisma
git checkout master -- package.json
git checkout master -- .env.example

# --- 7) Commit and push to dist ---
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "Committing and pushing dist..."
git add -f dist prisma/schema.prisma package.json .env.example
git commit -m "Deploy from latest master ($timestamp)"
git push origin dist

# --- 8) Return to main branch ---
Write-Host "Switching back to master..."
git checkout master

Write-Host "Deployment completed."
git status
