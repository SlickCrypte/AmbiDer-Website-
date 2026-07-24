# MiniATS Backend — API Documentation
Base URL: `http://localhost:5000`
Auth Header (protected routes): `Authorization: Bearer <token>`

Reflects the **actual current code** in `Backend - Copy`, not the aspirational spec — a few notes at the bottom flag where they differ.

---

## 1. Auth API — `/api/auth`

### 1.1 Register
```
POST /api/auth/register
Auth: Public

Request Body
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "password": "password123",
  "role": "candidate",      // "admin" | "recruiter" | "candidate" — defaults to "candidate"
  "phone": "9876543210"     // optional
}

Response 201
{
  "message": "User registered successfully",
  "userId": "665f1c...",
  "candidateId": "665f1c...",   // populated only when role = candidate, else null
  "role": "candidate"
}

Response 400 (email already exists)
{ "message": "User already exists" }
```
Note: if `role` is `candidate` (or omitted), a linked `Candidate` document is auto-created and referenced from `User.candidateProfile`.

### 1.2 Login
```
POST /api/auth/login
Auth: Public

Request Body
{
  "email": "john@gmail.com",
  "password": "password123"
}

Response 200
{
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "665f1c...",
    "name": "John Doe",
    "email": "john@gmail.com",
    "role": "candidate",
    "candidateId": "665f1c..."   // null for admin/recruiter
  }
}

Response 400 (bad credentials)
{ "message": "Invalid credentials" }
```
JWT payload contains `{ id, role, candidateId }`, expires in 7 days.

### 1.3 Get Profile
```
GET /api/auth/profile
Auth: Any logged-in user

Response 200
{
  "_id": "665f1c...",
  "name": "John Doe",
  "email": "john@gmail.com",
  "role": "candidate",
  "phone": "9876543210",
  "profilePicture": null,
  "candidateProfile": { ...full candidate doc... },
  "createdAt": "...", "updatedAt": "..."
}
```

### 1.4 Update Profile
```
PUT /api/auth/profile
Auth: Any logged-in user

Request Body
{
  "name": "John D.",
  "phone": "9998887777",
  "profilePicture": "url-or-path"
}

Response 200
{ "message": "Profile updated", "user": { ...updated user, no password... } }
```
Also patches the linked `Candidate` doc's `name`/`phone` if one exists.

---

## 2. Dashboard API — `/api/dashboard`

