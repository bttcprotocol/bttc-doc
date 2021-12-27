# TRON &lt;-> BTTC

BTTC引入了一条可靠的，能够连通TRON与BTTC网络的跨链桥。通过跨链桥，用户可以随意通过BTTC来转移自己的代币到TRON上，并且无需考虑第三方机构带来的风险以及流动性限制。

BTTC提供了一种极其高效、低成本并且灵活的扩展方案。

## 代币跨链

当代币通过跨链桥传递时，它的总流通量不会被影响

+ 离开TRON的代币会被锁定，同时在BTTC网络上铸造与其等量的映射代币。

+ 将代币从BTTC转回TRON时，BTTC上的代币将被销毁，同时将解锁TRON上的等量原始代币。

## PoS桥

PoS桥能实现对资产的精确控制、提高存取款速度，并且增强资产的灵活性。作为一种资产转移的方式，它非常适合需要跨链运行的dApp。

### 简介

PoS桥能让用户自由的出入BTTC的生态系统。您可以高效的在链间转移您的TRC-20或者TRC-721代币。PoS桥能够在7-8分钟内完成存款，并在30分钟内完成提款过程。下文将介绍代币转移的流程。

### 使用PoS桥

开始介绍PoS桥的使用之前，我们建议您先了解下面两个概念，以和跨链桥顺利交互：

