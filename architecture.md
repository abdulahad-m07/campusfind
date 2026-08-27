# CampusFind — Technical Architecture

## 1. Architecture Goal

Keep the system small, understandable, and easy to vibe-code.

The architecture should support the MVP without introducing unnecessary infrastructure.

```text
User
  ↓
CampusFind Web UI
  ↓
Backend API
  ↓
Database
  ↓
Image Storage
```

## 2. Recommended Stack

Use the following unless the existing UI already uses another compatible stack.

### Frontend
- React
- Vite
- JavaScript or TypeScript
- Existing UI/CSS should be preserved.

### Backend
- Node.js
- Express

### Database
- MongoDB

### Image Storage
- Cloudinary

### Deployment
- Frontend: Vercel
- Backend: Render/Railway
- Database: MongoDB Atlas
- Images: Cloudinary

If the current UI was generated with a different frontend stack, do **not** rebuild it unnecessarily. Adapt the architecture to the existing project.

## 3. High-Level Architecture

```text
                 ┌──────────────────┐
                 │      Student     │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ CampusFind Web   │
                 │ React Frontend   │
                 └────────┬─────────┘
                          │ HTTP/JSON
                          ▼
                 ┌──────────────────┐
                 │ Express Backend  │
                 │ REST API         │
                 └───────┬──────────┘
                         │
               ┌─────────┴─────────┐
               ▼                   ▼
      ┌────────────────┐   ┌────────────────┐
      │ MongoDB Atlas  │   │   Cloudinary   │
      │ Item data      │   │ Item images    │
      └────────────────┘   └────────────────┘
```

## 4. Frontend Structure

Suggested structure:

```text
src/
├── components/
│   ├── ItemCard
│   ├── SearchBar
│   └── ReportForm
├── pages/
│   ├── Home
│   ├── Browse
│   ├── ReportItem
│   └── ItemDetails
├── services/
│   └── api
├── App
└── main
```

The exact structure can differ depending on the existing UI.

## 5. Backend Structure

Suggested structure:

```text
backend/
├── controllers/
│   └── itemController
├── models/
│   └── Item
├── routes/
│   └── itemRoutes
├── middleware/
├── config/
├── server
└── .env
```

Keep the backend simple. Avoid adding layers that do not provide value for this MVP.

## 6. Database Model

### Item

```text
Item
├── _id
├── type
├── itemName
├── description
├── location
├── date
├── imageUrl
├── contact
├── status
└── createdAt
```

### Field definitions

| Field | Type | Required |
|---|---|---|
| id | ObjectId | Yes |
| type | String | Yes |
| itemName | String | Yes |
| description | String | Yes |
| location | String | Yes |
| date | Date | Yes |
| imageUrl | String | No |
| contact | String | Yes |
| status | String | Yes |
| createdAt | Date | Yes |

`type` values:

```text
lost
found
```

`status` values:

```text
active
returned
```

## 7. REST API

### GET /api/items

Get items.

Optional query parameters:

```text
?q=wallet
&type=lost
&type=found
```

### GET /api/items/:id

Get one item.

### POST /api/items

Create a lost/found post.

Request data:

```json
{
  "type": "found",
  "itemName": "Black Wallet",
  "description": "Black leather wallet found near library.",
  "location": "Central Library",
  "date": "2026-08-24",
  "imageUrl": "https://...",
  "contact": "example@email.com"
}
```

### PATCH /api/items/:id

Update basic item status/details if required.

Example:

```json
{
  "status": "returned"
}
```

### DELETE /api/items/:id

Delete a post.

Because there is no login system, deletion should be handled carefully. For the very first MVP, this endpoint can be omitted or restricted to a future admin/moderation flow.

## 8. User Flow

### Report Flow

```text
Report Item
     ↓
Choose Lost / Found
     ↓
Enter item details
     ↓
Upload image
     ↓
Enter contact
     ↓
POST /api/items
     ↓
Database saves item
     ↓
Redirect to item/details
```

### Browse Flow

```text
Browse
   ↓
GET /api/items
   ↓
Backend queries MongoDB
   ↓
Items returned as JSON
   ↓
Frontend renders ItemCards
```

### Search Flow

```text
Search
   ↓
GET /api/items?q=...
   ↓
Backend filters items
   ↓
Results returned
   ↓
Frontend updates list
```

## 9. Image Flow

Images should not be stored directly inside MongoDB.

```text
User selects image
       ↓
Frontend uploads image
       ↓
Cloudinary
       ↓
Cloudinary returns image URL
       ↓
Frontend sends image URL with item data
       ↓
MongoDB stores imageUrl
```

## 10. Security and Abuse

Because there is no authentication, the MVP has a basic trust model.

Minimum protections:
- Validate required fields.
- Limit image size/type.
- Sanitize user-provided text.
- Add basic API rate limiting.
- Never expose database credentials.
- Store secrets in environment variables.

Important:

Without login, we should **not pretend that a post belongs to a specific user**.

Do not build "My Posts" functionality unless an ownership mechanism is introduced.

## 11. Environment Variables

Example:

```text
MONGODB_URI=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=
```

Never commit `.env` to Git.

## 12. Development Strategy

Build in small working increments.

### Phase 1
Make the existing UI run locally.

### Phase 2
Create Express server.

### Phase 3
Connect MongoDB.

### Phase 4
Implement:

```text
GET /api/items
POST /api/items
GET /api/items/:id
```

### Phase 5
Connect the Report form.

### Phase 6
Connect Browse/Home to real database data.

### Phase 7
Connect Item Details.

### Phase 8
Add image upload.

### Phase 9
Add search.

### Phase 10
Test complete user flows.

### Phase 11
Deploy.

## 13. Vibe-Coding Rules

The coding AI must:

1. Inspect the existing project before changing anything.
2. Preserve the existing UI.
3. Make one feature at a time.
4. Avoid unnecessary dependencies.
5. Avoid adding authentication.
6. Avoid creating unnecessary pages.
7. Explain important changes in beginner-friendly language.
8. Run/build/test after significant changes.
9. Fix errors before moving to the next feature.
10. Never rewrite working code without a reason.

## 14. Definition of Done

CampusFind MVP is done when:

- Website is deployed.
- Users can browse items.
- Users can search items.
- Users can report lost/found items.
- Posts are saved in MongoDB.
- Images can be attached.
- Item details work.
- Contact information is visible.
- No login is required.
- The complete lost/found flow works on mobile and desktop.

## 15. Architecture Principle

> **Keep the system boring.**

The goal is not to demonstrate how many technologies we can use.

The goal is to make CampusFind work reliably with the smallest reasonable architecture.
