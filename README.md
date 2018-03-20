# sbanken-prometheus
Prometheus exporter for SBanken

Usage with docker:

    sudo docker run -d \
    -p 12900:12900 \
    --name promSbanken \
    -e apiKey=[API key] \
    -e secret=[api password] \
    -e userID=[personnummer] \
    danielvestol/sbanken-prometheus
	
Replace parts with [] with your own values.

Your API key and API password is accessible by sbanken's utviklerportal. To get there, navigate to:

  * Profile icon
  * Select "account settings"
  * Beta features
  * Utviklerportal in the top right corner

