const Job = require("../models/Job")
const mongoose = require("mongoose")

const createJob = async(req, res, next) => {
  try {

    const {
      title,
      company,
      location,
      jobType,
      status,
      salary,
      applicationDate,
      jobUrl,
      notes
    } = req.body

    if (!title || !company || !location || !jobType || !status || !salary || !applicationDate) {
      return res.status(400).json({
        message: "Title, company, location, jobType, status, salary and applicationDate fields are required"
      })
    }

    const job = await Job.create({
      title,
      company,
      location,
      jobType,
      status,
      salary,
      applicationDate,
      jobUrl,
      notes,
      user: req.user.userId
    })

    res.status(201).json({
      message: "Job Application created successfully",
      job
    })

  } catch (error) {

    // res.status(500).json({
    //   message: "Server error",
    //   error: error.message
    // })

    next(error)

  }
}

const getSingleJob = async(req, res, next) => {
  try {

    const { id } = req.params

    const job = await Job.findById(id)

    if (!job) {
      return res.status(404).json({
        message: "Job post not found"
      })
    }

    if (job.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to view this job"
      })
    }

    res.status(200).json({
      job
    })

  } catch (error) {

    // res.status(500).json({
    //   message: "Server error",
    //   error: error.message
    // })

    next(error)

  }
}

const getAllJobs = async(req, res, next) => {
  try {

    const {
      search,
      company,
      status,
      location,
      jobType,
      sort = "newest",
      page = 1,
      limit = 10
    } = req.query

    const pageNumber = Number(page)
    const limitNumber = Number(limit)

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      return res.status(400).json({
        message: "Page must be a positive integer"
      })
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1) {
      return res.status(400).json({
        message: "Limit must be a positive integer"
      })
    }

    // searching
    const filter = {
      user: req.user.userId
    }

    if (search) {
      filter.$or = [
        {
          company: {
            $regex: search,
            $options: "i"
          }
        },
        {
          title: {
            $regex: search,
            $options: "i"
          }
        },
        {
          location: {
            $regex: search,
            $options: "i"
          }
        }
      ]
    }

    // Filtering
    if (company) {
      filter.company = company
    }

    if (status) {
      filter.status = status
    }

    if (location) {
      filter.location = location
    }

    if (jobType) {
      filter.jobType = jobType
    }

    // sorting
    let sortOption = {}

    if (sort === "oldest") {
      sortOption.createdAt = 1
    } else {
      sortOption.createdAt = -1
    }

    const skip = (pageNumber - 1) * limitNumber

    const jobs = await Job.find(
      filter
    )
    .sort(sortOption)
    .skip(skip)
    .limit(limitNumber)

    const totalJobs = await Job.countDocuments(filter)

    res.status(200).json({
      page: pageNumber,
      limit: limitNumber,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limitNumber),
      jobs
    })

  } catch (error) {

    // res.status(500).json({
    //   message: "Server error",
    //   error: error.message
    // })

    next(error)

  }
}

const updateJob = async(req, res, next) => {
  try {

    const { id } = req.params
    const { title, company, location, jobType, status, salary, applicationDate, jobUrl, notes } = req.body

    const jobPost = await Job.findById(id)

    if (!jobPost) {
      return res.status(404).json({
        message: "Job post not found"
      })
    }

    // Authorization checks
    if (jobPost.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to update this post"
      })
    }

    if (title) {
      jobPost.title = title
    }

    if (company) {
      jobPost.company = company
    }

    if (location) {
      jobPost.location = location
    }

    if (jobType) {
      jobPost.jobType = jobType
    }

    if (status) {
      jobPost.status = status
    }

    if (salary !== undefined) {
      jobPost.salary = salary
    }

    if (applicationDate) {
      jobPost.applicationDate = applicationDate
    }

    if (jobUrl !== undefined) {
      jobPost.jobUrl = jobUrl
    }

    if (notes !== undefined) {
      jobPost.notes = notes
    }

    await jobPost.save()

    res.status(200).json({
      message: "Job post updated successfully",
      jobPost
    })

  } catch (error) {

    next(error)

  }
}

