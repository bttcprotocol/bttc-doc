# Architecture

BTTC is a powerful blockchain platform for developing applications.

We'll use multiple sets of contracts to manage pledges on each TRON, and we'll work with BTTC network verifiers to ensure the platform's PoS mechanism runs smoothly. TRON will be BTTC's first basechain to be supported, but the ecosystem of BTTC will be much larger. Based on community suggestions, we will support more public blockchains.

BTTC has an architecture of three-layers:

1. Smart contracts on TRON
2. Validation layer
3. BTTC chain

![image](./pics/architecture.jpg)

## BTTC Smart Contracts

BTTC deploys a set of smart contracts on TRON to handle the following:

+ PoS layer staking

+ Validator share delegation

+ Sidechain checkpoint

## PoS Layer

The verification node works in conjunction with the TRON pledge contract to enable the BTTC network's PoS mechanism. We started with the TenderMint engine and added the necessary modifications. The verification layer is in charge of several critical tasks, including block verification, producer selection, and checkpoint submission.

The verification layer aggregates the side chain's blocks into a Merkel tree and periodically sends it to TRON. This type of regularly transmitted content is referred to as checkpoint. A verification layer node requires the following for every few blocks on the side chain:

+ Verify all blocks created since the previous checkpoint.

+ Create a Merkel tree based on the hash of a block

+ Transmit the merkle root to TRON

Checkpoints are important for the following reasons:

+ When withdrawing assets, provide proof of burning.

+ Ensure TRON's finality

The following is an overall description of the above process:

+ In the next interval, a subset of active validators will be chosen as block producers. The election of block producers requires a two-thirds vote of approval. These validators will be tasked with the responsibility of creating blocks and broadcasting them to the entire network.

+ Each checkpoint contains the roots of all the blocks contained within a specified interval. The verification node must validate these roots and sign them once they have been validated.

+ Among validators, a proposer will be generated. The proposer is responsible for gathering all signatures associated with a particular checkpoint and submitting them to TRON.

+ The likelihood that a verifier will obtain the right to create blocks and submit checkpoints is proportional to the verifier's equity.

## Block Producing Layer (Side Chain)

BTTC's block production layer is in charge of encapsulating transactions in blocks.

The verification layer's committee selects the block producer for the next span on a regular basis. The side chain's nodes generate blocks, and the side chain's virtual machine is fully compatible with the Ethereum virtual machine. The verification layer node will verify the side chain block on a periodic basis, and a checkpoint containing several blocks of Merkel hash will also be submitted to TRON on a periodic basis.