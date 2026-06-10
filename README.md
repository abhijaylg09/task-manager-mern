# TaskFlow - MERN Stack Task Management Web Application

TaskFlow is a premium, secure, and fully responsive Task Management Web Application built using the MERN stack (MongoDB, Express.js, React.js, Node.js). It features secure JWT session authentication, smooth CRUD operations, live task status tracking, search queries, status filtering, pagination, and a gorgeous, deep-dark glassmorphic user interface.

---

## Key Features

1. **Secure Session Authentication**: Registration and Login pages utilizing JSON Web Tokens (JWT) and client-side form validation.
2. **Smooth CRUD Operations**: Create new tasks, read detailed lists, modify contents, and delete tasks dynamically.
3. **Interactive Task Operations**: Toggle task status between `pending` and `completed` with instant responsive UI updates.
4. **Search and Status Filters**: Dynamic text searching across titles/descriptions combined with quick status filters (All, Pending, Completed).
5. **Dashboard Analytics**: Metrics cards providing real-time data on total tasks, completion rates, and status distributions.
6. **Smart Pagination**: Smooth page transitions displaying paginated rows.
7. **Premium Responsive UI**: Elegant dark mode theme with glassmorphic cards, glowing accents, and micro-animations styled using pure CSS.
8. **Self-Healing DB Connector**: Automatic DNS override resolver to fix standard Windows Node.js connection issues with MongoDB Atlas.

---

## Directory Structure

```text
task-manager-mern/
├── backend/
│   ├── config/
│   │   └── db.js          # MongoDB Mongoose database connection
│   ├── middleware/
│   │   └── auth.js        # JWT verify authentication middleware
│   ├── models/
│   │   ├── User.js        # Mongoose User schema (bcrypt hashing)
│   │   └── Task.js        # Mongoose Task schema (referenced to User)
│   ├── routes/
│   │   ├── auth.js        # Registration & Login router
│   │   └── tasks.js       # Task CRUD, filters, and paginated router
│   ├── .env               # Server environment variables
│   ├── server.js          # Express server startup
│   └── package.json       # Backend dependencies & scripts
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   ├── TaskCard.js    # Task card widget
        │   └── TaskModal.js   # Add/Edit task modal dialog
        ├── context/
        │   ├── AuthContext.js # Session auth state provider
        │   └── ToastContext.js# Custom notification engine
        ├── pages/
        │   ├── Dashboard.js   # Main application control panel
        │   ├── Login.js       # Authentication login form
        │   └── Register.js    # New account registration form
        ├── api.js             # Axios setup with JWT request interceptors
        ├── App.js             # Router coordination & route guards
        ├── index.js           # React root rendering
        └── index.css          # Deep-dark CSS variables, grids, and glass theme
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (either a local instance running on port `27017` or a MongoDB Atlas Database cluster)

---

### Step 1: Clone and Configure the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Open or create the environment file `.env` and define your variables:
   ```env
   # Target MongoDB Connection URI (Replace with your working Atlas string or local Mongo instance)
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.eval9z2.mongodb.net/task_manager?retryWrites=true&w=majority
   # OR for local instances:
   # MONGO_URI=mongodb://127.0.0.1:27017/task_manager

   JWT_SECRET=super_secret_jwt_key_2026_task_manager
   PORT=5000
   ```
   > **Note**: The template's provided database string may have expired credentials. If you see a `bad auth : authentication failed` error, simply update the `MONGO_URI` with your own working connection string.

4. Start the backend server in development mode:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

---

### Step 2: Configure and Start the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   The React application will launch at `http://localhost:3000`.

---

## API Documentation

All routes except login/registration require the `Authorization` header containing the JWT bearer token: `Authorization: Bearer <token>`.

### Authentication Routes
- `POST /api/auth/register`: Creates a new user. Required JSON body: `{ "name", "email", "password" }`.
- `POST /api/auth/login`: Authenticates user. Required JSON body: `{ "email", "password" }`.
- `GET /api/auth/me`: Fetches profile of currently authenticated user.

### Task Routes
- `POST /api/tasks`: Creates a new task. Required JSON body: `{ "title", "description" }`.
- `GET /api/tasks`: Retrieves paginated tasks belonging to the user.
  - Query parameters:
    - `q` (string): Text search across title and description.
    - `status` (string): Filters list by status (`all`, `pending`, `completed`).
    - `page` (number): Target page (defaults to `1`).
    - `limit` (number): Tasks per page (defaults to `6`).
- `GET /api/tasks/:id`: Fetches details of a single task.
- `PUT /api/tasks/:id`: Updates task title, description, or status.
- `PATCH /api/tasks/:id/toggle`: Toggles status between `pending` and `completed`.
- `DELETE /api/tasks/:id`: Permanently deletes the task.

---

## Design System & Styling
The UI is built with a bespoke deep-dark color scheme leveraging radial background blurs, glassmorphic cards (`backdrop-filter`), CSS custom properties, and fluid scale/glow transitions. The layout adapts seamlessly for desktops, laptops, tablets, and mobile screens.

### Design Screenshots & Mockups
You can find the high-fidelity UI design screenshots in the project artifacts directory:
- [Dashboard UI Design](file:///C:/Users/abhij/.gemini/antigravity-ide/brain/26a32945-9f34-4812-82c0-9ef995042381/dashboard_mockup_1781115379561.png)
- [Login Page UI Design](file:///C:/Users/abhij/.gemini/antigravity-ide/brain/26a32945-9f34-4812-82c0-9ef995042381/login_page_mockup_1781115401069.png)
