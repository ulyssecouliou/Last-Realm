# Last Realm Backend

Backend API server for the Last Realm project, built with Express.js and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Database Setup:**
   - Install PostgreSQL on your system
   - Create a new database named `last_realm`
   - Create a PostgreSQL user with appropriate permissions

3. **Environment Configuration:**
   - Copy `.env.example` to `.env`
   - Update the database credentials in `.env`:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=last_realm
     DB_USER=your_username
     DB_PASSWORD=your_password
     ```

4. **Start the server:**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

## Database Migration from MongoDB

This backend has been migrated from MongoDB/Mongoose to PostgreSQL/Sequelize:

- **Mongoose Schemas** → **Sequelize Models**
- **MongoDB Collections** → **PostgreSQL Tables**
- **ObjectId** → **UUID**

### Key Changes:

1. **Database Driver:** `mongoose` → `pg` + `sequelize`
2. **Schema Definition:** Mongoose schemas → Sequelize models with DataTypes
3. **Queries:** Mongoose methods → Sequelize ORM methods
4. **Relationships:** Mongoose refs → Sequelize associations

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Health Check
- `GET /health` - Server health status

## Project Structure

```
backend/
├── config/
│   └── database.js      # PostgreSQL configuration
├── models/
│   ├── index.js         # Model exports and associations
│   └── User.js          # User model
├── routes/
│   └── users.js         # User API routes
├── .env.example         # Environment variables template
├── server.js            # Main server file
└── package.json         # Dependencies and scripts
```

## Development Notes

- The server automatically syncs database models on startup
- All timestamps are handled automatically by Sequelize
- UUIDs are used instead of MongoDB ObjectIds
- Validation is handled at the model level
- Error handling includes proper HTTP status codes
