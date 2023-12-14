#!/bin/bash

sudo apt install ifupdown
sudo ifconfig eth0 192.168.1.1/24 up
sudo ip route add default via 192.168.1.254
sudo systemctl restart NetworkManager
