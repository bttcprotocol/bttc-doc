# 錢包

錢包用於客戶端對您在BTTC上的dApp集成管理。

在BTTC生態中，主要會用到兩種錢包：

* TronLink
* MetaMask

## TronLink

TronLink是功能最全面的去中心化TRON錢包。支持波場的全部常用功能。 TronLink有開放的SDK，支持測試網及自定義網絡。同時，TronLink受到TRON核心開發團隊的支持，與TRON主網無縫對接。

類型：非託管

私鑰存儲：本地

與TRON的通信：TronGrid HTTP API

我們推薦使用TronLink來管理您在TRON網絡上的資產。關於TronLink的集成，請參照TRON官方文檔：

* [TronWeb入門]([https://cn.developers.tron.network/docs/%E5%85%A5%E9%97%A8_new](https://cn.developers.tron.network/docs/%E5%85%A5%E9%97%A8_new))

* [TronLink集成]([https://cn.developers.tron.network/docs/%E4%BB%8B%E7%BB%8D-2](https://cn.developers.tron.network/docs/%E4%BB%8B%E7%BB%8D-2))

## MetaMask

MetaMask是一個免費且安全的錢包，它允許web程序與多種區塊鏈交互。

在使用前，請先在[MetaMask官網](https://metamask.io/)下載錢包，將它的Chrome擴展添加到本地的Google Chrome中。

接下來請在已經安裝好的MetaMask中創建一個新賬號。請妥善保管自己的密碼，私鑰以及助記詞，不要把它們告訴任何人。

### 在MetaMask上配置BTTC

為了查看賬戶資金在BTTC上的活動，需要在MetaMask上配置BTTC的URL。

要添加BTTC到MetaMask，請在這裡選擇自定義RPC，並在打開的表單中正確添加BTTC的相關參數。

![image](../pics/wallet-rpc.png)

### 配置自定義代幣

以下內容描述了在MetaMask上配置自定義代幣的過程。您可以用這種方法將任何自定義ERC-20代幣添加到MetaMask上的任何網絡。

在MetaMask中選擇Add Token，此處添加的Token為部署在以太坊Ropsten測試網的Test Token，代號為t，地址是`0x414C578d018afa9a4c9acf435a8C5fD042203901`，此代幣僅用於演示。填入代幣地址後，其他信息會自動補全，如圖：

![image](../pics/wallet-addtoken.jpg)

添加完成後，這個代幣將顯示在您MetaMask的賬戶中。

將BTTC上的代幣添加到MetaMask的操作與上述基本一致，只需要在添加前，在自定義RPC中輸入BTTC的正確URL。

### 多個賬戶

如果您是初次使用MetaMask，這篇文章會教您如何創建多個賬戶。

點擊右上角的圓形圖案，並點擊Create Account，如圖：

![image](../pics/wallet-account.jpg)

接下來在窗口中輸入賬戶名（可以使用任何名字）即可。

### 集成

#### 設置Web3

在您的dApp中安裝web3：

```sh
npm install --save web3
```

新建一個名為web3.js的文件，然後輸入如下的代碼：

```js
import Web3 from 'web3';

const getWeb3 = () => new Promise((resolve) => {
 window.addEventListener('load', () => {
   let currentWeb3;

   if (window.ethereum) {
     currentWeb3 = new Web3(window.ethereum);
     try {
       // Request account access if needed
       window.ethereum.enable();
       // Acccounts now exposed
       resolve(currentWeb3);
     } catch (error) {
       // User denied account access...
       alert('Please allow access for the app to work');
     }
   } else if (window.web3) {
     window.web3 = new Web3(web3.currentProvider);
     // Acccounts always exposed
     resolve(currentWeb3);
   } else {
     console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
   }
 });
});

export default getWeb3;
```

上面的代碼中`exports`的`getWeb3`函數，其作用是通過檢測MetaMask注入的全局對象（ethereum或web3）來請求MetaMask賬戶的訪問權限。

MetaMask的文檔有一段這樣的描述：

MetaMask injects a global API into websites visited by its users at window.ethereum (Also available at window.web3.currentProvider for legacy reasons). This API allows websites to request user login, load data from blockchains the user has a connection to, and suggest the user sign messages and transactions. You can use this API to detect the user of a web3 browser.

接下來，在客戶端代碼中，導入上面的文件：

```js
  import getWeb3 from '/path/to/web3';
```

調用如下的方法：

```js
  getWeb3()
    .then((result) => {
      this.web3 = result;
    });
```

#### 設置賬戶

當發送非查詢類的交易時，需要一個賬戶（私鑰）為這些交易簽名。

```js
  this.web3.eth.getAccounts()
  .then((accounts) => {
    this.account = accounts[0];
  })
```

`getAccounts()`將返回用戶MetaMask上所有的賬戶，`accounts[0]`則是其中的第一個賬戶。

#### 實例化合約

現在我們已經有了一個web3對象，接下來需要實例化合約，這需要合約的ABI以及地址。

```js
const myContractInstance = new this.web3.eth.Contract(myContractAbi, myContractAddress)
```

#### 調用合約

現在我們可以通過實例化的合約對象，來調用合約中的方法。

改變鏈上狀態的方法被稱為send()方法，查詢類的方法被稱為call()方法。

##### 調用call()方法

```js
  this.myContractInstance.methods.myMethod(myParams)
  .call()
  .then (
    // do stuff with returned values
  )
```

##### 調用send()方法

```js
  this.myContractInstance.methods.myMethod(myParams)
  .send({
    from: this.account,gasPrice: 0
  })
  .then (
    (receipt) => {
      // returns a transaction receipt}
    )
```