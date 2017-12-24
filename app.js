const express    = require("express");
const mongoose   = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./models/user");  

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
    secret: "This is some secret text for express session",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new passportLocal(User.authenticate()));

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/user_auth", {
  useMongoClient: true,
});

//======= ROUTES ========

app.get("/", function(req, res){
    res.render("index");
});

app.get("/secret",isLoggedIn, function(req, res){
    res.render("secret");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

app.post("/register", function(req, res){
    User.register(new User(
        {
            username:req.body.username
        }), 
        req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/secret");
        });
    });
});

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/secret",
        failureRedirect: "/login"
    }
));

//======= MIDDLEWARE ======
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//======== SERVER ===========

app.listen(3000, function(){
    console.log("Server started!");
});