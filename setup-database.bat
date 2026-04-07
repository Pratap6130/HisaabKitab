@echo off
SET PGPASSWORD=postgres
set PATH=%PATH%;C:\Program Files\PostgreSQL\18\bin
echo Creating database logiedge_billing...
psql -U postgres -c "CREATE DATABASE logiedge_billing;"
if ERRORLEVEL 1 (
    echo Database creation failed. Check your password.
    pause
    exit /b 1
)
echo ✓ Database created successfully!
echo Loading database schema...
psql -U postgres -d logiedge_billing -f "backend\database\schema.sql"
if ERRORLEVEL 1 (
    echo Schema loading failed.
    pause
    exit /b 1
)
echo ✓ Schema loaded successfully!
echo Verifying installation...
psql -U postgres -d logiedge_billing -c "SELECT COUNT(*) as total_customers FROM customers;"
echo ✓ Database setup complete!
pause
