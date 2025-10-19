# PowerShell Git Helper Script
# This script provides safe Git commands for Windows PowerShell

# Function to safely push to main branch
function Push-Main {
    Write-Host "Checking Git status..." -ForegroundColor Yellow
    git status
    
    Write-Host "`nChecking for sensitive files..." -ForegroundColor Yellow
    $sensitiveFiles = @(
        "firebase-service-account.json",
        ".env",
        ".env.local",
        ".env.production",
        "*.key",
        "*.pem",
        "config.json"
    )
    
    foreach ($file in $sensitiveFiles) {
        if (Test-Path $file) {
            Write-Host "WARNING: Found sensitive file: $file" -ForegroundColor Red
            Write-Host "Please ensure this file is in .gitignore" -ForegroundColor Red
        }
    }
    
    Write-Host "`nAdding all changes..." -ForegroundColor Green
    git add .
    
    Write-Host "`nCommitting changes..." -ForegroundColor Green
    $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    
    git commit -m $commitMessage
    
    Write-Host "`nPushing to origin main..." -ForegroundColor Green
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Push successful!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Push failed. Check the error above." -ForegroundColor Red
    }
}

# Function to safely pull from main branch
function Pull-Main {
    Write-Host "Pulling latest changes from origin main..." -ForegroundColor Green
    git pull origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Pull successful!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Pull failed. Check the error above." -ForegroundColor Red
    }
}

# Function to check Git status
function Git-Status {
    Write-Host "Git Status:" -ForegroundColor Cyan
    git status
    
    Write-Host "`nRecent commits:" -ForegroundColor Cyan
    git log --oneline -5
}

# Function to create a new branch
function New-Branch {
    $branchName = Read-Host "Enter new branch name"
    if (![string]::IsNullOrWhiteSpace($branchName)) {
        git checkout -b $branchName
        Write-Host "✅ Created and switched to branch: $branchName" -ForegroundColor Green
    }
}

# Function to switch branches
function Switch-Branch {
    Write-Host "Available branches:" -ForegroundColor Cyan
    git branch -a
    
    $branchName = Read-Host "Enter branch name to switch to"
    if (![string]::IsNullOrWhiteSpace($branchName)) {
        git checkout $branchName
        Write-Host "✅ Switched to branch: $branchName" -ForegroundColor Green
    }
}

# Main menu
function Show-Menu {
    Write-Host "`n🚀 Git Helper Menu" -ForegroundColor Cyan
    Write-Host "=================" -ForegroundColor Cyan
    Write-Host "1. Push to main branch" -ForegroundColor White
    Write-Host "2. Pull from main branch" -ForegroundColor White
    Write-Host "3. Check Git status" -ForegroundColor White
    Write-Host "4. Create new branch" -ForegroundColor White
    Write-Host "5. Switch branch" -ForegroundColor White
    Write-Host "6. Exit" -ForegroundColor White
    Write-Host ""
}

# Main execution
do {
    Show-Menu
    $choice = Read-Host "Select an option (1-6)"
    
    switch ($choice) {
        "1" { Push-Main }
        "2" { Pull-Main }
        "3" { Git-Status }
        "4" { New-Branch }
        "5" { Switch-Branch }
        "6" { 
            Write-Host "Goodbye! 👋" -ForegroundColor Green
            break 
        }
        default { 
            Write-Host "Invalid option. Please try again." -ForegroundColor Red 
        }
    }
    
    if ($choice -ne "6") {
        Read-Host "`nPress Enter to continue..."
    }
} while ($choice -ne "6")
