# BTTC合約開發教程

## 使用Remix在BTTC上部署Hello World合約

### 設置Remix

Remix是一個在線的智能合約IDE，可以用與編寫、編譯以及部署合約。

如果這是您首次使用Remix，需要在插件一欄中，找到“Solidity compiler”，並激活它，如下圖

![image](../pics/dapp/1.png)

點擊圖中圈出的按鈕，創建一個新文件，命名為HelloWorld.sol，並將下面的代碼複製粘貼到這個文件中。

![image](../pics/dapp/2.png)

### HelloWorld.sol

```js
//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

contract HelloWorld {
    string public greeting;
    
    constructor(string memory message) {
        greeting = message;
    }
    
    function updateGreeting(string memory message) public {
        greeting = message;
    }
}
```

第一行的`//SPDX-License-Identifier: GPL-3.0`表示這個智能合約是開源的，並且使用了GPL3.0的開源協議，可以根據需求自行選擇其他開源協議。無協議時使用UNLICENSED。

第二行`pragma solidity ^0.8.7` 聲明了編譯器的版本。這個合約只能在0.8.7以及更高版本的Solidity編譯器中才能編譯成功。

`string public greeting`聲明了一個名為`greeting`的字符串類型的public變量，這種變量稱為state variable，會被永久保存在合約中以及區塊鏈上。 public關鍵字讓這個變量可以從合約外部被訪問，並為其創建一個accessor函數。

`constructor`聲明了這個合約的構造函數。它可以接收一個string類型的參數message，將其存儲在內存中，並將其值賦給greeting。請注意，每個智能合約中只能有一個構造函數，它僅會在部署合約時被調用。

`function updateGreeting`聲明了一個普通函數，可以從外部調用，來修改greeting的內容。

### 編譯合約

在左側選擇Solidity編譯器，並選擇0.8.7或者更高的版本。

點擊Compile HelloWorld.sol。編譯成功時，編譯器圖標會有綠色的對勾，如圖所示。

![image](../pics/dapp/3.png)

### 網絡設置

打開MetaMask錢包，並在如圖的下拉選單中選擇Custom RPC

![image](../pics/dapp/4.png)

按照圖中的信息填寫：

* 網絡名稱（Network Name）：BitTorrent Chain Donau
* RPC URL（RPC URL）：https://pre-rpc.bittorrentchain.io/ 
* 智能鏈ID（ChainID）：1029
* 符號（Symbol）：BTT
* 區塊瀏覽器URL（Block Explorer URL）：https://testscan.bittorrentchain.io/

![image](../pics/wallet-rpc.png)

添加完成後的界面如下圖所示

![image](../pics/dapp/6.png)

圖中的測試賬戶已經預先存入了一些測試幣。請前往水龍頭來獲取測試BTT。

完成了網絡設置，接下來，就能在BTTC上部署智能合約了。

### 部署合約

首先，在Remix的DEPLOY & RUN TRANSACTIONS欄中，從Environment的下拉菜單裡選擇Injected Web3

![image](../pics/dapp/7.png)

在Deploy旁邊的輸入框中，輸入初始的Greeting內容

![image](../pics/dapp/8.png)

點擊Deploy後，MetaMask會彈出交易確認的窗口

![image](../pics/dapp/9.png)

恭喜，HelloWorld合約已經成功部署到了BTTC的測試網，現在您可以與它進行交互了，同時可以再瀏覽器上檢查它的狀態。

![image](../pics/dapp/10.png)

## 構建一個去中心化的圖書館

### 開發前準備

#### Nodej v10+

```sh
node -v
v10.24.1
```

#### Metamask

在[這裡](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)安裝Metamask的Google Chrome插件。

### 我們在做什麼？

我們將要構建一個包括以下功能的去中心化圖書館：

* 租書
* 查看可藉書目
* 添加書

### 數據結構

對於借書者來說，通常，需要關心書的名字、內容、是否可藉以及價格。基於此，我們在合約中創建一個名為Book的結構，它包括瞭如下的屬性：

```js
struct Book {
       string name;
       string description;
       bool valid; // false if been borrowed
       uint256 price; // BTT per day
       address owner; // owner of the book
   }
```

我們希望圖書館能通過一個映射來記錄每一本書。為此，這里分別創建了一個bookId的屬性，以及bookId到Book的映射關係，命名為books。

```js
uint256 public bookId;

mapping (uint256 => Book) public books;
```

我們還需要記錄每一本書的租借信息，包括借書者以及起止時間。

