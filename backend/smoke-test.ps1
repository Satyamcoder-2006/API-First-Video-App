$ErrorActionPreference = "Stop"

$base = "http://127.0.0.1:5000"
Write-Host ("Testing " + $base)

$health = Invoke-RestMethod -Method GET -Uri ($base + "/health")
Write-Host ("health: " + ($health | ConvertTo-Json -Compress))

$email = ("test" + [DateTime]::UtcNow.ToString("yyyyMMddHHmmss") + "@example.com")
$signupBody = @{ name = "Test User"; email = $email; password = "password123" } | ConvertTo-Json
$signup = Invoke-RestMethod -Method POST -Uri ($base + "/auth/signup") -ContentType "application/json" -Body $signupBody
Write-Host ("signup: " + ($signup | ConvertTo-Json -Compress))

$token = $signup.token
$hdr = @{ Authorization = ("Bearer " + $token) }

$me = Invoke-RestMethod -Method GET -Uri ($base + "/auth/me") -Headers $hdr
Write-Host ("me: " + ($me | ConvertTo-Json -Compress))

$dash = Invoke-RestMethod -Method GET -Uri ($base + "/dashboard") -Headers $hdr
Write-Host ("dashboard: " + ($dash | ConvertTo-Json -Compress))
if ($dash.Count -ne 2) { throw ("Expected 2 videos, got " + $dash.Count) }

$videoId = $dash[0].id
$play = Invoke-RestMethod -Method GET -Uri ($base + "/video/" + $videoId + "/play") -Headers $hdr
Write-Host ("play: " + ($play | ConvertTo-Json -Compress))
if ($play.embed_url -match "watch\\?v=") { throw "Disallowed watch URL returned" }

$logout = Invoke-RestMethod -Method POST -Uri ($base + "/auth/logout") -Headers $hdr
Write-Host ("logout: " + ($logout | ConvertTo-Json -Compress))

Write-Host "OK: all checks passed."

