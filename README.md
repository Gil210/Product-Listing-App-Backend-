# Property Listing REST API

A beginner-friendly property listing backend built with Node.js, Express, MongoDB, and Mongoose. The API uses MVC-style controllers, services, models, middleware, JWT authentication, role authorization, Cloudinary image uploads, and consistent JSON responses.

## Features

- User, owner, and admin roles
- JWT registration, login, and current-user lookup
- Password hashing with bcryptjs
- Property CRUD with ownership authorization
- Property search, filtering, sorting, and pagination
- Property image uploads through Multer and Cloudinary
- Contact-owner messaging with sender/receiver access checks
- User profiles, password changes, and admin user management
- CORS, Helmet, Morgan, validation, and centralized error handling
- Versioned routes under `/api/v1`

## Requirements

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection
- Cloudinary account for image uploads

## Setup

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

For production:

```bash
npm start
```

The default server URL is `http://localhost:5000`.

## Frontend

The React/Vite application lives in `frontend/`, separately from the Express API. Start the backend first, then in a second terminal run:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite development server proxies `/api` requests to `http://localhost:5000`. To use a different API URL, copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` to the API base URL (including `/api/v1`). Build the production frontend with `npm run build` from `frontend/`.

The frontend includes public property search and details, login and registration, owner property creation/editing/removal, profile and password management, and sent/received messages. API integrations are kept in `frontend/src/api/`; page views and shared components are separated under `frontend/src/pages/` and `frontend/src/components/`.

## Swagger UI

Start the API, then open [http://localhost:5000/api-docs](http://localhost:5000/api-docs) in your browser. Swagger UI lists all `/api/v1` endpoints and lets you send requests interactively.

For protected endpoints:

1. Use `POST /api/v1/auth/register` or `POST /api/v1/auth/login` and copy the returned token.
2. Click **Authorize** in Swagger UI.
3. Enter `Bearer YOUR_TOKEN` and click **Authorize**.
4. Open an endpoint, click **Try it out**, fill in the request, and click **Execute**.

The OpenAPI definition is maintained in `src/config/swagger.js`.

## Environment Variables

Copy `.env.example` to `.env` and set `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV`, and the three Cloudinary credentials. Never commit `.env`.

## Roles

- `user`: browse properties, manage their profile, and contact owners
- `owner`: user capabilities plus property management
- `admin`: administrative user and property management

Registration accepts `user` or `owner`; clients cannot register as `admin`.

## API Endpoints

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` (Bearer token)

Example registration:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phone": "08012345678",
  "role": "owner"
}
```

### Users

- `GET /api/v1/users/profile`
- `PUT /api/v1/users/profile`
- `PUT /api/v1/users/change-password`
- `GET /api/v1/users` (admin)
- `GET /api/v1/users/:id` (admin)
- `DELETE /api/v1/users/:id` (admin)
- `PATCH /api/v1/users/:id/status` (admin)

### Properties

- `POST /api/v1/properties` (owner; `multipart/form-data`, images field)
- `GET /api/v1/properties`
- `GET /api/v1/properties/my-properties` (owner/admin)
- `GET /api/v1/properties/:id`
- `PUT /api/v1/properties/:id` (owner/admin)
- `DELETE /api/v1/properties/:id` (owner/admin)

Search and filter example:

```text
GET /api/v1/properties?search=apartment&city=Lagos&propertyType=apartment&minPrice=1000000&maxPrice=5000000&bedrooms=3&page=1&limit=10&sort=-price
```

For JSON requests, send `amenities` and `images` as arrays. For uploads, use `multipart/form-data` and attach up to 10 jpg, jpeg, png, or webp files under `images`; each file is limited to 5 MB.

### Messages

- `POST /api/v1/messages`
- `GET /api/v1/messages/sent`
- `GET /api/v1/messages/received`
- `GET /api/v1/messages/admin` (admin; list conversation starters)
- `GET /api/v1/messages/:id`
- `GET /api/v1/messages/:id/thread`
- `POST /api/v1/messages/:id/replies`
- `PATCH /api/v1/messages/:id/read`

The sender is always taken from the JWT. The receiver is taken from the selected property's owner. Fetching a message or thread marks messages addressed to the authenticated user as read; viewing another user's messages as an admin does not clear that user's unread state.
To reply, send `{"message":"Your reply text"}` to `POST /api/v1/messages/:id/replies`, where `:id` is any message in the thread. The original sender and property owner can reply to one another; admins can reply to any thread, and their replies are addressed to the original sender. Retrieve the full conversation with `GET /api/v1/messages/:id/thread`. Admins can browse conversation starters through `GET /api/v1/messages/admin`; each starter's thread endpoint returns its replies as well. Every reply retains the original property and subject.

## Response Format

```json
{
  "success": true,
  "message": "Property retrieved successfully",
  "data": {},
  "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

Errors use `{ "success": false, "message": "..." }`.

## Project Structure

```text
server.js
src/
  app.js
  config/             database and Cloudinary setup
  controllers/        request/response handlers
  middleware/         auth, roles, validation, errors, uploads
  models/             User, Property, Message schemas
  routes/             versioned API routes
  services/           reusable database/business operations
  utils/              tokens, async handlers, response helpers
```

`v1` is the first public API version. Future incompatible changes can use another version without breaking existing clients.

## Troubleshooting

- MongoDB errors: confirm MongoDB is running and `MONGO_URI` is correct.
- Authentication errors: send `Authorization: Bearer <token>` and use the current `JWT_SECRET`.
- Upload errors: verify Cloudinary credentials and supported image types.
- Authorization errors: property writes require `owner` or `admin`; owners can only change their own properties.