與Book相同，創建一個名為Tracking的結構來記錄這些信息。這個結構包含了下面的屬性：

```js
struct Tracking {
       uint256 bookId;
       uint256 startTime; // start time, in timestamp
       uint256 endTime; // end time, in timestamp
       address borrower; // borrower's address
   }
```

同樣的，我們也需要建立一種映射關係，來管理每一次租借記錄：

```js
uint256 public trackingId;

mapping(uint256 => Tracking) public trackings;
```

#### 定義功能和事件

我們需要為圖書館添加一些基本功能，包括：

* 為圖書館添加書籍 - addBook
* 借一本書 - borrowBook
* 從圖書館移除這本書 - deleteBook

##### addBook

```js
/**
    * @dev Add a Book with predefined `name`, `description` and `price`
    * to the library.
    *
    * Returns a boolean value indicating whether the operation succeeded.
    *
    * Emits a {NewBook} event.
    */
   function addBook(string memory name, string memory description, uint256 price) public returns (bool) {
       Book memory book = Book(name, description, true, price, _msgSender());

       books[bookId] = book;

       emit NewBook(bookId++);

       return true;
   }

   /**
    * @dev Emitted when a new book is added to the library.
    * Note bookId starts from 0.
    */
   event NewBook(uint256 bookId);
```

##### borrowBook

```js
   /**
    * @dev Borrow a book has `_bookId`. The rental period starts from
    * `startTime` ends with `endTime`.
    *
    * Returns a boolean value indicating whether the operation succeeded.
    *
    * Emits a `NewRental` event.
    */
   function borrowBook(uint256 _bookId, uint256 startTime, uint256 endTime) public payable returns(bool) {
       Book storage book = books[_bookId];

       require(book.valid == true, "The book is currently on loan");

       require(_msgValue() == book.price * _days(startTime, endTime), "Incorrect fund sent.");

       _sendBTT(book.owner, _msgValue());

       _createTracking(_bookId, startTime, endTime);

       emit NewRental(_bookId, trackingId++);
   }
```

##### deleteBook

```js
/**
    * @dev Delete a book from the library. Only the book's owner or the
    * library's owner is authorised for this operation.
    *
    * Returns a boolean value indicating whether the operation succeeded.
    *
    * Emits a `DeleteBook` event.
    */
   function deleteBook(uint256 _bookId) public returns(bool) {
       require(_msgSender() == books[_bookId].owner || isOwner(),
               "You are not authorised to delete this book.");
      
       delete books[_bookId];

       emit DeleteBook(_bookId);

       return true;
   }
```

在borrowBook方法中，我們用到了兩個工具方法_sendBTT和_createTracking。我們不希望用戶調用這些方法，因此，遵照Solidity的規則，我們把它們標記為internal，表示僅能在合約內部被調用。

##### _sendBTT

```js
/**
    * @dev Send BTT to the book's owner.
    */
   function _sendBTT(address receiver, uint256 value) internal {
       payable(address(uint160(receiver))).transfer(value);
   }
```

##### _createTracking

```js
/**
    * @dev Create a new rental tracking.
    */
   function _createTracking(uint256 _bookId, uint256 startTime, uint256 endTime) internal {
         trackings[trackingId] = Tracking(_bookId, startTime, endTime, _msgSender());

         Book storage book = books[_bookId];

         book.valid = false;
   }
```

現在我們已經完成了合約的編寫工作，接下來就該部署上線了。

### 部署和測試

