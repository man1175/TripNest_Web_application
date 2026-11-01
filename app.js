if(process.env.NODE_ENV != "production"){

    require('dotenv').config();
}

const dns = require("node:dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require("./models/user.js");

const router = express.Router({mergeParams : true});


const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const user = require("./routes/user.js");




// const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";
const dbUrl = process.env.ATLASDB_URL;


main()
    .then(()=>{console.log("Databse Connected");})
    .catch((err) => console.log("Databse Error",err));

async function main() {
  await mongoose.connect(dbUrl);
}



app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));




// Test
app.listen(8080 , ()=>{
    console.log("Server is listening @8080 port");
});

const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret: process.env.SESSION_SECRET,
    },
    touchAfter : 24*3600,
});

store.on("error", (err)=>{
    console.log("Error in Mongo-Store",err);
});

const sessionOptions ={
    store : store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires : Date.now() + (7 * 24 * 60 * 60 * 1000),
        maxAge : (7 * 24 * 60 * 60 * 1000),
        httpOnly : true,
    },
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(( req , res , next )=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
 });




//Listing.js Routes
app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);
app.use("/",user);




app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});
 
app.use((err,req,res,next)=>{
    console.log(err);
    let {statusCode=500 , message="OOPS!! Something Went Wrong!"} = err;
    res.status(statusCode).render("listings/error.ejs");
    //res.status(statusCode).send(message);
});

