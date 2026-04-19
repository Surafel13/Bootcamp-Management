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

### Auth
- `POST /api/auth/login` - Authenticate and retrieve token.

### Sessions
- `GET /api/sessions` - Get all sessions (filtered by scope/permissions).
- `POST /api/sessions` - Create a new session.

### QR Attendance
- `POST /api/attendance/qr/generate/:sessionId` 
  - Generates a fresh QR token for the specified session. Token naturally expires in 13 seconds.
- `POST /api/attendance/qr/scan`
  - Validates a scanned QR token and marks the corresponding student conditionally (must not have expired, must not be used).

### Attendance Information
- `GET /api/attendance/session/:sessionId` - Get all attendance records for a single session.
- `GET /api/attendance/student/:studentId` - Get personal attendance history for a specific student.

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
