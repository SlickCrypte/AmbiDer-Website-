# ATS Backend — New API Documentation
## (Extension Only — Existing APIs Untouched)

Base URL: `http://localhost:5000`
Auth Header: `Authorization: Bearer <token>`

---

## 1. Admin — Recruiter Management
All routes require `role: admin`

### Create Recruiter
```
POST /api/admin/recruiters
Auth: Admin only

Body:
{
  "name": "Priya Sharma",
  "email": "priya@ambider.com",
  "password": "priya1234",
  "phone": "9876500001"
}

Response 201:
{
  "message": "Recruiter created successfully",
  "recruiter": {
    "id": "...",
    "name": "Priya Sharma",
    "email": "priya@ambider.com",
    "role": "recruiter",
    "isActive": true,
    "createdAt": "2026-07-11T..."
  }
}
```

### Get All Recruiters
```
GET /api/admin/recruiters
Auth: Admin only

Response 200:
{
  "total": 3,
  "recruiters": [...]
}
```

### Get Single Recruiter
```
GET /api/admin/recruiters/:id
Auth: Admin only
```

### Update Recruiter
```
PUT /api/admin/recruiters/:id
Auth: Admin only

Body:
{
  "name": "Priya Sharma Updated",
  "phone": "9876500002"
}
```

### Delete Recruiter
```
DELETE /api/admin/recruiters/:id
Auth: Admin only

Response 200:
{ "message": "Recruiter deleted successfully" }
```

### Activate / Deactivate Recruiter
```
PATCH /api/admin/recruiters/:id/toggle-status
Auth: Admin only

Response 200:
{
  "message": "Recruiter deactivated successfully",
  "isActive": false
}
```

### Reset Recruiter Password
```
PATCH /api/admin/recruiters/:id/reset-password
Auth: Admin only

Body:
{ "newPassword": "newPass123" }

Response 200:
{ "message": "Password reset successfully" }
```

---

## 2. Resume Matching Engine
Pure backend logic — no AI

### Match Single Candidate to Job
```
POST /api/matching/match
Auth: Admin, Recruiter

Body:
{
  "candidateId": "CANDIDATE_ID",
  "jobId": "JOB_ID"
}

Response 200:
{
  "candidateId": "...",
  "jobId": "...",
  "candidateName": "John Doe",
  "jobTitle": "Full Stack Developer",
  "matchingPercentage": 82,
  "matchedSkills": ["React", "Node.js", "MongoDB"],
  "missingSkills": ["TypeScript"]
}
```

### Match ALL Candidates for a Job
```
POST /api/matching/job/:jobId/match-all
Auth: Admin, Recruiter

Response 200:
{
  "jobId": "...",
  "jobTitle": "Full Stack Developer",
  "totalApplications": 5,
  "results": [
    {
      "applicationId": "...",
      "candidateId": "...",
      "candidateName": "John Doe",
      "matchingPercentage": 82,
      "matchedSkills": [...],
      "missingSkills": [...]
    }
  ]
}
```

### Get Ranked Candidates for a Job
```
GET /api/matching/job/:jobId/ranking
Auth: Admin, Recruiter

Ranking order:
1. Overall ranking score (based on match %, experience, education, skills count)
2. matchingPercentage
3. experience
4. education
5. skillsCount

Response 200:
{
  "jobId": "...",
  "jobTitle": "Full Stack Developer",
  "totalCandidates": 5,
  "ranking": [
    {
      "rank": 1,
      "applicationId": "...",
      "applicationStatus": "Applied",
      "candidate": {
        "id": "...",
        "name": "John Doe",
        "email": "john@gmail.com",
        "skills": ["React", "Node.js"],
        "experience": "3 years",
        "education": "B.Tech Computer Science",
        "skillsCount": 5
      },
      "matchingPercentage": 82,
      "matchedSkills": ["React", "Node.js"],
      "missingSkills": ["TypeScript"],
      "rankingScore": 47.5
    }
  ]
}
```

---

## 3. Dashboard Statistics (Updated)

