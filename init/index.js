const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
const initData = require('./data.js');
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderstay';
main()
    .then(() => console.log('connection successful '))
    .catch(err => console.log(err));
async function main() {
    await mongoose.connect(MONGO_URL);
};

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map( (obj) => ({...obj,
         owner: "67c6ff3d288d6b7909af553a"}));
    await Listing.insertMany(initData.data);
    console.log("Data inserted");
};
initDB();



 