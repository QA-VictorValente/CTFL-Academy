@echo off
set "PATH=C:\Users\Victor\AppData\Local\nvm\v20.20.2;%PATH%"
echo ===================================================================
echo 1/3 - Aplicando as migrations no banco Supabase (prisma migrate deploy)...
echo ===================================================================
call npx prisma migrate deploy
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERRO] Falha ao conectar ou aplicar migrations no Supabase.
  echo Verifique se voce substituiu [YOUR-PASSWORD] pela senha real no arquivo .env!
  exit /b %ERRORLEVEL%
)

echo.
echo ===================================================================
echo 2/3 - Populando o banco Supabase com Capitulos, Aulas, 55 Questoes e Flashcards...
echo ===================================================================
call npm run db:seed

echo.
echo ===================================================================
echo 3/3 - Criando a conta de Administrador (admin@ctfl.local)...
echo ===================================================================
call npm run admin:create

echo.
echo [SUCESSO] Banco Supabase migrado e populado com sucesso!
