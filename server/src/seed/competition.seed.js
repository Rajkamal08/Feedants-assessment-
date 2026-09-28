const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Competition = require('../models/Competition');
const User = require('../models/User');
const Registration = require('../models/Registration');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Competition.deleteMany();
    await User.deleteMany();
    await Registration.deleteMany();

    // Create a mock user
    const user = await User.create({
      _id: new mongoose.Types.ObjectId('6ab94be4b82a7b75a5ce2464'),
      name: 'Test User',
      email: 'test@feedants.com'
    });

    // Create the competition matching the screenshot exactly
    const comp = await Competition.create({
      _id: new mongoose.Types.ObjectId('6ab94be5b82a7b75a5ce2468'),
      title: 'Feedants Classical Dance',
      tags: ['Dance', 'Multi-Win'],
      prizePool: 1500,
      entryFee: 99,
      capacity: {
        totalSpots: 20,
        bookedSpots: 1
      },
      judge: {
        name: 'Manju Dubey',
        title: 'Professional Kathak Dancer',
        experience: '12+ Years of Experience',
        image: 'https://i.pravatar.cc/150?img=47', // Placeholder judge image
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      dates: {
        // We will make the registration close date 1 day and 6 hours from now to ensure the countdown looks realistic and active
        // But the design says 10 Aug 26, so we'll use a dynamic future date to ensure the countdown works when testing
        registrationClose: new Date(Date.now() + (1 * 24 * 60 * 60 * 1000) + (6 * 60 * 60 * 1000) + (28 * 60 * 1000)), // 1d 6h 28m from now
        submissionStart: new Date('2026-08-06T04:00:00.000Z'), // Example fixed dates as per design
        submissionEnd: new Date('2026-08-30T23:55:00.000Z'),
        resultDate: new Date('2026-09-01T23:50:00.000Z')
      },
      previousWinners: [
        { name: 'Riya Shah', position: '1st Winner', image: 'https://i.pravatar.cc/150?img=44' },
        { name: 'Aarav Mehta', position: '1st Winner', image: 'https://i.pravatar.cc/150?img=11' },
        { name: 'Neha Verma', position: '2nd Winner', image: 'https://i.pravatar.cc/150?img=9' },
        { name: 'Ishita Chou...', position: '3rd Winner', image: 'https://i.pravatar.cc/150?img=10' }
      ],
      tabs: {
        about: 'This is an online classical dance competition open for all age groups.\nParticipate from anywhere and showcase your talent.\nExpress your passion through traditional dance.',
        judgingParameters: 'Judging will be based on rhythm, expression, technical accuracy, and overall presentation.',
        rules: '1. Video must be unedited.\n2. Duration between 2-4 minutes.\n3. Appropriate traditional attire required.'
      },
      rewards: [
        { position: '1st Winner', amount: 550 },
        { position: '2nd Winner', amount: 300 },
        { position: '3rd Winner', amount: 240 },
        { position: '4th Winner', amount: 200 },
        { position: '5th Winner', amount: 130 },
        { position: '6th Winner', amount: 80 }
      ]
    });

    console.log('Data Seeded Successfully');
    console.log(`Competition ID: ${comp._id}`);
    console.log(`Mock User ID: ${user._id}`);
    
    process.exit();
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
