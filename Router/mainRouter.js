const express = require("express")
const router = express.Router();
const userRouter = require("./userRouter")
const jobRouter = require("./jobRouter")

router.use("/jobs",jobRouter)
router.use("/users",userRouter)

module.exports = router;