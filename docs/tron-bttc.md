# TRON &lt;-> BTTC

BTTC launched a secure cross-chain bridge capable of connecting the TRON and BTTC networks. Users can freely transfer their tokens to TRON via BTTC via the cross-chain bridge, without having to consider the risks and liquidity constraints imposed by third-party institutions.

BTTC offers a highly efficient, cost-effective, and adaptable expansion solution.

## Token Cross-chain

When tokens are transferred across chains, their total circulation is unaffected.

+ Tokens that leave the TRON network will be locked, and an equivalent number of mapped tokens will be minted on the BTTC network.

+ When tokens are transferred from BTTC to TRON, the tokens on BTTC are destroyed and the corresponding amount of original tokens on TRON are unlocked.

## PoS Bridge

The PoS bridge enables precise asset control, increases deposit and withdrawal speeds, and increases asset flexibility. As a method of asset transfer, it is ideal for decentralized applications (dApps) that need to run across chains.

### Description

Users can freely enter and exit the BTTC ecosystem via the PoS bridge. You can transfer your TRC-20 or TRC-721 tokens between chains efficiently. The PoS bridge can complete the deposit process in as little as 7-8 minutes and the withdrawal process in as little as 30 minutes. The process of token transfer will be discussed in greater detail below.

### Using the PoS Bridge

Prior to introducing the use of PoS bridges, we recommend that you familiarize yourself with the following two concepts to ensure that you can interact with cross-chain bridges smoothly:

+ [Token Mapping](mapping.md)

To begin using a PoS bridge, a token mapping must be established. This asset cannot be transferred between the two chains until the root chain's token contract and the sub-token contract on the sub-chain are mapped. Kindly send us your request for token mapping through email.

After successful mapping, you can interact with the contract via the interface or via various SDKs.

### Token Deposit & Withdraw

Having ERC-20 as an example.

#### Deposit

The Approve ERC20Predicate contract enables it to manage the required token deposits.

On RootChainManager, call depositFor.

#### Withdraw

Destroy BTTC tokens.

To submit the destruction certificate, invoke the exit method on RootChainManager. It must be invoked following the submission of the checkpoint containing this destruction transaction.

### Detailed Process

#### Instantiate Contract

```js
const mainWeb3 = new Web3(mainProvider)
const bttcWeb3 = new Web3(bttcProvider)
const rootTokenContract = new mainWeb3.eth.Contract(rootTokenABI, rootTokenAddress)
const rootChainManagerContract = new mainWeb3.eth.Contract(rootChainManagerABI, rootChainManagerAddress)
const childTokenContract = new bttcWeb3(childTokenABI, childTokenAddress)
```

#### Approve

Approve the contract ERC20Predicate consumption tokens. Approve requires two parameters: address and amount.

```js
await rootTokenContract.methods
  .approve(erc20Predicate, amount)
  .send({ from: userAddress })
```

#### Deposit

Invoke the RootChainManager contract's depositFor method. This method requires three parameters: the user's BTTC address, the root chain address of the token contract, and the deposit amount (in the form of ABI encoding).

Please ensure that the appropriate approval operation has been performed prior to depositing.

```js
const depositData = mainWeb3.eth.abi.encodeParameter('uint256', amount)
await rootChainManagerContract.methods
  .depositFor(userAddress, rootToken, depositData)
  .send({ from: userAddress })
```

#### Burn/Destroy

Call the withdraw method of the child token contract to destroy the tokens on BTTC. This method accepts a single parameter: the quantity of tokens to destroy. The proof of token destruction must be submitted in the subsequent operation, which means that the hash of the token destruction transaction must be stored.

```js
const burnTx = await childTokenContract.methods
  .withdraw(amount)
  .send({ from: userAddress })
const burnTxHash = burnTx.transactionHash
```

#### Exit

To unlock and receive tokens from the ERC20Predicate contract, invoke the RootChainManager contract's exit method. This method accepts a single parameter: the proof of the token's destruction.

