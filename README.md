# CIB Projects Management System

A full-stack project management dashboard for internal use, built with React, Vite, Ant Design, Node.js, Express, and Prisma.

## Prerequisites

- Node.js (v18+)
- PostgreSQL installed and running

## Project Structure

- `/client` - React frontend applicaton
- `/server` - Express backend API
- `package.json` - Root configuration to run both concurrently

## Setup Instructions

### 1. Database Configuration

Ensure your PostgreSQL server is running. Create a new database named `cib_projects_db` or update the connection string in `server/.env`.

Default connection string in `server/.env`:
`DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cib_projects_db?schema=public"`

Update the username (`postgres`) and password (`postgres`) to match your local setup if needed.

### 2. Install Dependencies

You can install all dependencies from the root directory:

```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Initialize Database

Run the Prisma migrations to create the tables and seed the database with sample data:

```bash
cd server
npx prisma migrate dev --name init
npm run prisma:seed
cd ..
```

### 4. Run Development Servers

From the root directory, you can start both frontend and backend concurrently:

```bash
npm run dev
```

- Frontend will run on: `http://localhost:5173`
- Backend API will run on: `http://localhost:3001`

## Features

- **Dashboard**: Overview of project statistics and charts.
- **Projects**: Manage projects with search, filter, and export (Excel/PDF) capabilities.
- **Add/Edit**: comprehensive form with validation.
- **Chatbot**: Simple rule-based assistant for common queries.

## Tech Stack

- **Frontend**: React, Vite, Ant Design (Dark Theme), Axios, React Query, Recharts.
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL.
- **Tools**: ExcelJS, PDFKit.

