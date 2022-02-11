# Asset Mapping

Mapping is a critical step in transferring assets between chains. The term "mapping" refers to the use of smart contracts on two networks (such as TRON and BTTC) to establish a one-to-one correspondence between assets, allowing for operations such as locking, destroying, and transferring to be performed more easily.

## Introduction

In the following description, "root chain" or "public blockchain" refers to TRON or Ethereum, and "subchain" or "side chain" refers to the BTTC main network.

If your token contract is currently deployed on the root chain and you wish to move it to a sub-chain, this document will provide sufficient guidance; if your token contract is currently deployed on a sub-chain, or your token is allowed to have extra issurance, you will encounter a different type of situation, which we refer to as BTTC Mintable Assets, See "Mintable Assets" on this page.

Here are some contract code examples. You can make changes to these examples, but you must ensure that the contract on BTTC uses the functions of `deposit`, `withdrawTo`, and `mint`.

## Child Token Contract

**Any child token contract must adhere to the following requirements:**

+ Inherit [ChildERC20](https://github.com/bttcprotocol/pos-portal/blob/master/contracts/child/ChildToken/ChildERC20.sol). Where the `childChainManagerProxy` address must be `0x9a15f3a682d086c515be4037bda3b0676203a8ef`.

:::tip NOTE
Provide a method of deposit. This function is invoked whenever a deposit request is initiated from the root chain by the 'ChildChainManagerProxy' contract. This method is used to mint tokens on the child chain.

Have a method of withdrawal. This method must always be available, as it will be used to burn tokens on the sub-chain. Burning is the first step in the withdrawal process and a critical step in ensuring that the total number of tokens issued remains constant.
:::

### Standard Child Token

If the token you need to map is a standard TRC-20 or TRC-721 contract, please submit a map request after deploying the contract [here](https://docs.google.com/forms/d/e/1FAIpQLScP1R7iB6s16CNKAZGjFH8mwDBi74wH_swzZvz3FGmjgUG33w/viewform).

You can determine whether your token is a standard contract by visiting the following link:

+ [TRC-20](https://github.com/tronprotocol/TIPs/blob/master/tip-20.md)

+ [TRC-721](https://github.com/tronprotocol/tips/blob/master/tip-721.md)

### Custom Child Token

If you wish to map a non-standard (custom) token, you must first deploy a token contract on the sub-chain and then send us your mapping request [here](https://docs.google.com/forms/d/e/1FAIpQLScP1R7iB6s16CNKAZGjFH8mwDBi74wH_swzZvz3FGmjgUG33w/viewform). Please ensure that you submit the request with accurate token information.

The following is an illustration of how to create a customized child token:

::: warning
The constructor of the child token contract must not perform token minting.
:::

#### Implementation

The conditions and reasons that the child token contract must meet have been introduced above, and the following is to implement it according to the requirements.

::: warning
Only proxy contracts can call the deposit method.
:::

```javascript
pragma solidity 0.6.6;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControlMixin} from "../../common/AccessControlMixin.sol";
import {IChildToken} from "./IChildToken.sol";
import {NativeMetaTransaction} from "../../common/NativeMetaTransaction.sol";
import {ContextMixin} from "../../common/ContextMixin.sol";


contract ChildERC20 is
    ERC20,
    IChildToken,
    AccessControlMixin,
    NativeMetaTransaction,
    ContextMixin
{
    bytes32 public constant DEPOSITOR_ROLE = keccak256("DEPOSITOR_ROLE");

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address childChainManager
    ) public ERC20(name_, symbol_) {
        _setupContractId("ChildERC20");
        _setupDecimals(decimals_);
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender()); //Optional. Required for extra issurance on BTTC
        _setupRole(DEPOSITOR_ROLE, childChainManager);
        _initializeEIP712(name_);
    }

    // This is to support Native meta transactions
    // never use msg.sender directly, use _msgSender() instead
    function _msgSender()
        internal
        override
        view
        returns (address payable sender)
    {
        return ContextMixin.msgSender();
    }

    /**
     * @notice called when token is deposited on root chain
     * @dev Should be callable only by ChildChainManager
     * Should handle deposit by minting the required amount for user
     * Make sure minting is done only by this function
     * @param user user address for whom deposit is being done
     * @param depositData abi encoded amount
     */
    function deposit(address user, bytes calldata depositData)
        external
        override
        only(DEPOSITOR_ROLE)
    {
        uint256 amount = abi.decode(depositData, (uint256));
        _mint(user, amount);
    }

    /**
     * @notice called when user wants to withdraw tokens back to root chain
     * @dev Should burn user's tokens. This transaction will be verified when exiting on root chain
     * @param amount amount of tokens to withdraw
     */
    function withdrawTo(address to, uint256 amount) public {
        _burn(_msgSender(), amount);
        emit WithdrawTo(to, address(0x00), amount);
    }

    function withdraw(uint256 amount) external {
        withdrawTo(_msgSender(), amount);
    }
}
```

Steps:

+ Deploy root tokens on the root chain, for example: TRON

+ Ensure that the child token has `deposit` and `withdrawTo` methods, and Inherit [IChildToken](https://github.com/bttcprotocol/pos-portal/blob/master/contracts/child/ChildToken/IChildToken.sol)

+ Deploy sub-token on BTTC

+ Submit a mapping request

::: tip NOTE
In most cases, for the token does not need to be issued on BTTC, only the `ChildChainManager` contract has the power to mint the token on BTTC (ie `_setupRole(DEPOSITOR_ROLE, childChainManager)`). When there is no need for additional issuance on BTTC, any account or contract other than `ChildChainManager` with minting powers will lead to audit failure, because redundant authorization will bring the risk of additional issuance.

For tokens that do not need to be issued on BTTC, if they have been deployed and authorized, they can give up their permissions by calling the `revoke` or `renounce` methods, and we will review whether the excess minting rights have been abandoned; Please redeploy the contract.
:::

## Mintable Assets

Assets can be transferred between the public blockchain and BTTC through the PoS bridge, and most assets need to be pre-deployed on the public blockchain. Another option is to create tokens directly on BTTC and transfer them to the public blockchain when needed. Compared with the public blockchain, the fee for issuing tokens on BTTC is lower and faster. Such tokens are called BTTC mintable assets.

When BTTC's mintable assets are transferred to the public blockchain, the token must be burnt on the BTTC first, and the proof of this burning must be submitted on the public blockchain. The `RootChainManager` contract calls a special contract internally, which can directly call the token minting method on the public blockchain and mint the tokens to the user address. This special contract is `MintableAssetPredicate`.

### Contract on Public Blockchains

The most important point is that the deployment of the token contract on the public blockchain needs to specify the `MintableAssetProxy`(e.g. `MintableERC20Proxy`. Asset represents the asset type, the same below) contract on the public blockchain as the mint. Only the `MintableAssetPredicate` contract has the right to mint coins on the public blockchain.

This role can be granted by calling the `grantRole` method of the token contract on the root chain. The first parameter is the constant value of `PREDICATE_ROLE`, which is `0x12ff340d0cd9c652c747ca35727e68c547d0f0bfa7758d2e77f75acef481b4f2`, and the second parameter is the corresponding `Predicate` contract address.

## Submit Mapping Request

Please submit your mapping request [here](https://docs.google.com/forms/d/e/1FAIpQLScP1R7iB6s16CNKAZGjFH8mwDBi74wH_swzZvz3FGmjgUG33w/viewform).
