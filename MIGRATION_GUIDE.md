# Migration Guide: MongoDB to PostgreSQL

## Overview
This guide documents the migration from MongoDB/Mongoose to PostgreSQL/Sequelize for the Last Realm backend.

## Key Changes

### 1. Dependencies
**Before (MongoDB):**
```json
{
  "mongoose": "^8.19.2"
}
```

**After (PostgreSQL):**
```json
{
  "pg": "^8.11.3",
  "sequelize": "^6.35.0"
}
```

### 2. Database Connection

**Before (Mongoose):**
```javascript
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/last_realm');
```

**After (Sequelize):**
```javascript
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  database: 'last_realm',
  username: 'postgres',
  password: 'password'
});
```

### 3. Schema/Model Definition

**Before (Mongoose Schema):**
```javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
```

**After (Sequelize Model):**
```javascript
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});
```

### 4. CRUD Operations

**Create:**
```javascript
// Before (Mongoose)
const user = new User({ username, email, password });
await user.save();

// After (Sequelize)
const user = await User.create({ username, email, password });
```

**Read:**
```javascript
// Before (Mongoose)
const users = await User.find();
const user = await User.findById(id);

// After (Sequelize)
const users = await User.findAll();
const user = await User.findByPk(id);
```

**Update:**
```javascript
// Before (Mongoose)
await User.findByIdAndUpdate(id, { username });

// After (Sequelize)
await User.update({ username }, { where: { id } });
```

**Delete:**
```javascript
// Before (Mongoose)
await User.findByIdAndDelete(id);

// After (Sequelize)
await User.destroy({ where: { id } });
```

### 5. Data Types

| Mongoose | Sequelize |
|----------|-----------|
| `String` | `DataTypes.STRING` |
| `Number` | `DataTypes.INTEGER` / `DataTypes.FLOAT` |
| `Date` | `DataTypes.DATE` |
| `Boolean` | `DataTypes.BOOLEAN` |
| `ObjectId` | `DataTypes.UUID` |
| `Array` | `DataTypes.ARRAY()` |
| `Object` | `DataTypes.JSONB` |

## Setup Instructions

1. **Install PostgreSQL:**
   - Download and install PostgreSQL
   - Create a database named `last_realm`

2. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment:**
   - Copy `.env.example` to `.env`
   - Update database credentials

4. **Run the Server:**
   ```bash
   npm run dev
   ```

## Benefits of PostgreSQL

- **ACID Compliance:** Better data integrity
- **Complex Queries:** Advanced SQL capabilities
- **Performance:** Better for complex relationships
- **Scalability:** Horizontal and vertical scaling options
- **Data Types:** Rich set of native data types
- **Constraints:** Database-level validation and constraints
