#!/bin/sh
# =============================================================================
# Create Self-Signed SSL Certificate
# إنشاء شهادة SSL ذاتية التوقيع
# =============================================================================

cd /etc/nginx/ssl

# Generate private key (4096 bits for security)
openssl genrsa -out key.pem 4096

# Generate certificate (valid for 365 days)
openssl req -new -x509 -key key.pem -out cert.pem -days 365 \
    -subj "/C=SY/ST=Damascus/L=Damascus/O=YallaBuy/OU=IT/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:::1"

# Set proper permissions
chmod 600 key.pem
chmod 644 cert.pem

echo "SSL certificate created successfully!"
echo "Certificate: /etc/nginx/ssl/cert.pem"
echo "Private Key: /etc/nginx/ssl/key.pem"

