const express = require("express");
const zod = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Job } = require("../db");
const authenticate = require("../middlewares/userMiddleware");

const router = express.Router();

// Use environment variable for JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Define Zod schema for signup
const signupSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6),
    name: zod.string(),
    resume: zod.string().url(),
});

// Route to handle user signup
router.post("/signup", async (req, res) => {
    console.log("Signup request received");
    try {
        const validation = signupSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(211).json({ message: "Invalid inputs", errors: validation.error.errors });
        }

        const { email, password, name, resume } = req.body;
        const existing = await User.findOne({ email });
        if (existing) {
            console.log("User already exists");
            return res.status(209).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword, name, resume });

        const userId = user._id;
        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: "User created successfully", token });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "An error occurred during signup" });
    }
});

// Define Zod schema for signin
const signinSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6),
});

// Route to handle user signin
router.post("/signin", async (req, res) => {
    console.log("Signin request received");
    try {
        const validation = signinSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(202).json({ message: "Invalid inputs", errors: validation.error.errors });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(201).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(210).json({ message: "Invalid credentials" });
        }

        const userId = user._id;
        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: "User logged in successfully", token });
    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ error: "An error occurred during signin" });
    }
});

// Route to get all users (protected by authentication)
router.get("/users", authenticate, async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users.map(user => ({
            id: user._id,
            email: user.email,
            name: user.name,
            resume: user.resume,
        })));
    } catch (error) {
        console.error("Fetch users error:", error);
        res.status(500).json({ error: "An error occurred while fetching users" });
    }
});

// Define Zod schema for job application
const applySchema = zod.object({
    jobId: zod.string().length(24),
});

// Route to apply for a job (protected by authentication)
router.post("/apply", authenticate, async (req, res) => {
    try {
        const validation = applySchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: "Invalid job ID", errors: validation.error.errors });
        }

        const { jobId } = req.body;
        const userId = req.user._id;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(206).json({ message: "Job not found" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(204).json({ message: "User not found" });
        }

        if (user.appliedJobs.includes(jobId)) {
            return res.status(202).json({ message: "Job already applied" });
        }

        user.appliedJobs.push(jobId);
        await user.save();

        res.status(200).json({ message: "Job applied successfully" });
    } catch (error) {
        console.error("Job application error:", error);
        res.status(500).json({ error: "An error occurred during job application" });
    }
});

// Route to get applied jobs for the authenticated user
router.get("/myapplications", authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('appliedJobs');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const appliedJobs = user.appliedJobs.map(job => ({
            companyName: job.companyname,
            jobName: job.name,
            description: job.description
        }));

        res.status(200).json({ appliedJobs });
    } catch (error) {
        console.error("Fetch applications error:", error);
        res.status(500).json({ error: "An error occurred while fetching applications" });
    }
});



router.get("/myprofile", authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findOne({_id:userId});

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const UserData = {
            userName:user.name,
            email:user.email,
            resume:user.resume,
        }

        res.status(200).json({ UserData });
    } catch (error) {
        console.error("Fetch applications error:", error);
        res.status(500).json({ error: "An error occurred while fetching applications" });
    }
});


module.exports = router;
