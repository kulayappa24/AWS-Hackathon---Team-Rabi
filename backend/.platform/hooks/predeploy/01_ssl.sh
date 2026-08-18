#!/bin/bash
mkdir -p /etc/pki/tls/certs /etc/pki/tls/private
if [ ! -f /etc/pki/tls/certs/server.crt ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/pki/tls/private/server.key \
        -out /etc/pki/tls/certs/server.crt \
        -subj "/C=IN/ST=AP/O=AWS SBG/CN=*.elasticbeanstalk.com"
    chmod 600 /etc/pki/tls/private/server.key
    chmod 644 /etc/pki/tls/certs/server.crt
fi
