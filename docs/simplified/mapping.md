# 资产映射

映射是资产跨链转移的重要步骤。所谓映射，就是利用两个网络（比如TRON和BTTC）上的智能合约进行资产的一一对应，便于诸如锁定、销毁以及转移等操作。

## 介绍

下文的描述中，“根链”或“公共区块链”代表如TRON或者以太坊，“子链”或“侧链”则代表BTTC主网。

如果您的代币合约部署在根链上，并想将其转移到子链，那么这篇文档将给予足够的指引；如果您的代币合约部署在子链上，或您允许此代币在侧链增发，这将是一种不同的情况，我们称为BTTC Mintable Assets，请参看本页“可铸造代币”。

下面是一些合约代码示例，您可以对这些示例进行更改，但BTTC上的代币必须确保合约拥有`deposit`、`withdrawTo`以及`mint`功能。

## 子代币合约

**子合约必须满足如下条件：**

+ 继承[ChildERC20](https://github.com/bttcprotocol/pos-portal/blob/master/contracts/child/ChildToken/ChildERC20.sol)。其中`childChainManagerProxy`地址必须为`0x9a15f3a682d086c515be4037bda3b0676203a8ef`。

:::tip NOTE
每当从根链上发起存款请求时，`ChildChainManagerProxy`合约都会调用`deposit`方法。这个方法会在子链上铸造代币。

您必须确保`withdrawTo`是始终可用的，因为它将被用于燃烧子链上的代币。燃烧是取款过程的第一步，也是维持代币总发行量不变的重要步骤。
:::

### 标准子代币

如果您需要映射的代币是标准的TRC-20或TRC-721合约，请部署好合约后，在[这里](https://docs.google.com/forms/d/e/1FAIpQLScP1R7iB6s16CNKAZGjFH8mwDBi74wH_swzZvz3FGmjgUG33w/viewform)提交映射请求。

您可以通过以下链接来确定您的代币是否为标准合约：

+ [TRC-20](https://github.com/tronprotocol/TIPs/blob/master/tip-20.md)

+ [TRC-721](https://github.com/tronprotocol/tips/blob/master/tip-721.md)

### 自定义子代币

如果您需要映射自定义（非标准）的代币，首先您需要在子链上自行部署代币合约，然后在[这里](https://docs.google.com/forms/d/e/1FAIpQLScP1R7iB6s16CNKAZGjFH8mwDBi74wH_swzZvz3FGmjgUG33w/viewform)提交映射请求。请确保在提交请求时您提供了准确的代币信息。

下面是一个创建自定义子代币的例子：

::: warning
子代币合约的构造器中不进行代币铸造。
:::

### 实现

上文已经介绍了子代币合约必须满足的条件及其原因，下面就是按照要求来实现它。

::: warning
只有代理合约能调用deposit方法。
:::

```js
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
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
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

步骤：

+ 在根链上部署根代币，例如：TRON

+ 确保子代币有`deposit`以及`withdrawTo`方法，并继承[ChildERC20](https://github.com/bttcprotocol/pos-portal/blob/master/contracts/child/ChildToken/ChildERC20.sol)

+ 在BTTC上部署子代币，

+ 提交一个映射请求

## 可铸造代币

资产可通过PoS桥在公共区块链和BTTC之间转移，多数资产需要预先存在公共区块链上。另一种选择是在BTTC上直接创建代币，并在需要时将其转移到公共区块链上。与公共区块链相比，在BTTC上发行代币手续费较低，且速度更快。这种代币被称为BTTC可铸造资产。

当BTTC的可铸造资转移到公共区块链时，必须先在BTTC上销毁该代币，并在公共区块链上提交此次的销毁证明。`RootChainManager`合约在内部调用一个特殊的合约，它能直接在公共区块链上调用代币的铸造方法，并将代币铸造到用户地址。这个特殊的合约是`MintableAssetPredicate`。

### 部署在公共区块链上的合约

最重要的一点是，部署在公共区块链代币合约需要指定公共区块链上的`MintableAssetProxy`(例如：`MintableERC20Proxy`。Asset表示资产类型，下同) 合约为铸币者。只有`MintableAssetPredicate`合约有权在公共区块链上铸币。

这个角色可以通过调用根链上代币合约的`grantRole`方法来授予。第一个参数是`PREDICATE_ROLE`常量值，即`0x12ff340d0cd9c652c747ca35727e68c547d0f0bfa7758d2e77f75acef481b4f2`，第二个参数是相应的`Predicate`合约地址。

## 提交映射请求

请在[这里](https://docs.google.com/forms/d/e/1FAIpQLScsdmIx3Ux_5P8T1ffmoPWipn7XD46GZEz-xbjwGdBrCGoCZg/viewform)提交映射请求。
