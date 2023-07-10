var express = require('express');
var router = express.Router();
var Country = require('../models/country');
var State = require('../models/state');

// for finding all countries that are added
router.get('/', (req, res, next) => {
  Country.find({})
    .populate('states')
    .populate('neighbouring_countries')
    .sort({ name: 1 })
    .then((countries) => {
      res.json({ countries });
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to retrieve countries' });
    });
});

// for adding new country
router.post('/', (req, res, next) => {
  Country.create(req.body)
    .then((country) => {
      res.status(201).json(country);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

//for updating the deatils of country
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  Country.findByIdAndUpdate(id, req.body, { new: true })
    .then((country) => {
      if (country) {
         country.populate('neighbouring_countries').execPopulate();
        res.json(country);
      } else {
        res.status(404).json({ error: 'Country not found' });
      }
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});


// for finding countries based on continents
router.get('/continents/:continent', (req, res, next) => {
  let { continent } = req.params;

  Country.find({ continent })
    .then((countries) => {
      res.status(200).json(countries);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

// for adding stated in country
router.post('/:id/states', (req, res, next) => {
  var id = req.params.id;
  req.body.countryId = id;

  State.create(req.body).then((state) => {
    Country.findByIdAndUpdate(
      id,
      {
        $push: { states: state._id },
      }
      // { new: true }
    )
      .then((updateCountry) => {
        res.json({ updateCountry });
      })

      .catch((error) => {
        res.status(500).json({ error });
      });
  });
});


// for finding countries neighbours
router.get('/:countryId/neighbouring_countries', async (req, res) => {
  const { countryId } = req.params;

  Country.findById(countryId).populate('neighbouring_countries').then((country) =>{
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }
    res.json(country.neighbouring_countries);
  }). catch ((error) => {
    res.status(500).json(error);
  })
});

// for finding the countries religion/ethnicity
router.get('/religions', (req, res, next) => {
  Country.aggregate([
    { $unwind: '$ethnicity' },
    { $group: { _id: null, religions: { $addToSet: '$ethnicity' } } },
    { $project: { _id: 0, religions: 1 } }
  ])
    .then((result) => {
      if (result.length === 0) {
        res.status(404).json({ error: 'No religions found' });
      } else {
        res.json(result[0].religions);
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to retrieve religions' });
    });
});

// for finding the countries based asc/desc order based on population
router.get('/population/:order', (req, res, next) => {
  const { order } = req.params;
  Country.find({})
    .then((countries) => {
      if (order === 'ascending') {
        countries.sort((a, b) => a.population - b.population);
        res.status(200).json(countries);
      } else if (order === 'descending') {
        countries.sort((a, b) => b.population - a.population);
        res.status(200).json(countries);
      } else {
        res.status(400).json({ error: 'Invalid sort order' });
      }
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

// for deleteing the country details 
router.delete('/:id', (req, res, next) => {
  var id = req.params.id;
  Country.findByIdAndDelete(id)
    .then(() => {
      if (country) {
        res.json({ message: 'Country deleted successfully' });
      } else {
        res.status(404).json({ error: 'Country not found' });
      }
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

module.exports = router;


