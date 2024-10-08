const mongoose = require("mongoose");

// Schema for questions
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [String],
  correctAnswer: { type: String, required: true },
});

// Schema for tests, each test contains questions
const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [questionSchema], // Array of questions for each test
  totalQuestions: { type: Number, required: true },
});

// Schema for topics, each topic contains tests
const topicSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., 'Number System'
  tests: [testSchema], // Array of tests under each topic
});

// Schema for sub-courses, each sub-course contains topics
const subCourseSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., 'Quantitative Aptitude'
  topics: [topicSchema], // Array of topics under each sub-course
});

// Schema for main courses, each course contains sub-courses
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., 'Aptitude'
  subCourses: [subCourseSchema], // Array of sub-courses
});

// Model for the course
const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
