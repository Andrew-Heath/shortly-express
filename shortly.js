var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var session = require('express-session');
var cookieParser = require('cookie-parser');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(session({
  secret: 'nyan cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
  username: null
}));
app.use(util.sessionRouter);


app.get('/', 
function(req, res) {
  res.render('index');
});

app.get('/create', 
function(req, res) {
  res.render('index');
});

app.get('/login', 
function(req, res) {
  res.render('login');
});

app.get('/signup', 
function(req, res) {
  res.render('signup');
});

app.get('/links', 
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          res.status(200).send(newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/logout', function(req, res) {
  req.session.cookie.username = null;
  res.redirect('/login');
});

app.post('/signup', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var newUser = new User({username: username, password: password});

  // store new user in the database
  Users.create(newUser)
  .then(function(newUser) {
    req.session.username = username;
    res.status(200).redirect('/');
  });
});

app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.knex('users')
  .where('username', '=', username)
  .then(function(userList) {
    if (userList[0]) {
      var user = userList[0];
      // compare newHash to saved hash
      if (user.password === bcrypt.hashSync(password, user.salt)) {
        req.session.cookie.username = username;
        res.status(200).redirect('/');
      } else {
        res.status(401).redirect('/login');
      }
    } else {
      res.status(401).redirect('/login');
    }
  }).catch(function(err) {
    console.log('error thrown');
    throw {
      type: 'Unkown User/Password',
      message: 'Unknown User or Password, please try again'
    };
  });

});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
