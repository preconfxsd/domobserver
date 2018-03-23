const DB_NAME = "TESTDB";
const DB_VERSION = 1;
const DB_STORE_NAME = "viewport-items";

let DB = null;
const OBSERVED_ITEMS = [];

function openDb(cb){
  if (DB) {
    //db is already opened
    cb();
  }
  else {
    console.log("opening db ...");
    this.dbRequest = indexedDB.open(DB_NAME, DB_VERSION);
    this.dbRequest.onsuccess = function (evt) {
      DB = this.result;
      console.log("openDb DONE");
      cb();
    };

    this.dbRequest.onerror = function (evt) {
      console.error("openDb:", evt.target.errorCode);
    };

    this.dbRequest.onupgradeneeded = function (evt) {
      let store = evt.currentTarget.result.createObjectStore(
        DB_STORE_NAME,
        { keyPath: 'id'}
      );
    };
  }
}

function getObjectStore(store_name, mode) {
  return DB.transaction(store_name, mode).objectStore(store_name);
}

function isItemObserved(item, cb) {
  const request = getObjectStore(DB_STORE_NAME, "readonly").get(item.id);
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

function addViewportItem(item) {
  const store = getObjectStore(DB_STORE_NAME, 'readwrite');
  let request = store.add(item);

  request.onsuccess = function(event) {
    //console.log("Successfully added item to db");
  };

  request.onerror = function(event) {
    //console.log("something went wrong here", JSON.stringify(event));
  }
}


onmessage = function (message) {
  const items = message.data;
  openDb(()=>{
    items.forEach((item)=>{
      const isObserved = isItemObserved(item, (isObserved)=> {
        if (!isObserved) {
          addViewportItem(item);
          postMessage(item);
        }
      });

    });
    //getAllItems();
  });

};