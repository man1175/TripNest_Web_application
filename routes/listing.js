const express = require("express");
const router = express.Router({mergeParams : true});

const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require("../models/listing.js");
const passport = require("passport");


const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");

const listingController = require("../controllers/listing.js");

const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload =multer({ storage }); 


// Home Route
router.get("/" , wrapAsync(listingController.index));

// Search Route
router.get("/search", wrapAsync(listingController.search)); 


// New Details Route : New.ejs
router.get("/new" ,isLoggedIn, listingController.renderNewForm);


// Submitted New.ejs form to "/listings"
router.post("/" ,isLoggedIn,upload.single('image[url]'),validateListing, wrapAsync(listingController.submitNewListing));




// Edit Details Route : Edit.ejs
router.get("/:id/edit"  , isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));


// Fetching data from edit.ejs and updating the Listing Detail
router.put("/:id",isLoggedIn,isOwner,upload.single('image[url]'),validateListing, wrapAsync(listingController.submitEditForm));


// Show Route : Show.ejs
router.get("/:id" , wrapAsync(listingController.renderShowPage));
 

// Delete Route : form Show.ejs
router.delete("/:id"  , isLoggedIn,isOwner ,wrapAsync(listingController.destroyListing));



module.exports = router;