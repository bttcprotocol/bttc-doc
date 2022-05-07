# Delegator and Validator

## Overview

BitTorrent-Chain is a blockchain application platform. If you wish to become a validator by setting up a node for BitTorrent-Chain, or to become a delegate to entrust tokens to a validator and receive rewards, you can use this document to get a quick overview of what is involved.

## PoS, Staking and voting

### Proof of Stake (PoS)

Proof of Stake (PoS) is a class of consensus algorithm for public blockchains that depends on the economic interest of the Validator in the network. In proof-of-work (PoW)-based public blockchains (such as current implementations of Bitcoin and Ether), the algorithm rewards participants who solve cryptographic puzzles to validate transactions and create new blocks (i.e. mining). In a PoS-based public blockchain, a set of super delegates take turns proposing and voting on the next block, with the weight of each Validator vote depending on the size of its deposit (i.e. equity). significant advantages of PoS include security, reduced risk of centralisation and energy efficiency.

For more detailed information, see https://github.com/ethereum/wiki/wiki/Proof-of-Stake-FAQ.

### Staking

Staking is the process of locking tokens into a deposit in order to gain the right to verify and produce blocks on the blockchain. Usually, pledging is done in the network's native token.

### Voting

Voting is the process by which token holders delegate their shares to a Validator. It allows token holders who do not have the skills or desire to run a node to participate in the network and receive a reward proportional to the number of shares voted.

## Architecture

BitTorrent-Chain is a blockchain application platform with an overall structure divided into three layers.

* Root Contracts layer: Root contracts on TRON and other blockchain networks, support for users to map tokens to BitTorrent-Chain by accessing funds, and support for features such as pledges.
* Validator layer: Validates BitTorrent-Chain blocks and regularly sends checkpoints to the supporting TRON and other blockchain networks.

    Bridge: Listens for events on each chain, sends event messages, etc.

    Core: Consensus module, including validation of Checkpoint (snapshot of BitTorrent-Chain state), consensus on Statesync events & Staking events.  

    REST-Server: provides related API services.

* BitTorrent-Chain layer.

## Github Code

BitTorrent-Chain's code base for understanding how the core BitTorrent-Chain components work.

Once you are familiar with the architecture and code base, you can set up your node. Please note that the above documentation is only intended to familiarise you with the inner workings of the polygon, you can set up your nodes directly without familiarising yourself with the specifications above.

## Setting up your node

