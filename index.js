require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB using env variable
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// User model
const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  password: String
}));

// Note model
const Note = mongoose.model('Note', new mongoose.Schema({
  userId: String,
  text: String
}));

// Login or Register route
app.post('/api/login', async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    const hashed = await bcrypt.hash(req.body.password, 10);
    user = await User.create({ email: req.body.email, password: hashed });
  }
  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(401).send("Invalid password");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).send("Unauthorized");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).send("Invalid token");
  }
}

// Notes APIs
app.get('/api/notes', auth, async (req, res) => {
  const notes = await Note.find({ userId: req.user.id });
  res.json(notes);
});

app.post('/api/notes', auth, async (req, res) => {
  const note = await Note.create({ text: req.body.text, userId: req.user.id });
  res.json(note);
});

app.delete('/api/notes/:id', auth, async (req, res) => {
  await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.sendStatus(204);
});

// Health check route
app.get('/', (req, res) => {
  res.send('✅ Backend is running successfully on EC2!');
});

// Start the server on env-defined port or default 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Auth server running on port ${PORT}`));
