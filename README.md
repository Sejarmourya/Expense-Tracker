💰 Expense Tracker

📌 Project Description

Expense Tracker is a full-stack MERN web application designed to
help users manage and track their daily expenses in one place.

The application allows users to enter an expense with its title,
amount, and category. The data is sent from the React frontend to a
Node.js + Express REST API, where it is stored securely in
MongoDB using Mongoose. Users can also retrieve their saved expenses
through the API.

The project is being developed to provide a practical understanding of
React frontend development, REST APIs, Express.js, MongoDB database
connectivity, and frontend-backend integration.

🔄 How the Application Works

User
  ↓
React Frontend
  ↓
REST API (Express + Node.js)
  ↓
Mongoose
  ↓
MongoDB
  ↓
Response
  ↓
React Frontend

🚀 Tech Stack

Frontend: React.js, Vite, JavaScript

Backend: Node.js, Express.js

Database: MongoDB, Mongoose

Testing: Postman

Other: dotenv, CORS

📁 Project Structure

expense-tracker/
├── backend/
│   ├── models/
│   │   └── Expense.js
│   ├── routes/
│   │   └── expenseRoutes.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── index.html
│
└── README.md

✨ Features

Add expenses

View all expenses

Delete expenses

Store expenses in MongoDB

REST API integration

Postman API testing

React frontend

Frontend-backend integration

🔌 API Endpoints

Method   Endpoint              Description

POST     /api/expenses       Add an expense
GET      /api/expenses       Get all expenses
DELETE   /api/expenses/:id   Delete an expense

⚙️ Backend Setup

cd backend
npm install
node server.js

Backend runs on:

http://localhost:5000

⚛️ Frontend Setup

cd frontend
npm install
npm run dev

🔐 Environment Variables

Create .env inside backend:

MONGO_URI=your_mongodb_connection_string

Never upload .env or database credentials to GitHub.

🧪 Postman Example

Add Expense

POST

http://localhost:5000/api/expenses

Body:

{
  "title": "Pizza",
  "amount": 300,
  "category": "Food"
}

Get Expenses

GET

http://localhost:5000/api/expenses

🎯 Project Goal

The goal of this project is to build a practical MERN application while
learning React, REST APIs, Express.js, MongoDB, and frontend-backend
integration.

👨‍💻 Developer

Sejar Mourya
Final-year B.Tech AI/ML Student

⭐ If you find this project useful, consider giving it a star.
