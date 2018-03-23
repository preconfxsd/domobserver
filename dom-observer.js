
function DOMObserver(elemToObserve, options, cb) {
  this.observer = null;
  this.options = options || {};
  this.elemToObserve = elemToObserve || [];
}

DOMObserver.prototype.init = function () {
  if (DOMObserver.__isWorkerSupported()) {
    this.__start();
    this.__addElems();
  }
};

DOMObserver.prototype.__isWorkerSupported = function () {
  if (DOMObserver.__isWorkerSupported()) {
    this.__start();
    this.__addElems();
  }
};

DOMObserver.prototype.__start = function () {
  const self = this;

  this.observer = new window.IntersectionObserver((entries, observer)=>{
    const messages = [];
    entries.forEach((entry)=>{
      if(entry.isIntersecting && entry.intersectionRatio > this.options.threshold) {
        let message = {
          id: entry.target.id,
          class: entry.target.classList.toString()
        };
        messages.push(message);
      }
    });
    cb(messages);
  }, self.options);
};

DOMObserver.prototype.__addElems = function () {
  this.elemToObserve.forEach((elem) => {
    this.observer.observe(elem);
  });
};

