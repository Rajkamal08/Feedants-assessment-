const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const competitionRoutes = require('./routes/competition.routes');
app.use('/api/competitions', competitionRoutes);

app.get('/', (req, res) => {
  res.send('Feedants API is running...');
});

// Error Handler
app.use(require('./middleware/error.middleware'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
