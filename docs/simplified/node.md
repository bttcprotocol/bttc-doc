# 节点部署

## 相关依赖及工具

- Git v2.30.1
- g++
- Go 1.16 +
- Nodejs v11.0
- Rabbitmq(latest stable version)
- Solc v0.5.11^

## 编译安装Delivery和BTTC二进制包

::: tip NOTE
部署需要的创世配置以及节点id等，均放在[launch仓库](https://github.com/bttcprotocol/launch.git)
:::

### clone delivery代码

```sh
git clone https://github.com/bttcprotocol/delivery.git
```

### 安装delivery

```sh
cd delivery
make install
```

::: tip NOTE
当在某些环境下`make install`失败时，请使用`make build`，并将`delivery-start.sh`中的`deliveryd`替换为build文件夹下deliverd的路径。
:::

### clone BTTC代码

```sh
git clone https://github.com/bttcprotocol/bttc
```

### 安装BTTC

```sh
cd bttc
make bttc
```

## 安装bttc-cli脚本

::: tip NOTE
当bttc-cli有更新时，请先卸载本地旧版本，再重新安装最新版本。
:::

```sh
npm uninstall -g bttc-cli
npm install -g @bttcnetwork/bttc-cli
```

### 检查bttc-cli版本

```sh
bttc-cli -V
```

## 部署节点

::: tip NOTE
在哨兵机和验证机上都要运行这一部分。
哨兵节点（全节点）是一个同时运行Delivery节点和Bttc节点的节点，用于从网络上的其他节点下载数据，并在网络上传播验证器数据。
一个哨兵节点（全节点）对网络上所有其他哨兵节点开放。
一个验证器节点只对其哨兵节点开放，而对网络的其他节点关闭。
:::

使用如下命令初始化节点目录：

```sh
bttc-cli setup devnet
```

然后依次填写以下问题，请注意主网和测试网的区别

### BTTC主网 (199)

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
? Please enter TRON grid url https://tronevent.bt.io/
? Please select devnet type remote
? Please enter comma separated hosts/IPs
```


### BTTC测试网（Donau, 1029）

```sh
? Please enter Bttc chain id 1029
? Please enter Delivery chain id delivery-1029
? Please enter Bttc branch or tag master
? Please enter Delivery branch or tag master
? Please enter Contracts branch or tag stake
? Please enter number of validator nodes 0 # number of validator nodes,if you want to deploy only one fullnode, use 0 instead of 1
? Please enter number of non-validator nodes 1 # number of sentry nodes(full node)
? Please enter ETH url https://goerli.infura.io/v3/<YOUR_INFURA_KEY>
? Please enter BSC url https://data-seed-prebsc-1-s1.binance.org:8545/ # or choose from https://docs.binance.org/smart-chain/developer/rpc.html
? Please enter TRON rpc url 47.252.19.181:50051
? Please enter TRON grid url https://test-tronevent.bt.io
? Please select devnet type remote
? Please enter comma separated hosts/IPs
```

运行上述脚本后，会生成如下的node目录

![image](../pics/node/node-dir.png)

::: tip NOTE
在每个 .sh 文件中，请确保 `NODE_DIR` 是正确的。 在这个例子中，`NODE_DIR` 应该是 `/data/bttc/node`。
:::

## sentry节点配置

假设sentry节点的根目录在`/data/bttc/node`。

### 配置delivery sentry节点

#### 节点API_KEY配置

修改delivery-config文件
目录：`/data/bttc/node/deliveryd/config/delivery-config.toml`

**配置说明：**

- eth_rpc_url: 以太坊网络rpc地址。需要自己生成 INFURA_KEY 以便跟以太坊通信。[API_KEY申请教程](https://ethereumico.io/knowledge-base/infura-api-key-guide)

- tron_rpc_url: TRON网络节点的RPC地址。

- tron_grid_url: TRON网络事件服务查询url。

- bsc_rpc_url：BSC网络节点的RPC地址。

**DEMO：**

```conf
vim /data/bttc/node/deliveryd/config/delivery-config.toml
  
eth_rpc_url = "https://goerli.infura.io/v3/<YOUR_INFURA_KEY>"
bsc_rpc_url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
tron_rpc_url = "47.252.19.181:50051"
tron_grid_url = "https://test-tronevent.bt.io"
```

#### 替换创世文件配置

将[genesis-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/sentry/delivery/config/genesis.json)或[genesis-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/sentry/delivery/config/genesis.json)替换至路径：`/data/bttc/node/deliveryd/config/genesis.json`。

#### 添加delivery层的node-id

修改配置文件`/data/bttc/node/deliveryd/config/config.toml`的seeds字段。在[这里](https://github.com/bttcprotocol/launch/tree/master/testnet-1029/sentry/sentry/delivery)查看测试网seed信息，或在[这里](https://github.com/bttcprotocol/launch/tree/master/mainnet-v1/sentry/sentry/delivery)查看主网seed信息。

### 启动Delivery sentry节点

#### 启动delivery

```sh
nohup sh delivery-start.sh>>logs/deliveryd.log 2>&1 &
```

#### 启动后续服务

```sh
nohup sh delivery-server-start.sh>>logs/rest-server.log 2>&1 &
nohup sh delivery-bridge-start.sh>>logs/bridge.log 2>&1 &
```

### 配置BTTC sentry节点

#### 替换BTTC的创世文件

BTTC创世文件路径:`/data/bttc/node/bttc/genesis.json`

将[genesis-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/sentry/bttc/genesis.json)或[genesis-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/sentry/bttc/genesis.json)替换至上述路径。

#### 添加BTTC网络sentry节点的node-id

将[static-nodes-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/sentry/bttc/static-nodes.json)或[static-nodes-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/sentry/bttc/static-nodes.json)替换到`/data/bttc/node/bttc/static-nodes.json`。

### 初始化BTTC sentry节点

```sh
sh bttc-setup.sh
```

### 启动BTTC sentry节点

```sh
nohup sh bttc-start.sh >>logs/bttc-start.log 2>&1 &
```

## validator节点配置

假设validator节点的根目录在`/data/bttc/node`。

### 配置delivery validator节点

#### 节点API_KEY配置

修改delivery-config文件
目录：`/data/bttc/node/deliveryd/config/delivery-config.toml`

**配置说明：**

- eth_rpc_url: 以太坊网络rpc地址。需要自己生成 INFURA_KEY 以便跟以太坊通信。[API_KEY申请教程](https://ethereumico.io/knowledge-base/infura-api-key-guide)

- tron_rpc_url: TRON网络节点的RPC地址。

- tron_grid_url: TRON网络事件服务查询url。

- bsc_rpc_url：BSC网络节点的RPC地址。

**DEMO：**

```conf
vim /data/bttc/node/deliveryd/config/delivery-config.toml
  
eth_rpc_url = "https://goerli.infura.io/v3/<YOUR_INFURA_KEY>"
bsc_rpc_url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
tron_rpc_url = "47.252.19.181:50051"
tron_grid_url = "https://test-tronevent.bt.io"
```

#### 替换创世文件配置

将[genesis-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/validator/delivery/config/genesis.json)或[genesis-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/validator/delivery/config/genesis.json)替换至路径：`/data/bttc/node/deliveryd/config/genesis.json`。

#### 配置config.toml 

修改配置文件`/data/bttc/node/deliveryd/config/config.toml`的seeds字段。
在config.toml中，改变以下内容。

  ##### seeds - 种子节点地址由一个节点ID、一个IP地址和一个端口组成。使用上面配置的哨兵节点的node_id，它可能看起来像:
        seeds="node_id_of_your_sentry_node@ip_of_your_sentry_node:26656"

### 启动Delivery validator节点

#### 启动delivery

```sh
nohup sh delivery-start.sh>>logs/deliveryd.log 2>&1 &
```

#### 启动后续服务

```sh
nohup sh delivery-server-start.sh>>logs/rest-server.log 2>&1 &
nohup sh delivery-bridge-start.sh>>logs/bridge.log 2>&1 &
```

### 配置BTTC validator节点

#### 替换BTTC的创世文件

BTTC创世文件路径:`/data/bttc/node/bttc/genesis.json`

将[genesis-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/validator/bttc/genesis.json)或[genesis-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/validator/bttc/genesis.json)替换至上述路径。

#### 配置static_nodes.json

修改static_nodes.json文件`/data/bttc/node/bttc/static_nodes.json`的种子字段。

在static_nodes.json中，编辑该文件并添加上面配置的bttc哨兵节点信息，看起来像:
     [
      "enode://enode_id_of_your_sentry_node@_of_your_sentry_node:30303"
     ]

    
### 初始化BTTC validator节点

```sh
sh bttc-setup.sh
```

### 启动BTTC validator节点

```sh
nohup sh bttc-start.sh >>logs/bttc-start.log 2>&1 &
```
