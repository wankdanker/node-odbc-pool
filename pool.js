var GenericPool = require('generic-pool');
var odbc = require('odbc');

module.exports = Pool;

function Pool (options) {
	var self = this;
	self.options = options || {};
	self.pools = {};
}

Pool.prototype.open = function (connectionString, cb) {
	var self = this;

	//check to see if we already have a pool for this connection string
	if (self.pools[connectionString]) {
		return self.pools[connectionString].acquire(cb);
	}

	//else define a new pool for this connection string
	var pool = self.pools[connectionString] = GenericPool.Pool({
		name : self.options.name || connectionString
		, max : self.options.max
		, min : self.options.min
		, idleTimeoutMillis : self.options.idleTimeoutMillis
		, refreshIdle : self.options.refreshIdle
		, reapIntervalMillis : self.options.reapIntervalMillis
		, priorityRange : self.options.priorityRange
		, log : self.options.log
		, create : function (callback) {
			var client = odbc();

			//proxy the close methods
			client.___close = client.close;
			client.___closeSync = client.closeSync;

			client.close = function (cb) {
				//we close and re-open the connection
				//to clear any temporary tables
				client.___close(function (err) {
					//call back early, not after opening the new connection
					//that would be a waste of time.
					if (cb) cb();

					client.open(connectionString, function (err) {
						//release the clean connection back
						//to the pool
						pool.release(client);
					});
				});
			};

			client.closeSync = function () {
				//close the connection to clear temporary data
				client.___closeSync();

				//re-open the connection
				client.open(connectionString, function (err) {
					//release the clean connection to the pool
					pool.release(client);
				});
			};

			client.open(connectionString, function (err) {
				callback(err, client);
			});
		}
		, destroy : function (client) {
			client.___closeSync();
		}
		, validate : function (client) {
			return client.connected
		}
	});

	//acquire a new connection
	pool.acquire(cb);
};

Pool.prototype.close = function (cb) {
	var self = this;

	//for each connection string pool, call the drain method;
	Object.keys(self.pools).forEach(function (cs) {
		var pool = self.pools[cs];
		
		pool.drain(function () {
			pool.destroyAllNow();

			delete self.pools[cs];
		});
	});
};
