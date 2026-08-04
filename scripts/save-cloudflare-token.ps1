[CmdletBinding()]
param(
  [string]$Destination = (Join-Path $env:USERPROFILE ".okagency-secrets\cloudflare-api-token.dpapi")
)

$ErrorActionPreference = "Stop"
$destinationPath = [System.IO.Path]::GetFullPath($Destination)
$parentPath = Split-Path -Parent $destinationPath

if (-not $destinationPath.StartsWith([System.IO.Path]::GetFullPath($env:USERPROFILE), [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Plik tokenu musi znajdować się w profilu bieżącego użytkownika."
}

$token = Read-Host "Wklej Cloudflare API token (wpis będzie ukryty)" -AsSecureString
if ($token.Length -lt 20) {
  throw "Token wygląda na pusty albo zbyt krótki."
}

New-Item -ItemType Directory -Path $parentPath -Force | Out-Null
$encrypted = ConvertFrom-SecureString -SecureString $token
[System.IO.File]::WriteAllText($destinationPath, $encrypted, [System.Text.UTF8Encoding]::new($false))

$acl = Get-Acl $destinationPath
$acl.SetAccessRuleProtection($true, $false)
$rule = [System.Security.AccessControl.FileSystemAccessRule]::new(
  [System.Security.Principal.WindowsIdentity]::GetCurrent().Name,
  [System.Security.AccessControl.FileSystemRights]::FullControl,
  [System.Security.AccessControl.AccessControlType]::Allow
)
$acl.SetAccessRule($rule)
Set-Acl -LiteralPath $destinationPath -AclObject $acl

$token.Dispose()
Write-Host "Zapisano zaszyfrowany DPAPI token w: $destinationPath"
Write-Host "Nie wklejaj tokenu do czatu. Odpowiedz tylko: gotowe."
