@echo off
title Innate Desktop - Tauri + Vite
echo Starting Innate Desktop...
set "RUST_CARGO_BIN=C:\ServBay\packages\rust\current\cargo\bin"
set "RUST_RUSTC_BIN=C:\ServBay\packages\rust\current\rustc\bin"

if exist "%RUST_CARGO_BIN%\cargo.exe" set "PATH=%RUST_CARGO_BIN%;%PATH%"
if exist "%RUST_RUSTC_BIN%\rustc.exe" set "PATH=%RUST_RUSTC_BIN%;%PATH%"

pushd "%~dp0apps\desktop"
call npm install
node .\node_modules\@tauri-apps\cli\tauri.js dev
popd
pause
