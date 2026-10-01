const id = { type: 'string', example: '507f1f77bcf86cd799439011' };
const user = {
  type: 'object',
  properties: {
    _id: id,
    name: { type: 'string', example: 'John Doe' },
    email: { type: 'string', format: 'email', example: 'john@example.com' },
    phone: { type: 'string', example: '08012345678' },
    role: { type: 'string', enum: ['user', 'owner', 'admin'], example: 'owner' },
    isActive: { type: 'boolean', example: true }
  }
};
const property = {
  type: 'object',
  properties: {
    _id: id,
    title: { type: 'string', example: 'Modern 3 Bedroom Apartment' },
    description: { type: 'string', example: 'Beautiful apartment in a secure environment.' },
    propertyType: { type: 'string', enum: ['apartment', 'house', 'condo', 'land', 'commercial'] },
    price: { type: 'number', example: 3500000 },
    location: { type: 'string', example: 'Lekki' },
    address: { type: 'string', example: 'Lekki Phase 1' },
    city: { type: 'string', example: 'Lagos' },
    state: { type: 'string', example: 'Lagos' },
    country: { type: 'string', example: 'Nigeria' },
    bedrooms: { type: 'number', example: 3 },
    bathrooms: { type: 'number', example: 3 },
    squareFeet: { type: 'number', example: 1800 },
    images: { type: 'array', items: { type: 'string', format: 'uri' } },
    amenities: { type: 'array', items: { type: 'string' } },
    status: { type: 'string', enum: ['available', 'sold', 'rented', 'unavailable'] },
    owner: { oneOf: [{ $ref: '#/components/schemas/User' }, id] }
  }
};
const response = (schema, message) => ({ description: message, content: { 'application/json': { schema: { $ref: schema } } } });
const successResponse = { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string' }, data: {} } };
const auth = { bearerAuth: [] };
const protectedResponses = { 401: { description: 'Authentication required' }, 403: { description: 'Forbidden' } };

module.exports = {
  openapi: '3.0.3',
  info: { title: 'Property Listing API', version: '1.0.0', description: 'Interactive documentation for the version 1 property listing REST API.' },
  servers: [{ url: 'http://localhost:5000', description: 'Local development server' }],
  tags: [
    { name: 'Auth', description: 'Registration and JWT authentication' },
    { name: 'Users', description: 'Profiles and admin user management' },
    { name: 'Properties', description: 'Property browsing and management' },
    { name: 'Messages', description: 'Contact property owners' }
  ],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      User: user,
      Property: property,
      ApiSuccess: successResponse,
      RegisterRequest: { type: 'object', required: ['name', 'email', 'password'], properties: { name: { type: 'string', example: 'John Doe' }, email: { type: 'string', format: 'email' }, password: { type: 'string', format: 'password', example: 'Password123' }, phone: { type: 'string' }, role: { type: 'string', enum: ['user', 'owner'], default: 'user' } } },
      LoginRequest: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', format: 'password' } } },
      MessageRequest: { type: 'object', required: ['property', 'subject', 'message'], properties: { property: id, subject: { type: 'string', example: 'Interested in this property' }, message: { type: 'string', example: 'I would like to schedule a viewing.' } } }
    }
  },
  paths: {
    '/api/v1/auth/register': { post: { tags: ['Auth'], summary: 'Register a user or owner', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } }, responses: { 201: response('#/components/schemas/ApiSuccess', 'Registration successful'), 400: { description: 'Validation error' }, 409: { description: 'Email already exists' } } } },
    '/api/v1/auth/login': { post: { tags: ['Auth'], summary: 'Login and receive a JWT', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } }, responses: { 200: response('#/components/schemas/ApiSuccess', 'Login successful'), 401: { description: 'Invalid credentials' } } } },
    '/api/v1/auth/me': { get: { tags: ['Auth'], summary: 'Get the authenticated user', security: [auth], responses: { 200: response('#/components/schemas/ApiSuccess', 'Current user'), ...protectedResponses } } },
    '/api/v1/users/profile': { get: { tags: ['Users'], summary: 'Get own profile', security: [auth], responses: { 200: response('#/components/schemas/ApiSuccess', 'Profile') } }, put: { tags: ['Users'], summary: 'Update own profile', security: [auth], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, phone: { type: 'string' }, profileImage: { type: 'string', format: 'uri' } } } } } }, responses: { 200: response('#/components/schemas/ApiSuccess', 'Profile updated') } } },
    '/api/v1/users/change-password': { put: { tags: ['Users'], summary: 'Change password', security: [auth], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['currentPassword', 'newPassword'], properties: { currentPassword: { type: 'string', format: 'password' }, newPassword: { type: 'string', format: 'password', minLength: 8 } } } } } }, responses: { 200: { description: 'Password changed' }, ...protectedResponses } } },
    '/api/v1/users': { get: { tags: ['Users'], summary: 'List all users', security: [auth], responses: { 200: response('#/components/schemas/ApiSuccess', 'Users'), ...protectedResponses } } },
    '/api/v1/users/{id}': { get: { tags: ['Users'], summary: 'Get a user', security: [auth], parameters: [{ name: 'id', in: 'path', required: true, schema: id }], responses: { 200: response('#/components/schemas/ApiSuccess', 'User'), ...protectedResponses } }, delete: { tags: ['Users'], summary: 'Delete a user', security: [auth], parameters: [{ name: 'id', in: 'path', required: true, schema: id }], responses: { 200: { description: 'User deleted' }, ...protectedResponses } } },
    '/api/v1/users/{id}/status': { patch: { tags: ['Users'], summary: 'Activate or deactivate a user', security: [auth], parameters: [{ name: 'id', in: 'path', required: true, schema: id }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['isActive'], properties: { isActive: { type: 'boolean' } } } } } }, responses: { 200: response('#/components/schemas/ApiSuccess', 'Status updated'), ...protectedResponses } } },
    '/api/v1/properties': { get: { tags: ['Properties'], summary: 'Search and paginate properties', parameters: [{ name: 'search', in: 'query', schema: { type: 'string' } }, { name: 'city', in: 'query', schema: { type: 'string' } }, { name: 'propertyType', in: 'query', schema: { type: 'string' } }, { name: 'minPrice', in: 'query', schema: { type: 'number' } }, { name: 'maxPrice', in: 'query', schema: { type: 'number' } }, { name: 'bedrooms', in: 'query', schema: { type: 'number' } }, { name: 'status', in: 'query', schema: { type: 'string' } }, { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }, { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }, { name: 'sort', in: 'query', schema: { type: 'string', example: '-price' } }], responses: { 200: response('#/components/schemas/ApiSuccess', 'Properties') } }, post: { tags: ['Properties'], summary: 'Create a property with optional images', security: [auth], requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['title', 'description', 'propertyType', 'price', 'location', 'address', 'city', 'state', 'country', 'bedrooms', 'bathrooms', 'squareFeet'], properties: { title: { type: 'string' }, description: { type: 'string' }, propertyType: { type: 'string' }, price: { type: 'number' }, location: { type: 'string' }, address: { type: 'string' }, city: { type: 'string' }, state: { type: 'string' }, country: { type: 'string' }, bedrooms: { type: 'number' }, bathrooms: { type: 'number' }, squareFeet: { type: 'number' }, amenities: { type: 'string', example: '["Parking","Security"]' }, images: { type: 'array', items: { type: 'string', format: 'binary' } } } } } } }, responses: { 201: response('#/components/schemas/ApiSuccess', 'Property created'), ...protectedResponses } } },
    '/api/v1/properties/my-properties': { get: { tags: ['Properties'], summary: 'List properties owned by the current user', security: [auth], responses: { 200: response('#/components/schemas/ApiSuccess', 'Your properties'), ...protectedResponses } } },
    '/api/v1/properties/{id}': { get: { tags: ['Properties'], summary: 'Get a property and owner', parameters: [{ name: 'id', in: 'path', required: true, schema: id }], responses: { 200: response('#/components/schemas/ApiSuccess', 'Property') } }, put: { tags: ['Properties'], summary: 'Update a property', security: [auth], parameters: [{ name: 'id', in: 'path', required: true, schema: id }], requestBody: { content: { 'multipart/form-data': { schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, price: { type: 'number' }, images: { type: 'array', items: { type: 'string', format: 'binary' } } } } } } }, responses: { 200: response('#/components/schemas/ApiSuccess', 'Property updated'), ...protectedResponses } }, delete: { tags: ['Properties'], summary: 'Delete a property', security: [auth], parameters: [{ name: 'id', in: 'path', required: true, schema: id }], responses: { 200: { description: 'Property deleted' }, ...protectedResponses } } },
    '/api/v1/messages': { post: { tags: ['Messages'], summary: 'Contact a property owner', security: [auth], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageRequest' } } } }, responses: { 201: response('#/components/schemas/ApiSuccess', 'Message sent'), ...protectedResponses } } },
    '/api/v1/messages/sent': { get: { tags: ['Messages'], summary: 'List sent messages', security: [auth], responses: { 200: response('#/components/schemas/ApiSuccess', 'Sent messages'), ...protectedResponses } } },
    '/api/v1/messages/received': { get: { tags: ['Messages'], summary: 'List received messages', security: [auth], responses: { 200: response('#/components/schemas/ApiSuccess', 'Received messages'), ...protectedResponses } } },
    '/api/v1/messages/{id}': { get: { tags: ['Messages'], summary: 'Get an accessible message', security: [auth], parameters: [{ name: 'id', in: 'path', required: true, schema: id }], responses: { 200: response('#/components/schemas/ApiSuccess', 'Message'), ...protectedResponses } } },
    '/api/v1/messages/{id}/read': { patch: { tags: ['Messages'], summary: 'Mark a received message as read', security: [auth], parameters: [{ name: 'id', in: 'path', required: true, schema: id }], responses: { 200: response('#/components/schemas/ApiSuccess', 'Message marked read'), ...protectedResponses } } }
  }
};
