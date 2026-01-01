#!/bin/sh
# =============================================================================
# Generate Self-Signed SSL Certificate
# إنشاء شهادة SSL ذاتية التوقيع
# =============================================================================
# For development/testing only
# للاختبار والتطوير فقط

# Create certificate directory if it doesn't exist
mkdir -p /etc/nginx/ssl

# Generate private key
openssl genrsa -out /etc/nginx/ssl/key.pem 4096

# Generate certificate signing request
openssl req -new -key /etc/nginx/ssl/key.pem -out /etc/nginx/ssl/cert.csr \
    -subj "/C=SY/ST=Damascus/L=Damascus/O=YallaBuy/OU=IT/CN=localhost"

# Generate self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in /etc/nginx/ssl/cert.csr \
    -signkey /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -extensions v3_req \
    -extfile <(echo "[v3_req]"; echo "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:::1")

# Set proper permissions
chmod 600 /etc/nginx/ssl/key.pem
chmod 644 /etc/nginx/ssl/cert.pem

# Clean up CSR
rm /etc/nginx/ssl/cert.csr

echo "SSL certificate generated successfully!"
echo "Certificate: /etc/nginx/ssl/cert.pem"
echo "Private Key: /etc/nginx/ssl/key.pem"

