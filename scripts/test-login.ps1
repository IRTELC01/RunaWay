Param(
  [string]$Api = 'http://localhost:3001/api',
  [string]$Username = 'admin',
  [string]$Password = 'runaway123'
)

Write-Host "Probando login contra: $Api" -ForegroundColor Cyan
$payload = @{ username = $Username; password = $Password } | ConvertTo-Json
try {
  $resp = Invoke-RestMethod -Method POST -Uri "$Api/auth/login" -ContentType 'application/json' -Body $payload
} catch {
  Write-Error "Fallo conexión/login: $($_.Exception.Message)"; exit 1
}

if (-not $resp.token) { Write-Error "Login falló: $($resp | ConvertTo-Json -Compress)"; exit 1 }
Write-Host "Login OK" -ForegroundColor Green

$headers = @{ Authorization = "Bearer $($resp.token)" }
try {
  $inv = Invoke-RestMethod -Method GET -Uri "$Api/invoices" -Headers $headers
  Write-Host "Listado de facturas: OK (${($inv | Measure-Object).Count} items)" -ForegroundColor Green
} catch {
  Write-Warning "No se pudo listar facturas: $($_.Exception.Message)"
}

Write-Host "Prueba completa" -ForegroundColor Green