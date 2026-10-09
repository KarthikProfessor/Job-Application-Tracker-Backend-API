# Job Application Tracker API

A RESTful backend API built with Node.js, Express.js, and MongoDB to manage job applications, track application statuses, and analyze job-search progress through dashboard statistics.

## Features

- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Create, read, update, and delete job applications
- User-level authorization and ownership checks
- Dedicated job application status update endpoint
- Search applications by company, job title, and location
- Filter applications by company, location, job type, and status
- Sort applications by newest or oldest
- Pagination
- Dashboard statistics using MongoDB aggregation
- Monthly application statistics
- Job-type statistics
- Interview and offer rates
- Salary statistics, including average, highest, and lowest salary

## Tech Stack

- **Runtime:** Node.js
- **Backend Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JSON Web Token (JWT)
- **Password Security:** bcrypt
- **API Testing:** Postman

## Prerequisites

Before running the project, install:

- Node.js
- npm
- MongoDB Community Server or a MongoDB Atlas account
- Postman (for API testing)

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-project-folder>
```

Replace the placeholders with your actual repository URL and project directory.

### 2. Install Dependencies

```bash
npm install
```

Ensure the dependencies used by your project, such as `express`, `mongoose`, `bcrypt`, `jsonwebtoken`, and `dotenv`, are installed.

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-long-random-secret>
```

Use the environment variable names expected by your code.

**Security note:** Never commit your `.env` file, database credentials, or JWT secret to GitHub. Add `.env` to your `.gitignore` file.

### 4. Start the Server

Use the start script configured in your `package.json`:

```bash
npm start
```

For development, if your project has a development script:

```bash
npm run dev
```

Alternatively, start your server entry-point file directly, for example:

```bash
node server.js
```

If configured to use port 3000, the API will run at:

```text
http://localhost:3000
```

## API Endpoints

The endpoints below assume your authentication router is mounted at `/api/auth` and your job router is mounted at `/api/jobs`. Verify these paths against your actual route configuration.

### Authentication Routes

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Not required |
| POST | `/api/auth/login` | Log in and receive a JWT | Not required |

### Job Application Routes

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/api/jobs` | Create a job application | Required |
| GET | `/api/jobs` | Retrieve the user's applications | Required |
| GET | `/api/jobs/:id` | Retrieve a single application | Required |
| PUT/PATCH | `/api/jobs/:id` | Update an application | Required |
| DELETE | `/api/jobs/:id` | Delete an application | Required |
| PATCH | `/api/jobs/:id/status` | Update application status | Required |

Use the actual HTTP method configured for your general update route.

### Search, Filtering, Sorting, and Pagination

The job listing endpoint supports query parameters.

Example:

```http
GET /api/jobs?search=developer&status=Interview&jobType=Full-time&sort=newest&page=1&limit=10
```

| Parameter | Description |
|---|---|
| `search` | Search by company, title, or location |
| `company` | Filter by company |
| `location` | Filter by location |
| `jobType` | Filter by job type |
| `status` | Filter by application status |
| `sort` | Sort by `newest` or `oldest` |
| `page` | Page number, starting from 1 |
| `limit` | Number of records per page |

You can combine these query parameters to retrieve the applications you need.

### Dashboard and Statistics Routes

These endpoints assume the corresponding controllers and routes have been registered.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/jobs/dashboard` | Total applications and counts by status |
| GET | `/api/jobs/monthly-applications` | Applications grouped by year and month |
| GET | `/api/jobs/job-type-stats` | Application counts grouped by job type |
| GET | `/api/jobs/application-rates` | Interview and offer rates |
| GET | `/api/jobs/salary-stats` | Average, highest, and lowest salary |

The route paths must match your `jobRoutes.js` file.

**Important:** Register specific routes such as `/dashboard` and `/salary-stats` before the dynamic `/:id` route. Otherwise, Express may interpret the route name as a job ID.

## Authentication

Protected endpoints require a valid JWT.

1. Register a new account using `/api/auth/register`.
2. Log in using `/api/auth/login`.
3. Copy the JWT returned by the login endpoint.
4. Open the Authorization tab in Postman.
5. Select **Bearer Token**.
6. Paste your JWT and send the request.

The API should obtain the authenticated user's ID from the verified token. Users must not be allowed to access or modify another user's applications.

## Job Application Data Model

The Job model includes the following fields:

| Field | Description |
|---|---|
| `title` | Job title |
| `company` | Company name |
| `location` | Job location |
| `jobType` | Full-time, Part-time, Internship, Contract, or Freelance |
| `status` | Applied, OA, Interview, Offer, Rejected, or Withdrawn |
| `salary` | Numeric salary value |
| `applicationDate` | Date the application was submitted |
| `jobUrl` | Optional job listing URL |
| `notes` | Optional notes about the application |
| `user` | Reference to the user who owns the application |

Mongoose timestamps may also provide `createdAt` and `updatedAt`.

Keep salary values in a consistent unit so the salary statistics are meaningful.

## Example: Create a Job Application

**Request**

```http
POST /api/jobs
Content-Type: application/json
Authorization: Bearer <your-jwt>
```

**Request body**

```json
{
  "title": "Backend Developer",
  "company": "Example Company",
  "location": "Hyderabad",
  "jobType": "Full-time",
  "status": "Applied",
  "salary": 12,
  "applicationDate": "2026-10-01",
  "jobUrl": "https://example.com/jobs/123",
  "notes": "Applied through the company careers page"
}
```

The salary value is an example. Use the salary unit expected by your application.

## Testing with Postman

Recommended test cases:

- Register a new user and log in.
- Create a job application with valid data.
- Retrieve all applications and a single application.
- Update an application and its status.
- Delete an application.
- Test search, filters, sorting, and pagination.
- Verify that one user cannot access another user's applications.
- Test missing fields and invalid status values.
- Test invalid and non-existent job IDs.
- Call protected routes without a token and with an invalid token.
- Verify dashboard statistics for users with applications and users with no applications.

## Error Handling and Security

- Store credentials and secrets in environment variables.
- Hash passwords before storing them.
- Protect private endpoints with authentication middleware.
- Verify record ownership before reading, updating, or deleting applications.
- Validate incoming request data and allowed enum values.
- Use centralized error middleware.
- Avoid exposing stack traces or sensitive database details in production.
- Keep `.env` and other sensitive files out of version control.

## Suggested Project Structure

Your actual filenames may differ, but a common structure is:

```text
project/
├── controllers/
│   ├── authController.js
│   └── jobController.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/
│   ├── User.js
│   └── Job.js
├── routes/
│   ├── authRoutes.js
│   └── jobRoutes.js
├── .env
├── .gitignore
├── app.js
├── server.js
├── package.json
└── README.md
```

## Future Improvements

- Add automated tests.
- Add request validation middleware.
- Implement rate limiting and security headers.
- Deploy the API with production environment variables.
- Build a frontend dashboard with charts and visualizations.
- Track application status history for historical interview and offer metrics.

## Author

Karthik Raju

GitHub: https://github.com/KarthikProfessor/

---

