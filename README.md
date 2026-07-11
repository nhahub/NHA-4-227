# NHA-4-227
Auto generated repo 227
# Smart Multi-Role E-Commerce Platform
## Overview
Smart Multi-Role E-Commerce Platform is a MERN-based web application inspired by Amazon. It supports multiple user roles including customers and administrators, allowing users to browse products, manage orders, and perform administrative tasks.
---
# Installation Steps
1. Clone the repository
```bash
git clone https://github.com/NHA-4-227.git
```
2. Navigate to the project folder
```bash
cd NHA-4-227
```
3. Install frontend dependencies
```bash
npm install
```
4. Install backend dependencies
```bash
cd backend
npm install
```
---
# System Requirements
## Hardware
- Minimum 4 GB RAM
- 2 GHz Dual-Core Processor
- 500 MB Free Disk Space
## Software
- Node.js (v18 or later)
- npm (v9 or later)
- MongoDB Atlas or MongoDB Community Server
- Git
- Visual Studio Code (recommended)
---
# Configuration Instructions
Create a `.env` file inside the **backend** folder.
Example:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
For the frontend, create a `.env` file in the project root if needed.
Example:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
---
# Execution Guide
## Run Backend
```bash
cd backend
npm install
npm start
```
Backend runs on:
```
http://localhost:5000
```
---
## Run Frontend
Open another terminal.
```bash
npm install
npm run dev
```
Frontend runs on:
```
http://localhost:5173
```
---
# API Documentation
## Health Check
```
GET /api/health
```
Returns server status.
---
## Products
```
GET /api/products
```
Returns all products.
---
## Categories
```
GET /api/categories
```
Returns all product categories.
---
## Users
```
POST /api/users/login
```
Authenticates a user.
---
## Orders
```
POST /api/orders
```
Creates a new order.
---
## Notifications
```
GET /api/notifications
```
Returns notifications.
---
## Admin
```
GET /api/admin
```
Administrative endpoints.
---
## Support
```
GET /api/support
```
Support-related endpoints.
---
# Executable Files & Deployment Link
## Frontend (Live Demo)
https://nha-4-227.vercel.app/
## Source Code
GitHub Repository: https://github.com/NHA-4-227
Backend deployment is currently under development.
---
# Technologies Used
- React (Vite)
- Node.js
- Express.js
- MongoDB
- Mongoose
- Tailwind CSS
- JWT Authentication
- REST API
---
# Project Structure
```
frontend/
backend/
├── config
├── controllers
├── middleware
├── models
├── routes
├── uploads
├── utils
└── server.js
```
