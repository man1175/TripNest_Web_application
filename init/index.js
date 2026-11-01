// To Initialize the database

const mongoose  = require('mongoose');
const Listing = require("../models/listing.js");
const initData = require("./data.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";

main()
    .then(()=>{console.log("Databse Connected");})
    .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDb = async ()=>{
 await Listing.deleteMany({});
 initData.data = initData.data.map((obj)=>({...obj , owner : "6ad7b609876f85749cd94ce5"}));
 await Listing.insertMany(initData.data);  
 console.log(initData.data); 
}
initDb();

