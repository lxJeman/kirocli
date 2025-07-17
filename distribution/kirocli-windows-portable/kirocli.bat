@echo off
cd /d "%~dp0\app"
node dist/cli.js %*
