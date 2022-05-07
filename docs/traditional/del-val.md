# 驗證人和委託人

## 概述

BitTorrent-Chain 是一個區塊鏈應用平台,如果您希望通過為BitTorrent-Chain設置節點來成validator,或者希望成為委託人以將代幣委託給validator並獲得獎勵，可以通過該文檔進行快速了解相關內容。

## PoS、質押和投票

### 股權證明(PoS)

權益證明 (PoS) 是公共區塊鏈的一類共識算法，取決於驗證人在網絡中的經濟權益。在基於工作量證明 (PoW) 的公共區塊鏈（例如比特幣和以太坊的當前實現）中，該算法獎勵解決密碼難題的參與者，以驗證交易並創建新塊（即挖礦）。在基於 PoS 的公共區塊鏈中，一組驗證人輪流對下一個區塊進行提議和投票，每個驗證人投票的權重取決於其存款（即權益）的大小。PoS 的顯着優勢包括 安全性、降低中心化風險和能源效率。

有關更多詳細信息，請參閱 [https://github.com/ethereum/wiki/wiki/Proof-of-Stake-FAQ](https://github.com/ethereum/wiki/wiki/Proof-of-Stake-FAQ)。

### 質押

Staking 是指將代幣鎖定到存款中以獲得在區塊鏈上驗證和生產區塊的權利的過程。通常，質押是在網絡的本機令牌中完成的。

### 投票

投票是代幣持有者將其股份委託給驗證人的過程。它允許不具備運行節點的技能或願望的代幣持有者參與網絡，並根據投票的股份數量按比例獲得獎勵。

## 架構

BitTorrent-Chain 是一個區塊鏈應用平台，整體結構分為三層：

* Root Contracts層：TRON及其他區塊鏈網絡上的Root合約，支持用戶通過存取款的方式將代幣映射到 BitTorrent-Chain，及支持質押等功能。
* Validator層: 驗證BitTorrent-Chain區塊，定期發送Checkpoint至支持的TRON及其他區塊鏈網絡。

    **Bridge**：負責監聽各鏈路事件，發送事件消息等。

    **Core**：共識模塊，包括Checkpoint(BitTorrent-Chain鏈的狀態快照)的驗證，Statesync事件&Staking事件的共識。  

    **REST-Server**：提供相關API服務。

* BitTorrent-Chain層。

## 代碼庫

BitTorrent-Chain的代碼庫，用於了解BitTorrent-Chain 核心組件如何工作。

一旦熟悉了架構和代碼庫，您就可以設置您的節點。請注意，上面的文檔只是為了讓您熟悉多邊形內部的工作原理，您可以直接設置節點而不熟悉上面的規格。

## 設置節點

請參考節點設置[文檔](http://doc.bt.io/v1/doc/traditional/validator/node.html "文檔")

## 委託人

成為 BitTorrent-chain 的委託人沒有先決條件。您所要做的就是擁有一個TRON帳戶。

委託人無需託管完整節點即可參與驗證。他們可以將BTT代幣投票給驗證人，並獲得部分獎勵作為交換。因為他們與驗證人共享獎勵，所以委託人也分擔了風險。委託人在系統中起着至關重要的作用，因為他們可以根據自己的意願選擇驗證人。

### 投票相關合約接口說明
#### 為驗證人投票
* 合約方法：ValidatorShare:buyVoucher(uint256, uint256)
* 參數：
    * _amount：投票數量
    * _minSharesToMint：可接受的最少份額幣數量，委託人為驗證人投票的BTT會轉化為份額幣，以表示用戶為驗證人所投票數佔總票數的份額。委託人可通過驗證人的ValidatorShare合約的balanceOf方法來查詢他所擁有的份額幣數量。
* 說明：
    1. 在調用buyVoucher方法之前，需要先調用[`BTT`](https://tronscan.org/#/contract/TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4/code)的approve方法授權大於投票數量的BTT給[`StakeManagerProxy`](https://tronscan.org/#/contract/TEpjT8xbAe3FPCPFziqFfEjLVXaw9NbGXj/code)合約。
    2. 每一個驗證人都有對應的ValidatorShare合約， 可以訪問StakeManagerProxy的validators[validatorId].contractAddress來獲取某一個驗證人對應的ValidatorShare合約地址
    3. 此方法也可為驗證人追加投票


#### 領取獎勵
* 合約方法：ValidatorShare:withdrawRewards()
* 參數：無
* 說明
    1. 委託人調用驗證人的ValidatorShare合約的withdrawRewards方法來為提取獎勵，執行成功後獎勵立刻到達委託人賬戶。

#### 取消投票
* 合約方法：ValidatorShare:sellVoucher_new:(uint256, uint256)
* 參數：
    * uint256 claimAmount：取消投票的BTT數量；委託人為驗證人投票的總BTT數量，可通過ValidatorShare:getTotalStake方法獲取。
    * uint256 maximumSharesToBurn：可接受燃燒的最大份額幣數量；委託人所擁有的份額幣數量可通過ValidatorShare:balanceOf方法獲取。
* 說明
    1. 取消投票可以分多次進行，但是每次之間至少間隔1個檢查點。
    2. 取消投票後，質押金BTT需要經過80個檢查點的鎖定期，才可提取。


#### 提取投票所質押的BTT
* 合約方法：ValidatorShare:unstakeClaimTokens_new(uint256) 
* 參數
    * uint256 unbondNonce：`取消投票`操作對應的nonce，即提取第nonce次`取消投票`的BTT。委託人總的取消投票次數可以通過ValidatorShare:unbondNonces方法查詢。
* 說明
    1. 該方法需要在取消投票後，經過80個檢查點的鎖定期後，才可調用。


#### 獎勵复投
獎勵复投是將已獲得但未提取的BTT投票獎勵再次投票給驗證人，以獲取更多的投票獎勵。
* 合約方法：ValidatorShare:reStake()
* 參數：無


#### 轉移投票
轉移投票是轉移一部分票數給另一個驗證人。
* 合約方法：StakeManagerProxy:migrateDelegation(uint256, uint256, uint256)
* 參數
    * uint256 fromValidatorId：源validator id
    * uint256 toValidatorId：目標validator id
    * uint256 amount：轉移的BTT數量
* 說明
    1. 只能轉移給validatorID 大於7的驗證人
    2. 轉移投票會自動觸發領取獎勵操作


## 驗證人

驗證人(Validator)是網絡中的參與者，他將代幣鎖定在網絡中並運行驗證人節點以幫助運行網絡。驗證人有以下職責：

* 質押網絡令牌並運行驗證人節點以作為驗證器加入網絡
* 通過驗證區塊鏈上的狀態轉換獲得質押獎勵
* 因停機等活動而受到處罰

區塊鏈驗證人是負責驗證區塊鏈內交易的人，對於 BitTorrent-Chain，任何參與者都可以通過運行全節點獲得獎勵和交易費用，從而有資格成為BitTorrent-Chain的驗證人。BitTorrent-Chain中的驗證人是通過定期發生的鏈上拍賣過程選擇的，這些選定的驗證人將作為區塊生產者和驗證者參與。

Validator需要有兩個地址：

1. Owner 地址：驗證人可以通過該地址處理`與管理相關`的功能，比如取消抵押、獲取獎勵、設置委託參數。
2. Signer 地址：驗證人從這個地址簽署檢查點並運行節點。

### 架構

BitTorrent-Chain 網絡分為3層

#### Root Contracts

TRON及其他區塊鏈網絡上的Root合約，支持用戶通過存取款的方式將代幣映射到 BitTorrent-Chain，及支持質押等功能。

#### Validator

驗證BitTorrent-Chain區塊，定期發送Checkpoint至支持的TRON及其他區塊鏈網絡。

**Bridge**：負責監聽各鏈路事件，發送事件消息等。

**Core**：共識模塊，包括Checkpoint(BitTorrent-Chain鏈的狀態快照)的驗證，Statesync事件&Staking事件的共識。  

**REST-Server**：提供相關API服務。

#### BitTorrent-Chain

BitTorrent-Chain層的區塊生產者是驗證者的一個子集，由驗證人定期改組。

![image](../pics/architecture.jpg)

### 功能

區塊鏈驗證人是負責驗證區塊鏈內交易的人。對於BitTorrent-Chain來說，任何參與者都有資格成為BitTorrent-Chain的驗證人，通過運行一個完整的節點來獲得獎勵和交易費用。為了確保驗證人的良好參與，他們鎖定了他們的一些BTT代幣作為生態系統的股份。

BitTorrent-Chain的驗證人是通過鏈上的質押來選擇的，這個過程會定期進行。這些被選中的驗證人，作為區塊生產者和驗證者參與其中。一旦一個檢查點（一組區塊）被參與者驗證，那麼就會在TRON&以太坊&BSC上進行更新，根據驗證人在網絡中的股份，為其發放獎勵。

#### 驗證人的職責

* 通過在TRON上的質押合約中鎖定BTT代幣來加入網絡。
* 驗證人可以隨時退出系統，可以通過unstake 在合約上執行交易來完成，
* 驗證人可以隨時增加質押BTT代幣數量，以增加質押能力。
* 設置驗證人節點後，驗證人將執行以下操作：

    1.區塊生產者選擇

    2.在BitTorrent-Chain 上驗證塊

    3.檢查點提交

    4.在以太坊上同步對BitTorrent-Chain 質押合約的更改

    5.從TRON&以太坊&BSC 到BitTorrent-Chain層的狀態同步

* 驗證人需要保持最低數量的代幣來支付相關鏈上的交易費用。

#### Validator層

Validator層將BitTorrent-Chain產生的區塊聚合成默克爾樹，並定期將默克爾根發布到根鏈。這種定期發布被稱為「檢查點」。對於 BitTorrent-Chain 上的每幾個區塊，一個驗證人（Validator）：

1. 驗證自上次檢查點以來的所有塊
2. 創建塊哈希的默克爾樹
3. 將merkle root發布到主鏈

檢查點很重要，原因有兩個：

1. 在根鏈上提供終結性
2. 在提取資產時提供銷毀證明

#### BitTorrent-Chain層

BitTorrent-chain層中的區塊生產者，BitTorrent-chain層中的VM與EVM兼容，是一個基本的Geth實現，並對共識算法進行了自定義修改。

#### 檢查點機制(Checkpoint)

在Validator中通過Tendermint的加權輪迴算法來選擇一個提議者，在Tendermint上成功提交一個檢查點有2個階段的提交過程，一個是通過上述Tendermint算法選擇的提議者發送一個檢查點，在提議者字段中包含他的地址，所有其他提議者在將其添加到他們的狀態中之前將對此進行驗證。

然後下一個提議者發送一個確認交易，以證明之前的檢查點交易在以太坊主網中已經成功了。每一個驗證者集的變化將由Validator上的驗證人節點轉發，該節點被嵌入到驗證人節點上。這使得驗證人在任何時候都能與TRON&Ethereum等鏈上的BitTorrent-chain合約狀態保持同步。

部署在TRON&Ethereum等鏈上的BitTorrent-chain合約被認為是最終的真相來源，因此所有的驗證都是通過查詢TRON&Ethereum等鏈上的BitTorrent-chain合約完成的。

#### 交易費用

BitTorrent-chain層的每個區塊生產者都將獲得每個區塊收取的一定比例的交易費用。

#### 狀態同步機制

Validator層上的驗證人接收StateSynced事件並將其傳遞給BitTorrent-chain層。

接收者合約繼承了IStateReceiver,相關自定義邏輯位於onStateReceive函數內。

Dapp/用戶 需要做的事情是與state-sync 一起工作。

1. 調用StateSender合約的 `syncState()`函數。
2. 上述函數將觸發`StateSynced(uint256 indexed id, address indexed contractAddress, bytes data);`事件
3. Validator層上的所有驗證人都會收到這個事件。
4. 一旦Validator層上的狀態同步交易被包含在一個區塊中，它就會被添加到待定狀態同步列表中。
5. BitTorrent-chain層節點通過API調用從旦Validator上獲取待定的狀態同步事件。
6. 接收者合同繼承了IStateReceiver接口，解碼數據字節和執行任何行動的自定義邏輯位於onStateReceive函數中。


### 質押相關合約接口說明
#### 質押
* 合約方法：StakeManagerProxy:stakeFor(address, uint256, uint256, bool, bytes memory)
* 參數
    * address user：質押賬號地址，即驗證人的owner地址
    * uint256 amount：質押的BTT數量
    * uint256 deliveryFee：存入的手續費；驗證人為檢查點簽名需要支付一定的手續費，因此需要預先為signer地址存入一定的手續費。
    * bool acceptDelegation：驗證人是否接受委託人的投票
    * bytes memory signerPubkey：簽名賬戶公鑰；即驗證人的signer地址的公鑰，需要把前導“04”去掉
* 說明
    1. 參數`amount`允許的最小值可通過StakeManagerProxy:minDeposit方法查詢（目前為10^30， 也就是10^12個BTT）。
    2. 參數`deliveryFee`允許的最小值可通過StakeManagerProxy:minHeimdallFee方法查詢（目前為10^23，也就是100000個BTT）。
    3. 參數`acceptDelegation`：true表示接受委託人的投票，false表示不接受委託人的投票；後期可通過可通過ValidatorShare:updateDelegation方法更改該屬性值。
    4. 在調用stakeFor方法之前，需要先調用[`BTT`](https://tronscan.org/#/contract/TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4/code)的approve方法授權大於質押數量的BTT給[`StakeManagerProxy`](https://tronscan.org/#/contract/TEpjT8xbAe3FPCPFziqFfEjLVXaw9NbGXj/code)合約。
    5. 用戶質押成功後，可通過stakeManagerProxy:getValidatorId方法獲取到驗證人的validatorID，然後通過stakeManagerProxy:validators方法獲取到validator的詳細信息。

#### 追加質押
* 合約方法：StakeManagerProxy:restake(uint256，uint256，bool)
* 參數
    * uint256 validatorId：質押的validator id 
    * uint256 amount：質押數量
    * bool stakeRewards：獎勵是否加入質押
* 說明
    1. 調用此方法的前提條件是成功調用了StakeManagerProxy:stakeFor方法並成為驗證人。

#### 領取獎勵
* 合約方法：StakeManagerProxy:withdrawRewards(uint256)
* 參數
    * uint256 validatorId：領取獎勵的validator id 
* 說明
    1. 驗證人可通過withdrawRewards方法來領取獎勵，執行成功後獎勵立刻到達驗證人賬戶。


#### 取消質押
當驗證人想退出系統，停止驗證區塊和提交檢查點時，驗證人可以取消質押。為了保證良好的參與度，取消質押的驗證人的質押部分代幣將被鎖定withdrawalDelay個週期。

* 合約方法：StakeManagerProxy:unstake(uint256)
* 參數
    * uint256 validatorId：解除質押的validator id 
* 說明
    1. 驗證人可通過unstake方法來取消質押，取消質押後立刻返還獎勵的代幣到驗證人賬戶，但質押的代幣需要通過unstakeClaim函數來申領。
    2. unstakeClaim方法必須等待withdrawalDelay（目前為80）個檢查點後才可以被調用。

#### 領取質押的BTT
* 合約方法：StakeManagerProxy:unstakeClaim(uint256)
* 參數
    * uint256 validatorId：領取質押金的validator id 
* 說明
    1. 在取消質押後，需要等待withdrawalDelay（目前為80）個檢查點後，才可以調用此方法來領取之前質押的BTT。

#### 更新validator簽名公鑰
* 合約方法：StakeManagerProxy:updateSigner(uint256，bytes memory)
* 參數
    * uint256 validatorId：validator id
    * bytes memory signerPubkey：新簽名公鑰 
* 說明
    1. 驗證者可以更新簽名賬戶，但是兩次更新操作的時間間隔需要滿足大於signerUpdateLimit（目前為100）個檢查點。

#### 更新佣金比例
* 合約方法：StakeManagerProxy:updateCommissionRate(uint256，uint256)
* 參數
    * uint256 validatorId：validator id
    * uint256 newCommissionRate：新佣金比例
* 說明
    1. 驗證者可以更新佣金比例，但是兩次更新操作的時間間隔需要滿足大於WITHDRAWAL_DELAY（目前為80）個檢查點。
    2. 佣金比例需要小於等於100

