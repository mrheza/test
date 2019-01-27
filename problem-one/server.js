const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const app = express();
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

//read all public file
app.use(express.static('public'));
//using parse request body
app.use(bodyParser.urlencoded({ extended: true }));
//using view engine
app.set('view engine', 'ejs');

//create model
db.add({name: 'items', idFieldName: 'id'});
var Items = db.get('items');

//generete index page
app.get('/', function (req, res) {
	var cb;
	db.connect(function(conn, cb) {
        cps.seq([
            function(_, cb) {
                conn.query('select * from items', cb);
            },
            function(result, cb) {
				res.render('index', {items: result});
            }
        ], cb);
    }, cb);
});

// parse application/json
app.use(bodyParser.json());

//handle checkout process
app.post("/checkout", function(req, res){
    var cb;
    data = req.body; //array data of json
    //run method sequential
    cps.seq([
        function(_, cb) {
            cps.rescue({
                'try':function(cb) {
                    //execute method optimistic lock
                    exclusiveUpdate(db, data, cb);
                },
                'catch':function(cb) {
                    console.log('Transaction Error');
                    //send json data to client
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({status:"error", msg:"Transaction Error"}));
                },
                'finally': function(cb) {
                    console.log('Transaction Success');
                    //send json data to client
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify({status:"success", msg:"Transaction success"}));
                }
            }, cb);
        }
    ], cb);
});

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

app.listen(3000, function () {
	console.log('Test app listening on port 3000!');
});
