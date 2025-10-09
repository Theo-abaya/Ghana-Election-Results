# 🎨 Election Hub - Frontend

Modern React + TypeScript frontend for the Ghana Election Results Management System.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📦 Tech Stack

- **Framework:** React 18.2
- **Language:** TypeScript 5.2
- **Build Tool:** Vite 5.2
- **Styling:** Tailwind CSS 3.4
- **Routing:** React Router DOM 6.22
- **HTTP Client:** Axios 1.6
- **Charts:** Recharts 2.12
- **Icons:** Lucide React 0.344
- **Notifications:** React Hot Toast 2.4

## 📁 Project Structure

```
frontend/
├── public/
│   └── ghana-regions.geojson    # GeoJSON data for electoral map
├── src/
│   ├── assets/                  # Images, fonts, static files
│   │   └── Election_hub.png
│   ├── components/              # Reusable components
│   │   ├── admin/              # Admin-specific components
│   │   │   └── AdminModals.tsx # All admin modal components
│   │   ├── GhanaElectoralMap.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── AdminRoute.tsx
│   │   └── ...
│   ├── Layout/                  # Layout components
│   │   ├── Layout.tsx          # Public layout
│   │   ├── DashboardLayout.tsx # Protected layout
│   │   └── Sidebar.tsx
│   ├── pages/                   # Page components
│   │   ├── HomePage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── PresidentialPage.tsx
│   │   ├── ParliamentaryPage.tsx
│   │   ├── RegionsPage.tsx
│   │   ├── SubmitResultsPage.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── ProfilePage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/               # API service layer
│   │   └── api.ts             # Axios instance & API functions
│   ├── utils/                  # Utility functions
│   │   └── toast.ts           # Toast notification helpers
│   ├── hooks/                  # Custom React hooks
│   │   └── useWebSocket.ts    # WebSocket connection hook
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx                 # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── .env.example                # Environment variables template
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
└── package.json
```

## 🎯 Key Features

### Public Pages

- **Home Page** - Landing page with system overview
- **About Page** - Information about the electoral system
- **Presidential Results** - Real-time presidential election results
- **Parliamentary Results** - Constituency-wise parliamentary results
- **Regional Analysis** - Interactive map with regional breakdown

### Protected Pages (Authenticated)

- **Submit Results** - Polling officers submit station results
- **Profile Settings** - Change password and view account info

### Admin-Only Pages

- **Admin Dashboard** - System statistics and quick actions
- **User Management** - Create, view, and delete users
- **Party Management** - CRUD operations for political parties
- **Candidate Management** - Manage presidential & parliamentary candidates
- **Data Export** - Export results in CSV/JSON format
- **Audit Logs** - View system activity history
- **System Settings** - Configure system parameters

## 🔐 Authentication Flow

```
Login → JWT Token → localStorage → Axios Interceptor → Protected Routes
```

1. User logs in with email/password
2. Backend returns JWT token
3. Token stored in localStorage
4. Axios automatically adds token to all requests
5. Protected routes check authentication via ProtectedRoute component
6. Admin routes additionally check for ADMIN role via AdminRoute component

## 🎨 Design System

### Color Palette

- **Primary:** Purple/Blue (`#9333EA`, `#0066CC`)
- **Success:** Green (`#10B981`)
- **Warning:** Yellow (`#F59E0B`)
- **Error:** Red (`#EF4444`)
- **Neutral:** Gray shades

### Components

- Consistent 8px spacing system
- Rounded corners (rounded-lg, rounded-xl)
- Shadow levels (shadow-md, shadow-lg, shadow-xl)
- Hover states and transitions
- Loading skeletons for better UX

## 📱 Responsive Design

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

All components are mobile-first with responsive breakpoints:

```css
sm: '640px'
md: '768px'
lg: '1024px'
xl: '1280px'
2xl: '1536px'
```

## 🔌 API Integration

### API Service (`services/api.ts`)

Centralized API service with:

- Axios instance with base URL
- Request interceptor (adds JWT token)
- Response interceptor (handles 401 errors)
- All API functions organized by domain

Example usage:

```typescript
import { getPresidentialResults, login } from "../services/api";

// Login
const response = await login(email, password);

// Fetch results
const results = await getPresidentialResults();
```

### Available API Functions

**Authentication:**

- `login(email, password)`
- `register(email, password, role)`
- `getCurrentUser()`
- `changePassword(currentPassword, newPassword)`
- `logout()`

**Results:**

- `getPresidentialResults()`
- `getParliamentaryResults(constituencyId)`
- `getRegionResults(region)`
- `submitResult(data)`

**Admin:**

- `getAllUsers()`
- `deleteUser(id)`
- `getAllCandidatesAdmin(type?, constituencyId?)`
- `createCandidateAdmin(data)`
- `updateCandidateAdmin(id, data)`
- `deleteCandidateAdmin(id)`
- `getAllParties()`
- `updateParty(id, data)`
- `deleteParty(id)`
- `getSystemSettings()`
- `updateSystemSettings(settings)`
- `getAuditLogs(limit, offset)`
- `exportData(format, dataTypes)`
- `getDashboardStats()`

