const mongoose = require("mongoose");
const Listing = require("../models/listing"); // Make sure the path is correct
const initData = require("./data"); // your data.js file

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
  console.log("MongoDB Connected!");

  await Listing.deleteMany({}); // Clear existing listings
  initData.data = initData.data.map((obj)=>({...obj,owner:'68c06c0794d43e1d0d26f2c8'}))
  await Listing.insertMany(initData.data); // Insert new data

  console.log("Database seeded with initial listings.");
  mongoose.connection.close();
}
