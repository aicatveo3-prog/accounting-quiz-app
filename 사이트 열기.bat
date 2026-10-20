@echo off
chcp 65001 >nul
title 회계 기출 노트 (이 창을 닫으면 사이트가 꺼져요)
cd /d "%~dp0site"
where python >nul 2>nul && (set PY=python) || (set PY=py)
echo.
echo   회계 기출 노트: http://localhost:8765
echo   끄려면 이 창을 닫으세요.
echo.
start "" cmd /c "timeout /t 2 >nul & start http://localhost:8765"
%PY% -m http.server 8765
pause
