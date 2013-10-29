
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var exphbs  = require('express3-handlebars');
var mongo = require('mongodb');
var monk = require('monk');
var db =  monk('localhost:27017/veedio');

var app = express();

hbs = exphbs.create({
	defaultLayout: 'main',
    // Specify helpers which are only registered on this instance.
    helpers: {
        foo: function () { return 'https://www.filepicker.io/api/file/e6Oz8XRvTWCJAUm6Rivd'; }
    }
});
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(request, response) {
   response.render('home');
});

app.get('/cdn/:id', function(request, response) {
   var collection = db.get('urls');
   collection.find({_id : request.params.id}, function(e,docs){
		response.render('url', {
   		helpers: {
   			foo: function () { return docs[0].inkurl; }
   		}
   		});
	})
});

app.get('/collections',function(req,res){
  db.driver.collectionNames(function(e,names){
    res.json(names);
  })
});

app.post('/upload', function(req, res) {
	var collection = db.get('urls');
	collection.insert({inkurl: req.body.url}, function(err,docsInserted){
    	res.send(docsInserted);
	});
});

app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
