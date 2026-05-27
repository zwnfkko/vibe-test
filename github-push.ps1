param(
    [Parameter(Mandatory=$true)][string]$Username,
    [Parameter(Mandatory=$true)][string]$Token,
    [string]$RepoName = "vibe-test",
    [string]$Branch = "main"
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
        $params["ContentType"] = "application/json; charset=utf-8"
    }
    return Invoke-RestMethod @params
}

Write-Host "`n=== GitHub API Push ===" -ForegroundColor Cyan
Write-Host "https://github.com/$Username/$RepoName  (branch: $Branch)"

Write-Host "`n[1/4] Checking repo..." -ForegroundColor Yellow
$parentSha = $null
$baseTreeSha = $null
try {
    $ref = Invoke-GH -Method Get -Path "/repos/$Username/$RepoName/git/ref/heads/$Branch"
    $parentSha  = $ref.object.sha
    $commitInfo = Invoke-GH -Method Get -Path "/repos/$Username/$RepoName/git/commits/$parentSha"
    $baseTreeSha = $commitInfo.tree.sha
    Write-Host "    Found commit: $($parentSha.Substring(0,7))" -ForegroundColor DarkYellow
} catch {
    Write-Host "    No branch found (first commit)" -ForegroundColor DarkGray
}

Write-Host "`n[2/4] Collecting files..." -ForegroundColor Yellow
$excludeDirs = @("node_modules","dist","dist-ssr",".git")
$files = Get-ChildItem -Path $projectPath -Recurse -File | Where-Object {
    $parts = $_.FullName.Replace("$projectPath\","").Split("\")
    $parts[0] -notin $excludeDirs -and $_.Name -ne "github-push.ps1"
}
Write-Host "    Files: $($files.Count)"

Write-Host "`n[3/4] Uploading files..." -ForegroundColor Yellow
$treeItems = @()
$i = 0
foreach ($file in $files) {
    $i++
    $relPath = $file.FullName.Replace("$projectPath\","").Replace("\","/")
    Write-Host "    [$i/$($files.Count)] $relPath" -ForegroundColor DarkGray

    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $b64   = [Convert]::ToBase64String($bytes)

    $blob = Invoke-GH -Method Post -Path "/repos/$Username/$RepoName/git/blobs" -Body @{
        content  = $b64
        encoding = "base64"
    }

    $treeItems += @{
        path = $relPath
        mode = "100644"
        type = "blob"
        sha  = $blob.sha
    }
}

Write-Host "`n[4/4] Tree / Commit / Branch update..." -ForegroundColor Yellow

$treeBody = @{ tree = $treeItems }
if ($baseTreeSha) { $treeBody["base_tree"] = $baseTreeSha }
$tree = Invoke-GH -Method Post -Path "/repos/$Username/$RepoName/git/trees" -Body $treeBody
Write-Host "    Tree: $($tree.sha.Substring(0,7))" -ForegroundColor Green

if ($parentSha) { $parents = @($parentSha) } else { $parents = @() }
$commitMsg = "update: vibe coding community site"
$commitBody = @{
    message = $commitMsg
    tree    = $tree.sha
    parents = $parents
}
$commit = Invoke-GH -Method Post -Path "/repos/$Username/$RepoName/git/commits" -Body $commitBody
Write-Host "    Commit: $($commit.sha.Substring(0,7))" -ForegroundColor Green

if ($parentSha) {
    Invoke-GH -Method Patch -Path "/repos/$Username/$RepoName/git/refs/heads/$Branch" -Body @{
        sha   = $commit.sha
        force = $true
    } | Out-Null
    Write-Host "    Branch updated" -ForegroundColor Green
} else {
    Invoke-GH -Method Post -Path "/repos/$Username/$RepoName/git/refs" -Body @{
        ref = "refs/heads/$Branch"
        sha = $commit.sha
    } | Out-Null
    Write-Host "    Branch created ($Branch)" -ForegroundColor Green
}

Write-Host "`n=============================" -ForegroundColor Green
Write-Host "Done!" -ForegroundColor Green
Write-Host "https://github.com/$Username/$RepoName" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Green
