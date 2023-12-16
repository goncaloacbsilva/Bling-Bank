#!/bin/bash

sudo ifconfig eth0 192.168.0.2/24 up
sudo ifconfig eth1 192.168.2.1/24 up
sudo ip route add default via 192.168.0.1
sudo systemctl restart NetworkManager
