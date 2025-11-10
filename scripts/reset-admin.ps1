param(
  [string]$Uri = 'http://localhost:3001/api/auth/reset-admin',
  [Parameter(Mandatory = $true)][string]$MasterPassword,
  [string]$NewPassword = 'runaway123',
  [bool]$Disable2FA = $true
)

# Script para resetear el admin y opcionalmente desactivar 2FA.
# Uso local:
#   .\scripts\reset-admin.ps1 -MasterPassword 'TU_MASTER' -NewPassword 'runaway123'
# Uso en Render:
#   .\scripts\reset-admin.ps1 -Uri 'https://TU-BACKEND/api/auth/reset-admin' -MasterPassword 'TU_MASTER'

Write-Host "POST $Uri"

$body = @{ master_password = $MasterPassword; disable_2fa = $Disable2FA } | ConvertTo-Json

try {
  $resp = Invoke-RestMethod -Method POST -Uri $Uri -ContentType 'application/json' -Body $body
  Write-Host "Respuesta:" ($resp | ConvertTo-Json)
  Write-Host "Listo. Intenta login con admin / $NewPassword"
} catch {
  Write-Error $_
}