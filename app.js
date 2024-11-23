// Requiring Packages
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path = require('path');
const Listing = require(path.join(__dirname, '/models/listing.js'));
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema, reviewSchema}=require("./schema.js");
const Review = require(path.join(__dirname, '/models/review.js'));
 

// Database Connection
let MONGO_URL="mongodb://127.0.0.1:27017/wanderlust"
main().then(()=>{
    console.log("connected");
}).catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

// Setting Routs
app.get("/",(req,res)=>{
    res.send("Working!!");
});

app.get("/listings",async(req,res,next)=>{
        const allListings=await Listing.find({});
        res.render("listings/index.ejs",{allListings});
    
});

//Schema Validation
const validateListing=(req,res,next)=>{
    let{error}=listingSchema.validate(req.body);    
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

const validateReview=(req,res,next)=>{
    let{error}=reviewSchema.validate(req.body);    
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};


//New Route 
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs"); 
 });

 //Show Route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));

//Create Route
app.post("/listings",validateListing,wrapAsync(async(req,res,next)=>{
    
    const newListing= new Listing(req.body.listing);
        await newListing.save();
        //console.log(newListing);
        res.redirect("/listings");
    
}));
 
 //Edit Route
 app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
 }));

//Update Route
app.put("/listings/:id",validateListing,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deleteListing=await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
}));

// Reviews
//Post Route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new review saved");
    //res.send("new review saved");

    res.redirect(`/listings/${listing._id}`);
}));
// <<<<<<< HEAD

// =======
// >>>>>>> cd4915610f731024e346becac80b571eb3a2e2dc

// Setting Ports
app.all("*", (req,res,next)=>{
    next(new ExpressError(404,"Page not Found!"))
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong!"}=err;
    res.status(statusCode).render("error.ejs", {message});
});

const PORT=8080;
app.listen(PORT,(req,res)=>{
    console.log(`App is listening on port http://localhost:${PORT}/`);  
});
