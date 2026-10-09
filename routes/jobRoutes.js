const express = require('express')

const router = express.Router()

const { createJob, getAllJobs, updateJob, deleteJob, getSingleJob, updateJobStatus, getDashboardStats, monthlyApplications, getJobTypeStats, getApplicationRates, getSalaryStats } = require("../controllers/jobController")

const protect = require("../middlewares/authMiddleware")

router.post("/", protect, createJob)
router.get("/", protect, getAllJobs)
router.get("/dashboard", protect, getDashboardStats)
router.get("/monthly-applications", protect, monthlyApplications)
router.get("/job-type-status", protect, getJobTypeStats)
router.get("/application-rates", protect, getApplicationRates)
router.get("/salary-stats", protect, getSalaryStats)
router.get("/:id", protect, getSingleJob)
router.put("/:id", protect, updateJob)
router.put("/:id/status", protect, updateJobStatus)
router.delete("/:id", protect, deleteJob)

module.exports = router