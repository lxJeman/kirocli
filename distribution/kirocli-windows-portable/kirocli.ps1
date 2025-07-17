#!/usr/bin/env pwsh
Set-Location (Join-Path $PSScriptRoot "app")
node dist/cli.js @args
