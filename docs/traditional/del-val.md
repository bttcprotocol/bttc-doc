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

請參考節點設置[文檔](http://doc.bittorrentchain.io/v1/doc/traditional/validator/node.html "文檔")

## 委託人

成為 BitTorrent-chain 的委託人沒有先決條件。您所要做的就是擁有一個TRON帳戶。

### 什麼是委託人

委託人無需託管完整節點即可參與驗證。他們可以將BTT代幣投票給驗證人，並獲得部分獎勵作為交換。因為他們與驗證人共享獎勵，所以委託人也分擔了風險。委託人在系統中起着至關重要的作用，因為他們可以根據自己的意願選擇驗證人。

### 成為委託人

委託人可以將BTT代幣委託給validator，並獲得部分收入作為交換。成為BitTorrent-Chain 的委託人沒有先決條件，只需要擁有一個TRON賬戶。

### 如何為驗證人投票

相關合約方法：`ValidatorShare:buyVoucher(uint256, uint256)`

參數：

+ `_amount`：投票數量
+ `_minSharesToMint`：可接受的最少代理幣數量

### 領取獎勵

相關合約方法：`StakeManagerProxy:withdrawRewards(uint256)`

參數：

+ validatorId：領取獎勵的validator id

### 取消投票

相關合約方法：`ValidatorShare:(uint256, uint256)`

參數：

+ uint256 claimAmount：數量
+ uint256 maximumSharesToBurn：可接受的燃燒最大代理幣數量

### 獎勵復投

相關合約方法：`ValidatorShare:reStake()`

### 轉移投票

相關合約方法：`StakeManagerProxy:sellVoucher_new(uint256, uint256)`

參數：

+ uint256 claimAmount：解釋數量
+ uint256 maximumSharesToBurn：可接受的燃燒最大代理幣數量

## 驗證人

### 什麼是驗證人

驗證人(Validator)是網絡中的參與者，他將代幣鎖定在網絡中並運行驗證人節點以幫助運行網絡。驗證人有以下職責：

* 質押網絡令牌並運行驗證人節點以作為驗證器加入網絡
* 通過驗證區塊鏈上的狀態轉換獲得質押獎勵
* 因停機等活動而受到處罰

區塊鏈驗證人是負責驗證區塊鏈內交易的人，對於 BitTorrent-Chain，任何參與者都可以通過運行全節點獲得獎勵和交易費用，從而有資格成為BitTorrent-Chain的驗證人。BitTorrent-Chain中的驗證人是通過定期發生的鏈上拍賣過程選擇的，這些選定的驗證人將作為區塊生產者和驗證者參與。

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

#### 質押

對於BitTorrent-chain來說，任何參與者都可以通過運行全節點有資格成為BitTorrent-chain的驗證人，他們的成為驗證人的主要動機是賺取獎勵和交易費。

Validator有兩個地址：

1. Owner 地址：驗證人可以從該地址處理與管理相關的功能，比如取消抵押、獲取獎勵、設置委託參數。
2. Signer 地址：驗證人從這個地址簽署檢查點並運行節點。

##### 質押流程

* 保證卡槽數量validatorThreshold（StakeManagerProxy讀方法查詢）大於當前validator數量（通過StakeManagerProxy合約validatorState方法查看）。
* 準備一個擁有至少500TRX的TRON地址Address_A。
* 給地址Address_A轉一定數量BTT，至少2個token（注意精度的18個0）。
* 地址Address_A調用StakeManagerProxy的approve方法進行指定數量的BTT。
* 使用地址Address_A調用StakeManagerProxy的stakeFor方法進行質押，參數如下
 user：賬戶A地址

 amount：質押量，小於授權量，需精度的18個0
 deliveryFee：手續費，大於等於1個token，需精度的18個0

 acceptDelegation：false（如果為true的話，stakeFor不能通過tronscan調用，因為tronscan費用限制為300TRX，可通過wallet cli、API等調用

 signerPubkey：賬戶A公鑰，需要把前導「04」去掉

* 交易執行成功即質押成功。
* 用戶質押成功後可通過地址Address_A的address，訪問stakeManagerProxy的getValidatorId方法獲取validator id，然後通過validators方法，輸入id獲取validator詳細信息，判斷質押是否成功。

##### 取消質押流程

當驗證人想退出系統，停止驗證區塊和提交檢查點時，驗證人可以取消質押。為了保證良好的參與度，取消質押的驗證人的質押部分代幣將被鎖定withdrawalDelay個周期。

* 後續用戶可通過unstake方法來退出，退出後立馬返還獎勵代幣。質押部分的代幣需要通過unclaim函數來申領
* unclaim方法必須等待withdrawalDelay個周期後才可以

##### 質押相關合約接口說明

|合約|方法|參數|備註|
|--------|--------|--------|--------|
| StakeManagerProxy | stakeFor | address user：質押賬號地址<br>uint256 amount：質押代幣數量，帶精度<br>uint256 deliveryFee：手續費<br>bool acceptDelegation：是否接受代理<br>bytes memory signerPubkey：簽名賬號公鑰 | 質押成為validator，validator集合未滿時有效，否則報validator集合已滿 |
|StakeManagerProxy|restake|uint256 validatorId：質押的validator id<br>uint256 amount：質押數量<br>bool stakeRewards：獎勵是否加入質押|追加質押|
|StakeManagerProxy|withdrawRewards|uint256 validatorId：領取獎勵的validator id|領取獎勵|
|StakeManagerProxy|unstake|uint256 validatorId：解除質押的validator id|解除質押|
|StakeManagerProxy|unstakeClaim|uint256 validatorId：領取質押的validator id|領取質押，解除質押後WITHDRAWAL_DELAY個epoch後可領取|
|StakeManagerProxy|updateSigner|uint256 validatorId：validator id<br>bytes memory signerPubkey：新簽名公鑰|更新validator簽名公鑰|
|StakeManagerProxy|topUpForFee|user：手續費接收者的賬號地址<br>deliveryFee：手續費金額，帶精度|存delivery層手續費|
|StakeManagerProxy|claimFee|uint256 accumFeeAmount：領取手續費數量<br>uint256 index：bytes memory proof：證明數據|領取手續費|
|StakeManagerProxy|updateCommissionRate|uint256 validatorId：validator id<br>uint256 newCommissionRate：新佣金比例，<=100|更新佣金比例|
|ValidatorShare|buyVoucher|uint256 _amount：投票數量<br>uint256 _minSharesToMint：可接受的最少代理幣數量|投票和追加投票|
|StakeManagerProxy|migrateDelegation|uint256 fromValidatorId：源validator id<br>uint256 toValidatorId： 目的validator id<br>uint256 amount：轉移數量|轉移投票|
|ValidatorShare|sellVoucher_new|uint256 claimAmount：解釋數量<br>uint256 maximumSharesToBurn：可接受的燃燒最大代理幣數量|解除投票|
|ValidatorShare|unstakeClaimTokens_new|uint256 unbondNonce：解綁nonce|提取投票，解除投票後WITHDRAWAL_DELAY個epoch後可領取|
|ValidatorShare|restake|無|獎勵復投|
|ValidatorShare|withdrawRewards|無|領取投票獎勵|


#### 交易費用

BitTorrent-chain層的每個區塊生產者都將獲得每個區塊收取的一定比例的交易費用。

## 狀態同步機制

Validator層上的驗證人接收StateSynced事件並將其傳遞給BitTorrent-chain層。

接收者合約繼承了IStateReceiver,相關自定義邏輯位於onStateReceive函數內。

Dapp/用戶 需要做的事情是與state-sync 一起工作。

1. 調用StateSender合約的 `syncState()`函數。
2. 上述函數將觸發`StateSynced(uint256 indexed id, address indexed contractAddress, bytes data);`事件
3. Validator層上的所有驗證人都會收到這個事件。
4. 一旦Validator層上的狀態同步交易被包含在一個區塊中，它就會被添加到待定狀態同步列表中。
5. BitTorrent-chain層節點通過API調用從旦Validator上獲取待定的狀態同步事件。
6. 接收者合同繼承了IStateReceiver接口，解碼數據字節和執行任何行動的自定義邏輯位於onStateReceive函數中。