## 🗺️ Interactive Electoral Map

### GhanaElectoralMap Component

Features:

- Loads GeoJSON data from `public/ghana-regions.geojson`
- Dynamic coloring based on vote intensity
- Hover tooltips with region statistics
- Click handlers for detailed results
- Responsive SVG scaling
- Region name normalization for data matching

Usage:

```tsx
<GhanaElectoralMap
  regions={regionsData}
  onRegionClick={(regionName) => handleRegionClick(regionName)}
  geoJsonUrl="/ghana-regions.geojson"
/>
```

## 📊 Data Visualization

### Charts (Recharts)

Used for:

- **Pie Charts:** Presidential vote distribution
- **Bar Charts:** Regional comparison, Parliamentary results
- **Line Charts:** Turnout trends (future)

Example:

```tsx
<PieChart>
  <Pie
    data={candidateData}
    dataKey="votes"
    nameKey="name"
    cx="50%"
    cy="50%"
    label
  />
  <Tooltip />
  <Legend />
</PieChart>
```

## 🔔 Notifications

Using `react-hot-toast` for user feedback:

```typescript
import { showToast } from "../utils/toast";

// Success
showToast.success("User created successfully!");

// Error
showToast.error("Failed to load data");

// Warning
showToast.warning("You're offline");

// Info
showToast.info("Feature coming soon");
```

## 🎭 Modal System

All admin modals are in `components/admin/AdminModals.tsx`:

- **ManageUsersModal** - List, create, delete users
- **ManagePartiesModal** - CRUD for political parties
- **ManageCandidatesModal** - CRUD for candidates with type filtering
- **ExportDataModal** - Select format and data types to export
- **ViewAuditLogsModal** - Display system activity logs
- **SystemSettingsModal** - Toggle system configuration

Each modal:

- Has list/add/edit views
- Includes loading states
- Shows error messages
- Calls `onSuccess()` callback to refresh parent data

## 🛣️ Routing

### Public Routes

```
/ - Home page
/about - About page
/login - Login page
/results/presidential - Presidential results (public)
/results/parliamentary - Parliamentary results (public)
/results/regions - Regional analysis (public)
```

### Protected Routes (Authentication Required)

```
/dashboard - Redirects to /dashboard/submit
/dashboard/submit - Submit polling station results
/dashboard/presidential - Presidential results (authenticated view)
/dashboard/parliamentary - Parliamentary results (authenticated view)
/dashboard/regions - Regional analysis (authenticated view)
/dashboard/profile - User profile and settings
```

### Admin Routes (ADMIN role required)

```
/dashboard/admin - Admin dashboard
```

## 🔒 Route Protection

### ProtectedRoute Component

Checks if user is authenticated. Redirects to `/login` if not.

### AdminRoute Component

Checks if user has ADMIN role. Shows access denied if not admin.

Usage:

```tsx
<Route element={<ProtectedRoute />}>
  <Route element={<DashboardLayout />}>
    <Route path="/dashboard/submit" element={<SubmitResultsPage />} />
  </Route>
</Route>

<Route element={<AdminRoute />}>
  <Route path="/dashboard/admin" element={<AdminDashboard />} />
</Route>
```

## ⚙️ Environment Variables

Create `.env` file:

```env
# API Base URL
VITE_API_URL=http://localhost:5000/api

# WebSocket URL (optional, for real-time updates)
VITE_WS_URL=ws://localhost:5000
```

## 🧪 Development

### Running Tests

```bash
# Run unit tests (if configured)
pnpm test

# Run e2e tests (if configured)
pnpm test:e2e
```

### Code Quality

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check
```

## 📦 Building for Production

```bash
# Build
pnpm build

# Preview build locally
pnpm preview
```

Build output goes to `dist/` folder.

## 🚀 Deployment

### Recommended Platforms

- **Vercel** (easiest for Vite apps)
- **Netlify**
- **AWS S3 + CloudFront**
- **Azure Static Web Apps**

### Environment Variables in Production

Make sure to set `VITE_API_URL` to your production backend URL.

### Build Configuration

The app is configured for SPA routing. Make sure your hosting platform supports client-side routing (redirects all routes to index.html).

## 🐛 Common Issues

### Issue: "CORS Error"

**Solution:** Backend must allow your frontend origin in CORS configuration.

### Issue: "401 Unauthorized"

**Solution:** Check if JWT token is valid and not expired. Try logging in again.

### Issue: "Map not loading"

**Solution:** Ensure `ghana-regions.geojson` is in the `public/` folder.

### Issue: "Module not found"

**Solution:** Run `pnpm install` to install dependencies.

## 📚 Learning Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/)
- [Recharts Documentation](https://recharts.org/)

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Write meaningful component names
4. Add comments for complex logic
5. Test on mobile devices
6. Keep components small and focused

## 📄 License

MIT License - see main project README

---

**Part of Election Hub - Ghana Election Results Management System**
