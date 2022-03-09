# BTTC Snapshots Instructions

When setting up a new Sentry, Validator, or Full Node server, it is recommended you use a snapshot for faster syncing without having to sync over the network. Using snapshots will save you several days for both Delivery and BTTC.

Please refer to https://snapshots.bt.io for the latest snapshots.

# Usage 

## Step 1: Preparation
- Make sure your hardware meets the [suggested requirement](https://doc.bt.io/v1/doc/validator-node-system-requirements.html).
- A disk with enough free storage, at least twice the size of the snapshot.

## Step 2: Download && Uncompress

### Delivery

Download the snapshot to your machine. To download the Snapshot Tar file to your machine you can run the following command


`wget -c <Snapshot URL>`

For example:

```sh
wget -c https://bttc-blockchain-snapshots.s3-accelerate.amazonaws.com/bttc-mainnet/2022_03_03/delivery-mainnet-snapshot-2022_03_03.tar.gz
```

This will download the snapshot of Delivery.

Now, to unpack the Tar file in the current directory run the following command. You need to ensure that you’re running this command before you start the Delivery service on your node. If your Delivery service has started, please stop and then run the below command. 


`tar -xzvf <delivery snapshot file> -C <CURRENT_DIRECTORY>`

For example:

```sh
tar -xzvf delivery-mainnet-snapshot-2022_03_03.tar.gz ./
```

When this command completes, you can delete the tar file to reclaim space.

### BTTC

Download the Snapshot to your machine. To download the Snapshot Tar file to your machine you can run the following command


`wget -c <Snapshot URL>`

For example:

```sh
wget -c https://bttc-blockchain-snapshots.s3-accelerate.amazonaws.com/bttc-mainnet/2022_03_03/bttc-mainnet-snapshot-2022_03_03.tar.gz
```

Now, to unpack the Tar file in current directory run the following command. You need to ensure that you’re running this command before you start the BTTC service on your node. If your BTTC service has started, please stop and then run the below command. 


`tar -xzvf <bttc snapshot file> -C <CURRENT_DIRECTORY>`

For example:

```sh
tar -xzvf bttc-mainnet-snapshot-2022_03_03.tar.gz ./
```

When this command completes, you can delete the tar file to reclaim space.



## Step 3: Replace Data
  
### Delivery  
-   First, stop the running delivery client if you have one by `kill {pid}`, and make sure the client has shut down.

:::tip note
 If you already run the Delivery node for a few days,remember to backup the delivery database first.Otherwise,if you run the Delivery node from scratch,you can skip this step.
:::
-   Backing up the original data: `cp -r  ${Delivery_DataDir}/data ${Delivery_DataDir}/data_backup`
    For example:

    ```sh
    cp -r /root/.deliveryd/data /root/.deliveryd/data_backup
    ```

-   Replace the data: `cp -r ./${delivery_snapshot_file} ${Delivery_DataDir}/`
    For example:

    ```sh
    cp -r ./delivery_data/* /root/.deliveryd/data/
    ```   
-   Start the delivery client again and check the logs

### BTTC
-   First, stop the running bttc client if you have one by `kill {pid}`, and make sure the client has shut down.
:::tip note
 If you already run the BTTC node for a few days,remember to backup the BTTC database first.Otherwise,if you run the BTTC node from scratch,you can skip this step.
:::
-   Backing up the original data: `cp -r ${BTTC_DataDir}/data ${BTTC_DataDir}/data_backup`
    For example:

    ```sh
    cp -r /root/.bttc/data/ /root/.bttc/data_backup
    ```

-   Replace the data: `cp -r ./${bttc_snapshot_file} ${BTTC_DataDir}/; `
    For example:

    ```sh
    cp -r ./bttc_data/* /root/.bttc/data/bor/
    ```   
-   Start the BTTC client again and check the logs