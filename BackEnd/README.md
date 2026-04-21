# Bootcamp Management - Backend API (QR Attendance System)

## 1. Project Overview
This project serves as the backend for the Bootcamp Management System. Its core feature is a robust **QR Code-based Attendance System** designed to be highly secure and reliable. 

The system relies on securely generated JWT tokens embedded into QR codes that are flashed by an instructor (or system) and scanned by students within an extremely strict 13-second window, preventing token sharing or screenshotting.

## 2. Setup Instructions
To get this backend running on your local machine:

1. **Install Dependencies**
   Run the following command at the root of the `BackEnd` directory:
   ```bash
   npm install
   ```
   *(Note: This project also supports `pnpm`, so you can run `pnpm install`)*

2. **Configure Environment Variables**
   Create a `.env` file in the root backend directory. Refer to the `.env.example` structure, or see the expected variables below.

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The backend server should now be running (typically on port 5000) and connected to your database.

## 3. Environment Variables
Add the following to your `.env` file:
```env
PORT=5000
DB_URI=mongodb://localhost:27017/bootcamp
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d
JWT_QR_SECRET=your_super_secret_qr_key
```

## 4. API Routes Documentation

### Health Check
- `GET /health` - Basic health check endpoint (public).

### Authentication
- `POST /api/auth/login` - Authenticate user and retrieve JWT token (rate limited).
- `POST /api/auth/refresh` - Refresh JWT token.
- `POST /api/auth/forgot-password` - Request password reset.
- `PATCH /api/auth/reset-password/:token` - Reset password with token.
- `POST /api/auth/logout` - Logout user.

### Users
- `GET /api/users/me` - Get current user profile.
- `POST /api/users` - Create new user (Super Admin only).
- `GET /api/users` - Get all users (Super Admin only).
- `GET /api/users/:id` - Get user by ID (Super Admin only).
- `PATCH /api/users/:id` - Update user (Super Admin only).
- `PATCH /api/users/:id/status` - Update user status (Super Admin only).
- `PATCH /api/users/:id/divisions` - Update user divisions (Super Admin only).
- `DELETE /api/users/:id` - Delete user (Super Admin only).

### Divisions
- `GET /api/divisions` - Get all divisions (public).
- `GET /api/divisions/:id` - Get division by ID (public).
- `GET /api/divisions/:id/stats` - Get division statistics (public).
- `POST /api/divisions` - Create new division (Super Admin only).
- `PATCH /api/divisions/:id` - Update division (Super Admin only).
- `DELETE /api/divisions/:id` - Delete division (Super Admin only).

### Sessions
- `POST /api/sessions` - Create new session (Division Admin/Super Admin only).
- `GET /api/sessions` - Get all sessions (filtered by permissions).
- `GET /api/sessions/:id` - Get session by ID.
- `PATCH /api/sessions/:id` - Update session (Division Admin/Super Admin only).
- `DELETE /api/sessions/:id` - Cancel session (Division Admin/Super Admin only).
- `GET /api/sessions/:id/attendance` - Get attendance for session (Division Admin/Super Admin only).
- `POST /api/sessions/:sessionId/generate-qr` - Generate QR code for session (Division Admin/Super Admin only).

### Attendance
- `POST /api/attendance/scan` - Student scans QR code (Student only, IP range check required).
- `GET /api/attendance` - Get all attendance records (Division Admin/Super Admin only).
- `GET /api/attendance/session/:sessionId` - Get attendance for specific session (Division Admin/Super Admin only).
- `GET /api/attendance/me` - Get current student's attendance history (Student only).
- `POST /api/attendance/mark` - Manual attendance marking (Division Admin/Super Admin only).
- `PATCH /api/attendance/manual/:id` - Manual attendance update (Division Admin/Super Admin only).

### Tasks
- `GET /api/tasks` - Get all tasks (filtered by permissions).
- `GET /api/tasks/:id` - Get task by ID.
- `POST /api/tasks` - Create new task (Division Admin/Super Admin only).
- `PATCH /api/tasks/:id` - Update task (Division Admin/Super Admin only).
- `DELETE /api/tasks/:id` - Delete task (Division Admin/Super Admin only).

