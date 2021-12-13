# 节点部署

## 相关依赖及工具

- Git v2.30.1
- g++
- Go 1.16 +
- Nodejs v11.0
- Rabbitmq(latest stable version)
- Solc v0.5.11^
- Ganache CLI

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

## Event Monitor服务器搭建

Event Monitor用于查询波场上的合约事件。仅Validator需要搭建。使用bttc-cli时，对应TRON grid url一栏。

Event Monitor的搭建步骤如下：

- 安装MongoDB，要求collection为空

- 编译event plugin

    **代码地址**：https://github.com/tronprotocol/event-plugin

    **编译命令**：`./gradlew build -x test`

    **编译结果**：eventplugin/build/plugins/plugin-mongodb-1.0.0.zip，将其放到TRON fullnode配置文件的指定位置（event.subscribe.path）

- 编译TRON fullnode

    **代码地址**：https://github.com/tronprotocol/java-tron

    **编译命令**：`./gradlew build -x test`

    **修改配置文件**：

    ```conf
    event.subscribe = {
  native = {
    useNativeQueue = false // if true, use native message queue, else use event plugin.
  }
 
    path = "/data/bttc-jsonrpc/servers/fullnode/plugin-mongodb-1.0.0.zip" // absolute path of plugin
    server = "127.0.0.1:27017" // target server address to receive event triggers
    dbconfig = "eventlog|tron|123456|2" // dbname|username|password
    topics = [
        {
          triggerName = "block" // block trigger, the value can't be modified
          enable = true
          topic = "block" // plugin topic, the value could be modified
          solidified = true
        },
        {
          triggerName = "transaction"
          enable = true
          topic = "transaction"
          ethCompatible = true
          solidified = true
        },
        {
          triggerName = "solidity" // solidity block event trigger, the value can't be modified
          enable = true            // the default value is true
          topic = "solidity"
        },
        {
          triggerName = "soliditylog"
          enable = true
          redundancy = true
          topic = "soliditylog"
        }
    ]
 
    filter = {
       fromblock = "" // the value could be "", "earliest" or a specified block number as the beginning of the queried range
       toblock = "" // the value could be "", "latest" or a specified block number as end of the queried range
       contractAddress = [
           // contract address you want to subscribe, if it's set to "", you will receive contract logs/events with any contract address.
       ]
 
       contractTopic = [
           "" // contract topic you want to subscribe, if it's set to "", you will receive contract logs/events with any contract topic.
       ]
    }
    ```

- 编译bttc-event-monitor

    **代码地址**：

    **编译命令**：`./gradlew build -x test`

    **参考启动命令**：`nohup java -Xmx1g -XX:+UseConcMarkSweepGC -XX:+HeapDumpOnOutOfMemoryError -XX:+PrintGCDetails -Xloggc:./gc.log -XX:+PrintGCDateStamps -XX:+CMSParallelRemarkEnabled -XX:ReservedCodeCacheSize=256m -XX:+CMSScavengeBeforeRemark -jar -Dspring.config.location=application.yml  bttc-event-monitor-0.0.1-SNAPSHOT.jar >> bttc-event-monitor.log 2>&1 &`

## 部署节点

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
? Please enter Delivery branch or tag release_1.0.0
? Please enter Contracts branch or tag stake
? Please enter number of validator nodes 0 # number of block procducing nodes
? Please enter number of non-validator nodes 1 # number of full nodes
? Please enter ETH url https://mainnet.infura.io/v3/<YOUR_INFURA_KEY>
? Please enter BSC url https://bsc-dataseed.binance.org/
? Please enter TRON rpc url grpc.trongrid.io:50051
? Please enter TRON grid url # Please build your own event service
? Please select devnet type remote
? Please enter comma separated hosts/IPs
```

::: tip NOTE
仅Validator需要搭建时间监控服务（即TRON grid url对应的url）。普通用户请输入以"http://"开头的任意内容占位即可。

主网不提供公共的事件监控服务，请按照上面的教程自行搭建。
:::

### BTTC测试网（Donau, 1029）

```sh
? Please enter Bttc chain id 1029
? Please enter Delivery chain id delivery-1029
? Please enter Bttc branch or tag master
? Please enter Delivery branch or tag release_1.0.0
? Please enter Contracts branch or tag stake
? Please enter number of validator nodes 0 # number of block procducing nodes
? Please enter number of non-validator nodes 1 # number of full nodes
? Please enter ETH url https://goerli.infura.io/v3/<YOUR_INFURA_KEY>
? Please enter BSC url https://data-seed-prebsc-1-s1.binance.org:8545/
? Please enter TRON rpc url 47.252.19.181:50051
? Please enter TRON grid url test-tronevent.bt.io
? Please select devnet type remote
? Please enter comma separated hosts/IPs
```

运行上述脚本后，会生成如下的node目录

![image](../pics/node/node-dir.png)

::: tip NOTE
在每个 .sh 文件中，请确保 `NODE_DIR` 是正确的。 在这个例子中，`NODE_DIR` 应该是 `/data/bttc/node0`。
:::

## validator配置

假设节点的根目录在`/data/bttc/node0`。

### 配置delivery种子节点

#### 节点API_KEY配置

修改delivery-config文件
目录：`/data/bttc/node0/deliveryd/config/delivery-config.toml`

**配置说明：**

- eth_rpc_url: 为自己申请的API_KEY地址，需要自己生成 INFURA_KEY 以便跟以太坊通信。[API_KEY申请教程](https://ethereumico.io/knowledge-base/infura-api-key-guide)

- tron_rpc_url: TRON网络节点的RPC地址。

- tron_grid_url: TRON网络查询节点。

- bsc_rpc_url：BSC网络节点的RPC地址。

**DEMO：**

```conf
vim /data/bttc/node0/deliveryd/config/delivery-config.toml
  
eth_rpc_url = "https://goerli.infura.io/v3/<YOUR_INFURA_KEY>"
bsc_rpc_url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
tron_rpc_url = "47.252.19.181:50051"
tron_grid_url = "test-tronevent.bt.io"
```

#### 替换创世文件配置

将[genesis.json](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/sentry/delivery/config/genesis.json)替换至路径：`/data/bttc/node0/deliveryd/config/genesis.json`。

#### 添加delivery层的node-id

修改配置文件`/data/bttc/node0/deliveryd/config/config.toml`的seeds字段。在[这里](https://github.com/bttcprotocol/launch/tree/master/testnet-1029/without-sentry/delivery)查看seed信息。

### 启动Delivery节点

#### 启动delivery

```sh
nohup sh delivery-start.sh>>logs/deliveryd.log 2>&1 &
```

#### 启动后续服务

```sh
nohup sh delivery-server-start.sh>>logs/rest-server.log 2>&1 &
nohup sh delivery-bridge-start.sh>>logs/bridge.log 2>&1 &
```

### 配置BTTC种子节点

#### 替换BTTC的创世文件

BTTC创世文件路径:`/data/bttc/node0/bttc/genesis.json`

将[genesis.json](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/sentry/bttc/genesis.json)替换至上述路径。

#### 添加BTTC网络种子节点的node-id

将[static-nodes.json](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/sentry/bttc/static-nodes.json)替换到`/data/bttc/node0/bttc/static-nodes.json`。

### 初始化BTTC节点

```sh
sh bttc-setup.sh
```

### 启动BTTC节点

```sh
nohup sh bttc-start.sh >>logs/bttc-start.log 2>&1 &
```
