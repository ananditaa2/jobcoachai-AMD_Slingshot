
$ErrorActionPreference = "Stop"

# 1. Register a test user
$registerBody = @{
    email = "test_groq_user_$(Get-Random)@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

Write-Host "Registering user..."
try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/register" -Method POST -Body $registerBody -ContentType "application/json"
    $token = $registerResponse.token
    Write-Host "✅ User registered. Token obtained."
} catch {
    Write-Error "Registration failed: $($_.Exception.Message)"
}

# 2. Test Analyze API
$analyzeBody = @{
    resumeText = "Experienced Software Engineer with 5 years in Python and React."
    skills = @("Python", "React", "Node.js")
    company = "Google"
} | ConvertTo-Json

Write-Host "Calling /analyze endpoint..."
try {
    $analyzeResponse = Invoke-RestMethod -Uri "http://localhost:5000/analyze" -Method POST -Body $analyzeBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
    
    if ($analyzeResponse.result) {
        Write-Host "✅ /analyze SUCCESS!"
        Write-Host "Result Preview: $($analyzeResponse.result | ConvertTo-Json -Depth 2)"
    } else {
        Write-Error "❌ /analyze returned no result: $($analyzeResponse | ConvertTo-Json)"
    }
} catch {
    $ex = $_.Exception
    if ($ex.Response) {
        $reader = New-Object System.IO.StreamReader($ex.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Error "❌ /analyze FAILED: $errorBody"
    } else {
        Write-Error "❌ /analyze FAILED: $($ex.Message)"
    }
}
