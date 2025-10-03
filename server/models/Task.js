const mongoose = require("mongoose");

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ["pending", "completed"], default: "pending" }
}, { _id: false });

const reminderSchema = new mongoose.Schema({
  time: { type: String, required: true }, // e.g., "20:30"
  method: { type: String, enum: ["none", "notify", "email"], default: "notify" }
}, { _id: false });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, default: "General" },

  // Scheduling core
  date: { type: Date, default: Date.now }, // for ad-hoc/static instance date
  startTime: { type: String, default: "09:00" },
  endTime: { type: String, default: "10:00" },

  // Visual/type tag used in UI
  type: { 
    type: String, 
    enum: ["class", "meeting", "office_hours", "preparation", "research", "other"], 
    default: "class" 
  },

  location: String,
  status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },

  // Kind of task per requirements
  kind: { 
    type: String, 
    enum: ["static", "recurring", "periodic", "ad_hoc"], 
    default: "ad_hoc" 
  },

  // For static kind: specific days of week to show (0=Sun..6=Sat)
  staticDays: [{ type: Number, min: 0, max: 6 }],

  // Recurrence (for recurring kind)
  recurrence: {
    daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0=Sun ... 6=Sat
    intervalWeeks: { type: Number, default: 1, min: 1 },
    repeatEndDate: { type: Date }
  },

  // Periodic window (for periodic kind)
  period: {
    startDate: { type: Date },
    endDate: { type: Date }
  },

  // Subtasks and reminders
  subtasks: { type: [subtaskSchema], default: [] },
  reminders: { type: [reminderSchema], default: [] },
  dailySummary: { type: Boolean, default: true }, // include in 9pm summary

  // Lecture-specific optional details (used when type is 'class' or category indicates lecture)
  lectureDetails: {
    className: { type: String },
    hallNumber: { type: String },
    hours: { type: String }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Task", taskSchema);

