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


## 部署節點

::: tip NOTE
在哨兵機和驗證機上都要運行這一部分。
哨兵節點（全節點）是一個同時運行Delivery節點和BTTC節點的節點，用於從網絡上的其他節點下載數據，並在網絡上傳播驗證器數據。
一個哨兵節點（全節點）對網絡上所有其他哨兵節點開放。
一個驗證器節點只對其哨兵節點開放，而對網絡的其他節點關閉。
:::

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
? Please enter Delivery branch or tag master
? Please enter Contracts branch or tag stake
? Please enter number of validator nodes 0 # number of validator nodes,if you want to deploy only one fullnode, use 0 instead of 1
? Please enter number of non-validator nodes 1 # number of full nodes
? Please enter ETH url https://mainnet.infura.io/v3/<YOUR_INFURA_KEY>
? Please enter BSC url https://bsc-dataseed.binance.org/ # or choose from https://docs.binance.org/smart-chain/developer/rpc.html
? Please enter TRON rpc url grpc.trongrid.io:50051
? Please enter TRON grid url  https://tronevent.bt.io/
? Please select devnet type remote
? Please enter comma separated hosts/IPs
```

### BTTC測試網（Donau, 1029）

```sh
? Please enter Bttc chain id 1029
? Please enter Delivery chain id delivery-1029
? Please enter Bttc branch or tag master
? Please enter Delivery branch or tag master
? Please enter Contracts branch or tag stake
? Please enter number of validator nodes 0 # number of validator nodes,if you want to deploy only one fullnode, use 0 instead of 1
? Please enter number of non-validator nodes 1 # number of full nodes
? Please enter ETH url https://goerli.infura.io/v3/<YOUR_INFURA_KEY>
? Please enter BSC url https://data-seed-prebsc-1-s1.binance.org:8545/ # or choose from https://docs.binance.org/smart-chain/developer/rpc.html
? Please enter TRON rpc url 47.252.19.181:50051
? Please enter TRON grid url https://test-tronevent.bt.io
? Please select devnet type remote
? Please enter comma separated hosts/IPs
```

運行上述腳本後，會生成如下的node目錄

![image](../pics/node/node-dir.png)

::: tip NOTE
在每個 .sh 文件中，請確保 `NODE_DIR` 是正確的。在這個例子中，`NODE_DIR` 應該是 `/data/bttc/node`。
:::

## validator配置

假設節點的根目錄在`/data/bttc/node`。

### 配置delivery種子節點

#### 節點API_KEY配置

修改delivery-config文件
目錄：`/data/bttc/node/deliveryd/config/delivery-config.toml`

**配置說明：**

- eth_rpc_url: 以太坊網絡rpc地址。需要自己生成 INFURA_KEY 以便跟以太坊通信。 [API_KEY申請教程](https://ethereumico.io/knowledge-base/infura-api-key-guide)

- tron_rpc_url: TRON網絡節點的RPC地址。

- tron_grid_url: TRON網絡事件服務查詢url。

- bsc_rpc_url：BSC網絡節點的RPC地址。

**DEMO：**

```conf
vim /data/bttc/node/deliveryd/config/delivery-config.toml
  
