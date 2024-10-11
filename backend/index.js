const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost/compilerdb")
.then(() => {
  console.log("Successfully connected to MongoDB: compilerdb");
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Import other modules
const { generateFile } = require("./generateFile");
const { addJobToQueue } = require("./jobQueue");
const Job = require("./models/Job");

// Define routes
app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;

  console.log(language, "Length:", code.length);

  if (code === undefined) {
    return res.status(400).json({ success: false, error: "Empty code body!" });
  }

  // Generate a C++ file with content from the request
  const filepath = await generateFile(language, code);
  
  // Write into DB
  const job = await new Job({ language, filepath }).save();
  const jobId = job["_id"];
  
  addJobToQueue(jobId);
  res.status(201).json({ jobId });
});

app.get("/status", async (req, res) => {
  const jobId = req.query.id;

  if (jobId === undefined) {
    return res.status(400).json({ success: false, error: "missing id query param" });
  }

  const job = await Job.findById(jobId);

  if (!job) {
    return res.status(400).json({ success: false, error: "couldn't find job" });
  }

  return res.status(200).json({ success: true, job });
});

// Start the server
app.listen(5000, () => {
  console.log(`Listening on port 5000!`);
});
