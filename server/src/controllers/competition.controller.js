const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');

/**
 * @desc    Get competition details by ID, including user registration state
 * @route   GET /api/competitions/:id
 * @access  Public
 */
const getCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      res.status(404);
      throw new Error('Competition not found');
    }

    const userId = req.query.userId;
    let isRegistered = false;

    // Check if the provided user is already registered for this competition
    if (userId) {
      const registration = await Registration.findOne({
        competition: req.params.id,
        user: userId
      });
      if (registration) {
        isRegistered = true;
      }
    }

    res.json({
      competition,
      userState: {
        isRegistered
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a user for a competition with atomic spot reservation
 * @route   POST /api/competitions/:id/register
 * @access  Public
 */
const registerForCompetition = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const competitionId = req.params.id;

    // 1. Basic Validation
    if (!userId) {
      res.status(400);
      throw new Error('User ID is required');
    }

    // 2. Check for existing registration to prevent duplicates early
    const existingRegistration = await Registration.findOne({
      competition: competitionId,
      user: userId
    });

    if (existingRegistration) {
      res.status(400);
      throw new Error('User is already registered for this competition');
    }

    // 3. Atomic Reservation
    // We increment bookedSpots ONLY IF capacity is not full AND registration is still open.
    // This entirely prevents race conditions from concurrent users.
    const now = new Date();
    const competition = await Competition.findOneAndUpdate(
      { 
        _id: competitionId, 
        $expr: { $lt: ["$capacity.bookedSpots", "$capacity.totalSpots"] },
        "dates.registrationClose": { $gt: now } 
      },
      { 
        $inc: { "capacity.bookedSpots": 1 } 
      },
      { new: true }
    );

    // 4. Handle failed reservation (Capacity full, Date passed, or Not Found)
    if (!competition) {
      const checkComp = await Competition.findById(competitionId);
      if (!checkComp) {
        res.status(404);
        throw new Error('Competition not found');
      } else if (now > new Date(checkComp.dates.registrationClose)) {
        res.status(400);
        throw new Error('Registration is closed for this competition');
      } else {
        res.status(400);
        throw new Error('Competition is fully booked');
      }
    }

    // 5. Create the registration record
    const registration = await Registration.create({
      competition: competitionId,
      user: userId
    });

    res.status(201).json({
      message: 'Registration successful',
      competition,
      registration
    });
  } catch (error) {
    // Handle MongoDB duplicate key error for compound index
    if (error.code === 11000) {
       res.status(400);
       next(new Error('User is already registered for this competition'));
    } else {
       next(error);
    }
  }
};

module.exports = {
  getCompetition,
  registerForCompetition
};
