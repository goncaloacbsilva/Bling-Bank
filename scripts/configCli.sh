#!/bin/bash

sudo apt install ifupdown
sudo ifconfig eth0 192.168.1.2/24 up
sudo sed -i "/nameserver/d" /etc/resolv.conf
echo "nameserver 8.8.8.8" | sudo tee -a /etc/resolv.conf


