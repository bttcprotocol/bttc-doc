# TRON &lt;-> BTTC

BTTC引入了一條可靠的，能夠連通TRON與BTTC網絡的跨鏈橋。通過跨鏈橋，用戶可以隨意通過BTTC來轉移自己的代幣到TRON上，並且無需考慮第三方機構帶來的風險以及流動性限制。

BTTC提供了一種極其高效、低成本並且靈活的擴展方案。

## 代幣跨鏈

當代幣通過跨鏈橋傳遞時，它的總流通量不會被影響

+ 離開TRON的代幣會被鎖定，同時在BTTC網絡上鑄造與其等量的映射代幣。

+ 將代幣從BTTC轉回TRON時，BTTC上的代幣將被銷毀，同時將解鎖TRON上的等量原始代幣。

## PoS橋

PoS橋能實現對資產的精確控制、提高存取款速度，並且增強資產的靈活性。作為一種資產轉移的方式，它非常適合需要跨鏈運行的dApp。

### 簡介

PoS橋能讓用戶自由的出入BTTC的生態系統。您可以高效的在鏈間轉移您的TRC-20或者TRC-721代幣。 PoS橋能夠在7-8分鐘內完成存款，並在30分鐘內完成提款過程。下文將介紹代幣轉移的流程。

### 使用PoS橋

開始介紹PoS橋的使用之前，我們建議您先了解下面兩個概念，以和跨鏈橋順利交互：

+ [代幣映射](mapping.md)

使用PoS橋的第一步是建立代幣映射。只有根鏈上的代幣合約與子鏈上的子代幣合約建立映射之後，才能在兩條鏈之間轉移這種資產。請發送郵件提交映射請求。

成功映射後，可以使用各種SDK，或直接通過接口與合約進行交互。

## 代幣充提

### 流程簡述

此處以ERC-20為例。

#### 充值

1. Approve ERC20Predicate合約，允許它控制需要被存入的代幣。

2. 在RootChainManager上調用depositFor。

#### 提取

1. 在BTTC上銷毀代幣。

2. 在RootChainManager上調用exit方法，以提交銷毀證明。需要在包含此銷毀交易的checkpoint提交之後調用。

### 詳細流程

#### 實例化合約

```js
const mainWeb3 = new Web3(mainProvider)
const bttcWeb3 = new Web3(bttcProvider)
const rootTokenContract = new mainWeb3.eth.Contract(rootTokenABI, rootTokenAddress)
const rootChainManagerContract = new mainWeb3.eth.Contract(rootChainManagerABI, rootChainManagerAddress)
const childTokenContract = new bttcWeb3(childTokenABI, childTokenAddress)
```

#### Approve

批准合約ERC20Predicate消費代幣。 approve需要兩個參數：地址和金額。

```js
await rootTokenContract.methods
  .approve(erc20Predicate, amount)
  .send({ from: userAddress })
```

#### 存款

調用RootChainManager合約的depositFor方法。這個方法需要接收三個參數：BTTC上接收存款的用戶地址，代幣合約在根鏈上的地址以及金額（以ABI編碼形式體現）。

請在存款之前，確保已經進行過正確的approve操作。

```js
const depositData = mainWeb3.eth.abi.encodeParameter('uint256', amount)
await rootChainManagerContract.methods
  .depositFor(userAddress, rootToken, depositData)
  .send({ from: userAddress })
```

#### 燃燒/銷毀

通過調用子代幣合約的withdraw方法來銷毀BTTC上的代幣。這個方法接收一個參數：要銷毀的代幣數量。銷毀代幣的證明需要在下一步操作中提交，因此要儲存銷毀交易的哈希。

```js
const burnTx = await childTokenContract.methods
  .withdraw(amount)
  .send({ from: userAddress })
const burnTxHash = burnTx.transactionHash
```

  #### 退出

調用RootChainManager合約的exit方法來解鎖並從ERC20Predicate合約接收代幣。這個方法接收一個參數：代幣的銷毀證明。

調用這個方法之前必須要等待包含銷毀交易的checkpoint提交成功。銷毀證明由RLP編碼生成如下字段：

+ headerNumber：包含銷毀交易的checkpoint起始塊
+ blockProof：確保區塊頭是提交的默克爾根所在樹中葉子的證明
+ blockNumber：包含銷毀交易的區塊號
+ blockTime：包含銷毀交易的區塊時間
+ txRoot：區塊的交易根
+ receiptRoot：區塊的receipt root
+ receipt：銷毀交易的receipt
+ receiptProof：銷毀交易receipt的默克爾根
+ branchMask：表示receipt在Merkle Patricia Tree中位置的一個32位參數
+ receiptLogIndex：用於從receipt中讀取的日誌索引

