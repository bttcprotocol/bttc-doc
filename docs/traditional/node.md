# 節點部署

## 相關依賴及工具

- Git v2.30.1
- g++
- Go 1.16 +
- Nodejs v11.0
- Rabbitmq(latest stable version)
- Solc v0.5.11^

## 編譯安裝Delivery和BTTC二進制包

::: tip NOTE
部署需要的創世配置以及節點id等，均放在[launch倉庫](https://github.com/bttcprotocol/launch.git)
:::

### clone delivery代碼

```sh
git clone https://github.com/bttcprotocol/delivery.git
```

### 安裝delivery

```sh
cd delivery
make install
```

::: tip NOTE
當在某些環境下`make install`失敗時，請使用`make build`，並將`delivery-start.sh`中的`deliveryd`替換為build文件夾下deliverd的路徑。
:::

### clone BTTC代碼

```sh
git clone https://github.com/bttcprotocol/bttc
```

### 安裝BTTC

```sh
cd bttc
make bttc
```

## 安裝bttc-cli腳本

::: tip NOTE
當bttc-cli有更新時，請先卸載本地舊版本，再重新安裝最新版本。
:::

```sh
npm uninstall -g bttc-cli
npm install -g @bttcnetwork/bttc-cli
```

### 檢查bttc-cli版本

```sh
bttc-cli -V
```

## Event Monitor服務器搭建

Event Monitor用於查詢波場上的合約事件。僅Validator需要搭建。使用bttc-cli時，對應TRON grid url一欄。

Event Monitor的搭建步驟如下：

- 安裝MongoDB，要求collection為空

- 編譯event plugin

    **代碼地址**：https://github.com/tronprotocol/event-plugin

    **編譯命令**：`./gradlew build -x test`

    **編譯結果**：eventplugin/build/plugins/plugin-mongodb-1.0.0.zip，將其放到TRON fullnode配置文件的指定位置（event.subscribe.path）

- 編譯TRON fullnode

    **代碼地址**：https://github.com/tronprotocol/java-tron

    **編譯命令**：`./gradlew build -x test`

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

- 編譯bttc-event-monitor

    **代碼地址**：

    **編譯命令**：`./gradlew build -x test`

    **參考啟動命令**：`nohup java -Xmx1g -XX:+UseConcMarkSweepGC -XX:+HeapDumpOnOutOfMemoryError -XX:+PrintGCDetails -Xloggc:./gc.log -XX:+PrintGCDateStamps -XX:+CMSParallelRemarkEnabled -XX:ReservedCodeCacheSize=256m -XX:+CMSScavengeBeforeRemark -jar -Dspring.config.location=application.yml  bttc-event-monitor-0.0.1-SNAPSHOT.jar >> bttc-event-monitor.log 2>&1 &`

## 部署節點

使用如下命令初始化節點目錄：

```sh
bttc-cli setup devnet
```

然後依次填寫以下問題，請注意主網和測試網的區別

### BTTC主網 (199)

```sh
? Please enter Bttc chain id 199
? Please enter Delivery chain id delivery-199
? Please enter Bttc branch or tag master
? Please enter Delivery branch or tag release_1.0.0
? Please enter Contracts branch or tag stake
? Please enter number of validator nodes 0 # number of block procducing nodes
? Please enter number of non-validator nodes 1 # number of full nodes
? Please enter ETH url https://mainnet.infura.io/v3/<YOUR_INFURA_KEY>
? Please enter BSC url https://bsc-dataseed.binance.org/ # or choose from https://docs.binance.org/smart-chain/developer/rpc.html
? Please enter TRON rpc url grpc.trongrid.io:50051
? Please enter TRON grid url  # Please build your own event service
? Please select devnet type remote
? Please enter comma separated hosts/IPs
```

::: tip NOTE
僅Validator需要搭建事件監控服務（即TRON grid url對應的url）。普通用戶請輸入以"http://"開頭的任意內容佔位即可。

主網不提供公共的事件監控服務，請按照上面的教程自行搭建。
:::

### BTTC測試網（Donau, 1029）

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

運行上述腳本後，會生成如下的node目錄

![image](../pics/node/node-dir.png)

::: tip NOTE
在每個 .sh 文件中，請確保 `NODE_DIR` 是正確的。在這個例子中，`NODE_DIR` 應該是 `/data/bttc/node0`。
:::

## validator配置

假設節點的根目錄在`/data/bttc/node0`。

### 配置delivery種子節點

#### 節點API_KEY配置

修改delivery-config文件
目錄：`/data/bttc/node0/deliveryd/config/delivery-config.toml`

**配置說明：**

- eth_rpc_url: 以太坊網絡rpc地址。需要自己生成 INFURA_KEY 以便跟以太坊通信。 [API_KEY申請教程](https://ethereumico.io/knowledge-base/infura-api-key-guide)

- tron_rpc_url: TRON網絡節點的RPC地址。

- tron_grid_url: TRON網絡事件服務查詢url。

- bsc_rpc_url：BSC網絡節點的RPC地址。

**DEMO：**

```conf
vim /data/bttc/node0/deliveryd/config/delivery-config.toml
  
eth_rpc_url = "https://goerli.infura.io/v3/<YOUR_INFURA_KEY>"
bsc_rpc_url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
tron_rpc_url = "47.252.19.181:50051"
tron_grid_url = "test-tronevent.bt.io"
```

#### 替換創世文件配置

將[genesis-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/sentry/delivery/config/genesis.json)或[genesis-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/sentry/delivery/config/genesis.json)替換至路徑：`/data/bttc/node0/deliveryd/config/genesis.json`。

#### 添加delivery層的node-id

修改配置文件`/data/bttc/node0/deliveryd/config/config.toml`的seeds字段。在[這裡](https://github.com/bttcprotocol/launch/tree/master/testnet-1029/without-sentry/delivery)查看測試網seed信息，或在[這裡](https://github.com/bttcprotocol/launch/tree/master/mainnet-v1/without-sentry/delivery)查看主網seed信息。

### 啟動Delivery節點

#### 啟動delivery

```sh
nohup sh delivery-start.sh>>logs/deliveryd.log 2>&1 &
```

#### 啟動後續服務

```sh
nohup sh delivery-server-start.sh>>logs/rest-server.log 2>&1 &
nohup sh delivery-bridge-start.sh>>logs/bridge.log 2>&1 &
```

### 配置BTTC種子節點

#### 替換BTTC的創世文件

BTTC創世文件路徑:`/data/bttc/node0/bttc/genesis.json`

將[genesis-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/sentry/bttc/genesis.json)或[genesis-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/sentry/bttc/genesis.json)替換至上述路徑。

#### 添加BTTC網絡種子節點的node-id

將[static-nodes-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/sentry/bttc/static-nodes.json)或[static-nodes-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/sentry/bttc/static-nodes.json)替換到`/data/bttc/node0/bttc/static-nodes.json`。

### 初始化BTTC節點

```sh
sh bttc-setup.sh
```

### 啟動BTTC節點

```sh
nohup sh bttc-start.sh >>logs/bttc-start.log 2>&1 &
```
