var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var countrySchema = new Schema(
  {
    name: { type: String, required: true },
    states:[{ type: Schema.Types.ObjectId, ref: 'State' }],
    continent: { type: String, required: true },
    population: Number,
    ethnicity: [ String ],
    neighbouring_countries:[{ type: Schema.Types.ObjectId,ref:'Country'}],
    area: String,
  },
  { timestamps: true }
);


var Country = mongoose.model('Country', countrySchema);

module.exports = Country;












