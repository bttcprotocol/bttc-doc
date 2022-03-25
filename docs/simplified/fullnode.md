# fullnode节点部署

本节旨在介绍如何从二进制文件启动并运行fullnode节点。

如需了解系统要求，请参阅 [fullnode节点系统要求](https://doc.bt.io/v1/doc/simplified/validator-node-system-requirements.html).

:::tip 注意

按本节提示操作的过程中，您需要等待 Delivery 服务和 BTTC 服务完全同步， 整个过程约需几个小时。

或者，你可以使用官方维护的快照，这将把同步时间减少到几分钟。详细说明请见[Delivery and Bttc](https://doc.bt.io/v1/doc/simplified/snapshots-instructions.html)的快照说明。

关于快照的下载链接，请参见[BTTC链快照](https://snapshots.bt.io/)。

:::

## 前置要求

* 一台机器——一台fullnode节点。
* 在fullnode节点上安装`build-essential` (可选).

  安装（仅 Ubuntu 系统需要安装）:

  ```sh
  sudo apt-get install build-essential
  ```

* 在fullnode节点上安装Go 1.17.

  安装:

  ```sh
  wget https://gist.githubusercontent.com/ssandeep/a6c7197811c83c71e5fead841bab396c/raw/go-install.sh
  bash go-install.sh
  sudo ln -nfs ~/.go/bin/go /usr/bin/go
  ```

## 概览

请执行以下操作以运行fullnode节点:

1. 准备一台设备.
1. 在fullnode设备上安装 Delivery 二进制文件和 BTTC 二进制文件.
1. 在fullnode设备上设置好 Delivery 服务文件和 BTTC 服务文件.
1. 在fullnode设备上设置好 Delivery 服务和 BTTC 服务.
1. 配置fullnode节点.
1. 启动fullnode节点上节点.
1. 配置fullnode节点.
1. 与社区共同检查节点健康状态.

:::tip 备注

请严格遵守上述操作顺序，否则将会出错。

:::

## 安装二进制文件

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

检出正确的[发布版本](https://github.com/bttcprotocol/bttc/releases):

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

## 设置fullnode节点文件

### 获取launch仓库

克隆 [launch 仓库](https://github.com/bttcprotocol/launch):

```sh
git clone https://github.com/bttcprotocol/launch
```

:::tip 备注
选择正确的文件夹。如要接入主网，请选择 mainnet-v1；如要接入测试网，请选择 testnet-1029。请确保选择无误。
:::

### 设置启动目录

创建 `node` 目录:

```sh
mkdir -p node
```

将文件和脚本从`launch`目录复制到`node`目录:

```sh
cp -rf launch/mainnet-v1/sentry/sentry/* ~/node
```

### 设置网络目录

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

## 配置fullnode节点

登录远程fullnode节点。

### 配置 Delivery 服务

打开编辑  `vim ~/.deliveryd/config/config.toml`.

在 `config.toml`,  中修改如下内容:

* `moniker` — 任何名称。 示例: `moniker = "my-full-node"`.
* `seeds` — seed 节点地址由节点ID、IP 地址、端口三部分组成.

  使用以下来自 ~/node/delivery/delivery-seeds.txt的值:

  主网配置
  ```toml
  seeds="161c2cbe07fccc8c8a3b10ccdea608569a202c06@54.157.35.210:26656,f3f21c82c04003e3c6ee14eb4d11d5dd0b1f201e@107.20.250.182:26656,ed080edbac1a1a285d265e3e87269aea9f6693b7@54.219.27.155:26656,3114d9ebc7254a27de7092b071bd698d250748aa@54.241.235.101:26656"
  ```

  1029测试网配置
  ```toml
  seeds="3f562eed0fcfabc848db5ebed81633e340352c0c@52.53.72.234:26656,65f774fece098327b595c971b507db24356000fd@54.176.105.93:26656,8a8944fcaddb46ff18ec59a3197af1c5763eb824@50.18.50.100:26656,7ece43f437d4dc419bdf9c09604ebed084699779@54.215.2.221:26656"
  ```

* `pex` — 将值设置为 true，开启 PEX。 示例: `pex = true`.
* `prometheus` — 将值设置为 true，启用 Prometheus 指标。 示例: `prometheus = true`.
* `max_open_connections` — 将值设置为 `100`。 示例 : `max_open_connections = 100`.

在 config.toml 中保存更改.


打开编辑 `vim ~/.deliveryd/config/delivery-config.toml`.

在 `delivery-config.toml`, 中修改如下内容:

* `eth_rpc_url`: 以太坊网络 RPC 地址。 您需自行生成 INFURA_KEY 以连接以太坊网络。 [API_KEY 应用教程](https://ethereumico.io/knowledge-base/infura-api-key-guide)

* `tron_rpc_url`: 波场网络节点的 RPC 地址 [官方-公共-节点](https://developers.tron.network/docs/official-public-node)

* `tron_grid_url`: 波场网络事件服务查询 URL。

* `bsc_rpc_url`: BSC 网络节点的 RPC 地址。[官方-公共-节点](https://docs.binance.org/smart-chain/developer/rpc.html)

**示例（主网):**

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

主網配置
```config
--bootnodes 
"enode://8ef920be1d44ad7c41a517a6420e43511f2e30d1c35a4bb05954c9f413b1712dae6e9e05f56595966470506891ff05d203e233c2e8f6df8c72621537a3d783e9@54.157.35.210:30303,enode://f3a2534ac30db7387f84c1262bce9a0737c46a8b5627f8193d412a4bde415c191191bbf984f51e04e5d974e62b70fab148f38522c5e2917ca1f1860361f14cc9@107.20.250.182:30303,enode://268cc5c4062b4c30f7ae972322ec119465655d9b3f7220df4614f2890b5cef6ac350d65890f8ecebfe6c5ce0af635f7ae420db84de7677c54b35ed1ce6bb4fbd@54.219.27.155:30303,enode://a9aa7a7ec5b34485c73436d311d86c55f900db4008058231a2fd2fb8ee7ad1b68d7d5a64acbf1f62b8d5f25388b492d16befb686d6146b374a85a6ea7d5a95c9@54.241.235.101:30303"
```

1029测试网配置
```config
--bootnodes "enode://2e6a732ba9d0fcf102a4f4bda7d76f28095c9f03ee56bc89dc5c2235cd527c914b6063b0c76598cc37287f0594ae4022df550c592b3ba2a56a9f02810edbeee1@52.53.72.234:30303,enode://3d7da6d583072fbbe733135047010698e8b6a24c9315ce953b09dddbfabb2476c8b720b2ff2beb2ec73ef111b691c7dcd87f5e42bcba4a7bc385b7f728b2ab44@54.176.105.93:30303"
```

在 `start.sh` 中保存更改 .

### 配置防火墙

fullnode节点必须将以下端口对所有人开放`0.0.0.0/0`:

* 26656- 您的 Delivery 服务将连接您与其他 Delivery 服务的节点e.

* 30303- 您的 BTTC 服务将连接您与其他 BTTC 服务的节点。

* 22- fullnode无论身处何处都能使用 ssh。

## 启动fullnode节点

首先启动 Delivery 服务。 Delivery 服务同步后，您需要启动 BTTC 服务。

:::tip 备注

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

:::tip 备注

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
