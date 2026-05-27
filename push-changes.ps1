param([string]$Token)

$headers = @{
    "Authorization" = "token $Token"
    "Accept"        = "application/vnd.github.v3+json"
    "User-Agent"    = "PowerShell"
}

$repo        = "zwnfkko/vibe-test"
$projectPath = "C:\Users\User\ws\vibe-test"
$baseUrl     = "https://api.github.com"

$changedFiles = @(
    "src/components/layout/Footer.tsx",
    "src/components/layout/Navbar.tsx",
    "src/config/site.ts",
    "src/pages/Home.tsx",
    "github-push.ps1",
    ".github/workflows/deploy.yml"
)

foreach ($rel in $changedFiles) {
    $apiPath = $rel.Replace("\", "/")
    $full    = Join-Path $projectPath $rel

    Write-Host "Updating: $apiPath" -ForegroundColor Cyan

    # 현재 파일 SHA 조회 (업데이트에 필요)
    $getUrl  = "$baseUrl/repos/$repo/contents/$apiPath"
    try {
        $existing = Invoke-RestMethod -Uri $getUrl -Method Get -Headers $headers
        $fileSha  = $existing.sha
    } catch {
        $fileSha = $null
    }

    $b64     = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($full))
    $body    = @{ message = "update: $apiPath"; content = $b64 }
    if ($fileSha) { $body["sha"] = $fileSha }

    $bodyJson = $body | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri $getUrl -Method Put -Headers $headers -Body $bodyJson -ContentType "application/json; charset=utf-8" | Out-Null
    Write-Host "  OK" -ForegroundColor Green
}

Write-Host "`nAll files pushed!" -ForegroundColor Green
Write-Host "https://github.com/$repo" -ForegroundColor Cyan
Write-Host "GitHub Actions will now build and deploy automatically."
