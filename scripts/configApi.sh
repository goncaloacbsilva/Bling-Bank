#!/bin/bash

sudo apt install ifupdown
sudo ifconfig eth0 192.168.0.100/24 up
sudo ip route add default via 192.168.0.10
sudo systemctl restart NetworkManager
