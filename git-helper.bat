@echo off
REM Quick Git Commands for Windows
REM This batch file provides safe Git commands

echo.
echo ========================================
echo           Git Helper Commands
echo ========================================
echo.
echo 1. Push to main branch
echo 2. Pull from main branch  
echo 3. Check Git status
echo 4. Add and commit all changes
echo 5. Exit
echo.

set /p choice="Select an option (1-5): "

if "%choice%"=="1" goto push_main
if "%choice%"=="2" goto pull_main
if "%choice%"=="3" goto git_status
if "%choice%"=="4" goto add_commit
if "%choice%"=="5" goto exit
goto invalid

:push_main
echo.
echo Checking Git status...
git status
echo.
echo Pushing to origin main...
git push origin main
if %errorlevel% equ 0 (
    echo.
    echo ✅ Push successful!
) else (
    echo.
    echo ❌ Push failed. Check the error above.
)
goto end

:pull_main
echo.
echo Pulling from origin main...
git pull origin main
if %errorlevel% equ 0 (
    echo.
    echo ✅ Pull successful!
) else (
    echo.
    echo ❌ Pull failed. Check the error above.
)
goto end

:git_status
echo.
echo Git Status:
git status
echo.
echo Recent commits:
git log --oneline -5
goto end

:add_commit
echo.
set /p commit_msg="Enter commit message: "
if "%commit_msg%"=="" set commit_msg=Update: %date% %time%
echo.
echo Adding all changes...
git add .
echo.
echo Committing changes...
git commit -m "%commit_msg%"
if %errorlevel% equ 0 (
    echo.
    echo ✅ Commit successful!
) else (
    echo.
    echo ❌ Commit failed. Check the error above.
)
goto end

:invalid
echo.
echo ❌ Invalid option. Please try again.
goto end

:exit
echo.
echo Goodbye! 👋
goto end

:end
echo.
pause
