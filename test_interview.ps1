
$ErrorActionPreference = "Stop"

# 1. Register a test user
$registerBody = @{
    email    = "interview_tester_$(Get-Random)@example.com"
    password = "password123"
    name     = "Interview Tester"
} | ConvertTo-Json

Write-Host "Registering user..."
try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/register" -Method POST -Body $registerBody -ContentType "application/json"
    $token = $registerResponse.token
    Write-Host "✅ User registered."
}
catch {
    Write-Error "Registration failed: $($_.Exception.Message)"
}

# 2. Test Interview Feedback API
$interviewBody = @{
    question      = "Explain the difference between a process and a thread."
    answer        = "A process is an executing program with its own memory space, while a thread is a unit of execution within a process that shares memory with other threads."
    targetCompany = "Google"
} | ConvertTo-Json

Write-Host "Calling /interview-feedback endpoint..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/interview-feedback" -Method POST -Body $interviewBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
    
    if ($response.score -and $response.feedback) {
        Write-Host "✅ /interview-feedback SUCCESS!"
        Write-Host "Score: $($response.score)/10"
        Write-Host "Tip: $($response.improvement_tip)"
        Write-Host "Feedback Preview: $($response.feedback)"
    }
    else {
        Write-Error "❌ Invalid response format: $($response | ConvertTo-Json)"
    }
}
catch {
    $ex = $_.Exception
    if ($ex.Response) {
        $reader = New-Object System.IO.StreamReader($ex.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Error "❌ /interview-feedback FAILED: $errorBody"
    }
    else {
        Write-Error "❌ /interview-feedback FAILED: $($ex.Message)"
    }
}
