const express = require('express');
const router = express.Router();
const {
  getCompetition,
  registerForCompetition
} = require('../controllers/competition.controller');

router.route('/:id').get(getCompetition);
router.route('/:id/register').post(registerForCompetition);

module.exports = router;
