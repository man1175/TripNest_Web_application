
const User = require("../models/user.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");

module.exports.renderSignup = (req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.saveUser = async(req,res)=>{
    try{

        let {username,email,password} = req.body;
        const newUser = new User({email,username});
        const registerdUser = await User.register(newUser,password);
        req.login(registerdUser,(err)=>{
            if(err){next(err);}
            req.flash("success","Welcome to TripNest");
            res.redirect("/listings");
        });
        
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}

module.exports.renderLogin  =(req,res)=>{
    res.render("users/login.ejs");
}

module.exports.Login = async(req,res)=>{
    req.flash("success" , "Welcome back to the TripNest");
    let redirectUrl = res.locals.saveRedirectUrl || "/listings";
    res.redirect(redirectUrl);
}


module.exports.Logout  = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success" , "You are succesfully logged-out!");
        res.redirect("/listings");
    })
}
