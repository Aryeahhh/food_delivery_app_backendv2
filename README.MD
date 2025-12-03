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

**Serve Angular Frontend from Backend**
1. Build Angular frontend:
```
Push-Location "C:\University\GourmAI\backend\food_delivery_app_frontend"; npm install; npm run build; Pop-Location
```
2. Copy Angular `dist/<project-name>` contents into backend `public/`:
```
$distPath = "C:\University\GourmAI\backend\food_delivery_app_frontend\dist\<your-project-name>"
$backendPublic = "C:\University\GourmAI\backend\food_delivery_app_backendv2\public"
New-Item -ItemType Directory -Force -Path $backendPublic | Out-Null
Copy-Item -Path "$distPath\*" -Destination $backendPublic -Recurse -Force
```
3. Ensure `app.js` has static hosting and SPA fallback (after API routes):
- `app.use(express.static(path.join(__dirname, 'public')));`
- `app.get('*', (req, res, next) => { if (req.path.startsWith('/api')) return next(); res.sendFile(path.join(__dirname, 'public', 'index.html')); });`

This serves the Angular app and keeps `/api/*` routed to Express.

**Auth & CORS Notes**
- When serving UI from the same origin (backend hosts `public/`), CORS can be simplified.
- For cross-origin (e.g., Vercel UI):
	- Backend `cors({ origin: '<frontend-url>', credentials: true })`
	- Cookies must be `SameSite=None; Secure` over HTTPS.

**Key API Routes**
- Users: `POST /api/users/register`, `POST /api/users/login`, `POST /api/users/logout`, `GET /api/users/profile/:id`, `PUT /api/users/:id`
- Restaurants: `GET /api/restaurants`, `GET /api/restaurants/:id`, `PUT /api/restaurants/:id`, `GET /api/restaurants/:id/menu`, `PUT /api/restaurants/:id/image`
- Menu Items: `GET /api/menu-items`, `POST /api/menu-items`, `PUT /api/menu-items/:id`, `DELETE /api/menu-items/:id`
- Couriers: `GET /api/couriers/user/:userId`, `PUT /api/couriers/:id`, availability and orders endpoints
- Orders: `POST /api/orders`, status updates, user orders
- Admin: pending/approve endpoints for restaurants and couriers

**Deploy to Render (Recommended)**
1. Push backend to GitHub
2. Sign up at https://render.com with GitHub
3. Create New → Web Service → Connect your `food_delivery_app_backendv2` repo
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `node app.js`
   - **Environment Variables**:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `JWT_SECRET`: Your JWT secret
     - `NODE_ENV`: production
5. Deploy and copy your Render URL (e.g., `https://gourmai-backend.onrender.com`)
6. Update frontend `environment.ts` with this URL

**Note**: Vercel serverless is NOT compatible with this backend due to Sequelize sync, persistent connections, and pg native bindings.

**Troubleshooting**
- DB migrations: Sequelize `sync({ alter: true })` updates tables; for production, prefer migrations.
- Images: upload size limited to 5MB; served via `/api/restaurants/:id/image`.
- Cookies: If not persisting, check domain, `SameSite`, and HTTPS.

