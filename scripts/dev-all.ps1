Param(
  [string]$DataDir = "$env:USERPROFILE\Documents\RunaWay",
  [string]$MasterPassword = 'local_master',
  [switch]$Disable2FA,
  [switch]$ResetAdminOnStart,
  [int]$ApiPort = 3001,
  [int]$FrontendPort = 5173
)

function Get-NodeVersion {
  try { $v = (& node -v) } catch { return $null }
  if ($v -match '^v(\d+)\.(\d+)\.(\d+)') {
    return [version]::new([int]$Matches[1],[int]$Matches[2],[int]$Matches[3])
  }
  return $null
}

function Ensure-EnvVar {
  param([string]$Content, [string]$Key, [string]$Value)
  if ($Content -notmatch "^$Key=") {
    return "$Content`n$Key=$Value"
  } else {
    return ($Content -replace "^$Key=.*$", "$Key=$Value")
  }
}

Write-Host "=== RunaWay: Automatización local ===" -ForegroundColor Cyan

# 0) Verificar versión de Node compatible con frontend y backend
$nv = Get-NodeVersion
if (-not $nv) {
  Write-Error "Node.js no está instalado. Ejecuta .\\scripts\\install-node.ps1 para instalar 20.19.0."; exit 1
}
$min20 = [version]::new(20,19,0)
$min22 = [version]::new(22,12,0)
if (-not (($nv.Major -eq 20 -and $nv -ge $min20) -or ($nv.Major -ge 22 -and $nv -ge $min22))) {
  Write-Warning ("Node {0} detectado. Se requiere 20.19+ o 22.12+." -f $nv)
  Write-Warning "Instala con .\\scripts\\install-node.ps1 y reintenta."; exit 1
}

# 1) Preparar directorio de datos y .env del backend
Write-Host "Creando directorio de datos: $DataDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $DataDir | Out-Null

$envPath = Join-Path 'server' '.env'
if (-Not (Test-Path $envPath)) {
  Copy-Item (Join-Path 'server' '.env.example') $envPath -Force
  Write-Host "Copiado server/.env.example a server/.env" -ForegroundColor Green
}

$envContent = Get-Content $envPath -Raw
$envContent = Ensure-EnvVar -Content $envContent -Key 'DATA_DIR' -Value $DataDir
$envContent = Ensure-EnvVar -Content $envContent -Key 'JWT_SECRET' -Value 'supersecreto_local'
$envContent = Ensure-EnvVar -Content $envContent -Key 'DEFAULT_ADMIN_PASSWORD' -Value 'runaway123'
$envContent = Ensure-EnvVar -Content $envContent -Key 'MASTER_ENABLE' -Value 'true'
$envContent = Ensure-EnvVar -Content $envContent -Key 'MASTER_PASSWORD' -Value $MasterPassword
$origins = "http://localhost:$FrontendPort,http://localhost:5174"
$envContent = Ensure-EnvVar -Content $envContent -Key 'FRONTEND_ORIGIN' -Value $origins
if ($ResetAdminOnStart) { $envContent = Ensure-EnvVar -Content $envContent -Key 'RESET_ADMIN_PASSWORD_ON_START' -Value 'true' }
Set-Content $envPath $envContent
Write-Host "Configurado server/.env" -ForegroundColor Green

# 2) Arrancar backend en ventana separada
Write-Host "Arrancando backend (puerto $ApiPort)..." -ForegroundColor Yellow
$backend = Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","cd server; npm run dev" -PassThru
Start-Sleep -Seconds 2

# 3) Esperar salud del backend
$healthUrl = "http://localhost:$ApiPort/api/auth/health"
Write-Host "Esperando salud: $healthUrl" -ForegroundColor Yellow
for ($i=0; $i -lt 30; $i++) {
  try {
    $h = Invoke-RestMethod -Method GET -Uri $healthUrl -TimeoutSec 3
    if ($h -and $h.status -eq 'ok') { Write-Host "Backend saludable" -ForegroundColor Green; break }
  } catch { Start-Sleep -Milliseconds 500 }
  if ($i -eq 29) { Write-Warning "No se obtuvo salud del backend (revisa la ventana del servidor)" }
}

# 4) Reset admin y opcionalmente desactivar 2FA (protege de 401)
try {
  $uri = "http://localhost:$ApiPort/api/auth/reset-admin"
  $body = @{ master_password = $MasterPassword }
  if ($Disable2FA.IsPresent) { $body.disable_2fa = $true }
  Write-Host "Reset admin en: $uri" -ForegroundColor Yellow
  $resp = Invoke-RestMethod -Method POST -Uri $uri -ContentType 'application/json' -Body ($body | ConvertTo-Json)
  Write-Host "Reset admin: OK" -ForegroundColor Green
} catch {
  Write-Warning "Fallo al resetear admin: $($_.Exception.Message)"
}

# 5) Arrancar frontend en ventana separada y abrir navegador
Write-Host "Arrancando frontend (puerto $FrontendPort)..." -ForegroundColor Yellow
$frontend = Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","cd client; npm run dev" -PassThru
Start-Sleep -Seconds 3
$loginUrl = "http://localhost:$FrontendPort/login"
Write-Host "Abriendo: $loginUrl" -ForegroundColor Yellow
Start-Process $loginUrl | Out-Null

Write-Host "Listo. Credenciales: admin / runaway123" -ForegroundColor Cyan
Write-Host "Si ves 401, repite con -Disable2FA o borra localStorage ('runaway_token')." -ForegroundColor DarkCyan