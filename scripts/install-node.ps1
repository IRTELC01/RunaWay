Param(
  [string]$Version = '20.19.0'
)

Write-Host "=== RunaWay: Instalación de Node.js $Version ===" -ForegroundColor Cyan

function Has-Command($name) { Get-Command $name -ErrorAction SilentlyContinue }

if (Has-Command 'nvm') {
  Write-Host "Usando NVM para Windows" -ForegroundColor Yellow
  try {
    nvm install $Version
    nvm use $Version
    $v = (& node -v)
    Write-Host "Node activo: $v" -ForegroundColor Green
    Write-Host "Si no cambió, cierra y reabre la terminal." -ForegroundColor DarkYellow
    exit 0
  } catch { Write-Warning "NVM falló: $($_.Exception.Message)" }
}

if (Has-Command 'winget') {
  Write-Host "Usando winget para instalar Node LTS $Version" -ForegroundColor Yellow
  try {
    winget install OpenJS.NodeJS.LTS --version $Version --silent --accept-source-agreements --accept-package-agreements
    $v = (& node -v)
    Write-Host "Node instalado: $v" -ForegroundColor Green
    exit 0
  } catch { Write-Warning "winget falló: $($_.Exception.Message)" }
}

Write-Warning "No se encontró NVM ni winget. Instala manualmente Node $Version desde: https://nodejs.org/en/download"
Write-Host "Tras instalar, verifica: node -v (debe ser v$Version o superior compatible)." -ForegroundColor Yellow