# BTTC測試網絡

BitTorrent Chain（BTTC）測試網現已正式開啟，目前已支持TRON測試網(Nile)，以太坊測試網(Goerli)以及BSC測試網的接入，簡介如下：

| 公鏈  |  測試網絡名稱 |  URL |
| ------------ | ------------ | ------------ |
| TRON  | Nile  |  [Nile Faucet](https://nileex.io/join/getJoinPage) |
|  ETH |  Goerli | [Goerli Faucet](https://faucet.goerli.mudit.blog/)  |
|  BSC |  BSC測試網 | [BSC Faucet](https://testnet.binance.org/faucet-smart)  |
|  BTTC | BitTorrent Chain Donau  | [Donau Faucet](https://testfaucet.bittorrentchain.io/#)  |

## TRON Nile 測試網

Tron Nile測試網的接入需要使用Tronlink Chrome插件，並且Tronlink已支持Nile，用戶在登錄Tronlink錢包後需要切換至Nile測試網，通過水龍頭申請測試幣並發送至Tronlink賬號，即可完成Nile測試網環境準備。

* Nile測試網代幣申請URL：https://nileex.io/join/getJoinPage
* Nile測試網官網地址：https://nileex.io/
* Nile測試網區塊瀏覽器：https://nile.tronscan.org/
* Nile測試網開發資源：​​https://nileex.io/status/getStatusPage

## ETH Goerli測試網

Goerli測試網的接入需要使用Metamask，並切換至Goerli測試網，申請測試幣並發送至Metamask賬號，即可完成Goerli測試網環境的準備。

如Metamask還未接入Goerli測試網，需要在Metamask上添加自定義RPC網絡，參數如下：

* 網絡名稱（Network Name）：Goerli - Testnet
* RPC URL（RPC URL）：https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
* 智能鏈ID（ChainID）：5
* 符號（Symbol）：ETH
* 區塊瀏覽器URL（Block Explorer URL）：https://goerli.etherscan.com

![image](../pics/goerli-rpc.png)

詳細操作流程可參考：[Metamask接入Goerli測試網流程](https://mudit.blog/getting-started-goerli-testnet/)。

## BSC測試網

BSC測試網的接入需要使用Metamask，並切換至Goerli測試網，通過水龍頭申請測試幣並發送至Metamask賬號，即可完成BSC測試網環境準備。

如Metamask還未接入BSC測試網，需要在Metamask上添加自定義RPC網絡，參數如下：

* 網絡名稱（Network Name）：Binace Smart Chain - Testnet
* RPC URL（RPC URL）：https://data-seed-prebsc-1-s1.binance.org:8545/
* 智能鏈ID（ChainID）：97
* 符號（Symbol）：BNB
* 區塊瀏覽器URL（Block Explorer URL）：https://testnet.bscscan.com

![image](../pics/bsc-rpc.png)

詳細操作流程可參考：[Metamask接入BSC測試網流程](https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain)。

## BTTC測試網

BTTC測試網的接入需要使用Metamask，並使用Metamask添加BTTC測試網的網絡配置，並切換至BTTC測試網。

* 網絡名稱（Network Name）：BitTorrent Chain Donau
* RPC URL（RPC URL）：https://pre-rpc.bittorrentchain.io/ 
* 智能鏈ID（ChainID）：1029
* 符號（Symbol）：BTT
* 區塊瀏覽器URL（Block Explorer URL）：https://testscan.bittorrentchain.io/

![image](../pics/wallet-rpc.png)
