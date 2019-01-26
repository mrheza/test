const cps = require('cps');
const mysql = require('node-mysql');

//database connection
const db = new mysql.DB({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'sayurbox',
    useTransaction: {
        connectionLimit: 1
    }
});

//create model
db.add({name: 'items', idFieldName: 'id'});
var Items = db.get('items');

//method to handle optimistic lock
function exclusiveUpdate(conn, data, cb) {
    //begin transaction
    db.transaction(conn, function(conn, cb) {
        //loop data for update optimistic lock
        cps.pfor(data.length, function(i, cb){
            //run method sequential
            cps.seq([
                function(_, cb) {
                    //lock row by id
                    Items.Table.lockById(conn, data[i].id, cb);
                },
                function(row, cb) {
                    //calculate stock
                    value = row._data.stock - data[i].quantity;

                    /*update quantity
                      if update error will be rollback
                      if update no error will be commit
                    */
                    row.update(conn, {'stock': value}, cb);
                },
                function(res, cb) {
                    cb();
                }
            ], cb);
        }, cb);
    }, cb);
}


function lockTest(cb){
	var cb;
	var conn;
	db.transaction(db, function(conn, cb) {
        cps.seq([
            function(_, cb) {
                //transaction will execute parallel
               	cps.parallel([
                    function(cb) {
                    	//exec susan transaction
                    	dataSusan = [{id:1, quantity:5}, {id:2, quantity:1}];
                        exclusiveUpdate(conn, dataSusan, cb);
                    },
                    function(cb) {
                    	//exec manda transaction
                    	dataManda = [{id:1, quantity:2}, {id:2, quantity:1}];
                        exclusiveUpdate(conn, dataManda, cb);
                    }
                ], cb);
            },
            function(res, cb) {
                console.log(res);
                cb();
            }
        ], cb);
    }, cb);
}

//exec optimistic lock test (concurrency test)
lockTest();