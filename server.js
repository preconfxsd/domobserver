const fs = require('fs');
const http = require('http');
const port = 3000;

const requestHandler = (request, response) => {
  if (request.url === "/manager.js") {
    fs.createReadStream("manager.js").pipe(response);
  } else if (request.url === "/worker.js") {
    fs.createReadStream("worker.js").pipe(response);
  } else {
    fs.createReadStream("index.html").pipe(response);
  }

};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
});