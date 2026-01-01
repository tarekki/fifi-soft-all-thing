@echo off
REM =============================================================================
REM Create Self-Signed SSL Certificate (Windows)
REM إنشاء شهادة SSL ذاتية التوقيع (Windows)
REM =============================================================================

cd /d "%~dp0"

REM Check if OpenSSL is available
where openssl >nul 2>&1
if %errorlevel% neq 0 (
    echo OpenSSL not found. Please install OpenSSL or use Docker to generate certificate.
    echo OpenSSL غير موجود. يرجى تثبيت OpenSSL أو استخدام Docker لإنشاء الشهادة.
    exit /b 1
)

REM Generate private key (4096 bits)
openssl genrsa -out key.pem 4096

REM Generate certificate (valid for 365 days)
openssl req -new -x509 -key key.pem -out cert.pem -days 365 ^
    -subj "/C=SY/ST=Damascus/L=Damascus/O=YallaBuy/OU=IT/CN=localhost" ^
    -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

echo SSL certificate created successfully!
echo Certificate: cert.pem
echo Private Key: key.pem
pause

