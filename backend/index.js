const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware.js');
const { Medicine, User } = require('./db.js');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT;

// let UserId=1;
// Signup route
app.post("/signup", async (req, res) => {
    const { Username, Password } = req.body;
    const UserExists = await User.findOne({ Username });
    if (UserExists) {
        return res.status(400).json({ message: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(Password, 10);
    const NewUser = new User({ Username, Password: hashedPassword });
    await NewUser.save();
    res.status(201).json({
        id: NewUser._id,
        message: "User created successfully"
    });
});

// Login route
app.post("/signin", async (req, res) => {
    const { Username, Password } = req.body;
    const UserExists = await User.findOne({ Username });
    if (!UserExists) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(Password, UserExists.Password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: UserExists._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token });
});


// Post medicine route
app.post("/api/medicines", authenticateToken, async (req, res) => {
    try{
        const newMedicine = new Medicine({ ...req.body, userId: req.id });
        await newMedicine.save();
        res.status(201).json({ message: "Medicine added successfully" });
    }
    catch(err){
        res.status(403).json({
            message: "Error adding medicine",
            error: err.message,
        });
    }
});


// Get medicines route
app.get("/api/medicines", authenticateToken, async (req, res) => {
    try {
        const medicines = await Medicine.find({ userId: req.id });
        res.status(200).json({ medicines });
    } catch (err) {
        res.status(403).json({
            message: "Error fetching medicines",
            error: err.message,
        });
    }
});


// Delete medicine route
app.delete("/api/medicines/:id", authenticateToken, async (req, res) => {
    try {
        const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, userId: req.id });   
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        res.status(200).json({ message: "Medicine deleted successfully" });
    } catch (err) {
        res.status(403).json({
            message: "Error deleting medicine",
            error: err.message,
        });
    }
});

//Update medicine route
app.put("/api/medicines/:id", authenticateToken, async (req, res) => {
    try {
        const medicine = await Medicine.findOneAndUpdate(
            { _id: req.params.id, userId: req.id },
            req.body,
            { new: true }
        );
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        res.status(200).json({ message: "Medicine updated successfully", medicine });
    } catch (err) {
        res.status(403).json({
            message: "Error updating medicine",
            error: err.message,
        });
    }
});

// Delete the expired medicines

app.delete("/api/medicines/expired/all", authenticateToken, async (req, res) => {
    try {
        const result = await Medicine.deleteMany({ 
            userId: req.id,
            expiry_date: { $lt: new Date() }  // aaj se pehle ki sab
        });
        res.status(200).json({ message: `${result.deletedCount} expired medicines removed` });
    } catch (err) {
        res.status(500).json({ message: "Error deleting expired medicines", error: err.message });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
