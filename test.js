var ODBCPool = require('./pool.js');
var p = new ODBCPool({ 
	log : true
	, min : 2
	, max : 10
});

var cs = process.env.ODBC_CONNETION_STRING;

p.open(cs, function (err, client) {
	console.log(client.querySync('select top 1 * from customer'));

	client.closeSync();

	p.open(cs, function (err, client) {
		console.log(client.querySync('select top 1 * from notes'));

		client.close(function () { });
	});
});
