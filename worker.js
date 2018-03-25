const DB_NAME = "TY_OBSERVER_DB";
const DB_VERSION = 1;
const DB_STORE_BOUTIQUES = "boutiqueItems";
const DB_STORE_PRODUCTS = "productItems";

let DB = null;

function openDb(dbStoreNames){
  if (DB) {
    //db is opened
    console.log("db is opened");
  }
  else {
    console.log("opening db ...");
    const self = this;
    this.dbRequest = indexedDB.open(DB_NAME, DB_VERSION);
    this.dbRequest.onsuccess = function (evt) {
      DB = this.result;
      console.log('db is opened');

    };

    this.dbRequest.onerror = function (evt) {
      console.error("error openDb:", evt.target.errorCode);
    };

    this.dbRequest.onupgradeneeded = function (evt) {
      console.log("onupgradeneeded");
      dbStoreNames.forEach((storeName)=>{
        let store = evt.currentTarget.result.createObjectStore(
          storeName,
          { keyPath: 'id'} // TODO change with another index
        );
      });
    };
  }
}

function createStores(dbStoreNames) {
  const self = this;

}

function getObjectStore(storeName, m) {
  const mode = m || "readwrite";
  console.log("getting", storeName);
  const store = DB.transaction(storeName, mode).objectStore(storeName);
  return store || null;
}

function isItemObserved(item, cb) {
  const request = getObjectStore(item.storeName).get(item.id);
  request.onsuccess = function (event) {
    cb(request.result);
  };

}

function getAllItems() {
  let store = getObjectStore(DB_STORE_NAME, "readonly");
  let items = [];
  const request = store.openCursor();

  request.onsuccess = function(event) {
    let cursor = event.target.result;
    if (cursor) {
      items.push(cursor.value);
      cursor.continue();
    } else {
      return items;
    }
  };

  request.onerror = function (event) {
    console.log("error on request", event);
  }
}

function addViewportItem(storeName, item) {
  let request = getObjectStore(storeName).add(item);

  request.onsuccess = function(event) {
    //console.log("Successfully added item to db");
  };

  request.onerror = function(event) {
    //console.log("something went wrong here", JSON.stringify(event));
  }
}

openDb([DB_STORE_PRODUCTS, DB_STORE_BOUTIQUES]);

onmessage = function (message) {
  if(DB){
    const items = message.data;
    items.forEach((item)=>{
      const isObserved = isItemObserved(item, (isObserved)=> {
        if (!isObserved) {
          addViewportItem(item.storeName, item);
          postMessage(item);
        }
      });
    })
  }
};
