#!/bin/bash

PS3='Run setup for: '
options=("Client" "Database" "Server" "Quit")
select opt in "${options[@]}"
do
    case $opt in
        "Client")
            chmod +x ./setup/configClient.sh
            ./setup/configClient.sh
            ;;
        "Database")
            chmod +x ./setup/configDB.sh
            ./setup/configDB.sh
            ;;
        "Server")
            chmod +x ./setup/configApi.sh
            ./setup/configApi.sh
            ;;
        "Quit")
            break
            ;;
        *) echo "invalid option $REPLY";;
    esac
done
