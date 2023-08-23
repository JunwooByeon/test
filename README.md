# academyHelper

docker save academyhelper_client > academyhelper_client.tar.gz
docker save academyhelper_api > academyhelper_api.tar.gz
docker save academyhelper_nginx > academyhelper_nginx.tar.gz

docker load < academyhelper_client.tar.gz
docker load < academyhelper_api.tar.gz
docker load < academyhelper_nginx.tar.gz

docker-compose up --build

## ngrok setting
config file location: ngrok config check

C:\Users\phill\AppData\Local\ngrok

version: "2"
authtoken: ""
tunnels:
  firstserver:
    addr: 3000
    proto: http
    host_header: "localhost:3000"
  secondserver:
    addr: 3001
    proto: http
    host_header: "localhost:3001"

run multiple hosts: ngrok start --all