### Submissions
- `POST /api/submissions` - Submit task (Student only).
- `GET /api/submissions/me` - Get current user's submissions (Student only).
- `GET /api/submissions/:id` - Get submission by ID.
- `GET /api/submissions` - Get all submissions (Division Admin/Super Admin only).
- `GET /api/submissions/task/:taskId` - Get submissions for specific task (Division Admin/Super Admin only).
- `PATCH /api/submissions/:submissionId/grade` - Grade submission (Division Admin/Super Admin only).

### Resources
- `GET /api/resources` - Get all resources (filtered by permissions).
- `GET /api/resources/:id` - Get resource by ID.
- `POST /api/resources/:id/download` - Track resource download.
- `POST /api/resources` - Create new resource (Division Admin/Super Admin only).
- `DELETE /api/resources/:id` - Delete resource (Division Admin/Super Admin only).

### Feedback
- `POST /api/feedback` - Submit feedback (Student only).
- `GET /api/feedback/me` - Get current user's feedback (Student only).
- `GET /api/feedback/session/:sessionId` - Get feedback for session (Division Admin/Super Admin only).

### Groups
- `GET /api/groups` - Get all groups (filtered by permissions).
- `GET /api/groups/:id` - Get group by ID.
- `POST /api/groups` - Create new group (Division Admin/Super Admin only).
- `PATCH /api/groups/:id` - Update group (Division Admin/Super Admin only).
- `POST /api/groups/:id/members` - Add member to group (Division Admin/Super Admin only).
- `DELETE /api/groups/:id/members/:userId` - Remove member from group (Division Admin/Super Admin only).

### Progress
- `POST /api/progress` - Submit progress update (Student only).
- `GET /api/progress/me` - Get current user's progress (Student only).
- `GET /api/progress` - Get all progress records (Division Admin/Super Admin only).
- `GET /api/progress/group/:groupId` - Get progress for specific group (Division Admin/Super Admin only).

### Notifications
- `GET /api/notifications` - Get current user's notifications.
- `PATCH /api/notifications/:id/read` - Mark notification as read.
- `PATCH /api/notifications/read-all` - Mark all notifications as read.

### Reports
- `GET /api/reports/attendance` - Get attendance report (Super Admin only).
- `GET /api/reports/tasks` - Get task report (Super Admin only).
- `GET /api/reports/feedback` - Get feedback report (Super Admin only).

## 5. QR Logic Explanation

### Generation
When an instructor calls the `generateQR` endpoint, the system validates the session and mints a JSON Web Token (JWT). This token embeds the `sessionId` and a perfectly random `qrSecret`. The system creates a strict JWT expiration of exactly `13s`. The backend also stores this token in an active local Set/Map. 

A Base64 image payload representing this strict token is generated using the `qrcode` library and served back to the requester.

### The 13-Second Expiration
Security is handled two ways:
1. **JWT Expiration**: The mathematical signature of the token inherently expires after 13 seconds.
2. **Server-Side Expiry Task**: Using `setTimeout()` mapped precisely to the server clock, the system drops the token from its `activeTokens` Map after exactly 13,000 milliseconds to prevent any time-drift hacking.

### Scanning & Validation
When the student payload hits `scanQR`:
1. Checks that `qrToken` isn’t in a `usedTokens` blocklist (prevents multi-scanning the same ticket).
2. Verifies the token exists in the `activeTokens` store.
3. Cryptographically checks the JWT expiration.
4. Verifies the student is registered for the division mapped to the session.
5. Verifies the student hasn't already been marked present for this session.
6. Grants the Attendance status and permanently burns/invalidates the token.

## 6. Testing Instructions
You can easily utilize **Postman** to test this logic sequentially:

**Step 1:** Log in via `/api/auth/login` to obtain an Admin/Instructor JWT token.
**Step 2:** Ensure there is an active session in the database and copy its `sessionId`.
**Step 3:** Call `POST /api/attendance/qr/generate/<sessionId>` and authenticate with a Bearer Token. 
**Step 4:** Very quickly (within 13 seconds), copy the `token` portion from the server's payload.
**Step 5:** Act as a student (obtain a secondary token) and send a `POST /api/attendance/qr/scan` request passing:
```json
{
  "qrToken": "<the_copied_token>",
  "studentId": "<the_student_id>"
}
```
**Step 6:** You should receive a "success" confirmation. Attempting to immediately resend Step 5 will yield a "QR expired / used" rejection.
