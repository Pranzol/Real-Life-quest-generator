import dotenv from 'dotenv';
import mongoose from 'mongoose';
import net from 'net';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/real_life_quest_generator';

// Quick check if MongoDB is active
const isMongoRunning = () => {
  return new Promise((resolve) => {
    // If external URI is set, assume it is running
    if (process.env.MONGO_URI && !process.env.MONGO_URI.includes('127.0.0.1') && !process.env.MONGO_URI.includes('localhost')) {
      return resolve(true);
    }
    const socket = new net.Socket();
    socket.setTimeout(1000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(27017, '127.0.0.1');
  });
};

const printLog = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

const run = async () => {
  const mongoActive = await isMongoRunning();

  if (!mongoActive) {
    global.USE_MOCK_DB = true;
    printLog('[WARNING] Local MongoDB was not detected on port 27017.');
    printLog('Starting server in MOCK DATABASE MODE (in-memory). Data will not persist across restarts!');
  }

  // Dynamically import app and seed controllers after global flag is set
  const { default: app } = await import('./src/app.js');
  const { seedBadges } = await import('./src/controllers/badgeController.js');

  if (global.USE_MOCK_DB) {
    // Seed default badges
    try {
      printLog('Seeding default badges to memory...');
      await seedBadges();
      printLog('Default badges verified / seeded.');
    } catch (err) {
      printLog(`[!] Error seeding badges in mock mode: ${err.message}`);
    }

    // Start listening
    app.listen(PORT, () => {
      printLog(`Server running in development mode on port ${PORT} [MOCK DB MODE]`);
    });
  } else {
    // Connect to real MongoDB
    mongoose.connect(MONGO_URI)
      .then(async () => {
        printLog('Connected to MongoDB database successfully.');
        
        try {
          printLog('Seeding default badges...');
          await seedBadges();
          printLog('Default badges verified / seeded.');
        } catch (err) {
          printLog(`[!] Error seeding badges: ${err.message}`);
        }

        app.listen(PORT, () => {
          printLog(`Server running in development mode on port ${PORT}`);
        });
      })
      .catch((err) => {
        printLog(`[!] MongoDB Connection Error: ${err.message}`);
        process.exit(1);
      });
  }
};

run().catch(err => {
  printLog(`[FATAL] Startup crash: ${err.stack}`);
});
