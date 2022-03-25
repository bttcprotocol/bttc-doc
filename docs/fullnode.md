# FullNode Deployment

This section guides you through starting and running the full node.

For the system requirements, see [Full Node System Requirements](https://doc.bt.io/v1/doc/validator-node-system-requirements.html).

:::tip note

Steps in this guide involve waiting for the Delivery and Bttc services to fully sync. This process takes several hours to complete.


Alternatively, you can use the official maintained snapshot, which will reduce the sync time to a few minutes. For detailed instructions, see Snapshot Instructions for [Delivery and Bttc](https://doc.bt.io/v1/doc/snapshots-instructions.html).

For snapshot download links, see [BTTC Chains Snapshots](https://snapshots.bt.io/).

:::

## Prerequisites

* One machine.
* `build-essential` installed on fullnode machine(optional).

  To install(only required in ubuntu):

  ```sh
  sudo apt-get install build-essential
  ```

* Go 1.17 installed on fullnode machine.

  To install:

  ```sh
  wget https://gist.githubusercontent.com/ssandeep/a6c7197811c83c71e5fead841bab396c/raw/go-install.sh
  bash go-install.sh
  sudo ln -nfs ~/.go/bin/go /usr/bin/go
  ```

## Overview

To get to running a full node, do the following:

1. Have the one machine prepared.
1. Install the Delivery and Bttc binaries on the fullnode machine.
1. Set up the Delivery and Bttc service files on the fullnode machine.
1. Set up the Delivery and Bttc services on the fullnode machine.
1. Configure the full node.
1. Start the full node.
1. Check node health with the community.

:::tip note

You must follow the exact outlined sequence of actions, otherwise you will run into issues.

:::

## Install Binaries

### Install Delivery


Clone the [Delivery repository](https://github.com/bttcprotocol/delivery/):

```sh
git clone https://github.com/bttcprotocol/delivery
```

Check out the correct [release version](https://github.com/bttcprotocol/delivery/releases):

```sh
git checkout RELEASE_TAG
```

where

* RELEASE_TAG — the tag of the release version that you install.

Example:

```sh
git checkout v1.0.0
```

Install Delivery:

```sh
make install
```

Check the installation:

```sh
deliveryd version --long
```

### Install Bttc

Clone the [Bttc repository](https://github.com/bttcprotocol/bttc):

```sh
git clone https://github.com/bttcprotocol/bttc
```

Check out the correct [release version](https://github.com/bttcprotocol/bttc/releases):

```sh
git checkout RELEASE_TAG
```

where

* RELEASE_TAG — the tag of the release version that you install.

Example:

```sh
git checkout v1.0.1
```

Install BTTC:

```sh
make bttc-all
```

Create symlinks:

```sh
sudo ln -nfs ~/bttc/build/bin/bttc /usr/bin/bttc
sudo ln -nfs ~/bttc/build/bin/bootnode /usr/bin/bootnode
```

Check the installation:

```sh
bttc version
```

## Set up node files

### Fetch the launch repository

Clone the [launch repository](https://github.com/bttcprotocol/launch):

```sh
git clone https://github.com/bttcprotocol/launch
```

:::tip note
Choose the correct folder,if you want to join the mainnet,choose mainnet-v1.otherwise,if you want to join the testnet,choose testnet-1029.make sure don't misuse.
:::

### Set up the launch directory

Create a `node` directory:

```sh
mkdir -p node
```

Copy the files and scripts from the `launch` directory to the `node` directory:

```sh
cp -rf launch/mainnet-v1/sentry/sentry/* ~/node
```

### Set up the network directories

#### Set up Delivery

Change to the `node` directory:

```sh
cd ~/node/delivery
```

Run the setup script:

```sh
bash setup.sh
```

#### Set up Bttc

Change to the `node` directory:

```sh
cd ~/node/bttc
```

Run the setup script:

```sh
bash setup.sh
```

## Configure the full node

Login to the remote fullnode machine.

### Configure the Delivery services

Open for editing `vim ~/.deliveryd/config/config.toml`.

In `config.toml`, change the following:

* `moniker` — any name. Example: `moniker = "my-fullnode"`.
* `seeds` — the seed node addresses consisting of a node ID, an IP address, and a port.

  Use the following values from ~/node/delivery/delivery-seeds.txt:

  Example(mainnet):
  ```toml
  seeds="161c2cbe07fccc8c8a3b10ccdea608569a202c06@54.157.35.210:26656,f3f21c82c04003e3c6ee14eb4d11d5dd0b1f201e@107.20.250.182:26656,ed080edbac1a1a285d265e3e87269aea9f6693b7@54.219.27.155:26656,3114d9ebc7254a27de7092b071bd698d250748aa@54.241.235.101:26656"
  ```

  Example(testnet-1029):
  ```toml
  seeds="3f562eed0fcfabc848db5ebed81633e340352c0c@52.53.72.234:26656,65f774fece098327b595c971b507db24356000fd@54.176.105.93:26656,8a8944fcaddb46ff18ec59a3197af1c5763eb824@50.18.50.100:26656,7ece43f437d4dc419bdf9c09604ebed084699779@54.215.2.221:26656"
  ```

* `pex` — set the value to `true` to enable the peer exchange. Example: `pex = true`.
* `prometheus` — set the value to `true` to enable the Prometheus metrics. Example: `prometheus = true`.
* `max_open_connections` — set the value to `100`. Example: `max_open_connections = 100`.

Save the changes in `config.toml`.

Open for editing `vim ~/.deliveryd/config/delivery-config.toml`.

In `delivery-config.toml`, change the following:

* `eth_rpc_url`: Ethereum network rpc address. You need to generate INFURA_KEY yourself in order to communicate with Ethereum. [API_KEY Application Tutorial](https://ethereumico.io/knowledge-base/infura-api-key-guide)

* `tron_rpc_url`: RPC address of TRON network node. choose from [official-public-node](https://developers.tron.network/docs/official-public-node)

* `tron_grid_url`: TRON Network event service query url.

* `bsc_rpc_url`: RPC address of BSC network node.[official-rpc-node](https://docs.binance.org/smart-chain/developer/rpc.html)
  
* `checkpoint_poll_interval`: checkpoint poll interval.please set this param to `30m0s`.

**Example(mainnet):**

```conf
vim ~/.deliveryd/config/delivery-config.toml
  
eth_rpc_url = "https://mainnet.infura.io/v3/<YOUR_INFURA_KEY>" 
bsc_rpc_url = "https://bsc-dataseed.binance.org/" 
tron_rpc_url = "grpc.trongrid.io:50051" 
tron_grid_url = "https://tronevent.bt.io/"
```

**Example(testnet-1029):**

```conf
vim ~/.deliveryd/config/delivery-config.toml
  
eth_rpc_url = "https://goerli.infura.io/v3/<YOUR_INFURA_KEY>" 
bsc_rpc_url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
tron_rpc_url = "47.252.19.181:50051" 
tron_grid_url = "https://test-tronevent.bt.io"
```

### Configure the Bttc Service

Open for editing `vi ~/node/bttc/start.sh`.

In `start.sh`, add the boot node addresses consisting of a node ID, an IP address, and a port by adding the following line at the end:

Example(mainnet):
```config
--bootnodes 
"enode://8ef920be1d44ad7c41a517a6420e43511f2e30d1c35a4bb05954c9f413b1712dae6e9e05f56595966470506891ff05d203e233c2e8f6df8c72621537a3d783e9@54.157.35.210:30303,enode://f3a2534ac30db7387f84c1262bce9a0737c46a8b5627f8193d412a4bde415c191191bbf984f51e04e5d974e62b70fab148f38522c5e2917ca1f1860361f14cc9@107.20.250.182:30303,enode://268cc5c4062b4c30f7ae972322ec119465655d9b3f7220df4614f2890b5cef6ac350d65890f8ecebfe6c5ce0af635f7ae420db84de7677c54b35ed1ce6bb4fbd@54.219.27.155:30303,enode://a9aa7a7ec5b34485c73436d311d86c55f900db4008058231a2fd2fb8ee7ad1b68d7d5a64acbf1f62b8d5f25388b492d16befb686d6146b374a85a6ea7d5a95c9@54.241.235.101:30303"
```

Example(testnet-1029):
```config
--bootnodes "enode://2e6a732ba9d0fcf102a4f4bda7d76f28095c9f03ee56bc89dc5c2235cd527c914b6063b0c76598cc37287f0594ae4022df550c592b3ba2a56a9f02810edbeee1@52.53.72.234:30303,enode://3d7da6d583072fbbe733135047010698e8b6a24c9315ce953b09dddbfabb2476c8b720b2ff2beb2ec73ef111b691c7dcd87f5e42bcba4a7bc385b7f728b2ab44@54.176.105.93:30303"
```

Save the changes in `start.sh`.

### Configure firewall

The full machine must have the following ports open to the world `0.0.0.0/0`:

* 26656- Your Delivery service will connect your node to other nodes Delivery service.

* 30303- Your Bttc service will connect your node to other nodes Bttc service.

* 22- For the fullnode to be able to ssh from wherever he/she is.

## Start the full node

You will first start the Delivery service. Once the Delivery service syncs, you will start the Bttc service.

:::tip note

The Delivery service takes several hours to fully sync from scratch.

:::

### Start the Delivery service

Change to the `~/node/delivery` directory:

```sh
cd ~/node/delivery
```

Start the Delivery service:

```sh
bash delivery-start.sh
```

Start the Delivery rest-server:

```sh
bash delivery-server-start.sh 
```

:::tip note

In the logs, you may see the following errors:

* `Stopping peer for error`
* `MConnection flush failed`
* `use of closed network connection`

These mean that one of the nodes on the network refused a connection to your node. You do not need to do anything with these errors. Wait for your node to crawl more nodes on the network.

:::

Check the sync status of Delivery:

```sh
curl localhost:26657/status
```

In the output, the `catching_up` value is:

* `true` — the Delivery service is syncing.
* `false` — the Delivery service is fully synced.

Wait for the Delivery service to fully sync.

### Start the Bttc service

Once the Delivery service is fully synced, start the Bttc service.

Change to the `~/node/bttc` directory:

```sh
cd ~/node/bttc
```

Start the Bttc service:

```sh
bash start.sh
```
