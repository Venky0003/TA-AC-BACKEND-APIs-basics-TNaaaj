var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stateSchema = new Schema({
  states_name: String,
  countryId: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
  population: Number,
  area: String,
  neighbouring_states: [
    { type: Schema.Types.ObjectId, ref: 'State', required: true },
  ],
});

var State = mongoose.model('State', stateSchema);

module.exports = State;
