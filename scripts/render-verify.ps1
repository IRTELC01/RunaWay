Param(
  [Parameter(Mandatory=$true)][string]$BackendUrl,
  [string]$FrontendUrl
)

Write-Host "=== RunaWay: Verificación Render ===" -ForegroundColor Cyan
$health = "$BackendUrl/api/auth/health"
try {
  Write-Host "Health: $health" -ForegroundColor Yellow
  $h = Invoke-RestMethod -Method GET -Uri $health -TimeoutSec 10
  Write-Host ("Salud OK | jwt_present={0} | origins={1}" -f $h.jwt_present, ($h.allowed_frontend_origins -join ',')) -ForegroundColor Green
} catch {
  Write-Error "Health falló: $($_.Exception.Message)"; return
}

# Reset admin y desactivar 2FA en Render
try {
  $reset = "$BackendUrl/api/auth/reset-admin"
  Write-Host "Reset admin: $reset" -ForegroundColor Yellow
  $body = @{ master_password = $env:MASTER_PASSWORD } # usa variable de entorno local si existe
  if (-not $body.master_password) { $body.master_password = 'local_master' }
  $body.disable_2fa = $true
  $r = Invoke-RestMethod -Method POST -Uri $reset -ContentType 'application/json' -Body ($body | ConvertTo-Json)
  Write-Host "Reset admin OK" -ForegroundColor Green
} catch {
  Write-Warning "Fallo reset admin: $($_.Exception.Message)"
}

if ($FrontendUrl) {
  Write-Host "Abriendo login del frontend: $FrontendUrl/login" -ForegroundColor Yellow
  Start-Process "$FrontendUrl/login" | Out-Null
}

Write-Host "Usa admin / runaway123. Si el login falla, borra 'runaway_token' en el Storage del navegador." -ForegroundColor Cyan