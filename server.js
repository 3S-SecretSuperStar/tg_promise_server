const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRouter');
const http = require('http')
const cors = require('cors');
const { finishPromise } = require('./controlGame/autoFinish');
const cron = require('node-cron')

dotenv.config();
const app = express();
const server = http.Server(app)

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors("*"));


// Connect MongoDB
connectDB();

// Routes
app.use('/api', userRoutes);

cron.schedule('0 * * * *', async () => {
    await finishPromise();
})

// Start the Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

