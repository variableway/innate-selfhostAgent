@echo off
title Innate Playground - Tauri + Next.js
echo Starting Innate Playground...
set "RUST_CARGO_BIN=C:\ServBay\packages\rust\current\cargo\bin"
set "RUST_RUSTC_BIN=C:\ServBay\packages\rust\current\rustc\bin"

if exist "%RUST_CARGO_BIN%\cargo.exe" set "PATH=%RUST_CARGO_BIN%;%PATH%"
if exist "%RUST_RUSTC_BIN%\rustc.exe" set "PATH=%RUST_RUSTC_BIN%;%PATH%"

pushd "%~dp0playground"
call pnpm install
popd
pushd "%~dp0playground\apps\desktop"
node .\node_modules\@tauri-apps\cli\tauri.js dev
popd
pause
