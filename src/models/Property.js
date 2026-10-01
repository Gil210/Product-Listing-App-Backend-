const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true, trim: true },
  propertyType: { type: String, required: true, enum: ['apartment', 'Apartment', 'house', 'House', 'condo', "Condo", 'land', "Land", 'commercial', 'Commercial', "Hotel", "hotel"] },
  price: { type: Number, required: true, min: 0 },
  location: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  bedrooms: { type: Number, required: true, min: 0 },
  bathrooms: { type: Number, required: true, min: 0 },
  squareFeet: { type: Number, required: true, min: 0 },
  images: [{ type: String }],
  amenities: [{ type: String, trim: true }],
  status: { type: String, enum: ['available', 'sold', 'rented', 'unavailable'], default: 'available' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

propertySchema.index({ title: 'text', description: 'text', location: 'text', city: 'text', state: 'text', propertyType: 'text' });

module.exports = mongoose.model('Property', propertySchema);
