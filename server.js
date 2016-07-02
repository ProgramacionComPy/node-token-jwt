// =======================
// Get the packages we need
// =======================
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require("method-override");
var app = express();
var User   = require('./models/user'); 
var middleware = require('./middleware');
var service = require('./service');

// Connection to DB
mongoose.connect('mongodb://localhost/token', function(err, res) {
 if(err) throw err;
 console.log('Connected to Database');
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());  
app.use(methodOverride());

// =======================
// Routes ================
// =======================
app.get('/', function(req, res) {
    res.send('Hola! API: http://localhost:3000/api');
});
app.get('/setup', function(req, res) {
  // create a sample user
  var nick = new User({ 
    name: 'Rodrigo', 
    password: 'pro',
    admin: true 
  });

  // save the sample user
  nick.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});


// API ROUTES
var apiRoutes = express.Router(); 

apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Bienvenido al api de programacion.com.py :)' });
});

apiRoutes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});   

// Route to authenticate a user (POST http://localhost:3000/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {
	//find the user
	User.findOne({
		name: req.body.name
	}, function(err, user) {

	if (err) throw err;

	if (!user) {
		res.json({ success: false, message: 'Authentication failed. User not found.' });
	} else if (user) {

	// check if password matches
	if (user.password != req.body.password) {
		res.json({ success: false, message: 'Authentication failed. Wrong password.' });
	} else {
		// return the information including token as JSON
		res.json({
		success: true,
		message: 'Enjoy your token!',
		token: service.createToken(user)
		});
	}
	}
	});
});

// Secure route
apiRoutes.get('/private',middleware.ensureAuthenticated, function(req, res){
	var token = req.headers.authorization.split(" ")[1];  
	res.json({ message: 'Estás autenticado correctamente y tu _id es:'+req.user });
});

app.use('/api', apiRoutes);

// Iniciamos las rutas de nuestro servidor/API
var router = express.Router();

// Start server
app.listen(3000, function() {
  console.log("Node server running on http://localhost:3000");
});