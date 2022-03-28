# fullnode節點部署

本節旨在介紹如何從二進制文件啟動併運行fullnode節點。

如需了解繫統要求，請參閱 [fullnode節點繫統要求](https://doc.bt.io/v1/doc/traditional/validator-node-system-requirements.html).

:::tip 備註

按本節提示操作的過程中，您需要等待Delivery服務和BTTC服務完全同步， 整個過程約需幾個小時。

或者，你可以使用官方維護的快照，這將把同步時間減少到幾分鐘。詳細說明請見[Delivery and Bttc](https://doc.bt.io/v1/doc/traditional/snapshots-instructions.html)的快照說明。

關於快照的下載鏈接，請參見[BTTC鏈快照](https://snapshots.bt.io/)。

:::

## 前置要求

* 一臺機器——一臺fullnode節點。
* 在fullnode節點設備上安裝`build-essential` (可選).

  安裝（僅 Ubuntu 繫統需要安裝）:

  ```sh
  sudo apt-get install build-essential
  ```

* 在fullnode節點設備上安裝Go 1.17.

  安裝:

  ```sh
  wget https://gist.githubusercontent.com/ssandeep/a6c7197811c83c71e5fead841bab396c/raw/go-install.sh
  bash go-install.sh
  sudo ln -nfs ~/.go/bin/go /usr/bin/go
  ```

## 概覽

請執行以下操作以運行fullnode節點:

1. 准備一臺設備.
1. 在fullnode節點設備上安裝 Delivery 二進制文件和 BTTC 二進制文件.
1. 在fullnode節點設備上設定好 Delivery 服務文件和 BTTC 服務文件.
1. 在fullnode節點設備上設定好 Delivery 服務和 BTTC 服務.
1. 配置fullnode節點.
1. 啟動fullnode節點.
1. 與社區共同檢查節點健康狀態.

:::tip 備註

請嚴格遵守上述操作順序，否則將會出錯。

:::

## 安裝二進制文件


### 安裝 Delivery

克隆 [Delivery 倉庫](https://github.com/bttcprotocol/delivery/):

```sh
git clone https://github.com/bttcprotocol/delivery
```

檢出正確的 [release版本](https://github.com/bttcprotocol/delivery/releases):

```sh
git checkout RELEASE_TAG
```

其中

* RELEASE_TAG — 即為您安裝的release版本標簽。

例:

```sh
git checkout v1.0.0
```

安裝 Delivery:

```sh
make install
```

檢查安裝:

```sh
deliveryd version --long
```

### 安裝BTTC

克隆 the [BTTC倉庫](https://github.com/bttcprotocol/bttc):

```sh
git clone https://github.com/bttcprotocol/bttc
```

檢出正確的[release版本 ](https://github.com/bttcprotocol/bttc/releases):

```sh
git checkout RELEASE_TAG
```

其中

* RELEASE_TAG — 即為您安裝的release版本標簽.

例:

```sh
git checkout v1.0.1
```

安裝 Bttc:

```sh
make bttc-all
```

創建符號鏈接:

```sh
sudo ln -nfs ~/bttc/build/bin/bttc /usr/bin/bttc
sudo ln -nfs ~/bttc/build/bin/bootnode /usr/bin/bootnode
```

檢查安裝:

```sh
bttc version
```

## 設定節點文件

### 獲取launch倉庫

克隆 [launch倉庫](https://github.com/bttcprotocol/launch):

```sh
git clone https://github.com/bttcprotocol/launch
```

:::tip 備註
選擇正確的檔案夾。如要接入主網，請選擇 mainnet-v1；如要接入測試網，請選擇 testnet-1029。請確保選擇無誤。
:::

### 設定啟動目錄

#### 在fullnode節點上

創建 `node` 目錄:

```sh
mkdir -p node
```

將文件和腳本從`launch`目錄復制到`node`目錄:

```sh
cp -rf launch/mainnet-v1/sentry/sentry/* ~/node
```


### 設定網路目錄

#### 設定 Delivery

切換至`node`目錄:

```sh
cd ~/node/delivery
```

運行設定腳本:

```sh
bash setup.sh
```

#### 設定 Bttc

切換至`node`目錄:

```sh
cd ~/node/bttc
```

運行設定腳本:

```sh
bash setup.sh
```

## 配置fullnode節點

登入遠程fullnode節點。

### 配置 Delivery 服務

打開編輯  `vim ~/.deliveryd/config/config.toml`.

在 `config.toml`,  中修改如下內容:

* `moniker` — 任何名稱。 示例: `moniker = "my-fullnode"`.
* `seeds` — seed 節點地址由節點ID、IP 地址、端口三部分組成.

  使用以下來自 ~/node/delivery/delivery-seeds.txt的值:

  主網配置
  ```toml
  seeds="161c2cbe07fccc8c8a3b10ccdea608569a202c06@54.157.35.210:26656,f3f21c82c04003e3c6ee14eb4d11d5dd0b1f201e@107.20.250.182:26656,ed080edbac1a1a285d265e3e87269aea9f6693b7@54.219.27.155:26656,3114d9ebc7254a27de7092b071bd698d250748aa@54.241.235.101:26656"
  ```

  1029測試網配置
  ```toml
  seeds="3f562eed0fcfabc848db5ebed81633e340352c0c@52.53.72.234:26656,65f774fece098327b595c971b507db24356000fd@54.176.105.93:26656,8a8944fcaddb46ff18ec59a3197af1c5763eb824@50.18.50.100:26656,7ece43f437d4dc419bdf9c09604ebed084699779@54.215.2.221:26656"
  ```

* `pex` — 將值設定為 true，開啟 PEX。 示例: `pex = true`.
* `prometheus` — 將值設定為 true，啟用 Prometheus 指標。 示例: `prometheus = true`.
* `max_open_connections` — 將值設定為 `100`。 示例 : `max_open_connections = 100`.

在 config.toml 中保存更改.


打開編輯 `vim ~/.deliveryd/config/delivery-config.toml`.

在 `delivery-config.toml`, 中修改如下內容:

* `eth_rpc_url`: 以太坊網路 RPC 地址。 您需自行生成 INFURA_KEY 以連接以太坊網路。 [API_KEY 應用教程](https://ethereumico.io/knowledge-base/infura-api-key-guide)

* `tron_rpc_url`: 波場網路節點的 RPC 地址 [官方-公共-節點](https://developers.tron.network/docs/official-public-node)

* `tron_grid_url`: 波場網路事件服務查詢 URL。

* `bsc_rpc_url`: BSC 網路節點的 RPC 地址。[官方-公共-節點](https://docs.binance.org/smart-chain/developer/rpc.html)

**示例（主網):**

```conf
vim ~/.deliveryd/config/delivery-config.toml
  
eth_rpc_url = "https://mainnet.infura.io/v3/<YOUR_INFURA_KEY>" 
bsc_rpc_url = "https://bsc-dataseed.binance.org/" 
tron_rpc_url = "grpc.trongrid.io:50051" 
tron_grid_url = "https://tronevent.bt.io/"
```
**示例（測試網-1029）:**

```conf
vim ~/.deliveryd/config/delivery-config.toml
  
eth_rpc_url = "https://goerli.infura.io/v3/<YOUR_INFURA_KEY>" 
bsc_rpc_url = "https://data-seed-prebsc-1-s1.binance.org:8545/"
tron_rpc_url = "47.252.19.181:50051" 
tron_grid_url = "https://test-tronevent.bt.io"
```


### 配置 Bttc 服務

打開編輯 `vi ~/node/bttc/start.sh`.

在`start.sh`中，將以下行輸入至末尾處，以添加由節點 ID、IP 地址和端口組成的啟動節點地址:

主網配置
```config
--bootnodes 
"enode://8ef920be1d44ad7c41a517a6420e43511f2e30d1c35a4bb05954c9f413b1712dae6e9e05f56595966470506891ff05d203e233c2e8f6df8c72621537a3d783e9@54.157.35.210:30303,enode://f3a2534ac30db7387f84c1262bce9a0737c46a8b5627f8193d412a4bde415c191191bbf984f51e04e5d974e62b70fab148f38522c5e2917ca1f1860361f14cc9@107.20.250.182:30303,enode://268cc5c4062b4c30f7ae972322ec119465655d9b3f7220df4614f2890b5cef6ac350d65890f8ecebfe6c5ce0af635f7ae420db84de7677c54b35ed1ce6bb4fbd@54.219.27.155:30303,enode://a9aa7a7ec5b34485c73436d311d86c55f900db4008058231a2fd2fb8ee7ad1b68d7d5a64acbf1f62b8d5f25388b492d16befb686d6146b374a85a6ea7d5a95c9@54.241.235.101:30303"
```

1029測試網配置
```config
--bootnodes "enode://2e6a732ba9d0fcf102a4f4bda7d76f28095c9f03ee56bc89dc5c2235cd527c914b6063b0c76598cc37287f0594ae4022df550c592b3ba2a56a9f02810edbeee1@52.53.72.234:30303,enode://3d7da6d583072fbbe733135047010698e8b6a24c9315ce953b09dddbfabb2476c8b720b2ff2beb2ec73ef111b691c7dcd87f5e42bcba4a7bc385b7f728b2ab44@54.176.105.93:30303"
```

在 `start.sh` 中保存更改 .

### 配置防火墻

fullnode節點必須將以下端口對所有人開放`0.0.0.0/0`:

* 26656- 您的 Delivery 服務將連接您與其他 Delivery 服務的節點.

* 30303- 您的 BTTC 服務將連接您與其他 BTTC 服務的節點。

* 22- fullnode節點無論身處何處都能使用 ssh。

## 啟動fullnode節點

首先啟動 Delivery 服務。 Delivery 服務同步後，您需要啟動 BTTC 服務。

:::tip 備註

Delivery 服務需要幾個小時才能完全同步.

:::

### 啟動 Delivery 服務

切換至`~/node/delivery`目錄:

```sh
cd ~/node/delivery
```

啟動 Delivery 服務:

```sh
bash delivery-start.sh
```

啟動 Delivery rest-server 服務:

```sh
bash delivery-server-start.sh 
```

:::tip 備註

您可能在日誌中檢查到以下錯誤:

* `Stopping peer for error`
* `MConnection flush failed`
* `use of closed network connection`

這錶明網路上的一個節點拒絕連接到您的節點。 您無需處理這些錯誤， 只需等待您的節點在網路上爬取更多節點.

:::

檢查 Delivery 的同步狀態:

```sh
curl localhost:26657/status
```

在輸出中，`catching_up` 值為:

* `true` — Delivery 服務正在同步.
* `false` — Delivery 服務已完全同步.

等待 Delivery 服務完全同步.

### 啟動 Bttc 服務

Delivery 服務同步後，將啟動 BTTC 服務.

切換至`~/node/bttc`目錄:

```sh
cd ~/node/bttc
```

啟動 Bttc 服務:

```sh
bash start.sh
```
