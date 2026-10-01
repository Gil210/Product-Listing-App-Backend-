const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { listProperties } = require('../services/propertyService');
const { uploadToCloudinary } = require('../config/cloudinary');

const parsePropertyBody = (body) => {
  const result = { ...body };
  ['price', 'bedrooms', 'bathrooms', 'squareFeet'].forEach((field) => { if (result[field] !== undefined) result[field] = Number(result[field]); });
  ['amenities', 'images'].forEach((field) => { if (typeof result[field] === 'string') { try { result[field] = JSON.parse(result[field]); } catch { result[field] = result[field].split(',').map((item) => item.trim()).filter(Boolean); } } });
  return result;
};
const uploadImages = async (files = []) => Promise.all(files.map((file) => uploadToCloudinary(file.buffer)));

const createProperty = asyncHandler(async (req, res) => {
  const input = parsePropertyBody(req.body);
  if (req.files?.length) input.images = [...(input.images || []), ...(await uploadImages(req.files))];
  const property = await Property.create({ ...input, owner: req.user._id });
  success(res, 201, 'Property created successfully', property);
});
const getProperties = asyncHandler(async (req, res) => { const result = await listProperties(req.query); success(res, 200, 'Properties retrieved successfully', result.data, { pagination: result.pagination }); });
const getProperty = asyncHandler(async (req, res) => { const property = await Property.findById(req.params.id).populate('owner', 'name email phone profileImage'); if (!property) throw Object.assign(new Error('Property not found'), { statusCode: 404 }); success(res, 200, 'Property retrieved successfully', property); });
const getMyProperties = asyncHandler(async (req, res) => success(res, 200, 'Your properties retrieved successfully', await Property.find({ owner: req.user._id }).sort('-createdAt')));
const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw Object.assign(new Error('Property not found'), { statusCode: 404 });
  if (req.user.role !== 'admin' && String(property.owner) !== String(req.user._id)) throw Object.assign(new Error('You are not authorized to modify this property'), { statusCode: 403 });
  const input = parsePropertyBody(req.body);
  if (req.files?.length) input.images = [...(input.images || property.images), ...(await uploadImages(req.files))];
  delete input.owner;
  Object.assign(property, input);
  await property.save();
  success(res, 200, 'Property updated successfully', property);
});
const deleteProperty = asyncHandler(async (req, res) => { const property = await Property.findById(req.params.id); if (!property) throw Object.assign(new Error('Property not found'), { statusCode: 404 }); if (req.user.role !== 'admin' && String(property.owner) !== String(req.user._id)) throw Object.assign(new Error('You are not authorized to delete this property'), { statusCode: 403 }); await property.deleteOne(); success(res, 200, 'Property deleted successfully'); });

module.exports = { createProperty, getProperties, getProperty, getMyProperties, updateProperty, deleteProperty };