我們用[Remix](https://remix.ethereum.org/)來編譯和部署合約。

部署合約需要燃燒BTT以支付gas。

打開MetaMask錢包，並在如圖的下拉選單中選擇Custom RPC

![image](../pics/dapp/4.png)

按照圖中的信息填寫：

* 網絡名稱（Network Name）：BitTorrent Chain Donau
* RPC URL（RPC URL）：https://pre-rpc.bittorrentchain.io/ 
* 智能鏈ID（ChainID）：1029
* 符號（Symbol）：BTT
* 區塊瀏覽器URL（Block Explorer URL）：https://testscan.bittorrentchain.io/

![image](../pics/wallet-rpc.png)

首先，在Remix的DEPLOY & RUN TRANSACTIONS欄中，從Environment的下拉菜單裡選擇Injected Web3

![image](../pics/dapp/7.png)

選擇0.8.0以及更高版本的編譯器

![image](../pics/dapp/11.png)

點擊Deploy後，MetaMask會彈出交易確認的窗口

![image](../pics/dapp/12.png)

恭喜，Library合約已經成功部署到了BTTC的測試網，現在您可以與它進行交互了，同時可以在瀏覽器上檢查它的狀態。

### 構建DApp

首先將上一步部署的合約地址粘貼到 utils.js 中的 libraryContractAddress 變量中。

#### 連接UI到Metamask

下一步我們需要將UI連接到Metamask Chrome 錢包,  Metamask Chrome擴展程序會將Web3對象注入每個瀏覽器頁面，使得 DApp 能與 BTTC 網絡進行交互。

在dapp-ui/plugins/utils.js中，創建如下函數來獲取智能合約對象，並將其保存到全局變量中,接下來就可以直接使用全局變量來與合約交互了。

```js
export async function setLibraryContract() {
     var MyContract = web3.eth.contract(LibraryABI); 
     bookRentContract = await MyContract.at('0xe7BBc13a279f11D313B2c8304CdcDfC856C7603C');
}
```

#### 定義功能和函數

當我們的UI能夠連接到Metamask之後，我要考慮我們的UI如何跟智能合約進行交互。所以我們要創建一個合約合約對象，表示去中心化圖書館智能合約。

圖書館DApp需要支持三個主要功能：

* 為圖書館添加書籍
* 查看所有可藉書籍
* 借書

在index.vue中調用setLibraryContract()初始化合約對象。

```js
 async mounted() {
   // init contract object
   await setLibraryContract();
   // fetch all books
   const books = await fetchAllBooks();
   this.posts = books;
 },
```

##### 添加書籍

首先創建添加書籍表單，用於用戶發布書籍出租信息。在後端，它將與library合約的addBook函數交互。

在dapp-ui/components/bookForm.vue的postAd()函數中添加如下代碼：

```js
 postAd() {
     postBookInfo(this.title,this.description,this.price);
 }
```

在dapp-ui/plugins/utils.js的postBookInfo()中添加如下代碼：

```js
const result = await bookRentContract.methods.addBook(name,description,price).send();
```

##### 查詢所有可藉書籍

通過`fetchAllBooks()`函數獲取書籍列表，列出所有可藉書籍。

在dapp-ui/plugins/utils.js的fetchAllBooks()函數中添加如下代碼：

```js
 const books = [];

 const bookId  = await bookRentContract.methods.bookId().call();
 //iterate from 0 till bookId
 for (let i = 0; i < bookId; i++){
   const book = await bookRentContract.methods.books(i).call()
   if(book.name!="") // filter the deleted books
   {
     books.push(
       {id: i,name: book.name,description: book.description,price: book.price}
     )
   } 
 }
return books
```

在index.vue中調用`fetchAllBooks()`來獲取書籍信息，並顯示到主頁上。

##### 借閱書籍

用戶查看書籍信息後，可以藉閱這本書。

在dapp-ui/components/detailsModal.vue的book()函數中添加如下代碼：

```js
     // get Start date
     const startDay = this.getDayOfYear(this.startDate)
     // get End date
     const endDay = this.getDayOfYear(this.endDate)
     // price calculation
     const totalPrice =this.propData.price * (endDay - startDay)
     // call metamask.bookProperty
     borrowBook(this.propData.id, startDay, endDay, totalPrice)
```

dapp-ui/plugins/utils.js，在borrowBook()函數中添加如下代碼：

```js
 const result = await bookRentContract.methods.borrowBook(spaceId,checkInDate,checkOutDate).send();
```

至此，圖書館DApp開發完畢。

### 運行DApp

確保Metamask為登錄狀態，然後執行如下命令來啟動服務：

```sh
npm run dev
```

在瀏覽器地址欄輸入：localhost:3000，查看前端頁面。

![image](../pics/dapp/13.png)

點擊右上角的”Rent Your Books”按鈕，發布一條圖書租賃信息。信息包括，圖書名稱，圖書簡要描述，圖書借閱一天的價格。

![image](../pics/dapp/14.png)

信息填寫完成後，點擊”Submit”按鈕，這些信息將發送給library合約的addBook函數，創建了一條觸發合約的交易，然後將出現Metamask的彈框，要求確認並簽名，如下所示：

![image](../pics/dapp/15.png)

交易成功上鍊後，這條租賃信息將顯示到頁面上：

![image](../pics/dapp/16.png)

點擊”View”可查看書籍詳細信息， 選擇租賃的時間段，租賃的價格為：每天的租賃價格*租賃天數。點擊”Lent Now”發起租賃請求。將觸發library合約的borrowBook函數調用。同樣需要簽名及廣播，然後完成租賃交易。

![image](../pics/dapp/17.png)