手動生成證明很複雜，因此我們建議使用BTTC SDK。如果您想手動發送交易，請將encodeAbi置為true以獲取原始調用數據。

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

## 存款與檢查點事件跟踪

### 存款事件

當代幣從公共區塊鏈存入BTTC時，狀態同步機制開始發揮作用，並最終在BTTC上鑄造代幣，整個過程需要5-7分鐘。由於時間較長，所以監聽用戶存款事件在此時尤為重要。 s

### 使用web socket進行存款事件追踪

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

### 在區塊鏈上查詢歷史存款是否成功

這段代碼可以查看特定的一筆存款是否已經完成。兩條鏈上各維護一個不斷增加的全局計數器變量。 StateSender合約發送帶有計數器數值的事件，子鏈上的計數器數值可以通過StateReceiver合約來查看。如果子鏈上的計數器數值大於等於主鏈計數器，則這筆存款可視作成功。

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

### 實時Checkpoint狀態檢查

BTTC上的所有交易都會定期提交Checkpoint到TRON。檢查點發生在TRON上的合約RootChain。

下面是實時監聽Checkpoint事件的例子

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

## 資產映射

映射是資產跨鏈轉移的重要步驟。所謂映射，就是利用兩個網絡（比如TRON和BTTC）上的智能合約進行資產的一一對應，便於諸如鎖定、銷毀以及轉移等操作。

### 介紹

下文的描述中，“根鏈”代表如TRON或者以太坊，子鏈則代表BTTC主網。

如果您的代幣合約部署在根鏈上，並想將其轉移到子鏈，那麼這篇文檔將給予足夠的指引；如果您的代幣合約部署在子鏈上，這將是一種不同的情況，我們稱為BTTC Mintable Assets。對於這種情況，請參考這篇[教程](mintable.md)。

### 標準子代幣

如果您需要映射的代幣是標準的TRC-20或TRC-721合約，請發送郵件進行映射請求，我們的團隊將以最快的速度為您在BTTC上部署標準的子代幣合約。

您可以通過以下鏈接來確定您的代幣是否為標準合約：