### Full Stats
```
GET /api/dashboard/stats
Auth: Admin, Recruiter

Response 200:
{
  "candidates": { "total": 25 },
  "jobs": { "total": 10, "open": 7, "closed": 3 },
  "applications": {
    "total": 45,
    "today": 3,
    "applied": 20,
    "screened": 8,
    "shortlisted": 8,
    "rejected": 10,
    "hired": 7
  },
  "interviews": {
    "scheduled": 5,
    "completed": 3,
    "cancelled": 1
  },
  "recentActivity": [...]
}
```

### Recruiter Analytics (NEW)
```
GET /api/dashboard/analytics
Auth: Admin, Recruiter

Response 200:
{
  "mostAppliedJob": {
    "jobId": "...",
    "title": "Full Stack Developer",
    "applicationCount": 12
  },
  "averageMatchingPercentage": 68,
  "hiringRate": "15%",
  "pipelineSummary": [
    { "status": "Applied", "count": 20 },
    { "status": "Screened", "count": 8 },
    { "status": "Interview", "count": 5 },
    { "status": "Hired", "count": 7 },
    { "status": "Rejected", "count": 10 }
  ],
  "applicationsPerJob": [
    { "jobTitle": "Full Stack Developer", "jobStatus": "Open", "applicationCount": 12 }
  ]
}
```

---

## 4. Advanced Candidate Search

```
GET /api/search/candidates
Auth: Admin, Recruiter

Query Parameters (all optional):
  name        string    Partial name search
  skill       string    Search by skill (partial)
  education   string    Education level search
  experience  number    Minimum years of experience
  location    string    Location search
  status      string    Applied | Screened | Interview | Hired | Rejected
  minMatch    number    Minimum matching % (requires jobId)
  jobId       string    Job ID for matching % filter
  page        number    Page number (default: 1)
  limit       number    Results per page (default: 10)

Examples:
  GET /api/search/candidates?skill=React&experience=2
  GET /api/search/candidates?name=John&status=Interview
  GET /api/search/candidates?minMatch=70&jobId=JOB_ID
  GET /api/search/candidates?education=B.Tech&page=1&limit=5

Response 200:
{
  "total": 15,
  "page": 1,
  "limit": 10,
  "totalPages": 2,
  "candidates": [...]
}
```

---

## 5. Role-Based Login Response

Existing login endpoint now returns role + candidateId:

```
POST /api/auth/login

Response 200:
{
  "message": "Login successful",
  "token": "eyJ...",
  "user": {
    "id": "...",
    "name": "Rudra",
    "email": "rudra@gmail.com",
    "role": "recruiter",        ← role always returned
    "candidateId": null         ← populated if role = candidate
  }
}
```

Frontend redirect logic:
- role = "admin"     → redirect to /admin/dashboard
- role = "recruiter" → redirect to /recruiter/dashboard
- role = "candidate" → redirect to /candidate/profile

---

## 6. Auto Notifications (Internal — No API Call Needed)

These fire automatically from controllers:

| Event | Trigger | Notification Message |
|-------|---------|---------------------|
| Application Submitted | POST /api/applications | "{name} has applied for {job}" |
| Interview Scheduled | POST /api/interviews | "Interview scheduled for {name} on {date}" |
| Status Changed | PUT /api/applications/:id/status | "Status changed to {status}" |
| Job Closed | PUT /api/jobs/:id with status:Closed | "Job {title} has been closed" |
| New Candidate | POST /api/candidates | "New candidate {name} added" |

Import and call from your existing controllers:
```js
const { notifyApplicationSubmitted } = require('../services/notificationService');
await notifyApplicationSubmitted(recruiterId, candidateName, jobTitle, candidateId, jobId);
```

---

## Files to Add/Replace

| Action | File |
|--------|------|
| ADD | controllers/adminController.js |
| ADD | controllers/matchingController.js |
| REPLACE | controllers/dashboardController.js |
| ADD | controllers/searchController.js |
| ADD | services/matchingService.js |
| ADD | services/notificationService.js |
| REPLACE | models/Application.js (adds 3 fields) |
| REPLACE | models/User.js (adds isActive field) |
| REPLACE | middleware/authMiddleware.js (adds isActive check) |
| ADD | routes/admin.js |
| ADD | routes/matching.js |
| ADD | routes/search.js |
| REPLACE | routes/dashboard.js (adds /analytics) |
| UPDATE | app.js (add 3 new route imports + app.use lines) |
