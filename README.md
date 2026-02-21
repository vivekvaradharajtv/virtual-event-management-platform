# Event Management Backend

A backend API for a virtual event management platform with user registration, event scheduling, and participant management. Uses in-memory storage, JWT authentication, bcrypt password hashing, and email notifications on event registration.

## Prerequisites

- Node.js 18+ (or 16+)

## Installation

```bash
npm install
```

Copy `.env.example` to `.env` and set `JWT_SECRET` (and optional SMTP vars for email):

```bash
cp .env.example .env
```

## Running

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000` by default (override with `PORT` in `.env`).

## Tests

```bash
npm run test
```

All test suites (errors, store, validators, auth, events, registration) should pass.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /register | No | Register a new user |
| POST | /login | No | Login, returns JWT and user |
| GET | /events | No | List all events |
| GET | /events/:id | No | Get one event by id |
| POST | /events | JWT, organizer | Create an event |
| PUT | /events/:id | JWT, event owner | Update an event |
| DELETE | /events/:id | JWT, event owner | Delete an event |
| POST | /events/:id/register | JWT | Register for an event (sends email) |

## Example Requests

### Register

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123","name":"Alice","role":"organizer"}'
```

Response (201):

```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "alice@example.com", "name": "Alice", "role": "organizer", "createdAt": "..." },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

Response (200): same shape as register (`user` + `token`).

### Create event (organizer only)

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{"title":"Meetup","description":"A meetup","date":"2025-06-01","time":"14:00"}'
```

Response (201):

```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "Meetup",
    "description": "A meetup",
    "date": "2025-06-01",
    "time": "14:00",
    "organizerId": "...",
    "participantIds": [],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Register for an event

```bash
curl -X POST http://localhost:3000/events/EVENT_ID/register \
  -H "Authorization: Bearer YOUR_JWT"
```

Response (201): event object with `participantIds` including the current user. An email is sent to the user’s email address.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| JWT_SECRET | Secret for signing JWTs | (set in production) |
| NODE_ENV | development / test / production | development |
| SMTP_HOST | SMTP host for registration emails | localhost |
| SMTP_PORT | SMTP port | 1025 |
| MAIL_FROM | From address for emails | noreply@events.local |

## Storage

Data (users and events) is stored **in memory**. Restarting the server clears all data.

## License

ISC