eth_rpc_url = "https://goerli.infura.io/v3/<YOUR_INFURA_KEY>"
bsc_rpc_url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
tron_rpc_url = "47.252.19.181:50051"
tron_grid_url = "https://test-tronevent.bt.io"
```

#### 替換創世文件配置

將[genesis-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/sentry/delivery/config/genesis.json)或[genesis-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/sentry/delivery/config/genesis.json)替換至路徑：`/data/bttc/node/deliveryd/config/genesis.json`。

#### 添加delivery層的node-id

修改配置文件`/data/bttc/node/deliveryd/config/config.toml`的seeds字段。在[這裡](https://github.com/bttcprotocol/launch/tree/master/testnet-1029/sentry/sentry/delivery)查看測試網seed信息，或在[這裡](https://github.com/bttcprotocol/launch/tree/master/mainnet-v1/sentry/sentry/delivery)查看主網seed信息。

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

BTTC創世文件路徑:`/data/bttc/node/bttc/genesis.json`

將[genesis-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/sentry/bttc/genesis.json)或[genesis-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/sentry/bttc/genesis.json)替換至上述路徑。

#### 添加BTTC網絡種子節點的node-id

將[static-nodes-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/sentry/bttc/static-nodes.json)或[static-nodes-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/sentry/bttc/static-nodes.json)替換到`/data/bttc/node/bttc/static-nodes.json`。

### 初始化BTTC節點

```sh
sh bttc-setup.sh
```

### 啟動BTTC節點

```sh
nohup sh bttc-start.sh >>logs/bttc-start.log 2>&1 &
```



## validator節點配置

假設validator節點的根目錄在`/data/bttc/node`。

### 配置delivery validator節點

#### 節點API_KEY配置

修改delivery-config文件
目錄：`/data/bttc/node/deliveryd/config/delivery-config.toml`

**配置說明：**

- eth_rpc_url: 以太坊網絡rpc地址。需要自己生成 INFURA_KEY 以便跟以太坊通信。 [API_KEY申請教程](https://ethereumico.io/knowledge-base/infura-api-key-guide)

- tron_rpc_url: TRON網絡節點的RPC地址。

- tron_grid_url: TRON網絡事件服務查詢url。

- bsc_rpc_url：BSC網絡節點的RPC地址。

**DEMO：**

```conf
vim /data/bttc/node/deliveryd/config/delivery-config.toml
  
eth_rpc_url = "https://goerli.infura.io/v3/<YOUR_INFURA_KEY>"
bsc_rpc_url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
tron_rpc_url = "47.252.19.181:50051"
tron_grid_url = "https://test-tronevent.bt.io"
```

#### 替換創世文件配置

將[genesis-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/sentry/delivery/config/genesis.json)或[genesis-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/sentry/delivery/config/genesis.json)替換至路徑：`/data/bttc/node/deliveryd/config/genesis.json`。

#### 配置config.toml

修改配置文件`/data/bttc/node/deliveryd/config/config.toml`的seeds字段。
在config.toml中，改變以下内容。

**seeds - 種子節點地址由一個節點ID、一個IP地址和一個端口組成。使用上面配置的哨兵節點的node_id，它可能看起來像:`seeds="node_id_of_your_sentry_node@ip_of_your_sentry_node:26656"`**

### 啟動Delivery validator節點

#### 啟動delivery

```sh
nohup sh delivery-start.sh>>logs/deliveryd.log 2>&1 &
```

#### 啟動後續服務

```sh
nohup sh delivery-server-start.sh>>logs/rest-server.log 2>&1 &
nohup sh delivery-bridge-start.sh>>logs/bridge.log 2>&1 &
```

### 配置BTTC validator節點

#### 替換BTTC的創世文件

BTTC創世文件路徑:`/data/bttc/node/bttc/genesis.json`

將[genesis-1029](https://github.com/bttcprotocol/launch/blob/master/testnet-1029/sentry/validator/bttc/genesis.json)或[genesis-199](https://github.com/bttcprotocol/launch/blob/master/mainnet-v1/sentry/validator/bttc/genesis.json)替換至上述路徑。

#### 配置 static_nodes.json

修改static_nodes.json文件`/data/bttc/node/bttc/static_nodes.json`的種子字段。

在static_nodes.json中，編輯該文件並添加上面配置的bttc哨兵節點信息，看起來像:`"enode://enode_id_of_your_sentry_node@_of_your_sentry_node:30303`

### 初始化BTTC validator節點

```sh
sh bttc-setup.sh
```

### 啟動BTTC validator節點

```sh
nohup sh bttc-start.sh >>logs/bttc-start.log 2>&1 &
```
