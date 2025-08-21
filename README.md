# library-management

Features
--------------------------------------------------------------------------------------------
User management (Admin & Member roles)
Book management (Add, Update, List, Soft Delete)
Borrow/Return tracking
Pagination and search for books
Aggregation for statistics (total books, borrowed books, top borrowed books/users)
Secure authentication with JWT
Dockerized for easy deployment

Tech Stack
---------------------------------------------------------------------------------------------
Backend: Node.js, Express
Database: MongoDB, Mongoose
Authentication: JWT
Validation: Joi
Logging: Winston
Containerization: Docker & Docker Compose
Reverse Proxy: Nginx

Getting Started
---------------------------------------------------------------------------------------------
Prerequisites

Docker & Docker Compose installed

Node.js (for local development if not using Docker)

Setup with Docker
---------------------------------------

Clone the repository:
---------------------------------------
https://github.com/dhinesh-KM/library-management.git
cd library-management


Build and run the containers:
---------------------------------------
docker compose build --no-cache
docker compose up -d


Verify containers are running:
---------------------------------------
docker ps


Ports:
---------------------------------------
Nginx: http://localhost

MongoDB: mongodb://localhost:27017/library


Run Locally (Without Docker)
---------------------------------------
cd library-management

npm install

npm start


API Documentation
------------------------------------------------------------------------
This project includes a Swagger (OpenAPI) specification for the API.

The file is located at:

library-management/library.yaml




📌 API Endpoints
-----------------------------------------------------------------------------

👤 Users
-----------------------------------------------------------------------------
POST /api/v1/users/register – Register a new user

POST /api/v1/users/login – Login user

Role-based access: Admin, Member

📚 Books
-----------------------------------------------------------------------------
POST /api/v1/book – Add a new book (Admin)

GET /api/v1/book – List books with pagination & filtering (All users)

GET /api/v1/book/:id – Get book details by ID (All users)

PATCH /api/v1/book/:id – Update book details (Admin)

DELETE /api/v1/book/:id – Delete book (Admin)

📖 Borrow
-----------------------------------------------------------------------------
POST /api/v1/borrow/:bookId – Borrow a book (Member)

POST /api/v1/borrow/return/:borrowId – Return a borrowed book (Member)

GET /api/v1/borrow/history – Get borrow history for logged-in user (Member)

📊 Reports
-----------------------------------------------------------------------------
GET /api/v1/report/most-borrowed – Most borrowed books (Admin)

GET /api/v1/report/active-members – Most active members (Admin)

GET /api/v1/report/library-availability – Overall library availability (Admin)

GET /api/v1/report/books-availability – Availability per book (Admin)