const deleteJob = async(req, res, next) => {
  try {

    const { id } = req.params

    const jobPost = await Job.findById(id)

    if (!jobPost) {
      return res.status(404).json({
        message: "Job post not found"
      })
    }

    if (jobPost.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to delete this post"
      })
    }

    await Job.findByIdAndDelete(id)

    res.status(200).json({
      message: "Job post deleted successfully"
    })

  } catch (error) {

    next(error)

  }
}

const updateJobStatus = async(req, res, next) => {
  try {

    const { id } = req.params

    const { status } = req.body

    const job = await Job.findById(id)
    if(!job) {
      return res.status(404).json({
        message: "Job post not found"
      })
    }

    if (job.user.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to update the job status"
      })
    }

    const validStatuses = [
      "Applied",
      "Offer",
      "OA",
      "Interview",
      "Rejected",
      "Withdrawn"
    ]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      })
    }

    if (!status) {
      return res.status(400).json({
        message: "Status is required"
      })
    }

    if (status) {
      job.status = status
    }

    await job.save()

    res.status(200).json({
      message: "Job status updated successfully",
      job
    })

  } catch (error) {

    next(error)

  }
}

const getDashboardStats = async(req, res) => {
  try {

    const jobStats = await Job.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.userId)
        }
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1
          }
        }
      }
    ])

    const totalApplications = await Job.countDocuments({
      user: req.user.userId
    })

    res.status(200).json({
      totalApplications,
      statusCounts: jobStats
    })

  } catch (error) {

    // res.status(500).json({
    //   message: "Server error",
    //   error: error.message
    // })

    next(error)

  }
}

const monthlyApplications = async(req, res, next) => {
  try {

    const jobs = await Job.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.userId)
        }
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$applicationDate"
            },
            month: {
              $month: "$applicationDate"
            }
          },
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ])

    res.status(200).json({
      monthlyApplications: jobs
    })

  } catch (error) {

    // res.status(400).json({
    //   error: error.message
    // })

    next(error)
  }
}

const getJobTypeStats = async(req, res, next) => {
  try {

    const stats = await Job.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.userId)
        }
      },
      {
        $group: {
          _id: "$jobType",
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          count: -1
        }
      }
    ])

    res.status(200).json({
      jobTypeStats: stats
    })

  } catch (error) {

    // res.status(500).json({
    //   error: error.message
    // })

    next(error)

  }
}

const getApplicationRates = async(req, res, next) => {
  try {

    const userFilter = {
      user: new mongoose.Types.ObjectId(req.user.userId)
    }
    
    const totalJobApplications = await Job.countDocuments(userFilter)

    const interviewApplications = await Job.countDocuments({
      ...userFilter,
      status: "Interview"
    })

    const offerApplications = await Job.countDocuments({
      ...userFilter,
      status: "Offer"
    })

    const interviewRate = 
    totalJobApplications === 0 ? 0 : Number((interviewApplications / totalJobApplications) * 100).toFixed(2)

    const offerRate = 
    totalJobApplications === 0 ? 0 : Number((offerApplications / totalJobApplications) * 100).toFixed(2)

    res.status(200).json({
      totalApplications: totalJobApplications,
      interviewApplications,
      offerApplications,
      interviewRate,
      offerRate
    })

  } catch (error) {

    res.status(500).json({
      error: error.message
    })

  }
}

const getSalaryStats = async(req, res, next) => {
  try {

    const stats = await Job.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.userId)
        }
      },
      {
        $group: {
          _id: null,
          totalApplications: {
            $sum: 1
          },
          averageSalary: {
            $avg: "$salary"
          },
          highestSalary: {
            $max: "$salary"
          },
          lowestSalary: {
            $min: "$salary"
          }
        }
      }
    ])

    const salaryStats = stats[0] || {
      totalApplications: 0,
      averageSalary: 0,
      highestSalary: 0,
      lowestSalary: 0
    }

    res.status(200).json({
      salaryStats: {
        ...salaryStats,
        averageSalary: Number(
          salaryStats.averageSalary.toFixed(2)
        )
      }
    })

  } catch (error) {

    next(error)

  }
}

module.exports = {
  createJob,
  getSingleJob,
  getAllJobs,
  updateJob,
  deleteJob,
  updateJobStatus,
  getDashboardStats,
  monthlyApplications,
  getJobTypeStats,
  getApplicationRates,
  getSalaryStats
}
