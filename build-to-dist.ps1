# build-to-dist.ps1

# --- 1) Kontrola prítomnosti .env a kľúčových premenných ---
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

Write-Host "✅ Environment variables verified."

# --- 2) Prisma kroky ---
Write-Host "🔧 Running Prisma commands..."
npx prisma generate
npx prisma migrate deploy

if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Prisma commands failed. Exiting."
  exit 1
}

# --- 3) Build ---
Write-Host "🚀 Building NestJS project..."
npm run build

if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Build failed. Exiting."
  exit 1
}

# --- 4) Commit build do main vetvy ---
Write-Host "📦 Committing dist folder to main..."
git add .
git add -f dist
git add -f prisma/schema.prisma
git add -f package.json
git add -f .env.example
git commit -m "NestJS build commit"
git push origin master

# --- 5) Prepnutie na dist vetvu ---
Write-Host "🔁 Switching to dist branch..."
git checkout -B dist

# --- 6) Prenos buildnutého výstupu z master ---
Write-Host "📂 Copying dist and related files from master..."
git checkout master -- dist
git checkout master -- prisma/schema.prisma
git checkout master -- package.json
git checkout master -- .env.example

# --- 7) Commit a push do dist vetvy ---
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "⬆️ Committing and pushing dist..."
git add -f dist prisma/schema.prisma package.json .env.example
git commit -m "Deploy from latest master ($timestamp)"
git push origin dist

# --- 8) Návrat na hlavnú vetvu ---
Write-Host "↩️ Switching back to master..."
git checkout master

Write-Host "✅ Deployment completed."
git status