Prior to calling this method, you must ensure that the checkpoint containing the destroyed transaction was successfully submitted. The destruction certificate uses RLP encoding rules to generate the following fields:

+ headerNumber: The checkpoint starting block containing the destruction transaction

+ blockProof: Ensure that the block header is the proof of the leaf in the tree where the submitted Merkel root is located

+ blockNumber: contains the block number of the destruction transaction

+ blockTime: contains the block time of the destroyed transaction

+ txRoot: the transaction root of the block

+ receiptRoot: the receipt root of the block

+ receipt: the receipt of the destroyed transaction

+ receiptProof: Merkel root that destroys the transaction receipt

+ branchMask: a 32-bit parameter indicating the position of receipt in the Merkle Patricia Tree

+ receiptLogIndex: log index used to read from receipt

Because manually generating the certificate is inconvenient, we recommend using the BTTC SDK. If you wish to manually send the transaction, set encodeAbi to true to obtain the original call data.

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

## Deposit and Checkpoint Time Tracking

### Deposit Event

When tokens from the public blockchain are deposited into BTTC, the state synchronization mechanism kicks in, and finally, tokens are minted on BTTC. The entire procedure takes approximately 5-7 minutes. Due to the length of time, it is critical to monitor user deposit events during this period.

### Tracking Deposit Events with Web Socket

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

### Verify the historical deposit on the blockchain

This code can be used to determine whether a particular deposit has been completed. Each of the two chains maintains a global counter variable that is increasing. The StateSender contract sends an event with a counter value, and the StateReceiver contract can view the counter value on the sub-chain. If the value of the sub-counter chain's is greater than or equal to the value of the main chain's counter, the deposit is considered successful.

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

#### Checkpoint Event

##### Realtime Checkpoint Status Checking

All BTTC transactions will be submitted as Checkpoints to TRON on a regular basis. On TRON, the checkpoint occurred on the RootChain contract.

The following is an illustration of real-time Checkpoint event monitoring.

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

### Historical Checkpoint Inclusion Checking

You can query through the API.

## Asset Mapping

Mapping is a critical step in transferring assets between chains. The term "mapping" refers to the use of smart contracts on two networks (such as TRON and BTTC) to establish a one-to-one correspondence between assets, allowing for operations such as locking, destroying, and transferring to be performed more easily.

### Introduction

The "root chain" in the following description refers to public blockchains, such as TRON or Ethereum, and the "subchain" refers to the BTTC main network.

If your token contract is currently deployed on the root chain and you wish to move it to a sub-chain, this document will provide sufficient guidance; if your token contract is currently deployed on a sub-chain, you will encounter a different type of situation, which we refer to as BTTC Mintable Assets. Please refer to this [tutorial] in this case (mintableassets.md).

#### Standard Child Token

If the token being mapped is a standard TRC-20 or TRC-721 contract, all you need to do is send us a mail, and our team will quickly deploy it on BTTC. Contract for standard sub-tokens.

You can determine whether your token is a standard contract by visiting the following link:

+ [TRC-20](https://github.com/tronprotocol/TIPs/blob/master/tip-20.md)

+ [TRC-721](https://github.com/tronprotocol/tips/blob/master/tip-721.md)

#### Custom Child Token

If you wish to map a non-standard (custom) token, you must first deploy a token contract on the sub-chain and then send us your mapping request. Please ensure that you submit the request with accurate token information.

The following is an illustration of how to create a customized child token:

**Any child token contract must adhere to the following requirements:**

+ Provide a method of deposit. This function is invoked whenever a deposit request is initiated from the root chain by the 'ChildChainManagerProxy' contract. This method is used to mint tokens on the child chain. 

+ Have a method of withdrawal. This method must always be available, as it will be used to burn tokens on the sub-chain. Burning is the first step in the withdrawal process and a critical step in ensuring that the total number of tokens issued remains constant.

::: warning
The constructor of the child token contract must not perform token minting.
:::

##### Implementation

The conditions and reasons that the child token contract must meet have been introduced above, and the following is to implement it according to the requirements.

::: warning
Only proxy contracts can call the deposit method.
:::

```javascript
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

Steps:

+ Deploy root tokens on the root chain, for example: TRON

+ Ensure that the child token has deposit and withdraw methods

+ Deploy sub-tokens on sub-chains, namely BTTC

+ Submit a mapping request

## State Transition

BTTC validators are continuing to monitor the public blockchain's `StateSender` contract. When a contract registered on the public blockchain makes a call to `StateSender,` an event is generated. Validators on the BTTC network use this event to relay data to another contract on the BTTC network. This mechanism is known as state synchronization, and it is used to transfer data from the public blockchain to the BTTC blockchain.

BTTC validators submit the hash values of all BTTC transactions to the public blockchain on a regular basis. This submission is referred to as a checkpoint, and it can be used to verify any BTTC transaction. When the verification is successful, the corresponding actions on the public blockchain can be taken.

Both mechanisms are used concurrently to enable bidirectional data transfer between BTTC and the public blockchain. To abstract these interactions, you can directly inherit our public blockchain contract `FxBaseRootTunnel` and the BTTC contract `FxBaseChildTunnel`.

### Contract Root Tunnel

The following functions are available via the `FxBaseRootTunnel` contract:

* `_processMessageFromChild(bytes memory data)`: This function is used to process data received from Child Tunnel.

* `_sendMessageToChild(bytes memory message)`: Pass any byte data as a parameter and call this function within the contract; the data will be sent to Child Tunnel in its entirety.

*`receiveMessage(bytes memory inputData)`: this function is used to receive messages sent by Child Tunnel. `calldata` must be used to provide proof of transaction.

### Contract Child Tunnel

The following functions are available via the FxBaseChildTunnel contract:

* `_processMessageFromRoot(uint256 stateId, sender address, bytes memory data)`: this function is used to process data sent via the Root Tunnel.

* `_sendMessageToRoot(bytes memory message)`: Use this function to send any byte data to the Root Tunnel from within the contract.

### Prerequisites

1. On the public blockchain, the Root contract must inherit the `FxBaseRootTunnel` contract. Similarly, the sub-contracts on BTTC must inherit the `FxBaseChildTunnel` contract.

2. The location of the `_checkpointManager` object

3. `_fxChild` has the address `_fxChild`

4. Call the`setChildTunnel` method on the root tunnel using the address of the child tunnel; concurrently, call the`setRootTunnel` method on the child tunnel using the address of the root tunnel.

### Transition of State Between Public Blockchain and BTTC

* Within the root contract, call `_sendMessageToChild()` to send data to BTTC.

* In the sub-contract, implement `_processMessageFromRoot()` to retrieve data from the public blockchain. When the status is synchronized, the data from the status receiver is automatically received.

#### BTTC state transfer to public blockchain

* Call `_sendMessageToRoot()` in the sub-contract to send the data to the public blockchain.

* After the transaction hash is collected in the checkpoint, it will be used to generate a proof. The following code can be used to generate a proof using the hash of the transaction.

```js
// npm i @bttcnetwork/bttcjs
const bttcPOSClient = new require("@bttcnetwork/bttcjs").BttcPOSClient({
  network: "testnet", 
  version: "", 
  maticProvider: "https://rpc-mumbai.matic.today", // when using mainnet, replace to BTTC mainnet RPC endpoint
  parentProvider: "https://rpc.slock.it/goerli", // when using mainnet, replace to ethereum mainnet RPC endpoint
});
const proof = bttcPOSClient.posRootChainManager
  .customPayload(
    "0x3cc9f7e675bb4f6af87ee99947bf24c38cbffa0b933d8c981644a2f2b550e66a", // replace with txn hash of sendMessageToRoot
    "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036" // SEND_MESSAGE_EVENT_SIG, do not change
  )
  .then(console.log);
```

* In the root contract, implement `_processMessageFromChild()`.

* To retrieve data sent from the child tunnel, pass the generated certificate as a parameter to`receiveMessage()`.