使用PoS桥的第一步是建立代币映射。只有根链上的代币合约与子链上的子代币合约建立映射之后，才能在两条链之间转移这种资产。请在[这里](https://docs.google.com/forms/d/e/1FAIpQLScP1R7iB6s16CNKAZGjFH8mwDBi74wH_swzZvz3FGmjgUG33w/viewform)映射请求。

成功映射后，可以使用各种SDK，或直接通过接口与合约进行交互。

## 代币充提

### 流程简述

此处以ERC-20为例。

#### 充值

1. Approve ERC20Predicate合约，允许它控制需要被存入的代币。

2. 在RootChainManager上调用depositFor。

#### 提取

1. 在BTTC上销毁代币。

2. 在RootChainManager上调用exit方法，以提交销毁证明。需要在包含此销毁交易的checkpoint提交之后调用。

### 详细流程

#### 实例化合约

```js
const mainWeb3 = new Web3(mainProvider)
const bttcWeb3 = new Web3(bttcProvider)
const rootTokenContract = new mainWeb3.eth.Contract(rootTokenABI, rootTokenAddress)
const rootChainManagerContract = new mainWeb3.eth.Contract(rootChainManagerABI, rootChainManagerAddress)
const childTokenContract = new bttcWeb3(childTokenABI, childTokenAddress)
```

#### Approve

批准合约ERC20Predicate消费代币。approve需要两个参数：地址和金额。

```js
await rootTokenContract.methods
  .approve(erc20Predicate, amount)
  .send({ from: userAddress })
```

#### 存款

调用RootChainManager合约的depositFor方法。这个方法需要接收三个参数：BTTC上接收存款的用户地址，代币合约在根链上的地址以及金额（以ABI编码形式体现）。

请在存款之前，确保已经进行过正确的approve操作。

```js
const depositData = mainWeb3.eth.abi.encodeParameter('uint256', amount)
await rootChainManagerContract.methods
  .depositFor(userAddress, rootToken, depositData)
  .send({ from: userAddress })
```

#### 燃烧/销毁

通过调用子代币合约的withdraw方法来销毁BTTC上的代币。这个方法接收一个参数：要销毁的代币数量。销毁代币的证明需要在下一步操作中提交，因此要储存销毁交易的哈希。

```js
const burnTx = await childTokenContract.methods
  .withdraw(amount)
  .send({ from: userAddress })
const burnTxHash = burnTx.transactionHash
```

#### 退出

调用RootChainManager合约的exit方法来解锁并从ERC20Predicate合约接收代币。这个方法接收一个参数：代币的销毁证明。

调用这个方法之前必须要等待包含销毁交易的checkpoint提交成功。销毁证明由RLP编码生成如下字段：

+ headerNumber：包含销毁交易的checkpoint起始块
+ blockProof：确保区块头是提交的默克尔根所在树中叶子的证明
+ blockNumber：包含销毁交易的区块号
+ blockTime：包含销毁交易的区块时间
+ txRoot：区块的交易根
+ receiptRoot：区块的receipt root
+ receipt：销毁交易的receipt
+ receiptProof：销毁交易receipt的默克尔根
+ branchMask：表示receipt在Merkle Patricia Tree中位置的一个32位参数
+ receiptLogIndex：用于从receipt中读取的日志索引

手动生成证明很复杂，因此我们建议使用BTTC SDK。如果您想手动发送交易，请将encodeAbi置为true以获取原始调用数据。

```js
const exitCalldata = await bttcPOSClient
  .exitERC20(burnTxHash, { from, encodeAbi: true })
```

```js
await mainWeb3.eth.sendTransaction({
  from: userAddress,
  to: rootChainManagerAddress,
  data: exitCalldata.data
})
```

## 存款与检查点事件跟踪

### 存款事件

当代币从公共区块链存入BTTC时，状态同步机制开始发挥作用，并最终在BTTC上铸造代币，整个过程需要5-7分钟。由于时间较长，所以监听用户存款事件在此时尤为重要。

### 使用web socket进行存款事件追踪

```js
const WebSocket = require("ws");
const Web3 = require("web3");

const ws = new WebSocket("");

const web3 = new Web3();
const abiCoder = web3.eth.abi;

async function checkDepositStatus(
 userAccount,
 rootToken,
 depositAmount,
 childChainManagerProxy
) {
 return new Promise((resolve, reject) => {
   ws.on("open", () => {
     ws.send(
       `{"id": 1, "method": "eth_subscribe", "params": ["newDeposits", {"Contract": ${childChainManagerProxy}}]}`
     );

     ws.on("message", (msg) => {
       const parsedMsg = JSON.parse(msg);
       if (
         parsedMsg &&
         parsedMsg.params &&
         parsedMsg.params.result &&
         parsedMsg.params.result.Data
       ) {
         const fullData = parsedMsg.params.result.Data;
         const { 0: syncType, 1: syncData } = abiCoder.decodeParameters(
           ["bytes32", "bytes"],
           fullData
         );

         // check if sync is of deposit type (keccak256("DEPOSIT"))
         const depositType =
           "0x87a7811f4bfedea3d341ad165680ae306b01aaeacc205d227629cf157dd9f821";
         if (syncType.toLowerCase() === depositType.toLowerCase()) {
           const {
             0: userAddress,
             1: rootTokenAddress,
             2: depositData,
           } = abiCoder.decodeParameters(
             ["address", "address", "bytes"],
             syncData
           );

           // depositData can be further decoded to get amount, tokenId etc. based on token type
           // For ERC20 tokens
           const { 0: amount } = abiCoder.decodeParameters(
             ["uint256"],
             depositData
           );
           if (
             userAddress.toLowerCase() === userAccount.toLowerCase() &&
             rootToken.toLowerCase() === rootTokenAddress.toLowerCase() &&
             depositAmount === amount
           ) {
             resolve(true);
           }
         }
       }
     });

     ws.on("error", () => {
       reject(false);
     });

     ws.on("close", () => {
       reject(false);
     });
   });
 });
}

checkDepositStatus("user address", "contract address", "amount", "proxy address")
 .then((res) => {
   console.log(res);
 })
 .catch((err) => {
   console.log(err);
 });
```

### 在区块链上查询历史存款是否成功

这段代码可以查看特定的一笔存款是否已经完成。两条链上各维护一个不断增加的全局计数器变量。StateSender合约发送带有计数器数值的事件，子链上的计数器数值可以通过StateReceiver合约来查看。如果子链上的计数器数值大于等于主链计数器，则这笔存款可视作成功。

```js
let Web3 = require("web3");

// For mainnet, use Ethereum RPC
const provider = new Web3.providers.HttpProvider(
 "https://goerli.infura.io/v3/API-KEY"
);
const web3 = new Web3(provider);


const child_provider = new Web3.providers.HttpProvider(
 ""
);

const child_web3 = new Web3(child_provider);

const contractInstance = new child_web3.eth.Contract(
 [
   {
     constant: true,
     inputs: [],
     name: "lastStateId",
     outputs: [
       {
         internalType: "uint256",
         name: "",
         type: "uint256",
       },
     ],
     payable: false,
     stateMutability: "view",
     type: "function",
   },
 ],
 "0x0000000000000000000000000000000000001001"
);

async function depositCompleted(txHash) {
 let tx = await web3.eth.getTransactionReceipt(txHash);
 let child_counter = await contractInstance.methods.lastStateId().call();
 let root_counter = web3.utils.hexToNumberString(tx.logs[3].topics[1]);
 return child_counter >= root_counter;
}

// Param 1 - Deposit transaction hash
depositCompleted(
 "transaction id"
)
 .then((res) => {
   console.log(res);
 })
 .catch((err) => {
   console.log(err);
 });
```

## Checkpoint事件

### 实时Checkpoint状态检查

BTTC上的所有交易都会定期提交Checkpoint到TRON。检查点发生在TRON上的合约RootChain。

下面是实时监听Checkpoint事件的例子

```js
const Web3 = require("web3");

// Ethereum provider
const provider = new Web3.providers.WebsocketProvider(
 "wss://goerli.infura.io/ws/v3/api-key"
);

const web3 = new Web3(provider);

const chil_provider = new Web3.providers.HttpProvider(
 ""
);
const child_web3 = new Web3(chil_provider);

async function checkInclusion(txHash, rootChainAddress) {
 let txDetails = await child_web3.eth.getTransactionReceipt(txHash);

 block = txDetails.blockNumber;
 return new Promise(async (resolve, reject) => {
   web3.eth.subscribe(
     "logs",
     {
       address: rootChainAddress,
     },
     async (error, result) => {
       if (error) {
         reject(error);
       }

       console.log(result);
       if (result.data) {
         let transaction = web3.eth.abi.decodeParameters(
           ["uint256", "uint256", "bytes32"],
           result.data
         );
         if (block <= transaction["1"]) {
           resolve(result);
         }
       }
     }
   );
 });
}

checkInclusion(
 "burn txid on child chain",
 "RootChainProxy"
)
 .then((res) => {
   console.log(res);
   provider.disconnect();
 })
 .catch((err) => {
   console.log(err);
 });
```

## 状态转移

BTTC的验证人持续对公共区块链上的`StateSender`合约进行监控。每当公共区块链上注册的合约调用`StateSender`时，它都会发出一个事件。BTTC的验证人用这个事件将数据中继到BTTC上的另一个合约。这个机制就是状态同步，用于将数据从公共区块链发送至BTTC。

BTTC的验证人定期向公共区块链上提交BTTC上所有交易的哈希值，这种提交被称为`checkpoint`，它可以用于验证发生在BTTC上的任何交易。当通过验证时，就可以在公共区块链上采取相应的行动。

同时使用这两种机制，以实现BTTC与公共区块链之间的双向数据传输。为了把这些交互抽象出来，您可以直接继承我们在公共区块链上的`FxBaseRootTunnel`合约，以及在BTTC上的`FxBaseChildTunnel`合约。

### Root Tunnel 合约

通过`FxBaseRootTunnel`合约，您可以使用以下功能：

* `_processMessageFromChild(bytes memory data)`：实现这个函数，来处理从Child Tunnel发送来的数据。

* `_sendMessageToChild(bytes memory message)`：使用任何字节数据作为参数，在合约内部调用这个函数，它将按原样将数据发送到Child Tunnel。

* `receiveMessage(bytes memory inputData)`：调用这个函数，来接收Child Tunnel发来的消息。交易证明需要通过`calldata`提供。

### Child Tunnel 合约

通过`FxBaseChildTunnel`合约，您可以使用以下功能：

* `_processMessageFromRoot(uint256 stateId, address sender, bytes memory data)`：实现这个函数，来处理从Root Tunnel发送的数据。

* `_sendMessageToRoot(bytes memory message)`：在合约内部调用此函数，可以将任何字节数据发送至Root Tunnel。

### 先决条件

1. 部署在公共区块链的Root合约需要继承`FxBaseRootTunnel`合约。您可以参照示例。同样，BTTC上的子合约也需要继承`FxBaseChildTunnel`合约。

2. `_checkpointManager`

3. `_fxChild`

4. 使用child tunnel的地址，在root tunnel上调用`setChildTunnel`方法；同时，使用root tunnel的地址，在child tunnel上调用`setRootTunnel`方法

### 从公共区块链到BTTC的状态转移

* 在根合约内部调用`_sendMessageToChild()`，将数据发送至BTTC。

* 在子合约中实现`_processMessageFromRoot()`来检索来自公共区块链的数据。当状态同步时，数据将自动从状态接收器接收。

#### 从BTTC到公共区块链的状态转移

* 在子合约内部调用`_sendMessageToRoot()`将数据发送至公共区块链。

* 交易哈希将在被收入checkpoint后，用于生成证明。可以使用如下的代码从交易哈希生成证明。

```js
const bttcPOSClient = new require("@bttcnetwork/bttcjs").BttcPOSClient({
  network: "",
  version: "",
  maticProvider: "https://rpc-mumbai.matic.today", // when using mainnet, replace to bttc mainnet RPC endpoint
  parentProvider: "https://rpc.slock.it/goerli", // when using mainnet, replace to ethereum mainnet RPC endpoint
});
const proof = bttcPOSClient.posRootChainManager
  .customPayload(
    "0x3cc9f7e675bb4f6af87ee99947bf24c38cbffa0b933d8c981644a2f2b550e66a", // replace with txn hash of sendMessageToRoot
    "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036" // SEND_MESSAGE_EVENT_SIG, do not change
  )
  .then(console.log);
```

* 在根合约中实现`_processMessageFromChild()`

* 用生成的证明作为`receiveMessage()`的参数，来检索从child tunnel发送来的数据。
