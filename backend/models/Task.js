const mongoose = require("mongoose");
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["Todo", "In-Progress", "Done"],
    default: "Todo",
  },
  category: {
    type: String,
    enum: ["Bug", "Feature", "Enhancement"],
    default: "Low",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low",
  },
  fileUrl: {
    type: String,
    default: "", 
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Task", TaskSchema);
