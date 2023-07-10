var express = require('express');
var router = express.Router();
var Country = require('../models/country');
var State = require('../models/state');

//for finding all the states of a particular country
router.get('/:countryId', (req, res, next) => {

  var countryId = req.params.countryId;

  State.find({ countryId })
    .populate('neighbouring_states')
      .sort({ states_name: 1 })
    .then((states) => {
      res.status(201).json(states);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

//   for updating info of a particuylar state
router.put('/:stateId', (req, res, next) => {
  var stateId = req.params.stateId;

  State.findByIdAndUpdate(stateId, req.body)
    .then((state) => {
      if (state) {
        res.status(201).json(state);
      } else {
        res.status(404).json({ error: 'State not found' });
      }
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

//   for particular state, listing all neighbouring states
router.get('/:stateId/neighbouring_states', (req, res) => {
  var stateId = req.params.stateId;

  State.findById(stateId)
    .populate('neighbouring_states')
    .then((state) => {
      if (!state) {
        return res.status(404).json({ error: 'State not found' });
      }
      res.json(state.neighbouring_states);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

//   for deleteing the particluar state
router.delete('/:stateId', (req, res, next) => {
  var stateId = req.params.stateId;

  State.findByIdAndDelete(stateId)
    .then((state) => {
      if (state) {
        res.status(200).json({ message: 'State deleted successfully' });
      } else {
        res.status(404).json({ error: 'State not found' });
      }
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

module.exports = router;
