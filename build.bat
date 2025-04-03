@echo off
setlocal enabledelayedexpansion
echo FiveM Launcher Builder
echo =====================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules" mkdir node_modules

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm is not installed or not in PATH.
    echo Please ensure npm is included with your Node.js installation.
    pause
    exit /b 1
)

echo Cleaning previous installations and temporary files...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del /f /q "package-lock.json"
if exist "build-config.js" del /f /q "build-config.js"

echo Installing dependencies...
call npm install --no-fund --no-audit
if %ERRORLEVEL% neq 0 (
    echo Failed to install dependencies with npm install.
    echo Trying alternative approach...

    call npm install --save fivem-server-api
    call npm install --save-dev electron electron-builder
    if %ERRORLEVEL% neq 0 (
        echo Failed to install essential dependencies.
        echo Please run "npm install" manually and then run this script again.
        pause
        exit /b 1
    )
)

echo Dependencies installed successfully.
echo Reading configuration...

echo Extracting application name from config.json...
set exeName=RPServerLauncher
for /f "tokens=* usebackq" %%a in (`node -e "try { const fs=require('fs'); const configPath='./config.json'; if(!fs.existsSync(configPath)) throw new Error('Config file not found'); const data=fs.readFileSync(configPath,'utf8'); const cleaned=data.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,''); const config=JSON.parse(cleaned); const exeName = config.exeName || 'RPServerLauncher'; console.log(exeName); } catch(e) { console.error('Error reading config:', e.message); console.log('RPServerLauncher'); }"`) do (
    set exeName=%%a
)

echo Using application name: %exeName%
echo Configuring build for %exeName%...
node -e "try { const fs=require('fs'); const packagePath='./package.json'; const packageData=JSON.parse(fs.readFileSync(packagePath,'utf8')); packageData.build.productName='%exeName%'; packageData.build.win.artifactName='%exeName%.exe'; fs.writeFileSync(packagePath, JSON.stringify(packageData,null,2)); console.log('Updated package.json'); } catch(e) { console.error('Error updating package.json:', e.message); process.exit(1); }"
if %ERRORLEVEL% neq 0 (
    echo Failed to update package.json with the executable name.
    echo Using default name: RPServerLauncher
    set exeName=RPServerLauncher
)

echo console.log('Building with product name: %exeName%'); > build-config.js
echo module.exports = { productName: '%exeName%' }; >> build-config.js

node -e "try { const fs=require('fs'); const configPath='./electron-builder-installer.json'; if(fs.existsSync(configPath)) { const configData=JSON.parse(fs.readFileSync(configPath,'utf8')); configData.productName='%exeName%'; configData.nsis = configData.nsis || {}; configData.nsis.artifactName='%exeName%.exe'; fs.writeFileSync(configPath, JSON.stringify(configData,null,2)); console.log('Updated electron-builder-installer.json'); }} catch(e) { console.error('Error updating installer config:', e.message); }"

if not exist "assets\icon.ico" (
    echo Warning: assets\icon.ico not found. Creating a placeholder icon...
    if not exist "assets" mkdir assets

    echo Attempting to create icon from system resources...

    powershell -Command "$shell = New-Object -ComObject WScript.Shell; $lnk = $shell.CreateShortcut('%TEMP%\temp.lnk'); $lnk.TargetPath = '%WINDIR%\System32\notepad.exe'; $lnk.Save(); Copy-Item '%TEMP%\temp.lnk' 'assets\icon.ico'; Remove-Item '%TEMP%\temp.lnk'"

    if not exist "assets\icon.ico" (
        echo Looking for alternate system icons...
        copy "%WINDIR%\System32\imageres.dll,15" "assets\icon.ico" >nul 2>&1
    )

    if not exist "assets\icon.ico" (
        echo Creating basic placeholder icon...
        echo [InternetShortcut] > "assets\icon.ico"
        echo IconIndex=13 >> "assets\icon.ico"
        echo IconFile=%WINDIR%\System32\shell32.dll >> "assets\icon.ico"
    )

    if not exist "assets\icon.ico" (
        echo Failed to create icon. Please add an icon.ico file in the assets folder manually.
        echo The build will continue, but the application may have a default icon.
    ) else (
        echo Icon created successfully.
    )
)

