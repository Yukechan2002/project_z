const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema({
 
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  }, // Reference to Course
  
  
  testTitle: { type: String, required: true }, // Store the test title
  score: { type: Number, required: true }, // Ensure score is required
  attempt: { type: Number, required: true }, // Field for attempt count
  createdAt: { type: Date, default: Date.now }, // Optional: Timestamp for when the result was created
});

const TestResult = mongoose.model("TestResult", testResultSchema);

module.exports = TestResult;
