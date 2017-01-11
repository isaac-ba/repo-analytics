/*********include****************/

var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;
var expressSession = require('express-session');




/**********Set Up****************/

var app = express();

app.use(express.static('public'));
app.use(express.static('node_modules'));

app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({extended: false}));


/****************Vars*********************/

var rootUrl = "https://api.github.com";


/**************middleware***********************/



/*************API Functionality***************/

var getInfoFromApi = function(url,res){

  var options = {
    url: url,
    headers: {
      'User-Agent': 'request'
    }
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      res.json(info);
    }
  })
}

/*******************Event Handlers*******************/

//Sending HTML on first GET
app.get('/', function (req, res) {
   res.sendFile(__dirname + "/index.html");
});

app.post('/login',function(req,res,next){
  res.send(req.body);
})

//Get a list of all user repo's and return it to client
app.get('/repos/:owner', function (req, res) {
  console.log(req.params.owner);//dev
  var url = rootUrl + '/users/' + req.params.owner + '/repos';
  getInfoFromApi(url, res);

});

//Get specific repo and return it to the client
app.get('/repo/:owner/:repo', function (req, res) {

  var url = rootUrl + '/repos/' + req.params.owner + '/' + req.params.repo;
  getInfoFromApi(url, res);
});

/////////git auth///////////
app.use(expressSession({ secret: 'mySecretKey' }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/github',passport.authenticate('github'));

passport.serializeUser(function(user,done){
  done(null,user);
})

passport.deserializeUser(function(user,done){
  done(null,user);
})

passport.use(new GitHubStrategy({
    clientID: '89e05ffc8792b80ca766',
    clientSecret: '04fb4a8693571d21899733433ebb2dbf9cb9e85a',
    callbackURL: "http://127.0.0.1:4000/auth/github/callback"
  },

  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function(){
      console.log(accessToken)
      return done(null,{profile:profile._json, accessToken:accessToken})
    })
}
));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    console.log(req.user.profile)
    // Successful authentication, redirect home.
    res.redirect('/');
  });
app.get('/',function(req,res){
  console.log(req.user)
})
app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/');
})
 

var port = process.env.PORT || '4000';

app.listen(port);




