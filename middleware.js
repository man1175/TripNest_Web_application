const Listing = require("./models/listing.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
            req.session.redirectUrl = req.originalUrl;
            req.flash("error","You must be logged-in to perform such actions!!");
            return res.redirect("/login");
        }
        
        next();
};

module.exports.saveRedirectUrl = (req,res,next)=>{

    if(req.session.redirectUrl){
        res.locals.saveRedirectUrl = req.session.redirectUrl;
    }


    next();
};




module.exports.validateListing = (req,res,next) => {
    const { error, value } = listingSchema.validate(req.body.listing, { convert: true });


    //let {error} = listingSchema.validate(req.body); 

    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg); 
    }else{
        next();
    }
};


module.exports.validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body); 
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg); 
    }else{
        next();
    }
};

module.exports.isOwner = async(req,res,next) =>{
    let {id} = req.params;
    let listing = await Listing.findById(id);

    
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error" , "You are not having permission to make changes");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async(req,res,next) =>{
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);

   
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error" , "You are not author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};