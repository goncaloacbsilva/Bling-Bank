#!/bin/bash

sudo ifconfig eth0 192.168.0.1/24 up

sudo ifconfig eth1 192.168.1.1/24 up

sudo sysctl net.ipv4.ip_forward=1

sudo sed -i "/nameserver/d" /etc/resolv.conf

echo "nameserver 8.8.8.8" | sudo tee -a /etc/resolv.conf

sudo iptables -F

sudo iptables -F -t nat

sudo iptables -t nat -A PREROUTING -i eth1 -p tcp --dport 80 -j DNAT --to-destination 192.168.0.2

sudo iptables -t nat -A POSTROUTING  -o eth2 -j MASQUERADE

sudo iptables -t nat -A POSTROUTING -o eth0 -p tcp --dport 80 -d 192.168.0.2 -j SNAT --to-source 192.168.0.1

sudo iptables -A FORWARD -i eth1 -o eth0 -p tcp --syn --dport 80 -m conntrack --ctstate NEW -j ACCEPT

sudo iptables -A FORWARD -i eth1 -o eth0 -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

sudo iptables -A FORWARD -i eth0 -o eth1 -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

sudo iptables -P FORWARD DROP

#sudo iptables -P INPUT DROP

#sudo iptables -P OUTPUT DROP
