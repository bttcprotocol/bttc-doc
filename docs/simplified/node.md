# 节点部署

本节旨在介绍如何从二进制文件启动并运行验证者节点。

如需了解系统要求，请参阅 [验证者节点系统要求](https://doc.bt.io/v1/doc/validator-node-system-requirements).

:::注意

按本节提示操作的过程中，您需要等待 Delivery 服务和 BTTC 服务完全同步， 整个过程约需几个小时。

验证者名额有限， 只有当现任活跃验证者解绑后新验证者才能加入活跃验证者集合。
:::

## 前置要求

* 两台机器——一台哨兵节点和一台验证者节点。
* 在哨兵节点和验证者节点设备上均安装`build-essential` (可选).

  安装（仅 Ubuntu 系统需要安装）:

  ```sh
  sudo apt-get install build-essential
  ```

* 在哨兵节点和验证者节点设备上均安装Go 1.17.

  安装:

  ```sh
  wget https://gist.githubusercontent.com/ssandeep/a6c7197811c83c71e5fead841bab396c/raw/go-install.sh
  bash go-install.sh
  sudo ln -nfs ~/.go/bin/go /usr/bin/go
  ```

* 在哨兵节点和验证者节点设备上均安装 RabbitMQ。 查看[下载和安装 RabbitMQ](https://www.rabbitmq.com/download.html).

## 概览

请执行以下操作以运行验证者节点:

1. 准备两台设备.
1. 在哨兵节点和验证者节点设备上安装 Delivery 二进制文件和 BTTC 二进制文件.
1. 在哨兵节点和验证者节点设备上设置好 Delivery 服务文件和 BTTC 服务文件.
1. 在哨兵节点和验证者节点设备上设置好 Delivery 服务和 BTTC 服务.
1. 配置哨兵节点.
1. 启动哨兵节点.
1. 配置验证者节点.
1. 设置所有者密钥和签名者密钥.
1. 启动验证者节点.
1. 与社区共同检查节点健康状态.

:::备注

请严格遵守上述操作顺序，否则将会出错。

例如，必须先设置哨兵节点，然后再设置验证者节点。

:::

## 安装二进制文件

:::备注

在哨兵节点和验证者节点上运行此部分。

:::

### 安装 Delivery


克隆 [Delivery 仓库](https://github.com/bttcprotocol/delivery/):

```sh
git clone https://github.com/bttcprotocol/delivery
```

检出正确的 [发布版本](https://github.com/bttcprotocol/delivery/releases):

```sh
git checkout RELEASE_TAG
```

其中

* RELEASE_TAG — 即为您安装的发布版本标签。

例:

```sh
git checkout v1.0.0
```

安装 Delivery:

```sh
make install
```

检查安装:

```sh
deliveryd version --long
```

### 安装  Bttc

克隆 the [Bttc 仓库](https://github.com/bttcprotocol/bttc):

```sh
git clone https://github.com/bttcprotocol/bttc
```

检出正确的[发布版本 ](https://github.com/bttcprotocol/bttc/releases):

```sh
git checkout RELEASE_TAG
```

其中

* RELEASE_TAG — 即为您安装的发布版本标签.

例:

```sh
git checkout v1.0.1
```

安装 Bttc:

```sh
make bttc-all
```

创建符号链接:

```sh
sudo ln -nfs ~/bttc/build/bin/bttc /usr/bin/bttc
sudo ln -nfs ~/bttc/build/bin/bootnode /usr/bin/bootnode
```

检查安装:

```sh
bttc version
```

## 设置节点文件

:::note

在哨兵节点和验证者节点上运行此部分。

:::

### 获取launch仓库

克隆 [launch 仓库](https://github.com/bttcprotocol/launch):

```sh
git clone https://github.com/bttcprotocol/launch
```
:::note 
选择正确的文件夹。如要接入主网，请选择 mainnet-v1；如要接入测试网，请选择 testnet-1029。请确保选择无误。
:::

### 设置启动目录

#### 在哨兵节点上

创建 `node` 目录:

```sh
mkdir -p node
```

将文件和脚本从`launch`目录复制到`node`目录:

```sh
cp -rf launch/mainnet-v1/sentry/sentry/* ~/node
```

#### 在验证者节点上

创建 `node` 目录:

```sh
mkdir -p node
```

将文件和脚本从`launch`目录复制到`node`目录:

```sh
cp -rf launch/mainnet-v1/sentry/validator/* ~/node
```

### 设置网络目录

:::note

在哨兵节点和验证者节点上运行此部分。

:::

#### 设置 Delivery

切换至`node`目录:

```sh
cd ~/node/delivery
```

运行设置脚本:

```sh
bash setup.sh
```

#### 设置 Bttc

切换至`node`目录:

```sh
cd ~/node/bttc
```

运行设置脚本:

```sh
bash setup.sh
```

## 配置哨兵节点

登录远程哨兵节点。

### 配置 Delivery 服务

打开编辑  `vim ~/.deliveryd/config/config.toml`.

在 `config.toml`,  中修改如下内容:

* `moniker` — 任何名称。 示例: `moniker = "my-sentry-node"`.
* `seeds` — seed 节点地址由节点ID、IP 地址、端口三部分组成.

  使用以下来自 ~/node/delivery/delivery-seeds.txt的值:

  ```toml
  seeds="161c2cbe07fccc8c8a3b10ccdea608569a202c06@54.157.35.210:26656,f3f21c82c04003e3c6ee14eb4d11d5dd0b1f201e@107.20.250.182:26656,ed080edbac1a1a285d265e3e87269aea9f6693b7@54.219.27.155:26656,3114d9ebc7254a27de7092b071bd698d250748aa@54.241.235.101:26656"
  ```

* `pex` — 将值设置为 true，开启 PEX。 示例: `pex = true`.
* `private_peer_ids` — 在验证者节点设置的 Delivery 节点 ID.

  在验证者节点上获取 Delivery 节点 ID:

  1. 登录验证者节点.
  1. 运行 `deliveryd tendermint show-node-id`.

  示例: `private_peer_ids = "e2c6a611e449b61f2266f0054a315fad6ce607ba"`.

* `prometheus` — 将值设置为 true，启用 Prometheus 指标。 示例: `prometheus = true`.
* `max_open_connections` — 将值设置为 `100`。 示例 : `max_open_connections = 100`.

在 config.toml 中保存更改.


打开编辑 `vim ~/.deliveryd/config/delivery-config.toml`.

在 `delivery-config.toml`, 中修改如下内容:

* `eth_rpc_url`: 以太坊网络 RPC 地址。 您需自行生成 INFURA_KEY 以连接以太坊网络。 [API_KEY 应用教程](https://ethereumico.io/knowledge-base/infura-api-key-guide)

* `tron_rpc_url`: 波场网络节点的 RPC 地址 [官方-公共-节点](https://developers.tron.network/docs/official-public-node)

* `tron_grid_url`: 波场网络事件服务查询 URL。

* `bsc_rpc_url`: BSC 网络节点的 RPC 地址。[官方-公共-节点](https://docs.binance.org/smart-chain/developer/rpc.html)

**示例（主网:**

```conf
vim ~/.deliveryd/config/delivery-config.toml
  
eth_rpc_url = "https://mainnet.infura.io/v3/<YOUR_INFURA_KEY>" 
bsc_rpc_url = "https://bsc-dataseed.binance.org/" 
tron_rpc_url = "grpc.trongrid.io:50051" 
tron_grid_url = "https://tronevent.bt.io/"
```
**示例（测试网-1029）:**

```conf
vim ~/.deliveryd/config/delivery-config.toml
  
eth_rpc_url = "https://goerli.infura.io/v3/<YOUR_INFURA_KEY>" 
bsc_rpc_url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
tron_rpc_url = "47.252.19.181:50051" 
tron_grid_url = "https://test-tronevent.bt.io"
```


### 配置 Bttc 服务

打开编辑 `vi ~/node/bttc/start.sh`.

在`start.sh`中，将以下行输入至末尾处，以添加由节点 ID、IP 地址和端口组成的启动节点地址:

```config
--bootnodes 
"enode://8ef920be1d44ad7c41a517a6420e43511f2e30d1c35a4bb05954c9f413b1712dae6e9e05f56595966470506891ff05d203e233c2e8f6df8c72621537a3d783e9@54.157.35.210:30303","enode://f3a2534ac30db7387f84c1262bce9a0737c46a8b5627f8193d412a4bde415c191191bbf984f51e04e5d974e62b70fab148f38522c5e2917ca1f1860361f14cc9@107.20.250.182:30303","enode://268cc5c4062b4c30f7ae972322ec119465655d9b3f7220df4614f2890b5cef6ac350d65890f8ecebfe6c5ce0af635f7ae420db84de7677c54b35ed1ce6bb4fbd@54.219.27.155:30303","enode://a9aa7a7ec5b34485c73436d311d86c55f900db4008058231a2fd2fb8ee7ad1b68d7d5a64acbf1f62b8d5f25388b492d16befb686d6146b374a85a6ea7d5a95c9@54.241.235.101:30303"
```

在 `start.sh` 中保存更改 .

### 配置防火墙

哨兵节点必须将以下端口对所有人开放`0.0.0.0/0`:

* 26656- 您的 Delivery 服务将连接您与其他 Delivery 服务的节点e.

* 30303- 您的 BTTC 服务将连接您与其他 BTTC 服务的节点。

* 22- 验证者无论身处何处都能使用 ssh。

## 启动哨兵节点

首先启动 Delivery 服务。 Delivery 服务同步后，您需要启动 BTTC 服务。

:::note

Delivery 服务需要几个小时才能完全同步.

:::

### 启动 Delivery 服务

切换至`~/node/delivery`目录:

```sh
cd ~/node/delivery
```

启动 Delivery 服务:

```sh
bash delivery-start.sh
```

启动 Delivery rest-server 服务:

```sh
bash delivery-server-start.sh 
```

:::note

您可能在日志中检查到以下错误:

* `Stopping peer for error`
* `MConnection flush failed`
* `use of closed network connection`

这表明网络上的一个节点拒绝连接到您的节点。 您无需处理这些错误， 只需等待您的节点在网络上爬取更多节点.

:::

检查 Delivery 的同步状态:

```sh
curl localhost:26657/status
```

在输出中，`catching_up` 值为:

* `true` — Delivery 服务正在同步.
* `false` — Delivery 服务已完全同步.

等待 Delivery 服务完全同步.

### 启动 Bttc 服务

Delivery 服务同步后，将启动 BTTC 服务.

切换至`~/node/bttc`目录:

```sh
cd ~/node/bttc
```

启动 Bttc 服务:

```sh
bash start.sh
```


## 配置validator 节点

:::note

要完成这一步，您须准备好已完成同步的以太坊主网节点的 RPC 接口, BSC RPC接口 ,TRON  RPC接口。

:::

### 配置Delivery 服务

登录远程验证者节点.

打开编辑 `vi ~/.deliveryd/config/config.toml`.

在 `config.toml`,  中修改如下内容:

* `moniker` — 任何名称。 示例: `moniker = "my-sentry-node"`.
* `pex` — 将值设置为 false，关闭 PEX。 示例: `pex = false`.
* `private_peer_ids` — 注释掉该值。 示例: `# private_peer_ids = ""`.

  在哨兵节点上获取 Delivery 节点 ID:

  1. 登录哨兵节点.
  1. 运行 `deliveryd tendermint show-node-id`.

示例: `persistent_peers = "sentry_machineNodeID@sentry_instance_ip:26656"`

* `prometheus` — 将值设置为 true，启用 Prometheus 指标。 示例: `prometheus = true`.

在 config.toml 中保存更改.

打开编辑 `vim ~/.deliveryd/config/delivery-config.toml`.

在 `delivery-config.toml`, 中修改如下内容:

* `eth_rpc_url`: 以太坊网络 RPC 地址。 您需自行生成 INFURA_KEY 以连接以太坊网络。 [API_KEY 应用教程](https://ethereumico.io/knowledge-base/infura-api-key-guide)

* `tron_rpc_url`: 波场网络节点的 RPC 地址 [官方-公共-节点](https://developers.tron.network/docs/official-public-node)

* `tron_grid_url`: 波场网络事件服务查询 URL。

* `bsc_rpc_url`: BSC 网络节点的 RPC 地址。[官方-公共-节点](https://docs.binance.org/smart-chain/developer/rpc.html)


**示例（主网:**

```conf
vim ~/.deliveryd/config/delivery-config.toml
  
eth_rpc_url = "https://mainnet.infura.io/v3/<YOUR_INFURA_KEY>" 
bsc_rpc_url = "https://bsc-dataseed.binance.org/" 
tron_rpc_url = "grpc.trongrid.io:50051" 
tron_grid_url = "https://tronevent.bt.io/"
```
**示例（测试网-1029）:**

```conf
vim ~/.deliveryd/config/delivery-config.toml
  
eth_rpc_url = "https://goerli.infura.io/v3/<YOUR_INFURA_KEY>" 
bsc_rpc_url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
tron_rpc_url = "47.252.19.181:50051" 
tron_grid_url = "https://test-tronevent.bt.io"
```

### 配置 Bttc 服务

打开编辑 `vi ~/.bttc/data/bor/static-nodes.json`.

在 `static-nodes.json` 中修改如下内容:

* `"<replace with enode://sentry_machine_enodeID@sentry_machine_ip:30303>"` — 在哨兵节点上设置的 BTTC 节点 ID 和 IP 地址.

  在哨兵节点上获取 BTTC 节点 ID:

  1. 登录哨兵节点.
  1. 运行 `bootnode -nodekey ~/.bttc/data/bor/nodekey -writeaddress`.

  示例: `"enode://8ef920be1d44ad7c41a517a6420e43511f2e30d1c35a4bb05954c9f413b1712dae6e9e05f56595966470506891ff05d203e233c2e8f6df8c72621537a3d783e9@54.157.35.210:30303"`.

在 `static-nodes.json` 中保存更改.

## 设置所有者和签名者密钥

我们建议您在 BTTC 上设置不同的所有者和签名者密钥。

* 签名者——签名检查点交易的地址。 建议在签名者地址上保留至少 1 个 ETH 代币，20,000TRX, 0.5BNB.
* 所有者——进行质押交易的地址。 建议在所有者地址上保留 BTT 代币.

### 生成 Delivery 私钥

您必须在验证者节点上生成 Delivery 私钥， 请勿在哨兵节点上生成 Delivery 私钥。

要生成私钥，请运行:

```sh
deliverycli generate-validatorkey ETHEREUM_PRIVATE_KEY
```

其中

* ETHEREUM_PRIVATE_KEY — 是您的以太坊钱包私钥.

这样将生成`priv_validator_key.json`文件。 将生成的 JSON 文件移到 Delivery 配置目录中。:

```sh
mv ./priv_validator_key.json ~/.deliveryd/config
```

### 生成 BTTC Keystore 文件

您必须在验证者节点上生成 BTTC Keystore 文件， 请勿在哨兵节点上生成 BTTC Keystore 文件。

要生成私钥，请运行:

```sh
deliverycli generate-keystore ETHEREUM_PRIVATE_KEY
```

其中

* ETHEREUM_PRIVATE_KEY — 是您的以太坊私钥.

根据提示设置 Keystore 文件的密码.

这样将生成一个 `UTC-<time>-<address>` 文件.

将生成的 Keystore 文件移至 BTTC 配置目录中:

```sh
mv ./UTC-<time>-<address> ~/.bttc/keystore/
mv ./nodekey ~/.bttc/
```

### 添加 password.txt

请确保先创建 `password.txt`文件，然后在`~/.bttc/password.txt`文件中添加 BTTC Keystore 文件密码。

### 添加您的以太坊地址

请确保先创建 `address.txt` 文件，然后在 `~/.bttc/address.txt` 文件中添加 BTTC 地址文件。
打开编辑 `vi ~/.bttc/address.txt`。

在 `address.txt`, 中添加您的以太坊地址， 例如: `0xca67a8D767e45056DC92384b488E9Af654d78DE2`.

在 `address.txt` 中保存更改.

## 启动验证者节点

在此环节，您必须满足下列条件：

* 哨兵节点的 Delivery 服务已完全同步且处于运行状态。
* 哨兵节点的 BTTC 服务处于运行状态。
* 验证者节点的 Delivery 服务与 BTTC 服务已完成配置。
* 您的所有者密钥与签名者密钥均已完成配置。

### 启动 Delivery 服务

您需要在验证者节点上启动 Delivery 服务。 Delivery 服务同步后，您需要在验证者节点上启动 BTTC 服务。

切换至 `~/node/delivery` 目录:

```sh
cd ~/node/delivery
```

启动 Delivery 服务:

```sh
bash delivery-start.sh
```

启动 Delivery rest-server:

```sh
bash delivery-server-start.sh
```

启动 Delivery bridge:

```sh
bash delivery-bridge-start.sh 
```

检查 Delivery 的同步状态:

```sh
curl localhost:26657/status
```

在输出中，`catching_up` 值为:

* `true` — Delivery 服务正在同步。
* `false` — Delivery 服务已完全同步。

等待 Delivery 服务完全同步。

### 启动 BTTC 服务

验证者节点上的 Delivery 服务完全同步后，您需要在验证者节点上启动BTTC 服务

切换至`~/node/bttc` 目录:

```sh
cd ~/node/bttc
```

启动 BTTC 服务：

```sh
bash start.sh
```
