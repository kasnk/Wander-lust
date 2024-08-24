// Requiring Packages
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path = require('path');
const Listing = require(path.join(__dirname, '/models/listing.js'));
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");


// Database Connection
let MONGO_URL="mongodb://127.0.0.1:27017/wanderlust"
main().then(()=>{
    console.log("connected");//sachin
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

app.get("/listings",async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
});

//New Route 
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs"); 
 });

 //Show Route
app.get("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});

//Create Route
app.post("/listings",async(req,res)=>{
    const newListing= new Listing(req.body.listing);
    await newListing.save();
    //console.log(newListing);
    res.redirect("/listings");
});
 
 //Edit Route
 app.get("/listings/:id/edit",async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
 });

//Update Route
app.put("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
});

//Delete Route
app.delete("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    let deleteListing=await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
});
<<<<<<< HEAD

=======
>>>>>>> cd4915610f731024e346becac80b571eb3a2e2dc

// Setting Ports
app.listen(8080,(req,res)=>{
    console.log("App is listening on port 8080");  
});
