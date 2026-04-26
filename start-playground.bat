@echo off
title Innate Playground - Tauri + Next.js
echo 🚀 Starting Innate Playground...

:: 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 Node.js，请先安装 https://nodejs.org
    pause
    exit /b 1
)
echo    ✅ Node.js: 
node -v

:: 检查 pnpm
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到 pnpm，请先运行: npm install -g pnpm
    pause
    exit /b 1
)
echo    ✅ pnpm: 
pnpm -v

:: 检查/查找 Cargo
set "CARGO_FOUND=0"
where cargo >nul 2>nul
if %errorlevel% equ 0 (
    set "CARGO_FOUND=1"
) else (
    :: Try common paths
    if exist "C:\Users\%USERNAME%\.cargo\bin\cargo.exe" (
        set "PATH=C:\Users\%USERNAME%\.cargo\bin;%PATH%"
        set "CARGO_FOUND=1"
    )
    if exist "C:\ServBay\packages\rust\current\cargo\bin\cargo.exe" (
        set "PATH=C:\ServBay\packages\rust\current\cargo\bin;%PATH%"
        set "CARGO_FOUND=1"
    )
    if exist "C:\Program Files\Rust stable MSVC 1.x\bin\cargo.exe" (
        set "CARGO_FOUND=1"
    )
)

if %CARGO_FOUND% equ 0 (
    echo.
    echo ⚠️  警告: 未找到 Rust/Cargo
    echo.
    echo    Tauri 桌面应用需要 Rust 来编译后端。
    echo.
    echo    请选择操作:
    echo      1) 自动安装 Rust（推荐）
    echo      2) 仅启动前端（浏览器预览，无桌面窗口）
    echo      3) 退出
    echo.
    set /p choice="   输入选项 [1/2/3]: "

    if "%choice%"=="1" (
        echo.
        echo 🔧 正在安装 Rust...
        where curl >nul 2>nul
        if %errorlevel% equ 0 (
            curl --proto '=https' --tlsv1.2 -sSf https://win.rustup.rs/x86_64 -o %TEMP%\rustup-init.exe
            %TEMP%\rustup-init.exe -y
            set "PATH=C:\Users\%USERNAME%\.cargo\bin;%PATH%"
            echo ✅ Rust 安装完成
        ) else (
            echo ❌ 错误: 未找到 curl，无法自动安装 Rust
            echo    请手动安装: https://rustup.rs
            pause
            exit /b 1
        )
        set "RUN_MODE=tauri"
    ) else if "%choice%"=="2" (
        echo.
        echo 🌐 将以纯前端模式启动（浏览器访问 http://localhost:3001）
        echo.
        set "RUN_MODE=web"
    ) else (
        echo 已退出
        exit /b 0
    )
) else (
    echo    ✅ Cargo: 
    cargo -V
    set "RUN_MODE=tauri"
)

:: Install playground dependencies
pushd "%~dp0playground"
if not exist "node_modules" (
    echo.
    echo 📦 安装 playground 依赖...
    call pnpm install
) else (
    echo    ✅ playground 依赖已安装
)
popd

:: Install desktop app dependencies
pushd "%~dp0playground\apps\desktop"
if not exist "node_modules" (
    echo 📦 安装 desktop app 依赖...
    call pnpm install
) else (
    echo    ✅ desktop app 依赖已安装
)

echo.
if "%RUN_MODE%"=="web" (
    echo 🔧 启动 Next.js 前端开发服务器...
    echo.
    echo    🌐 浏览器访问: http://localhost:3001
    echo    ⚠️  部分 Tauri 功能（如文件系统、终端）在浏览器中不可用
    echo.
    call pnpm dev
) else (
    echo 🔧 启动 Tauri 开发服务器...
    echo.
    echo    🌐 前端: http://localhost:3001
    echo    🖥️  桌面窗口即将打开...
    echo.
    node .\node_modules\@tauri-apps\cli\tauri.js dev
)
popd

pause
