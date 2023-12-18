#!/bin/bash

# Setup routes

# DMZ
sudo ifconfig eth0 192.168.0.2/24 up
# Database
sudo ifconfig eth1 192.168.2.1/24 up
# Default Gateway (Router)
sudo ip route add default via 192.168.0.1

# Setup DNS

# Clear nameserver entries
sudo sed -i "/nameserver/d" /etc/resolv.conf

# Add 8.8.8.8 entry
echo "nameserver 8.8.8.8" | sudo tee -a /etc/resolv.conf

echo "[Setup server]: Installing NodeJS..."
sudo apt-get install -y nodejs
sudo apt install -y npm

echo "[Setup server]: Installing yarn..."
sudo npm install -g --unsafe-perm yarn

if [ ! -d "~/blingbank" ]; then
	echo "[Setup server]: Creating local project folder..."
	mkdir ~/blingbank
fi

cp -r ../securelib ~/blingbank
cp -r ../server ~/blingbank

echo "[Setup server]: Installing dependencies (securelib)..."
(cd ~/blingbank/securelib; yarn install)

echo "[Setup server]: Installing dependencies (server)..."
(cd ~/blingbank/server; yarn install)

echo "[Setup server]: Building server..."
(cd ~/blingbank/server; yarn build)


# Generate asymmetric keys

mkdir -p ~/.ssh
cd ~/.ssh
if [ ! -f "server_private.pem" ] || [ ! -f "server_public.pem" ]; then
echo "Generating Server Asymmetric Keys..."
openssl genpkey -algorithm RSA -out server_private.pem
openssl rsa -pubout -in server_private.pem -out server_public.pem
else
echo "Asymmetric Keys Already Exist"
fi

#Change keys path in .env
cd ~/blingbank/server
eval NEW_KEYS_PATH="~/.ssh"
sed -i "s|^KEYS_PATH=.*|KEYS_PATH=\"$NEW_KEYS_PATH\"|" ".env"
#Copy server public key to shared folder
echo "Making a copy of server public key..."
cp ~/.ssh/server_public.pem /media/sf_Keys/
