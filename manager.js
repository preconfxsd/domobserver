window.datalayer = [];

const DB_STORE_BOUTIQUES = "boutiqueItems";
const DB_STORE_PRODUCTS = "productItems";

/*
DOMObserver class
 */

function DOMObserver(elemToObserve, options, cb) {
  this.observer = null;
  this.options = options || {};
  this.elemToObserve = elemToObserve || [];
  this.cb = cb;
}

DOMObserver.prototype.init = function () {
  if (this.__isWorkerSupported()) {
    this.__start();
    this.__addElems();
  }
};

DOMObserver.prototype.__isWorkerSupported = function () {
  return window.Worker && window.IntersectionObserver;
};

DOMObserver.prototype.__start = function () {
  const self = this;

  this.observer = new window.IntersectionObserver((entries, observer)=>{
    const messages = [];
    entries.forEach((entry)=>{
      if(entry.isIntersecting && entry.intersectionRatio > this.options.threshold) {

        let message = {
          id: parseInt(entry.target.id),
          class: entry.target.classList.toString(),
          storeName: entry.target.dataset.type
        };

        console.log(message);
        messages.push(message);
      }
    });

    self.cb(messages);

  }, self.options);
};

DOMObserver.prototype.__addElems = function () {
  this.elemToObserve.forEach((elem) => {
    this.observer.observe(elem);
  });
};


/*
 * Manager Class
 */
function Manager(config) {
  this.config = config;
  this.worker = null;
  this.domobserver = null;
}

Manager.prototype.init = function () {
  const self = this;
  this.createWorker(()=>{
    // first handle coming messages listener event
    this.worker.onmessage = function (message) {
      const item = message.data;
      window.datalayer.push(item); // change
    };
    // then init dom observer
    self.initDOMObserver((message)=>{
      // pass the postmessage event as callback to
      // domobserver while starting
      self.worker.postMessage(message);
    });
  });
};

Manager.prototype.initDOMObserver = function (cb) {
  this.domobserver = new DOMObserver(
    this.config.domObserverConfig.elemToObserve,
    this.config.domObserverConfig.options,
    cb
  );

  this.domobserver.init();

  console.log("dom observer init");
};

Manager.prototype.createWorker = function (cb) {
  this.worker = new Worker(this.config.workerFile);
  console.log("worker created");
  cb();
};


const manager = new Manager({
  workerFile: "worker.js",
  domObserverConfig: {
    elemToObserve: Array.from(document.getElementsByClassName("block")),
    options: {
      root: null,
      rootMargin: '0px',
      threshold: 0.6
    }
  }
});

manager.init();