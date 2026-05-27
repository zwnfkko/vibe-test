param(
    [Parameter(Mandatory=$true)][string]$Username,
    [Parameter(Mandatory=$true)][string]$Token,
    [string]$RepoName = "vibe-test",
    [string]$Branch = "main",
    [string]$CommitMsg = "update: vibe coding community site"
)

$ErrorActionPreference = "Stop"
$projectPath = "C:\Users\User\ws\vibe-test"

$headers = @{
    "Authorization" = "token $Token"
    "Accept"        = "application/vnd.github.v3+json"
    "User-Agent"    = "PowerShell-GitHubAPI"
}

function Invoke-GH {
    param([string]$Method, [string]$Path, [object]$Body = $null)
    $uri = "https://api.github.com$Path"
    $params = @{ Uri = $uri; Method = $Method; Headers = $headers }
    if ($Body) {
        $params["Body"] = ($Body | ConvertTo-Json -Depth 10 -Compress)
        $params["ContentType"] = "application/json"
    }
    return Invoke-RestMethod @params
}

Write-Host "`n=== GitHub API Push ===" -ForegroundColor Cyan
Write-Host "https://github.com/$Username/$RepoName  (branch: $Branch)"

Write-Host "`n[1/4] Checking repo..." -ForegroundColor Yellow
$parentSha = $null
try {
    $ref = Invoke-GH -Method Get -Path "/repos/$Username/$RepoName/git/ref/heads/$Branch"
    $parentSha = $ref.object.sha
    Write-Host "    Found commit: $($parentSha.Substring(0,7))" -ForegroundColor DarkYellow
} catch {
    Write-Host "    No branch found (first commit)" -ForegroundColor DarkGray
}

Write-Host "`n[2/4] Collecting files..." -ForegroundColor Yellow
$excludeDirs = @("node_modules","dist","dist-ssr",".git")
$files = Get-ChildItem -Path $projectPath -Recurse -File | Where-Object {
    $parts = $_.FullName.Replace("$projectPath\","").Split("\")
    $parts[0] -notin $excludeDirs -and $_.Name -notin @("github-push.ps1", ".env", ".env.local")
}
Write-Host "    Files: $($files.Count)"

Write-Host "`n[3/4] Uploading blobs..." -ForegroundColor Yellow
$treeItems = [System.Collections.Generic.List[object]]::new()
$i = 0
foreach ($file in $files) {
    $i++
    $relPath = $file.FullName.Replace("$projectPath\","").Replace("\","/")
    Write-Host "    [$i/$($files.Count)] $relPath" -ForegroundColor DarkGray
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $b64   = [Convert]::ToBase64String($bytes)
    $blob  = Invoke-GH -Method Post -Path "/repos/$Username/$RepoName/git/blobs" -Body @{ content=$b64; encoding="base64" }
    $treeItems.Add([PSCustomObject]@{ path=$relPath; mode="100644"; type="blob"; sha=$blob.sha })
}

Write-Host "`n[4/4] Tree / Commit / Branch..." -ForegroundColor Yellow
$treeJson = $treeItems | ConvertTo-Json -Depth 5 -Compress
$treeBodyJson = "{`"tree`":$treeJson}"
$treeResult = Invoke-RestMethod -Uri "https://api.github.com/repos/$Username/$RepoName/git/trees" -Method Post -Headers $headers -Body $treeBodyJson -ContentType "application/json"
Write-Host "    Tree: $($treeResult.sha.Substring(0,7))" -ForegroundColor Green

$parents = if ($parentSha) { @($parentSha) } else { @() }
$commit = Invoke-GH -Method Post -Path "/repos/$Username/$RepoName/git/commits" -Body @{ message=$CommitMsg; tree=$treeResult.sha; parents=$parents }
Write-Host "    Commit: $($commit.sha.Substring(0,7))" -ForegroundColor Green

if ($parentSha) {
    Invoke-GH -Method Patch -Path "/repos/$Username/$RepoName/git/refs/heads/$Branch" -Body @{ sha=$commit.sha; force=$true } | Out-Null
    Write-Host "    Branch updated" -ForegroundColor Green
} else {
    Invoke-GH -Method Post -Path "/repos/$Username/$RepoName/git/refs" -Body @{ ref="refs/heads/$Branch"; sha=$commit.sha } | Out-Null
    Write-Host "    Branch created ($Branch)" -ForegroundColor Green
}

Write-Host "`n=============================" -ForegroundColor Green
Write-Host "Done! (커밋 1개)" -ForegroundColor Green
Write-Host "https://github.com/$Username/$RepoName" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Green
