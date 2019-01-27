const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const cps = require('cps');
const server = app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});
const io = require('socket.io').listen(server);

//read all public file
app.use(express.static('../problem-one/public'));
//using parse request body
app.use(bodyParser.urlencoded({ extended: true }));
//using view engine
app.set('view engine', 'ejs');

//generete index page
app.get('/', function (req, res) {
	res.render('index');
});

//generete passenger page
app.get('/passenger', function (req, res) {
	res.render('passenger');
});

//generete driver page
app.get('/driver', function (req, res) {
	res.render('driver');
});

var clients = [];
io.on('connection', function(socket){

	//create passenger connection (Ani)
	socket.on('passenger', function(data){
		var clientInfo = new Object();
		clientInfo.customId = data.id;
		clientInfo.clientId = socket.id;
		clientInfo.role = data.role;
		//list of users
		clients.push(clientInfo);
    });

	//handle request driver from passenger
    socket.on('requestDriver', function(data){
    	for(var i=0, len=clients.length; i<len; i++){
    		var c = clients[i];
    		if(c.role == 'driver'){
    			//send request from passenger to driver
        		socket.to(c.clientId).emit('receiveRequest', {userId:socket.id, name:'Ani', to:c.clientId, toName:c.customId, lat:0, long:0, from:'Kembangan'});
        		//send information to passenger
    			socket.emit('searchDriver', {msg:"Searching driver..."});
    			break;
    		}
    	}
    });

    //handle request cancel from passenger
    socket.on('cancelRequest', function(data){
    	//send cancel request to driver
    	socket.broadcast.to('Driver').emit('requestCanceled', {userId: socket.id, msg:"Request has been canceled"});
    });

    //handle accept request from driver
    socket.on('acceptRequest', function(data){
    	//send information to passenger
    	socket.to(data.userId).emit('requestAccepted', data);
    });

    //handle approaching passenger from driver
    socket.on('approachUser', function(data){
    	//send distance driver to passenger
    	socket.to(data.userId).emit('approachUser', data);
    });

    //handle start trip from driver
    socket.on('startTrip', function(data){
    	//send information start trip to passenger
    	socket.to(data.userId).emit('startTrip', data);
    });

    //handle end trip from driver
    socket.on('endTrip', function(data){
    	//send information end trip to passenger
    	socket.to(data.userId).emit('endTrip', data);
    });

	//create driver connection (Joko)
    socket.on('driver', function(data){
    	var clientInfo = new Object();
		clientInfo.customId = data.id;
		clientInfo.clientId = socket.id;
		clientInfo.role = data.role;
		//list of users
		clients.push(clientInfo);
		socket.join('Driver');
    });

    //handle user disconnect
    socket.on('disconnect', function(data){
    	for(var i=0, len=clients.length; i<len; i++){
    		var c = clients[i];
    		if(c.clientId == socket.id){
    			clients.splice(i,1);
    			break;
    		}
    	}
    });
});
