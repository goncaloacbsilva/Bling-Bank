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
