param([string]$Token)

$headers = @{
    "Authorization" = "token $Token"
    "Accept"        = "application/vnd.github.v3+json"
    "User-Agent"    = "PowerShell"
}

$repo        = "zwnfkko/vibe-test"
$distPath    = "C:\Users\User\ws\vibe-test\dist"
$baseUrl     = "https://api.github.com"
$branch      = "gh-pages"

function Invoke-GHGet {
    param([string]$Path)
    try {
        return Invoke-RestMethod -Uri "$baseUrl$Path" -Method Get -Headers $headers
    } catch { return $null }
}

function Invoke-GHPut {
    param([string]$Path, [hashtable]$Body)
    $json = $Body | ConvertTo-Json -Compress -Depth 5
    try {
        Invoke-RestMethod -Uri "$baseUrl$Path" -Method Put -Headers $headers -Body $json -ContentType "application/json; charset=utf-8" | Out-Null
        return $true
    } catch {
        Write-Host "  ERROR: $_" -ForegroundColor Red
        return $false
    }
}

# dist 파일 목록 수집
$files = Get-ChildItem -Path $distPath -Recurse -File
Write-Host "Deploying $($files.Count) files to gh-pages..." -ForegroundColor Cyan

$ok = 0
$fail = 0
foreach ($file in $files) {
    $rel     = $file.FullName.Replace("$distPath\", "").Replace("\", "/")
    $apiPath = "/repos/$repo/contents/$rel"

    # 현재 SHA 조회
    $existing = Invoke-GHGet -Path "${apiPath}?ref=${branch}"
    $fileSha  = if ($existing) { $existing.sha } else { $null }

    $b64  = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($file.FullName))
    $body = @{ message = "deploy: $rel"; content = $b64; branch = $branch }
    if ($fileSha) { $body["sha"] = $fileSha }

    Write-Host "  $rel" -ForegroundColor DarkGray
    $result = Invoke-GHPut -Path $apiPath -Body $body
    if ($result) { $ok++ } else { $fail++ }
}

Write-Host "`nDone: $ok OK, $fail failed" -ForegroundColor Green
Write-Host "https://zwnfkko.github.io/vibe-test/" -ForegroundColor Cyan