if exist "dist" (
    echo Cleaning previous builds...
    rmdir /s /q "dist"
)

echo Building portable executable (%exeName%.exe)...
set PRODUCT_NAME=%exeName%
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Failed to build portable executable.
    echo The error might be related to missing dependencies or configuration issues.
    echo Try running "npm install electron-builder --save-dev" manually.
    pause
    exit /b 1
)

if exist "build-config.js" (
    echo Cleaning up temporary files...
    del /f /q "build-config.js"
)

echo Checking for executable and renaming if necessary...
if exist "dist\win-unpacked\*.exe" (
    for %%f in ("dist\win-unpacked\*.exe") do (
        if not "%%~nxf"=="%exeName%.exe" (
            echo Renaming "%%f" to "%exeName%.exe"
            ren "dist\win-unpacked\%%~nxf" "%exeName%.exe"
        )
    )
)

if exist "dist\*.exe" (
    for %%f in ("dist\*.exe") do (
        if not "%%~nxf"=="%exeName%.exe" (
            echo Renaming "%%f" to "%exeName%.exe"
            ren "dist\%%~nxf" "%exeName%.exe"
        )
    )
)

echo Creating Source Code package...
mkdir "dist\Source Code" 2>nul

echo Copying source files...
robocopy . "dist\Source Code" /E /XD node_modules dist /NFL /NDL /NJH /NJS /nc /ns /np

echo.
echo Creating ZIP archive...
mkdir "dist\temp_%exeName%" 2>nul

if exist "dist\%exeName%.exe" (
    copy "dist\%exeName%.exe" "dist\temp_%exeName%\"
    set exeExists=1
) else if exist "dist\win-unpacked\%exeName%.exe" (
    copy "dist\win-unpacked\%exeName%.exe" "dist\temp_%exeName%\"
    set exeExists=1
) else (
    set exeExists=0
    echo Warning: Executable file was not found!
)

robocopy "dist\Source Code" "dist\temp_%exeName%\Source Code" /E /NFL /NDL /NJH /NJS /nc /ns /np

where powershell >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Using PowerShell to create ZIP archive...
    powershell -Command "Add-Type -Assembly 'System.IO.Compression.FileSystem'; [System.IO.Compression.ZipFile]::CreateFromDirectory('dist\temp_%exeName%', 'dist\%exeName%.zip')"
    if %ERRORLEVEL% neq 0 (
        echo PowerShell zip creation failed. Trying alternative method...
        powershell -Command "Compress-Archive -Path 'dist\temp_%exeName%\*' -DestinationPath 'dist\%exeName%.zip' -Force"
    )
) else (
    echo PowerShell not available. Creating file list for ZIP...
    pushd "dist\temp_%exeName%"
    dir /b /s /a:-D > ..\filelist.txt
    popd

    echo Looking for zip utilities...
    where 7z >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        echo Using 7-Zip to create archive...
        7z a -tzip "dist\%exeName%.zip" @dist\filelist.txt
    ) else (
        echo No built-in zip utilities found. Simply keeping files in dist folder.
        echo ZIP creation skipped. Please manually zip the files if needed.
    )

    if exist "dist\filelist.txt" del /f /q "dist\filelist.txt"
)

if exist "dist\temp_%exeName%" rmdir /s /q "dist\temp_%exeName%"

echo.
echo Build process completed!
echo.

if exist "dist\%exeName%.zip" (
    echo ZIP archive created: dist\%exeName%.zip
    echo The ZIP file contains:
    if %exeExists%==1 echo - %exeName%.exe (Portable app)
    echo - Source Code folder (Source code package)
) else (
    echo Files created:
    if %exeExists%==1 (
        if exist "dist\%exeName%.exe" (
            echo - dist\%exeName%.exe (Portable app)
        )
        echo - dist\Source Code\ (Source code package)
    ) else (
        echo - Executable not found! Build might have failed.
    )
)

echo.
echo The dist folder contains all distribution files.
echo Please distribute the ZIP file to your users.
echo.
pause
