@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Script for Windows
@REM ----------------------------------------------------------------------------
@echo off
setlocal
set DIR=%~dp0
if exist "%DIR%..\apache-maven-3.9.9\bin\mvn.cmd" (
    "%DIR%..\apache-maven-3.9.9\bin\mvn.cmd" %*
) else if exist "%DIR%apache-maven-3.9.9\bin\mvn.cmd" (
    "%DIR%apache-maven-3.9.9\bin\mvn.cmd" %*
) else (
    mvn %*
)
