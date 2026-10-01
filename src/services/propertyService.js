const Property = require('../models/Property');

const listProperties = async (query) => {
  const { page = 1, limit = 10, search, city, propertyType, minPrice, maxPrice, bedrooms, status, sort = '-createdAt' } = query;
  const filter = {};
  if (city) filter.city = new RegExp(city, 'i');
  if (propertyType) filter.propertyType = propertyType;
  if (status) filter.status = status;
  if (bedrooms !== undefined) filter.bedrooms = Number(bedrooms);
  if (minPrice !== undefined || maxPrice !== undefined) filter.price = { ...(minPrice !== undefined ? { $gte: Number(minPrice) } : {}), ...(maxPrice !== undefined ? { $lte: Number(maxPrice) } : {}) };
  if (search) filter.$text = { $search: search };
  const pageNumber = Math.max(1, Number(page));
  const pageLimit = Math.min(50, Math.max(1, Number(limit)));
  const [data, total] = await Promise.all([
    Property.find(filter).populate('owner', 'name email phone profileImage').sort(sort).skip((pageNumber - 1) * pageLimit).limit(pageLimit),
    Property.countDocuments(filter)
  ]);
  return { data, pagination: { page: pageNumber, limit: pageLimit, total, totalPages: Math.ceil(total / pageLimit) } };
};

module.exports = { listProperties };
