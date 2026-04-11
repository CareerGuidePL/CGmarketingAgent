#!/bin/sh
# Uruchamiany w kontenerze ngrok/ngrok. Forward do n8n w sieci compose.
# Gdy zespół używa jednej zarezerwowanej domeny *.ngrok-free.dev, ustaw NGROK_PUBLIC_URL
# (https://...) i TEN SAM NGROK_AUTHTOKEN co konto, które tę domenę posiada.
set -e
if [ -n "$NGROK_PUBLIC_URL" ]; then
  exec ngrok http "http://n8n:5678" --url="$NGROK_PUBLIC_URL"
else
  exec ngrok http "http://n8n:5678"
fi
