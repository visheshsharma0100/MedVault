const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    throw new Error('Missing MONGO_URI in environment. Check your .env file or dotenv path.');
}
mongoose.connect(MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log(err);
});
const medicineschema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name:String,
    category:String,
    quantity:Number,
    expiry_date:Date,
    low_stock_threshold:Number,
    manufacturer:String,
},
{ timestamps: true });


const userschema = new mongoose.Schema({
    Username:String,
    Password:String
},
{ timestamps: true });


const Medicine = mongoose.model("Medicine",medicineschema);
const User = mongoose.model("User",userschema);
module.exports = { Medicine, User };
