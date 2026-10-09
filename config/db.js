const dns = require('dns')
dns.setServers(["8.8.8.8", "1.1.1.1"])

const mongoose = require('mongoose')

const connectDB = async(req, res) => {
  try {

    await 
    mongoose.connect(process.env.MONGO_URI)
      .then(() => {
        console.log('MongoDB connected')
      })
      .catch(error => console.log(error))

  } catch (error) {
    console.log(error)
  }
}

module.exports = connectDB;