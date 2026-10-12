@echo off
chcp 65001 >nul
set "PATH=C:\Users\Victor\AppData\Local\nvm\v20.20.2;%PATH%"

if "%1"=="list" (
  npx tsx scripts/user-list.ts %2 %3 %4 %5 %6
  goto :eof
)
if "%1"=="add" (
  npx tsx scripts/user-add.ts %2 %3 %4 %5 %6
  goto :eof
)
if "%1"=="edit" (
  npx tsx scripts/user-edit.ts %2 %3 %4 %5 %6
  goto :eof
)
if "%1"=="delete" (
  npx tsx scripts/user-delete.ts %2 %3 %4 %5 %6
  goto :eof
)

:menu
echo.
echo =========================================================
echo   CTFL ACADEMY - GERENCIADOR DE USUARIOS (QA / ADMIN)
echo =========================================================
echo   1. Listar todos os usuarios
echo   2. Adicionar novo usuario (Estudante ou Admin)
echo   3. Editar usuario existente (nome, email, senha, perfil, XP)
echo   4. Excluir usuario (Hard ou Soft delete)
echo   0. Sair
echo =========================================================
set /p opcao="Escolha uma opcao [0-4]: "

if "%opcao%"=="1" (
  call npx tsx scripts/user-list.ts
  goto :menu
)
if "%opcao%"=="2" (
  call npx tsx scripts/user-add.ts
  goto :menu
)
if "%opcao%"=="3" (
  call npx tsx scripts/user-edit.ts
  goto :menu
)
if "%opcao%"=="4" (
  call npx tsx scripts/user-delete.ts
  goto :menu
)
if "%opcao%"=="0" (
  goto :eof
)
goto :menu
