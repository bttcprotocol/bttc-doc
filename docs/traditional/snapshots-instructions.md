# BTTC快照操作指引

當設置一個新的哨兵、驗證器或全節點服務器時，建議你使用快照，以加快同步速度，而不必通過網絡同步。使用快照將為你的Delivery和BTTC節省幾天時間。

請參考https://snapshots.bt.io，獲取最新的快照。

# 使用方法 

## 第1步：準備
- 確保你的硬件符合[建議要求](https://doc.bt.io/v1/doc/traditional/validator-node-system-requirements.html).
- 一個有足夠自由存儲空間的磁盤，至少是快照大小的兩倍。

##  第2步：下載&&解壓

### Delivery

將快照下載到你的主機上。要下載快照tar文件到你的機器，你可以運行以下命令:

`wget -c <Snapshot URL>`

例如:

```sh
wget -c https://bttc-blockchain-snapshots.s3-accelerate.amazonaws.com/bttc-mainnet/2022_03_03/delivery-mainnet-snapshot-2022_03_03.tar.gz
```

這將下載Delivery的快照.

現在，為了解壓Delivery快照Tar文件，運行以下命令。你需要確保在你的節點上啟動Delivery服務之前運行這個命令。如果你的Delivery服務已經開始，請停止，然後運行下面的命令。

`tar -xzvf <delivery snapshot file> -C <CURRENT_DIRECTORY>`

比如說:

```sh
tar -xzvf delivery-mainnet-snapshot-2022_03_03.tar.gz ./
```

當這個命令完成後，你可以刪除這個tar文件以回收空間。

### Bttc

下載快照到你的機器。要下載快照tar文件到你的機器，你可以運行以下命令

`wget -c <Snapshot URL>`

比如:

```sh
wget -c https://bttc-blockchain-snapshots.s3-accelerate.amazonaws.com/bttc-mainnet/2022_03_03/bttc-mainnet-snapshot-2022_03_03.tar.gz
```

現在，為了解壓當前目錄下的Tar文件，運行以下命令。你需要確保在你的節點上啟動Bttc服務之前運行這個命令。如果你的Bttc服務已經啟動，請停止，然後運行下面的命令。

`tar -xzvf <bttc snapshot file> -C <CURRENT_DIRECTORY>`

比如:

```sh
tar -xzvf bttc-mainnet-snapshot-2022_03_03.tar.gz ./
```

當這個命令完成後，你可以刪除這個tar文件以回收空間。



## 第三步：替換數據
  
### Delivery  
-   首先，如果可以的話，通過`kill {pid}`停止運行中的交付客戶端，並確保客戶端已經關閉。

:::tip 備註
  如果你已經運行了一段時間的Delivery節點，記得先備份Delivery數據庫。否則，如果你從頭開始運行Delivery節點，你可以跳過這個步驟。
:::
-   備份原始數據: `cp -r  ${Delivery_DataDir}/data ${Delivery_DataDir}/data_backup`
    例如:

    ```sh
    cp /root/.deliveryd/data /root/.deliveryd/data_backup
    ```

-   替換數據: `cp -r ./${delivery_snapshot_file} ${Delivery_DataDir}/`
    例如:

    ```sh
    cp ./delivery_data/* /root/.deliveryd/data/
    ```   
-   再次啟動Delivery客戶端並檢查日誌

### BTTC
-    首先，如果你有一個正在運行的bttc客戶端，通過`kill {pid}`停止它，並確保客戶端已經關閉。
:::tip 備註
  如果你已經運行了一段時間BTTC節點，記得先備份BTTC數據庫。否則，如果你從頭開始運行BTTC節點，你可以跳過這一步。
:::
-   備份原始數據。: `cp -r ${BTTC_DataDir}/data ${BTTC_DataDir}/data_backup`
    例如:

    ```sh
    cp /root/.bttc/data/ /root/.bttc/data_backup
    ```

-   替換數據: `cp -r ./${bttc_snapshot_file} ${BTTC_DataDir}/; `
    例如:

    ```sh
    cp ./bttc_data/* /root/.bttc/data/bor/
    ```   
-   再次啟動BTTC客戶端並檢查日誌