const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    company: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    jobType: {
      type: String,
      required: true,
      enum: ["Part-time", "Full-time", "Freelance", "Internship","Contract"]
    },

    status: {
      type: String,
      required: true,
      trim: true,
      enum: ["Applied", "OA", "Interview", "Offer", "Rejected", "Withdrawn"]
    },

    salary: {
      type: Number,
      required: true
    },

    applicationDate: {
      type: Date,
      required: true
    },

    jobUrl: {
      type: String
    },

    notes: {
      type: String,
      default: ""
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
)

const Job = mongoose.model("Job", jobSchema)

module.exports = Job