const app = require('http').createServer();
const socketServer = require('socket.io')(app);
const config = require('./config');
const port = config.port ? config.port : 3000;

app.listen(port, function () {
	console.log('nasluchuje na porcie', app.address().port);
});

socketServer.on('connection', function (socket) {
	console.log('socketServer', 'connection');

	socket.on('test', function (data) {
		console.log('test', data);
	});
});
