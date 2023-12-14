#!/bin/bash

#sudo apt install ifupdown
sudo ifconfig eth0 192.168.0.10/24 up
sudo ifconfig eth1 192.168.1.254/24 up
sudo systemctl restart NetworkManager
sudo sysctl net.ipv4.ip_forward=1
sudo iptables -F FORWARD 
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT DROP
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A OUTPUT -p tcp --sport 80 -j ACCEPT
