yes Y | sudo apt-get update
yes Y | sudo apt-get install -y wget git
yes Y | sudo apt install build-essential
yes Y | sudo apt-get install libcap2-bin
yes Y | sudo apt install openssh-server
yes Y | sudo apt install redis-tools stunnel4
sudo systemctl start ssh
sudo ufw allow ssh
curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
sudo apt -y install nodejs
node --version
sudo setcap cap_net_bind_service=+ep /usr/local/bin/node
sudo npm install forever -g
sudo npm i -g ts-node
sudo nano /etc/default/stunnel4
echo '# /etc/default/stunnel
# Julien LEMOINE <speedblue@debian.org>
# September 2003
FILES="/etc/stunnel/*.conf"
OPTIONS=""
# Change to one to enable ppp restart scripts
PPP_RESTART=1
ENABLED=1
# Change to enable the setting of limits on the stunnel instances
# For example, to set a large limit on file descriptors (to enable
# more simultaneous client connections), set RLIMITS="-n 4096"
# More than one resource limit may be modified at the same time,
# e.g. RLIMITS="-n 4096 -d unlimited"
RLIMITS=""' > /etc/default/stunnel4
touch 
echo 'fips = no
setuid = root
setgid = root
pid = /root/pids/stunnel.pid
debug = 7
delay = yes
[redis-cli]
  client = yes
  accept = 127.0.0.1:8000
  connect = 10.159.99.3:6378' | sudo tee /etc/stunnel/stunnel.conf
mkdir ~/.ssh
cd
mkdir pids
sudo chown -R root:root pids/
sudo systemctl restart stunnel4
sudo netstat -plunt | grep stunnel
ps aux | grep stunnel
sudo chmod 700 ~/.ssh
sudo touch ~/.ssh/known_hosts
sudo chmod 600 ~/.ssh/known_hosts
sudo echo "-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACCuBrlqyDw8uyEUQ6WtIL15ctgdCoVr7yLOnmxCIKyNnwAAAJg+7AuKPuwL
igAAAAtzc2gtZWQyNTUxOQAAACCuBrlqyDw8uyEUQ6WtIL15ctgdCoVr7yLOnmxCIKyNnw
AAAEBCgG/GRbHETLNFPKVKC2Gnlfh7/uAHUiBcsxSJU/odtq4GuWrIPDy7IRRDpa0gvXly
2B0KhWvvIs6ebEIgrI2fAAAAEW1ic2FpMjlAZ21haWwuY29tAQIDBA==
-----END OPENSSH PRIVATE KEY-----" | sudo tee ~/.ssh/id_ed25519
sudo chown root ~/.ssh/id_ed25519
sudo chmod 600 ~/.ssh/id_ed25519
sudo echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK4GuWrIPDy7IRRDpa0gvXly2B0KhWvvIs6ebEIgrI2f mbsai29@gmail.com" | sudo tee ~/.ssh/id_ed25519.pub
sudo chown root ~/.ssh/id_ed25519.pub
sudo chmod 777 ~/.ssh/id_ed25519.pub
sudo mkdir divvy
sudo chmod 777 divvy
cd divvy
sudo ssh-keyscan -H github.com >>  ~/.ssh/known_hosts
sudo ssh -o "StrictHostKeyChecking no" -i ~/.ssh/id_ed25519 git@github.com
yes | ssh-agent bash -c 'git clone git@github.com:DivvyBet/solbust-backend.git'
yes | ssh-agent bash -c 'git clone git@github.com:DivvyBet/solbust-socket.git'
sudo npm i -g typescript
echo "export DB_HOST=34.85.47.113
export DB_USER=root
export DB_PWD=1vx5eywxjuyJIkoI
export DB_NAME=bets
export REDIS_HOST=localhost
export REDIS_PORT=8000
export REDIS_PASS=5af1ce0f-e36f-4bc3-a1c2-59a05eb8c777" | sudo tee -a ~/.bashrc
source ~/.bashrc
cd solbust-backend
sudo npm i
forever start -v -c ts-node .
cd ../solbust-socket
sudo npm i 
forever start -v -c ts-node .