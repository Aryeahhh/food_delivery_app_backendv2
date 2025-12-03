**GourmAI Backend (Express + PostgreSQL)**
- API server for users, restaurants, menu items, orders, couriers, ratings
- Can serve the Angular frontend build from `public/` for a single-origin deployment

**Tech Stack**
- Node.js + Express
- PostgreSQL via Sequelize ORM
- JWT auth via HttpOnly cookies
- Multer (image upload to DB), CORS, dotenv

**Environment Variables (.env)**
- `PORT`: The port for Express (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for signing JWT cookies
- Optional CORS vars if separating frontend: `FRONTEND_ORIGIN`

**Setup (Windows PowerShell)**
- Install dependencies:
```
Push-Location "C:\University\GourmAI\backend\food_delivery_app_backendv2"; npm install; Pop-Location
```
- Ensure PostgreSQL is running and `DATABASE_URL` is set in `.env`.

**Run Locally**
```
Push-Location "C:\University\GourmAI\backend\food_delivery_app_backendv2"; node app.js; Pop-Location
```
- Server runs at `http://localhost:3000` (or your `PORT`).

**Auth & CORS Notes**
- When serving UI from the same origin (backend hosts `public/`), CORS can be simplified.
- For cross-origin development and deployment:
	- Backend allows `http://localhost:4200` (Angular dev server), `http://localhost:3000` (backend self), and `https://food-delivery-app-backendv2-three.vercel.app` (production)
	- CORS configured with `credentials: true` for HttpOnly cookies
	- For HTTPS cross-origin, cookies require `SameSite=None; Secure`

**Key API Routes**
- Users: `POST /api/users/register`, `POST /api/users/login`, `POST /api/users/logout`, `GET /api/users/profile/:id`, `PUT /api/users/:id`
- Restaurants: `GET /api/restaurants`, `GET /api/restaurants/:id`, `PUT /api/restaurants/:id`, `GET /api/restaurants/:id/menu`, `PUT /api/restaurants/:id/image`
- Menu Items: `GET /api/menu-items`, `POST /api/menu-items`, `PUT /api/menu-items/:id`, `DELETE /api/menu-items/:id`
- Couriers: `GET /api/couriers/user/:userId`, `PUT /api/couriers/:id`, availability and orders endpoints
- Orders: `POST /api/orders`, status updates, user orders
- Admin: pending/approve endpoints for restaurants and couriers

**Troubleshooting**
- DB migrations: Sequelize `sync({ alter: true })` updates tables; for production, prefer migrations.
- Images: upload size limited to 5MB; served via `/api/restaurants/:id/image`.
- Cookies: If not persisting, check domain, `SameSite`, and HTTPS.