### 2.1 Stats
```
GET /api/dashboard/stats
Auth: Admin, Recruiter only

Response 200
{
  "total": 25,
  "applied": 10,
  "screened": 5,
  "interview": 4,
  "hired": 3,
  "rejected": 3
}
```
Currently counts **Candidates by `currentStatus`** only — no jobs/applications/interviews/notifications breakdown yet (spec's Milestone 2 dashboard is not implemented beyond this).

---

## 3. Jobs API — `/api/jobs`

### 3.1 Create Job
```
POST /api/jobs
Auth: Admin, Recruiter

Request Body
{
  "title": "Full Stack Developer",
  "description": "Build and maintain web apps",
  "requiredSkills": ["React", "Node.js", "MongoDB"],
  "location": "Remote",
  "experience": "2-4 years",
  "status": "Open"        // optional, defaults to "Open"
}

Response 201
{ "message": "Job created", "job": { ...job, createdBy: <userId> } }
```

### 3.2 Get All Jobs
```
GET /api/jobs
Auth: Any logged-in user

Response 200
[ { ...job, createdBy: { name, email } }, ... ]
```

### 3.3 Get Single Job
```
GET /api/jobs/:id
Auth: Any logged-in user

Response 200: { ...job with createdBy populated }
Response 404: { "message": "Job not found" }
```

### 3.4 Update Job
```
PUT /api/jobs/:id
Auth: Admin, Recruiter

Request Body: any subset of job fields (e.g. { "status": "Closed" })
Response 200: { "message": "Job updated", "job": { ... } }
Response 404: { "message": "Job not found" }
```

### 3.5 Delete Job
```
DELETE /api/jobs/:id
Auth: Admin, Recruiter

Response 200: { "message": "Job deleted" }
Response 404: { "message": "Job not found" }
```

---

## 4. Candidate API — `/api/candidates`

### 4.1 Search Candidates
```
GET /api/candidates/search?skills=React,Node&status=Applied&name=john
Auth: Any logged-in user
Query params (all optional, combinable): skills (comma-separated), status, name (partial, case-insensitive)

Response 200: [ ...matching candidates ]
```

### 4.2 Add Candidate
```
POST /api/candidates
Auth: Admin, Recruiter

Request Body
{
  "name": "Jane Doe",
  "email": "jane@gmail.com",
  "phone": "9876500000",
  "skills": ["React", "CSS"],
  "experience": "2 years",
  "education": "B.Tech",
  "appliedFor": "Frontend Developer"
}

Response 201: { "message": "Candidate added", "candidate": { ... } }
```

### 4.3 Get All Candidates
```
GET /api/candidates
Auth: Admin, Recruiter

Response 200: [ ...all candidates ]
```

### 4.4 Get Single Candidate
```
GET /api/candidates/:id
Auth: Any logged-in user
Response 200: { ...candidate }
Response 404: { "message": "Candidate not found" }
```

### 4.5 Update Candidate
```
PUT /api/candidates/:id
Auth: Admin, Recruiter
Request Body: any subset of candidate fields
Response 200: { "message": "Candidate updated", "candidate": { ... } }
```

### 4.6 Delete Candidate
```
DELETE /api/candidates/:id
Auth: Admin, Recruiter
Response 200: { "message": "Candidate deleted" }
```

### 4.7 Update Candidate Status
```
PUT /api/candidates/:id/status
Auth: Admin, Recruiter
Request Body: { "status": "Interview" }   // Applied | Screened | Interview | Hired | Rejected
Response 200: { "message": "Status updated", "candidate": { ... } }
```

---

## 5. Resume API — `/api/resume`

### 5.1 Upload Resume
```
POST /api/resume/:id/upload
Auth: Any logged-in user
Content-Type: multipart/form-data, field name "resume" (PDF only)

Response 200
{ "message": "Resume uploaded successfully", "resumeUrl": "uploads/169...-resume.pdf", "candidate": { ... } }
Response 400: { "message": "No file uploaded" } / multer rejects non-PDF files
```

### 5.2 Save Parsed Resume Data
```
PUT /api/resume/:id/parsed-data
Auth: Any logged-in user
Request Body: { ...any parsed fields, e.g. skills, experience... }
Response 200: { "message": "Parsed data saved", "candidate": { ... } }
```

---

## 6. Applications API — `/api/applications`
```
POST   /api/applications                       Candidate only        Create application
GET    /api/applications                        Admin, Recruiter      List all applications
GET    /api/applications/:id                     Any logged-in user   Get one application
GET    /api/applications/job/:jobId              Admin, Recruiter      Applications for a job
GET    /api/applications/candidate/:candidateId  Any logged-in user   Applications by candidate
PUT    /api/applications/:id/status              Admin, Recruiter      Update status
DELETE /api/applications/:id                     Any logged-in user   Delete application
```
`status` enum: `Applied | Screened | Interview | Hired | Rejected`.

---

## 7. Interviews API — `/api/interviews`
```
POST   /api/interviews             Admin, Recruiter   Schedule interview
GET    /api/interviews             Admin, Recruiter   List all interviews
GET    /api/interviews/:id         Any logged-in user  Get one interview
PUT    /api/interviews/:id         Admin, Recruiter   Update interview
PUT    /api/interviews/:id/cancel  Admin, Recruiter   Cancel interview
DELETE /api/interviews/:id         Admin, Recruiter   Delete interview
```
Fields: `scheduledAt`, `mode` (Online/Offline/Phone), `status` (Scheduled/Completed/Cancelled), `meetingLink`, `location`, `notes`, `feedback`.

---

## 8. Notifications API — `/api/notifications`

### 8.1 Create Notification
```
POST /api/notifications
Auth: Any logged-in user
Request Body
{
  "message": "Interview scheduled for tomorrow",
  "type": "status_change",          // application | status_change | new_candidate | general
  "relatedCandidate": "665f1c...",  // optional
  "relatedJob": "665f1c..."         // optional
}
Response 201: { "message": "Notification created", "notification": { ... } }
```
Note: `recipient` is force-set to the *caller's own* id server-side — there's currently no way to notify a different user via this endpoint (worth revisiting once Milestone 7's auto-triggers land).

### 8.2 Get My Notifications
```
GET /api/notifications
Auth: Any logged-in user
Response 200: [ ...notifications for req.user, newest first, with candidate/job populated ]
```

### 8.3 Unread Count
```
GET /api/notifications/unread
Auth: Any logged-in user
Response 200: { "unreadCount": 4 }
```

### 8.4 Mark One as Read
```
PUT /api/notifications/:id/read
Auth: Any logged-in user
Response 200: { "message": "Marked as read", "notification": { ... } }
```

### 8.5 Mark All as Read
```
PUT /api/notifications/read/all
Auth: Any logged-in user
Response 200: { "message": "All notifications marked as read" }
```

### 8.6 Delete One / Delete All
```
DELETE /api/notifications/:id
DELETE /api/notifications/delete/all
Auth: Any logged-in user
Response 200: { "message": "Notification deleted" } / { "message": "All notifications deleted" }
```

---

## ⚠️ Bug found & fixed while reviewing

`authController.js`, `candidateController.js`, `dashboardController.js`, and `resumeController.js` imported the models as:
```js
require('../models/User')       // actual file: models/user.js
require('../models/Candidate')  // actual file: models/candidate.js
```
Windows and macOS filesystems ignore case by default, so this ran fine locally — but on Linux (every real deployment target: Render, Railway, EC2, Docker, etc.) `require` is case-sensitive, so the server would crash on boot with `Cannot find module '../models/User'` the moment anyone tried to deploy it. That breaks **register, login, profile, candidates, dashboard, and resume upload** — most of the app.

Fix applied (require paths only, no files renamed, no behavior changed):
```diff
- const User = require('../models/User');
+ const User = require('../models/user');
- const Candidate = require('../models/Candidate');
+ const Candidate = require('../models/candidate');
```
I verified all 8 route files now `require()` cleanly with no module errors. I couldn't run a full live request test end-to-end since this sandbox has no network access to your MongoDB Atlas cluster — worth a quick smoke test on your side once deployed.

**Changed files:** `controllers/authController.js`, `controllers/candidateController.js`, `controllers/dashboardController.js`, `controllers/resumeController.js`

## Other things worth knowing (not fixed, just flagged)
- Response shapes are inconsistent across controllers (some return raw arrays/objects, some `{message, data}}` — the spec's Milestone 9 asks for a uniform `{success, message, data}` envelope, which isn't in place yet).
- Dashboard (`/api/dashboard/stats`) currently only reflects candidate status counts — jobs/applications/interviews/notifications aggregation from the spec's Milestone 2 isn't built yet.
- I noticed a separate `ats-backend-extension` package in your uploads (admin/recruiter management, resume matching, ranking, search, analytics) that implements several other milestones — it hasn't been wired into this backend yet. Happy to integrate it next if that's the plan.
