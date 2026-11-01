const Listing = require("../models/listing.js");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
  const {category} = req.query;
  let allListings;
  if(category) {
    allListings = await Listing.find({category: category});
  } else {
    allListings = await Listing.find({});
  }
  res.render("listings/index.ejs", {allListings});
};

module.exports.search= async (req, res) => {
    const query = req.query.q?.trim();
    console.log(req.query);


    if (!query) {
        return res.redirect("/listings");
    }

    // Escape special regex characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const listings = await Listing.find({
        title: {
            $regex: escapedQuery,
            $options: "i"
        }
    });

    res.render("listings/search.ejs", {
        listings,
        query
    });
};

// module.exports.search = async (req, res) => {
//   const {location} = req.query;
//   const listings = await Listing.find({
//     location: {
//       $regex: location, 
//       $options: "i"
//     }
//   });
//   res.render("listings/search.ejs", {listings, location});
// };

module.exports.renderNewForm = (req,res,next)=>{
    res.render("listings/new.ejs");
}


module.exports.submitNewListing = async(req,res)=>{
        try{
            let response = await geocodingClient.forwardGeocode({ 
          query: req.body.location, 
         limit: 1 
        }).send();

        let url = req.file.url;
        console.log(req.file.path);
        console.log(req.file.filename);
        let filename = req.file.originalname;

        const newListing = new Listing(req.body);
        newListing.owner = req.user._id;
        newListing.image = {url,filename};

        newListing.geometry = response.body.features[0].geometry;
        console.log("New Listing Created!!");
        await newListing.save();
        console.log(newListing);
        
        req.flash("success" , "New Listing is Created");
        res.redirect("/listings");
        }catch(error){
            console.log(error);
            next(error);
        }
        
}

module.exports.renderEditForm = async(req,res)=>{
    let {id} = req.params;
    console.log("Into Edit Route")
    const listing = await Listing.findById(id);
    console.log("edit no 2");
    if(!listing){
        req.flash("error" , "The Listing You Are Looking for Changes Doesn't Exists!!");
        return res.redirect("/listings");
    }
     console.log("edit no 2");
    let originalImageUrl = listing.image.url;
     console.log("edit no 3");
     console.log(originalImageUrl);
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    console.log("REndering edit.ejs");
    res.render("listings/edit.ejs" , { listing, originalImageUrl });
}

module.exports.submitEditForm = async(req,res)=>{
    let {id} = req.params;
    let obj = await Listing.findByIdAndUpdate(id, {...req.body});
    if(typeof req.file !== "undefined"){
        let url = req.file.url;
        let filename = req.file.originalname;
        obj.image = {url,filename};
        await obj.save();
    }
    req.flash("success" , "Listing is Updated Successfully!!");
    res.redirect(`/listings/${id}`);
}

module.exports.renderShowPage = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({
      path: "review",
      populate: {
          path: "author"
      }
  })
  .populate("owner");

  
    if(!listing){
        req.flash("error" , "The Listing You Are Looking for Doesn't Exists!!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs" , {listing});
}

module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findByIdAndDelete(id);
     if(!listing){
        req.flash("error" , "The Listing You Are Trying to Delete Doesn't Exists!!");
        return res.redirect("/listings");
    }
    req.flash("success" , "Listing Deleted!!");
    res.redirect("/listings");
}

module.exports.new = (req,res)=>{


    res.send(req.file);
}