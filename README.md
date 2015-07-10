Microexpresscion is an SCXML orchestration server designed to be run on nodejs
IoT devices, like the Intel Edison development board. 

Microexpresscion provides Node.js express middleware which
implements the [State Machines as a Service (SMaaS)](https://github.com/JacobeanRnD/SMaaS-swagger-spec) 
REST protocol. 

## Installation

`npm install -g microexpresscion`

## Usage

`microexpresscion path/to/scxml`

Open `http://localhost:3000/` in your web browser to view the web dashboard.

## API

See `bin/www` for example of the JavaScript API.

```javascript
var microexpresscion = require('../index');
var http = require('http');

microexpresscion.initExpress(pathToScxml,function(err, app){

  if(err) throw err;

  /**
   * Create HTTP server.
   */

  var server = http.createServer(app);

  /**
   * Listen on provided port, on all network interfaces.
   */

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

  function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    console.log('Listening on ' + bind);
  }
});
```

## Examples

[UMIO Universal Morse Input Output device](https://github.com/jbeard4/universal-morse-input-output)

## Links

* [State Machines as a Service: An SCXML Microservices Platform for the Internet of Things](http://scxmlworkshop.de/eics2015/submissions/State%20Machines%20as%20a%20Service.pdf)
