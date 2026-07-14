$ErrorActionPreference = "Stop"

$repoRoot = "C:\work\source\repos\FinSight"

Set-Location $repoRoot

Write-Host "Building FinSight backend API..." -ForegroundColor Cyan
dotnet restore .\FinSight.Api\FinSight.Api.csproj
dotnet build .\FinSight.Api\FinSight.Api.csproj

Write-Host "Building FinSight React frontend..." -ForegroundColor Cyan
Set-Location .\FinSight.Web
npm run build

Set-Location $repoRoot

Write-Host ""
Write-Host "FinSight backend and frontend builds completed successfully." -ForegroundColor Green