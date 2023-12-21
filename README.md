# T49 BlingBank Project Read Me

<!-- this is an instruction line; after you follow the instruction, delete the corresponding line. Do the same for all instruction lines! -->

## Team

| Number | Name              | User                             | E-mail                              |
| -------|-------------------|----------------------------------| ------------------------------------|
| 110948  | Renato Custódio     | <https://github.com/Renato-Custodio>   | <mailto:renato.miguel.monteirinho.custodio@tecnico.ulisboa.pt>   |
| 96925  | Gonçalo Silva      | <https://github.com/goncaloacbsilva>     | <mailto:goncalo.c.brito.da.silva@tecnico.ulisboa.pt>     |
| 99113  | Miguel Vale | <https://github.com/MiguelVale2121> | <mailto:miguel.vale@tecnico.ulisboa.pt> |

![Renato](img/renato.jpg) ![Gonçalo](img/96925.png) ![Miguel](img/IMG_99113.jpg)

## Contents

This repository contains documentation and source code for the *Network and Computer Security (SIRS)* project.

The [REPORT](REPORT.md) document provides a detailed overview of the key technical decisions and various components of the implemented project.
It offers insights into the rationale behind these choices, the project's architecture, and the impact of these decisions on the overall functionality and performance of the system.

This document presents installation and demonstration instructions.

## Installation

To see the project in action, it is necessary to setup a virtual environment, with 3 networks and 5 machines.  

The following diagram shows the networks and machines:

![NetworkDiagram](img/network.jpeg)

### Prerequisites

All the virtual machines are based on: Linux 64-bit, Kali 2023.3  

[Download](https://cdimage.kali.org/kali-2023.4/kali-linux-2023.4-installer-amd64.iso) and [install](https://www.kali.org/docs/installation/hard-disk-install/) a virtual machine of Kali Linux 2023.3.  

When using VirtualBox in Windows the Hyper-V has to be **disabled**

### Machine configurations

For each machine, there is an initialization script with prefix `config` and suffix `.sh`, that installs all the necessary packages and makes all required configurations in the a clean machine.

To simplify the setup process we also have a script called `setup.sh` that should be used to configurate all the machines. This script presents the user with several options one for each machine.

Inside the machine from which we make the linked copies, use Git to obtain a copy of all the scripts and code. This way we only need to clone the repository once.

```sh
$ git clone https://github.com/tecnico-sec/t49-goncalo-miguel-renato.git
```

Next we have custom instructions for each machine.

#### Machine 1 (Border Router)

1. Network tab in VirtualBox:

    **Adapter 1:**
    - Attached to: `Internal Network`
    - Name: `dmz`
    - Advanced Settings:
      - Promiscuous Mode: `Allow VMs`

    **Adapter 2:**
    - Attached to: `Internal Network`
    - Name: `outnet`
    - Advanced Settings:
      - Promiscuous Mode: `Allow VMs`

    **Adapter 3:**
    - Attached to: `NAT`

2. Run machine setup:

    ```sh
    $ chmod +x setup.sh
    $ ./setup.sh
    ```
3. Select option `4) Border Router`

#### Machine 2 (Inner Router)

This machine runs the inner router

### To Setup:

1. Network tab in VirtualBox:

    **Adapter 1:**
    - Attached to: `Internal Network`
    - Name: `dmz`
    - Advanced Settings:
      - Promiscuous Mode: `Allow VMs`

    **Adapter 2:**
    - Attached to: Internal Network
    - Name: `db`
    - Advanced Settings:
      - Promiscuous Mode: `Allow VMs`

2. Run machine setup:

    ```sh
    $ chmod +x setup.sh
    $ ./setup.sh ("select the option inner router")
    ```

3. Select option `5) Inner Router`

Sometimes the setup crashes because the network is still being set so the solution is to run the set up again.

#### Machine 3 (Server)

This machine runs the server that runs in nodejs

### To Setup:

1. Shared folders tab in VirtualBox:
  - Add an empty shared folder called Keys and auto-mount it.

2. Network tab in VirtualBox:

    **Adapter 1:**
    - Attached to: `Internal Network`
    - Name: `dmz`
    - Advanced Settings:
      - Promiscuous Mode: `Allow VMs`

    ```sh
    $ chmod +x setup.sh
    $ ./setup.sh ("select the option server")
    ```
3. Select option `5) Inner Router`

> Note: Sometimes the setup crashes because the network is still being set so the solution is to run the set up again.

#### Machine 4 (DataBase)

This machine runs the database which runs in mongo

### To Setup:

1. Network tab in VirtualBox:

    **Adapter 1:**
    - Attached to: `Internal Network`
    - Name: `db`
    - Advanced Settings:
      - Promiscuous Mode: `Allow VMs`

    ```sh
    $ chmod +x setup.sh
    $ ./setup.sh ("select the option database")
    ```

2. Select option `2) Database`

Sometimes the setup crashes because the network is still being set so the solution is to run the set up again.

#### Machine 5 (Client)

This machine runs the client in nodejs.

### To Setup:

1. Shared folders tab in VirtualBox:
  - Add an empty shared folder called Keys and auto-mount it.

2. Network tab in VirtualBox:

    **Adapter 1:**
    - Attached to: `Internal Network`
    - Name: `outNet`
    - Advanced Settings:
      - Promiscuous Mode: `Allow VMs`

    **Adapter 2:**
    - Attached to: `NAT`

    ```sh
    $ chmod +x setup.sh
    $ ./setup.sh ("select the option client")
    ```

3. Select option `1) Client`

Sometimes the setup crashes because the network is still being set so the solution is to run the set up again.

## Demonstration

Now that all the networks and machines are up and running, ...

*(give a tour of the best features of the application; add screenshots when relevant)*


*(IMPORTANT: show evidence of the security mechanisms in action; show message payloads, print relevant messages, perform simulated attacks to show the defenses in action, etc.)*

This concludes the demonstration.

## Additional Information

### Links to Used Tools and Libraries

#### Base stack:
- [NodeJS](https://nodejs.org/)
- [TypeScript](https://typescriptlang.org)

#### Server:
- [Cache Manager](https://www.npmjs.com/package/cache-manager)
- [Class Validator](https://www.npmjs.com/package/class-validator)
- [Class Transformer](https://www.npmjs.com/package/class-transformer)
- [Luxon](https://moment.github.io/luxon/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [NestJS](https://nestjs.com/)

#### Client:
 - [Prompt](https://www.npmjs.com/package/prompts)
 - [Axios](https://www.npmjs.com/package/axios)

#### Iptables:
 - [Nat configuration](https://www.digitalocean.com/community/tutorials/how-to-forward-ports-through-a-linux-gateway-with-iptables)

### Versioning

We use [SemVer](http://semver.org/) for versioning.  

### License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) for details.

----
END OF README