# BTTC快照操作指引

当设置一个新的哨兵、验证器或全节点服务器时，建议你使用快照，以加快同步速度，而不必通过网络同步。使用快照将为你的Delivery和BTTC节省几天时间。

请参考https://snapshots.bt.io，获取最新的快照。

# 使用方法 

## 第1步：准备
- 确保你的硬件符合[建议要求](https://doc.bt.io/v1/doc/validator-node-system-requirements.html).
- 一个有足够自由存储空间的磁盘，至少是快照大小的两倍。

##  第2步：下载&&解压

### Delivery

将快照下载到你的主机上。要下载快照tar文件到你的机器，你可以运行以下命令:

`wget -c <Snapshot URL>`

例如:

```sh
wget -c https://bttc-blockchain-snapshots.s3-accelerate.amazonaws.com/bttc-mainnet/2022_03_03/delivery-mainnet-snapshot-2022_03_03.tar.gz
```

这将下载Delivery的快照.

现在，为了解压Delivery快照Tar文件，运行以下命令。你需要确保在你的节点上启动Delivery服务之前运行这个命令。如果你的Delivery服务已经开始，请停止，然后运行下面的命令。

`tar -xzvf <delivery snapshot file> -C <CURRENT_DIRECTORY>`

比如说:

```sh
tar -xzvf delivery-mainnet-snapshot-2022_03_03.tar.gz ./
```

当这个命令完成后，你可以删除这个tar文件以回收空间。

### Bttc

下载快照到你的机器。要下载快照tar文件到你的机器，你可以运行以下命令

`wget -c <Snapshot URL>`

比如:

```sh
wget -c https://bttc-blockchain-snapshots.s3-accelerate.amazonaws.com/bttc-mainnet/2022_03_03/bttc-mainnet-snapshot-2022_03_03.tar.gz
```

现在，为了解压当前目录下的Tar文件，运行以下命令。你需要确保在你的节点上启动Bttc服务之前运行这个命令。如果你的Bttc服务已经启动，请停止，然后运行下面的命令。

`tar -xzvf <bttc snapshot file> -C <CURRENT_DIRECTORY>`

比如:

```sh
tar -xzvf bttc-mainnet-snapshot-2022_03_03.tar.gz ./
```

当这个命令完成后，你可以删除这个tar文件以回收空间。



## 第三步：替换数据
  
### Delivery  
-   首先，如果可以的话，通过`kill {pid}`停止运行中的交付客户端，并确保客户端已经关闭。

:::tip 备注
  如果你已经运行了一段时间的Delivery节点，记得先备份Delivery数据库。否则，如果你从头开始运行Delivery节点，你可以跳过这个步骤。
:::
-   备份原始数据: `cp -r  ${Delivery_DataDir}/data ${Delivery_DataDir}/data_backup`
    例如:

    ```sh
    cp /root/.deliveryd/data /root/.deliveryd/data_backup
    ```

-   替换数据: `cp -r ./${delivery_snapshot_file} ${Delivery_DataDir}/`
    例如:

    ```sh
    cp ./delivery_data/* /root/.deliveryd/data/
    ```   
-   再次启动Delivery客户端并检查日志

### BTTC
-    首先，如果你有一个正在运行的bttc客户端，通过`kill {pid}`停止它，并确保客户端已经关闭。
:::tip 备注
  如果你已经运行了一段时间BTTC节点，记得先备份BTTC数据库。否则，如果你从头开始运行BTTC节点，你可以跳过这一步。
:::
-   备份原始数据。: `cp -r ${BTTC_DataDir}/data ${BTTC_DataDir}/data_backup`
    例如:

    ```sh
    cp /root/.bttc/data/ /root/.bttc/data_backup
    ```

-   替换数据: `cp -r ./${bttc_snapshot_file} ${BTTC_DataDir}/; `
    例如:

    ```sh
    cp ./bttc_data/* /root/.bttc/data/bor/
    ```   
-   再次启动BTTC客户端并检查日志