Please refer to the node setup [documentation](http://doc.bt.io/v1/doc/validator/node.html "documentation")

## Delegator

There are no prerequisites to become a delegator of BitTorrent-Chain, only a TRON account is required. 

A delegator does not need to host a full node to participate in the verification. They can stake BTT tokens to a validator and receive a portion of the reward in exchange. Because they share the reward with the validator, the delegator also shares the risk. Delegators play a crucial role in the system because they can choose the Validator as they wish.

### Voting related contract interface description
#### Vote for a Validator

* Contract method:`ValidatorShare:buyVoucher(uint256, uint256)`
* Parameters:
    * `_amount`：vote amount
    * `_minSharesToMint`：The minimum acceptable number of share tokens. The BTT voted by the delegator for the validator will be converted into share tokens to represent the share of the user's votes for the validator in the total votes. The delegator can query the number of shares he owns through the `balanceOf` method of the validator's ValidatorShare contract.
* Illustration
    1. Before calling buyVoucher, you need to authorize the contract [`StakeManagerProxy`](https://tronscan.org/#/contract/TEpjT8xbAe3FPCPFziqFfEjLVXaw9NbGXj/code) to transfer [`BTT`](https://tronscan.org/#/contract/TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4/code) from delegator account by calling the `approve` method of BTT.
    2. Each validator has a corresponding ValidatorShare contract. You can access the validators[validatorId].contractAddress of StakeManagerProxy to obtain the ValidatorShare contract address of a validator
    3. This method can also used as adding votes for validators

#### Claim rewards

* Contract method: `ValidatorShare:withdrawRewards()`
* parameters: none
* Illustration
    1. The delegator calls the withdrawRewards method of the validator's ValidatorShare contract to withdraw the reward. After the execution is successful, the reward immediately reaches the delegator's account.

#### Cancel votes

* Contract method: `ValidatorShare:sellVoucher_new:(uint256, uint256)`
* Parameters:
    * uint256 claimAmount：claiming amount; The total amount of BTT voted by the delegator for the validator, which can be obtained through the ValidatorShare:getTotalStake method.
    * uint256 maximumSharesToBurn：acceptable maximum number of share token to burn; the number of share token owned by the delegator can be obtained through the ValidatorShare:balanceOf method.
* Illustration
    1. Cancellation vote can be done in multiple times, but the interval between each time is at least one checkpoint.
    2. After the vote is cancelled, the staked BTT needs to go through a lock-up period of 80 checkpoints before it can be withdrawn.

#### Withdraw staked BTT
* Contract method: ValidatorShare:unstakeClaimTokens_new(uint256)
* Parameter
    * uint256 unbondNonce: The nonce of the `cancle vates` operation, that is, to withdraw the BTT of the nonce `cancel vates`. The total number of `cancel votes` operation by the delegator can be queried through the ValidatorShare:unbondNonces method.
* Illustrate
    1. This method can only be called after a lock-up period of 80 checkpoints has elapsed after the vote is cancelled.

### Reward reinvestment
The reward re-investment is to vote the reward to the validator to obtain more voting rewards.
* Contract method: ValidatorShare:reStake()
* parameter: none

#### Transfer vote
To transfer votes is to transfer a portion of the votes to another validator.
* Contract method: StakeManagerProxy:migrateDelegation(uint256, uint256, uint256)
* parameter
    * uint256 fromValidatorId: source validator id
    * uint256 toValidatorId: target validator id
    * uint256 amount: transfer amount
* illustrate
    1. Only can transfer to validators whoes validatorID is greater than 7
    2. The transfer of votes will automatically trigger the `Claim rewards` operation


## Validator

### What is a Validator

A Validator (Validator) is a participant in the network who locks tokens into the network and runs the Super Delegate node to help run the network. A Super Delegate has the following responsibilities.

* Pledging the network token and running the Validator node to join the network as a validator
* Receive pledge rewards by verifying state transitions on the blockchain
* Receive penalties for activities such as downtime

A Blockchain Validator is the person responsible for validating transactions within the blockchain, and for BitTorrent-Chain, any participant can qualify as a BitTorrent-Chain Validator by running a full node for rewards and transaction fees. selected, and these selected super-representatives will participate as block producers and validators.

The Validator has two addresses.

* Owner address: from this address the Validator can handle administration-related functions such as canceling collateral, getting rewards, and setting stake parameters.
* Signer address: from this address the validator signs checkpoints and runs nodes.

### Architecture

The BitTorrent-Chain is a blockchain application platform with an overall structure divided into three layers.

* Root Contracts layer: Root contracts on TRON and other blockchain networks will support functions of staking, mapping tokens to BitTorrent-Chain by depositing/withdrawing funds, etc.
* Validator layer: Validates BitTorrent-Chain blocks and periodically sends checkpoints to the TRON and other supported blockchain networks.

     Bridge: Responsible for listening to events on each chain, sending event   messages, etc.

     Core: Consensus module, including verification of Checkpoint (snapshot of BitTorrent-Chain chain state), consensus of Statesync events & Staking events.  

     REST-Server: Provides related API services.

* BitTorrent-Chain layer.

![image](./pics/architecture.jpg)

### Functions

A Blockchain Validator is the person responsible for verifying transactions within the blockchain. For BitTorrent-Chain, any participant is eligible to become a BitTorrent-Chain Validator, earning rewards and transaction fees by running a full node. To ensure good participation by the Validator, they lock in a number of their BTT tokens as shares in the ecosystem.

BitTorrent-Chain's Validators are selected through an on-chain stake, a process that takes place periodically. These selected super-representatives participate as block producers and validators. Once a checkpoint (a set of blocks) has been verified by a participant, it is then updated on TRON & Ether & BSC and a reward is issued for the super-representative based on his or her shares in the network.

#### Duties of the Validator

* Join the network by locking in BTT tokens in a stake contract on TRON.
* Validators can exit the system at any time, which can be done by unstake executing transactions on the contract.
* The Validator can increase the number of Stake BTT tokens at any time to increase pledge capacity.
* After setting up a Validator node, the Validator will perform the following actions.

     1. Block Producer Selection

     2. Validate the block on BitTorrent-Chain

     3. checkpoint submission

     4. Synchronise changes to the BitTorrent-Chain stake contract on Ether

     5. State sync from TRON & Ether & BSC to BitTorrent-Chain layer

* Validators are required to maintain a minimum number of tokens to pay for transactions on the relevant chain.

### Core components

#### The Validator Layer

The Validator layer aggregates the blocks generated by the BitTorrent-Chain into a Merkle tree, and periodically publishes the Merkle root to the root chain. This periodic posting is called a "checkpoint". For each block on BitTorrent-Chain, a Validator (Validator).

1. Validates all blocks since the last checkpoint.
2. Create a merkle tree of block hashes.
3. Posting the merkle root to the main chain.

Checkpoints are important for two reasons.

1. To provide finality on the root chain.
2. Provide proof of destruction when assets are withdrawn.

#### BitTorrent-Chain

A block producer in the BitTorrent-chain layer, the VM in the BitTorrent-chain layer is compatible with EVM, a basic Geth implementation with custom modifications to the consensus algorithm.

#### Checkpoint mechanism (Checkpoint)

A proposer is selected in Validator by the weighted round robin algorithm of Tendermint. There is a 2 stage submission process for successfully submitting a checkpoint on Tendermint, one where the proposer selected by the Tendermint algorithm above sends a checkpoint with his address in the proposer field and all other proposers will validate it before adding it This is verified by all other proposers before adding it to their state.

The next proponent then sends a confirmation transaction to prove that the previous checkpoint transaction has succeeded in the Ethernet mainnet. Each change to the validator set will be forwarded by the Validator node on the Validator, which is embedded on the super delegate node. This allows the super-representative to stay in sync with the state of BitTorrent-chain contracts on chains such as TRON & Ethereum at all times.

The BitTorrent-chain contracts deployed on chains such as TRON & Ethereum are considered to be the ultimate source of truth, so all verification is done by querying the BitTorrent-chain contracts on chains such as TRON & Ethereum.

#### Transaction Fees

Each block producer in the BitTorrent-chain layer will receive a percentage of the transaction fees charged for each block.

#### State Synchronisation Mechanism

A Validator on the Validator layer receives the StateSynced event and passes it to the BitTorrent-chain layer.

The receiver contract inherits from the IStateReceiver, and the associated custom logic is located within the onStateReceive function.

What the Dapp/user needs to do is work with the state-sync.

1. The syncState() function of the StateSender contract is called.
2. The above function will trigger the StateSynced(uint256 indexed id, address indexed contractAddress, bytes data); event
3. All super delegates on the Validator layer will receive this event.
4. Once a state sync transaction on the Validator layer is included in a block, it is added to the pending state sync list.
5. BitTorrent-chain layer nodes fetch the pending state sync event from the DanValidator via an API call.
6. The receiver contract inherits the IStateReceiver interface and the custom logic to decode the data bytes and perform any actions is located in the onStateReceive function.


### Stake Related Contracts Interface Description
#### Stake
* Contract method: StakeManagerProxy:stakeFor(address, uint256, uint256, bool, bytes memory)
* parameter
    * address user: stake account address, that is, the validator's owner address
    * uint256 amount: the amount of staked BTT
    * uint256 deliveryFee: delivery fee; The validator needs to pay a fee for signing a checkpoint, so it is necessary to deposit a certain fee for the signer address in advance.
    * bool acceptDelegation: Whether the validator accepts the delegator's vote
    * bytes memory signerPubkey: the public key of the signature account; that is, the public key of validator's signer address, the leading "04" needs to be removed
* illustration
    1. The minimum value allowed by the parameter `amount` can be queried through the StakeManagerProxy:minDeposit method (currently 10^30, which is 10^12 BTT).
    2. The minimum value allowed by the parameter `deliveryFee` can be queried through the StakeManagerProxy:minHeimdallFee method (currently 10^23, which is 100000 BTT).
    3. Parameter `acceptDelegation`: true means accepting the vote of the delegator, false means not accepting the vote of the delegator; the value of this property can be changed later through ValidatorShare:updateDelegation.
    4. Before calling stakeFor, you need to authorize [`StakeManagerProxy`](https://tronscan.org/#/contract/TEpjT8xbAe3FPCPFziqFfEjLVXaw9NbGXj/code) contract to transfer [`BTT`](https://tronscan.org/#/contract/TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4/code) from the stake account address by calling the `approve` method of BTT, and the number of BTT approved should be larger than the amount of staked BTT.
    2. After the user stakes BTT successfully, the validatorID can be obtained through `stakeManagerProxy:getValidatorId` , and then the validator's detailed information can be obtained through `stakeManagerProxy:validators` method.

#### Stake more
* Contract method: StakeManagerProxy:restake(uint256, uint256, bool)
* parameter
    * uint256 validatorId: the validator id
    * uint256 amount: stake amount
    * bool stakeRewards: whether to stake the reward
* illustration
    1. The prerequisite for calling this method is to successfully call the StakeManagerProxy:stakeFor method and become a validator.

#### Claim rewards
* Contract method: StakeManagerProxy:withdrawRewards(uint256)
* parameter
    * uint256 validatorId: validator id
* illustration
    1. The validator can claim the reward through the withdrawRewards method. After successfully execution, the reward will be immediately put into the validator's account.


#### Unstake
Validators can unstake BTT when they want to exit the system, stop validating blocks and commit checkpoints. In order to ensure good participation, the staked BTT of validators will be locked for withdrawalDelay checkpoints.

* Contract method: StakeManagerProxy:unstake(uint256)
* parameter
    * uint256 validatorId: validator id
* illustration
    1. The validator can cancel the stake through the unstake method, and immediately return the reward tokens to the validator's account after canceling the stake, but the staked tokens need to be claimed through the `unstakeClaim` method.
    2. The unstakeClaim method must wait for withdrawalDelay (currently 80) checkpoints before it can be called.

#### Withdraw the staked BTT
* Contract method: StakeManagerProxy:unstakeClaim(uint256)
* parameter
    * uint256 validatorId: validator id 
* illustration
    1. After unstake, you need to wait for withdrawalDelay (currently the value is 80) checkpoints before calling this method to claim the previously staked BTT.

#### Update signer public key of validator  
* Contract method: StakeManagerProxy:updateSigner(uint256, bytes memory)
* parameter
    * uint256 validatorId: validator id
    * bytes memory signerPubkey: new signer public key
* illustration
    1. The validator can update the signer account, but the time interval between two update operations needs to be greater than signerUpdateLimit (currently 100) checkpoints.

#### Update commission rate
* Contract method: StakeManagerProxy:updateCommissionRate(uint256, uint256)
* parameter
    * uint256 validatorId: validator id
    * uint256 newCommissionRate: new commission rate
* illustration
    1. Validators can update the commission ratio, but the time interval between two update operations needs to be greater than WITHDRAWAL_DELAY (currently 80) checkpoints.
    2. The commission ratio needs to be less than or equal to 100

