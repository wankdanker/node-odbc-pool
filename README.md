node-odbc-pool
--------------

A connection pool for node-odbc based on generic-pool.

description
-----------

This is a connection pooling module that creates instances of generic-pool for each
connection string that is encountered. Using this pool module gains all the benefits
of using the generic-pool module including min and max connections.

install
-------

```bash
npm install odbc-pool
```

usage
-----

node-odbc-pool does not depend on node-odbc, so you must `npm install odbc` before
being able to use this module. The reason for this is so that you can install whatever
verion of node-odbc that you want and not have to mess with the version that this 
module might depend on.

```javascript
var pool = require('odbc-pool');

var myPool = new pool({
	min : 1
	, max : 10
	, log : true
});

myPool.open(process.env.ODBC_CONNECTION_STRING, function (err, client) {
	console.log(client.querySync('select top 10 * from test'));

	client.close(function () {
		console.log('closed');
	});
});
```

license
-------

MIT
