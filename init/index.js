const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL= "mongodb://127.0.0.1:27017/uninest";

main().then(()=>{
    console.log("connected to DB")

}).catch(err => {
    console.log(err);
})
async function main(){
    await mongoose.connect(MONGO_URL);
}
const initDB = async()=> {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=> ({...obj,owner:"69c264ab475ce4908d56df59"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}
initDB();
