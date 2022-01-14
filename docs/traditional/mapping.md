# 資產映射

映射是資產跨鏈轉移的重要步驟。所謂映射，就是利用兩個網絡（比如TRON和BTTC）上的智能合約進行資產的一一對應，便於諸如鎖定、銷毀以及轉移等操作。

## 介紹

下文的描述中，“根鏈”或“公共區塊鏈”代表如TRON或者以太坊，“子鏈”或“側鏈”則代表BTTC主網。

如果您的代幣合約部署在根鏈上，並想將其轉移到子鏈，那麼這篇文檔將給予足夠的指引；如果您的代幣合約部署在子鏈上，或您允許此代幣在側鏈增發，這將是一種不同的情況，我們稱為BTTC Mintable Assets，請參看本頁“可鑄造代幣”。

下面是一些合約代碼示例。您可以對這些示例進行更改，但必須確保BTTC上的合約拥有`deposit`、`withdrawTo`以及`mint`功能。

## 子代幣合約

**自定義子合約必須滿足如下條件：**

+ 繼承[ChildERC20](https://github.com/bttcprotocol/pos-portal/blob/master/contracts/child/ChildToken/ChildERC20.sol)。其中`childChainManager`地址必須為`0x5e87d84828eddd249e7463e9fbd06a49920114e9`。

+ 擁有一個存款方法。每當從根鏈上發起存款請求時，`ChildChainManagerProxy`合約都會調用這個函數。這個方法會在子鏈上鑄造代幣。

+ 擁有一個取款方法。您必須確保這個方法是始終可用的，因為它將被用於燃燒子鏈上的代幣。燃燒是取款過程的第一步，也是維持代幣總發行量不變的重要步驟。

### 標準子代幣

如果您需要映射的代幣是標準的TRC-20或TRC-721合約，請部署好合約後，在[這裡](https://docs.google.com/forms/d/e/1FAIpQLScP1R7iB6s16CNKAZGjFH8mwDBi74wH_swzZvz3FGmjgUG33w/viewform)提交映射請求。

您可以通過以下鏈接來確定您的代幣是否為標準合約：

+ [TRC-20](https://github.com/tronprotocol/TIPs/blob/master/tip-20.md)

+ [TRC-721](https://github.com/tronprotocol/tips/blob/master/tip-721.md)

### 自定義子代幣

如果您需要映射自定義（非標準）的代幣，首先您需要在子鏈上自行部署代幣合約，在[這裡](https://docs.google.com/forms/d/e/1FAIpQLScP1R7iB6s16CNKAZGjFH8mwDBi74wH_swzZvz3FGmjgUG33w/viewform)提交映射請求。請確保在提交請求時您提供了準確的代幣信息。

下面是一個創建自定義子代幣的例子：

::: warning
子代幣合約的構造器中不進行代幣鑄造。
:::

### 實現

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

## 可鑄造代幣

資產可通過PoS橋在公共區塊鍊和BTTC之間轉移，多數資產需要預先存在公共區塊鏈上。另一種選擇是在BTTC上直接創建代幣，並在需要時將其轉移到公共區塊鏈上。與公共區塊鏈相比，在BTTC上發行代幣手續費較低，且速度更快。這種代幣被稱為BTTC可鑄造資產。

當BTTC的可鑄造資轉移到公共區塊鏈時，必須先在BTTC上銷毀該代幣，並在公共區塊鏈上提交此次的銷毀證明。 `RootChainManager`合約在內部調用一個特殊的合約，它能直接在公共區塊鏈上調用代幣的鑄造方法，並將代幣鑄造到用戶地址。這個特殊的合約是`MintableAssetPredicate`。

### 部署在公共區塊鏈上的合約

最重要的一點是，部署在公共區塊鏈代幣合約需要指定公共區塊鏈上的`MintableAssetProxy`(例如：`MintableERC20Proxy`。Asset表示資產類型，下同)合約為鑄幣者。只有`MintableAssetPredicate`合約有權在公共區塊鏈上鑄幣。

這個角色可以通過調用根鏈上代幣合約的`grantRole`方法來授予。第一個參數是`PREDICATE_ROLE`常量值，即`0x12ff340d0cd9c652c747ca35727e68c547d0f0bfa7758d2e77f75acef481b4f2`，第二個參數是相應的`Predicate`合約地址。

## 提交映射請求

請在[這裡](https://docs.google.com/forms/d/e/1FAIpQLScsdmIx3Ux_5P8T1ffmoPWipn7XD46GZEz-xbjwGdBrCGoCZg/viewform)提交映射請求。
