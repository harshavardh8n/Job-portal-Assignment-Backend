const express = require("express");
const zod = require("zod");
const { Job } = require("../db");
const authenticate = require("../middlewares/userMiddleware");

const router = express.Router();

// Define Zod schema for job creation
const jobSchema = zod.object({
    companyname: zod.string(),
    name: zod.string(),
    description: zod.string(),
    skills: zod.array(zod.string())
});

// Route to add a job with validation
router.post("/addJob", authenticate, async (req, res) => {
    try {
        // Validate input using Zod schema
        const validation = jobSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: "Invalid inputs", errors: validation.error.errors });
        }

        const { name, description, skills, companyname } = req.body;

        // Create the new job
        const job = await Job.create({ name, description, skills, companyname });
        res.status(201).json({ message: "Job has been created", job });
    } catch (error) {
        console.error("Error creating job:", error);
        res.status(500).json({ error: "An error occurred while creating the job" });
    }
});

// Route to get all jobs
router.get("/jobs", authenticate, async (req, res) => {
    try {
        const jobs = await Job.find({});
        const formattedJobs = jobs.map(job => ({
            jobId: job._id,
            company: job.companyname,
            jobName: job.name,
            description: job.description,
            skillsRequired: job.skills
        }));
        res.status(200).json(formattedJobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ error: "An error occurred while fetching jobs" });
    }
});

module.exports = router;
