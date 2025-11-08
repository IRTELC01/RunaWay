Param(
  [string]$TargetDir = "$env:USERPROFILE\Documents\RunaWay"
)

Write-Host "Creando directorio de datos en: $TargetDir"
New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

$envPath = "server\.env"
if (-Not (Test-Path $envPath)) {
  Copy-Item "server\.env.example" $envPath -Force
  Write-Host "Copiado server/.env.example a server/.env"
}

# Escribir/actualizar DATA_DIR en .env
$envContent = Get-Content $envPath -Raw
if ($envContent -notmatch "^DATA_DIR=") {
  Add-Content $envPath "`nDATA_DIR=$TargetDir"
  Write-Host "Añadido DATA_DIR al .env"
} else {
  $updated = $envContent -replace "^DATA_DIR=.*$", "DATA_DIR=$TargetDir"
  Set-Content $envPath $updated
  Write-Host "Actualizado DATA_DIR en .env"
}

Write-Host "Listo. Inicia el backend: cd server; npm run dev"