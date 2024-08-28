const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URL);

const userSchema = mongoose.Schema({
    email: String,
    password: String,
    name: String,
    resume: String,
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }] // Change to array
});

const jobSchema = mongoose.Schema({
    companyname: String,
    name: String,
    description: String,
    skills: {
        type: [String]
    }
});

const User = mongoose.model("User", userSchema);
const Job = mongoose.model("Job", jobSchema);

module.exports = { User, Job };