+ [TRC-20](https://github.com/tronprotocol/TIPs/blob/master/tip-20.md)

+ [TRC-721](https://github.com/tronprotocol/tips/blob/master/tip-721.md)

### 自定義子代幣

如果您需要映射自定義（非標準）的代幣，首先您需要在子鏈上自行部署代幣合約，然後發送郵件進行映射請求。請確保在提交請求時您提供了準確的代幣信息。

下面是一個創建自定義子代幣的例子：

**自定義子合約必須滿足如下條件：**

+ 擁有一個存款方法。每當從根鏈上發起存款請求時，`ChildChainManagerProxy`合約都會調用這個函數。這個方法會在子鏈上鑄造代幣。

+ 擁有一個取款方法。您必須確保這個方法是始終可用的，因為它將被用於燃燒子鏈上的代幣。燃燒是取款過程的第一步，也是維持代幣總發行量不變的重要步驟。

::: warning
子代幣合約的構造器中不進行代幣鑄造。
:::

#### 實現

上文已經介紹了子代幣合約必須滿足的條件及其原因，下面就是按照要求來實現它。

::: warning
只有代理合約能調用deposit方法。
:::

```js
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SubToken is ERC20 {

   address public childChainManagerProxy;
   address private owner;
  
   constructor(string memory name, string memory symbol, uint8 decimals, address _childChainManagerProxy) public ERC20(name, symbol) {
       _setupDecimals(decimals);
       // minting in subcontract is restricted.
       childChainManagerProxy = _childChainManagerProxy;
       owner = msg.sender;
   }

   function updateSubChainManager(address newChildChainManagerProxy) external {
       require(newChildChainManagerProxy != address(0), "The proxy cannot be the blackhole.");
       require(msg.sender == owner, "This can only be done by the owner.");

       childChainManagerProxy = newChildChainManagerProxy;
   }

   function deposit(address recipient, bytes calldata depositData) external {
       require(msg.sender == childChainManagerProxy, "You are not allowed.");

       uint256 amount = abi.decode(depositData, (uint256));

       // the 'amount' of tokens will be minted, and the same amount
       // will be locked on the root chain in RootChainManager

       _totalSupply += amount;
       _balances[user] += amount;

       emit Transfer(address(0), user, amount);
   }

   function withdraw(uint256 amount) external {
       _balances[msg.sender] -= amount;
       _totalSupply -= amount;

       emit Transfer(msg.sender, address(0), amount);
   }
}
```

步驟：

+ 在根鏈上部署根代幣，例如：TRON

+ 確保子代幣有deposit以及withdraw方法

+ 在子鏈上部署子代幣，即BTTC

+ 提交一個映射請求

### 提交映射請求

請發送郵件進行映射請求。

## 可鑄造代幣

資產可通過PoS橋在公共區塊鍊和BTTC之間轉移，多數資產需要預先存在公共區塊鏈上。另一種選擇是在BTTC上直接創建代幣，並在需要時將其轉移到公共區塊鏈上。與公共區塊鏈相比，在BTTC上發行代幣手續費較低，且速度更快。這種代幣被稱為BTTC可鑄造資產。

當BTTC的可鑄造資轉移到公共區塊鏈時，必須先在BTTC上銷毀該代幣，並在公共區塊鏈上提交此次的銷毀證明。 `RootChainManager`合約在內部調用一個特殊的合約，它能直接在公共區塊鏈上調用代幣的鑄造方法，並將代幣鑄造到用戶地址。這個特殊的合約是`MintableAssetPredicate`。

### 需要滿足的條件

您可以在BTTC上部署可鑄造的代幣，或者通過提交映射請求，在BTTC上自動部署可鑄造的代幣合約。

如果您打算自行部署合約，下面是一些合約代碼示例。您可以對這些示例進行更改，但必須確保合約用有`deposit`、`withdraw`以及`mint`功能。

### 部署在公共區塊鏈上的合約

最重要的一點是，部署在公共區塊鏈代幣合約需要指定公共區塊鏈上的`MintableAssetProxy`合約為鑄幣者。只有`MintableAssetPredicate`合約有權在公共區塊鏈上鑄幣。

這個角色可以通過調用根鏈上代幣合約的`grantRole`方法來授予。第一個參數是`PREDICATE_ROLE`常量值，即`0x12ff340d0cd9c652c747ca35727e68c547d0f0bfa7758d2e77f75acef481b4f2`，第二個參數是相應的`Predicate`合約地址：

## 狀態轉移

BTTC的驗證人持續對公共區塊鏈上的`StateSender`合約進行監控。每當公共區塊鏈上註冊的合約調用`StateSender`時，它都會發出一個事件。 BTTC的驗證人用這個事件將數據中繼到BTTC上的另一個合約。這個機制就是狀態同步，用於將數據從公共區塊鏈發送至BTTC。

BTTC的驗證人定期向公共區塊鏈上提交BTTC上所有交易的哈希值，這種提交被稱為`checkpoint`，它可以用於驗證發生在BTTC上的任何交易。當通過驗證時，就可以在公共區塊鏈上採取相應的行動。

同時使用這兩種機制，以實現BTTC與公共區塊鏈之間的雙向數據傳輸。為了把這些交互抽像出來，您可以直接繼承我們在公共區塊鏈上的`FxBaseRootTunnel`合約，以及在BTTC上的`FxBaseChildTunnel`合約。

### Root Tunnel 合約

通過`FxBaseRootTunnel`合約，您可以使用以下功能：

* `_processMessageFromChild(bytes memory data)`：實現這個函數，來處理從Child Tunnel發送來的數據。

* `_sendMessageToChild(bytes memory message)`：使用任何字節數據作為參數，在合約內部調用這個函數，它將按原樣將數據發送到Child Tunnel。

* `receiveMessage(bytes memory inputData)`：調用這個函數，來接收Child Tunnel發來的消息。交易證明需要通過`calldata`提供。

### Child Tunnel 合約

通過`FxBaseChildTunnel`合約，您可以使用以下功能：

* `_processMessageFromRoot(uint256 stateId, address sender, bytes memory data)`：實現這個函數，來處理從Root Tunnel發送的數據。

* `_sendMessageToRoot(bytes memory message)`：在合約內部調用此函數，可以將任何字節數據發送至Root Tunnel。

### 先決條件

1. 部署在公共區塊鏈的Root合約需要繼承`FxBaseRootTunnel`合約。您可以參照示例。同樣，BTTC上的子合約也需要繼承`FxBaseChildTunnel`合約。

2. `_checkpointManager`

3. `_fxChild`

4. 使用child tunnel的地址，在root tunnel上調用`setChildTunnel`方法；同時，使用root tunnel的地址，在child tunnel上調用`setRootTunnel`方法

### 從公共區塊鏈到BTTC的狀態轉移

* 在根合約內部調用`_sendMessageToChild()`，將數據發送至BTTC。

* 在子合約中實現`_processMessageFromRoot()`來檢索來自公共區塊鏈的數據。當狀態同步時，數據將自動從狀態接收器接收。

#### 從BTTC到公共區塊鏈的狀態轉移

* 在子合約內部調用`_sendMessageToRoot()`將數據發送至公共區塊鏈。

* 交易哈希將在被收入checkpoint後，用於生成證明。可以使用如下的代碼從交易哈希生成證明。

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

* 在根合約中實現`_processMessageFromChild()`

* 用生成的證明作為`receiveMessage()`的參數，來檢索從child tunnel發送來的數據。
