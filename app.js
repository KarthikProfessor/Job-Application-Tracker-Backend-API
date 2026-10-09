const express = require("express")

const app = express()

const authRoutes = require("./routes/authRoutes")
const jobRoutes = require("./routes/jobRoutes")
app.use(express.json())

app.get("/", (req, res) => {
  res.json({
    message: "Job Application Tracker API is running"
  })
})

app.use("/api/auth", authRoutes)
app.use("/api/jobs", jobRoutes)

module.exports = app;