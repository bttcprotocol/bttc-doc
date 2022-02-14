# Node Deployment

## Dependencies and Tools

- Git v2.30.1
- g++
- Go 1.16 +
- Nodejs v11.0
- Rabbitmq(latest stable version)
- Solc v0.5.11^

## Compile & Install Delivery and BTTC Binary Packages

::: tip NOTE
The genesis configuration and node id needed for deployment are all placed in [launch](https://github.com/bttcprotocol/launch.git)
:::

### Clone Delivery Code

```sh
git clone https://github.com/bttcprotocol/delivery.git
```

### Install Delivery

```sh
cd delivery
make install
```

::: tip NOTE
When `make install` fails in some environments, please use `make build` and replace `deliveryd` in `delivery-start.sh` with the delivered path under the build folder.
:::

### Clone BTTC Code

```sh
git clone https://github.com/bttcprotocol/bttc
```

### Install BTTC

```sh
cd bttc
make bttc
```

## Install bttc-cli Script

::: tip NOTE
When bttc-cli is updated, please uninstall the local old version first, and then reinstall the latest version.
:::

```sh
npm uninstall -g bttc-cli
npm install -g @bttcnetwork/bttc-cli
```

### Check bttc-cli Version

```sh
bttc-cli -V
```


## Deploy Node

::: tip NOTE
Run this section both on the sentry and the validator machines.
A sentry node(full node) is a node running both the Delivery node and the BTTC node to download the data from other nodes on the network and to propagate the validator data on the network.
A sentry node(full node) is open to all other sentry nodes on the network.
A validator node is only open to its sentry node and closed to the rest of the network.
:::

Use the following command to initialize the node directory:

```sh
bttc-cli setup devnet
```

Then fill in the following questions one by one, please pay attention to the difference between the main network and the test network

### BTTC Main Net (199)

```sh
? Please enter Bttc chain id 199
? Please enter Delivery chain id delivery-199
? Please enter Bttc branch or tag master
? Please enter Delivery branch or tag master
? Please enter Contracts branch or tag stake
? Please enter number of validator nodes 1 # number of validator nodes,if you want to deploy only one fullnode, use 0 instead of 1
? Please enter number of non-validator nodes 1 # number of sentry nodes(full node)
? Please enter ETH url https://mainnet.infura.io/v3/<YOUR_INFURA_KEY>
? Please enter BSC url https://bsc-dataseed.binance.org/ # or choose from https://docs.binance.org/smart-chain/developer/rpc.html
? Please enter TRON rpc url grpc.trongrid.io:50051
? Please enter TRON grid url  https://tronevent.bt.io/
? Please select devnet type remote
? Please enter comma separated hosts/IPs
```

### BTTC Test Net (Donau, 1029)

```sh
? Please enter Bttc chain id 1029
? Please enter Delivery chain id delivery-1029
? Please enter Bttc branch or tag master
? Please enter Delivery branch or tag master
? Please enter Contracts branch or tag stake
? Please enter number of validator nodes 1 # number of validator nodes,if you want to deploy only one fullnode, use 0 instead of 1
? Please enter number of non-validator nodes 1 # number of sentry nodes(full node)
? Please enter ETH url https://goerli.infura.io/v3/<YOUR_INFURA_KEY>
? Please enter BSC url https://data-seed-prebsc-1-s1.binance.org:8545/ # or choose from https://docs.binance.org/smart-chain/developer/rpc.html
? Please enter TRON rpc url 47.252.19.181:50051
? Please enter TRON grid url https://test-tronevent.bt.io
? Please select devnet type remote
? Please enter comma separated hosts/IPs
```

After running the above script, the following node directory will be generated

![image](./pics/node/node-dir.png)

::: tip NOTE
In each .sh file, please ensure `NODE_DIR` is correct. In this example, `NODE_DIR` should be `/data/bttc/node`.
:::

## Configure the sentry node

Assume that the root directory of the sentry node is in `/data/bttc/node`.

### Configure the Delivery sentry Node

#### Node API_KEY Configuration

Modify the delivery-config file
Directory: `/data/bttc/node/deliveryd/config/delivery-config.toml`

**Configuration instructions:**

- eth_rpc_url: Ethereum network rpc address. You need to generate INFURA_KEY yourself in order to communicate with Ethereum. [API_KEY Application Tutorial](https://ethereumico.io/knowledge-base/infura-api-key-guide)

- tron_rpc_url: RPC address of TRON network node.

- tron_grid_url: TRON Network event service query url.

- bsc_rpc_url: RPC address of BSC network node.

**DEMO:**

```conf
vim /data/bttc/node/deliveryd/config/delivery-config.toml
  
eth_rpc_url = "https://goerli.infura.io/v3/<YOUR_INFURA_KEY>"
bsc_rpc_url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
tron_rpc_url = "47.252.19.181:50051"
tron_grid_url = "https://test-tronevent.bt.io"
```

#### Replace Genesis file Configuration

Replace delivery-genesis.json in [genesis-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/sentry/delivery/config/genesis.json) or [genesis-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/sentry/delivery/config/genesis.json) with the path: `/data/bttc/node/deliveryd/config/genesis.json`.

#### Add node-ids of the Delivery Layer

Modify the seeds field of the configuration file `/data/bttc/node/deliveryd/config/config.toml`. See the seed information in [here](https://github.com/bttcprotocol/launch/tree/master/testnet-1029/sentry/sentry/delivery) for testnet or [here](https://github.com/bttcprotocol/launch/tree/master/mainnet-v1/sentry/sentry/delivery) for mainnet.

### Start the Delivery sentry node

#### Start Delivery

```sh
nohup sh delivery-start.sh>>logs/deliveryd.log 2>&1 &
```

#### Start Follow-up Service

```sh
nohup sh delivery-server-start.sh>>logs/rest-server.log 2>&1 &
nohup sh delivery-bridge-start.sh>>logs/bridge.log 2>&1 &
```

### Configure BTTC sentry Node

#### Replace BTTC's Genesis File

BTTC genesis file path: `/data/bttc/node/bttc/genesis.json`

Replace `bttc-genesis.json` in [genesis-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/sentry/bttc/genesis.json) or [genesis-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/sentry/bttc/genesis.json) with the above path.

#### Add node-ids of BTTC Seed Nodes

Replace `static-nodes.json` in [static-nodes-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/sentry/bttc/static-nodes.json) or [static-nodes-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/sentry/bttc/static-nodes.json) with `/data/bttc/node/bttc/static-nodes.json`.

### Initialize the BTTC sentry Node

```sh
sh bttc-setup.sh
```

### Start BTTC sentry Node

```sh
nohup sh bttc-start.sh >>logs/bttc-start.log 2>&1 &
```

## Configure the validator node

Assume that the root directory of the node is in `/data/bttc/node`.

### Configure the Delivery validator Node

#### Node API_KEY Configuration

Modify the delivery-config file
Directory: `/data/bttc/node/deliveryd/config/delivery-config.toml`

**Configuration instructions:**

- eth_rpc_url: Ethereum network rpc address. You need to generate INFURA_KEY yourself in order to communicate with Ethereum. [API_KEY Application Tutorial](https://ethereumico.io/knowledge-base/infura-api-key-guide)

- tron_rpc_url: RPC address of TRON network node.

- tron_grid_url: TRON Network event service query url.

- bsc_rpc_url: RPC address of BSC network node.

**DEMO:**

```conf
vim /data/bttc/node/deliveryd/config/delivery-config.toml
  
eth_rpc_url = "https://goerli.infura.io/v3/<YOUR_INFURA_KEY>"
bsc_rpc_url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
tron_rpc_url = "47.252.19.181:50051"
tron_grid_url = "https://test-tronevent.bt.io"
```

#### Replace Genesis file Configuration

Replace delivery-genesis.json in [genesis-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/validator/delivery/config/genesis.json) or [genesis-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/validator/delivery/config/genesis.json) with the path: `/data/bttc/node/deliveryd/config/genesis.json`.

#### Configure the config.toml 

Modify the seeds field of the configuration file `/data/bttc/node/deliveryd/config/config.toml`. 

In config.toml, change the following:

**seeds — the seed node addresses consisting of a node ID, an IP address, and a port.Use the node value of the sentry node which configured above,which may look like: `seeds="node_id_of_your_sentry_node@ip_of_your_sentry_node:26656"`**

### Start the Delivery validator node

#### Start Delivery 

```sh
nohup sh delivery-start.sh>>logs/deliveryd.log 2>&1 &
```

#### Start Other Delivery Service

```sh
nohup sh delivery-server-start.sh>>logs/rest-server.log 2>&1 &
nohup sh delivery-bridge-start.sh>>logs/bridge.log 2>&1 &
```

### Configure BTTC validator Node

#### Replace BTTC's Genesis File

BTTC genesis file path: `/data/bttc/node/bttc/genesis.json`

Replace `bttc-genesis.json` in [genesis-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/validator/bttc/genesis.json) or [genesis-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/validator/bttc/genesis.json) with the above path.

#### Configure the static_nodes.json

Modify the seeds field of the static_nodes.json file `/data/bttc/node/bttc/static_nodes.json`. 

In static_nodes.json, edit this file and add the bttc sentry node info which configured above,which may look like `enode://enode_id_of_your_sentry_node@_of_your_sentry_node:30303`

### Initialize the BTTC validator Node

```sh
sh bttc-setup.sh
```

### Start BTTC validator Node

```sh
nohup sh bttc-start.sh >>logs/bttc-start.log 2>&1 &
```
