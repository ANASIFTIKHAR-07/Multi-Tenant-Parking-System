# 🏢 Enterprise Multi-Tenant Parking Management System

A high-performance, real-time parking management suite engineered for modern corporate facilities. This platform provides centralized control over tenant parking quotas, employee vehicle tracking, visitor access, and detailed analytical reporting.

## 🚀 Key Features

### 📊 Real-Time Analytics Dashboard
- Comprehensive system utilization overview using **Recharts**.
- Dynamic data visualization detailing allocated vs. occupied parking slots per tenant.
- High-level metric cards for instant monitoring of active badges, contracts, and vehicles.

### 🏢 Tenant & Facility Management
- **Multi-Tenant Architecture:** Track parking allocations, leases, and contracts individually across multiple companies within the same facility.
- **Quota Management:** Strictly enforce maximum card limits and parking slot assignments based on tenant contractual agreements.
- **Unit & Floor Mapping:** Visually align companies to specific floors and office units.

### 🚗 Access Control & Vehicle Tracking
- **Employee Badging:** Issue, monitor, and deactivate employee RFID access badges.
- **Live Parking Logs:** Real-time visibility into which vehicles are currently occupying specific parking slots.
- **Visitor Passes:** Dedicated workflow to issue temporary check-in/check-out cards for external visitors.

### 🎨 Enterprise UI/UX
- Responsive grid architecture tailored for modern desktop monitors and mobile devices.
- Seamless **Dark & Light Mode** toggling with persistent state management and a deeply customized "Slate & Emerald" color palette.

---

## 🛠️ Technology Stack

**Frontend Architecture (Client)**
* **Core:** React 19 + Vite
* **Styling:** Tailwind CSS (v4)
* **Data Visualization:** Recharts
* **Routing:** React Router DOM (v7)

**Backend Architecture (Server)**
* **Environment:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB + Mongoose (Optimized Schema Indexing)
* **Authentication:** JWT (JSON Web Tokens) with dual-strategy HttpOnly Cookies & Bearer Tokens.
* **Security:** Helmet, XSS-Clean, Express-Mongo-Sanitize, CORS.

---

## ☁️ Deployment Strategy

This system is fully architected for modern Platform-as-a-Service (PaaS) deployment:

### Backend ➔ Render
The backend is configured as an Express web service. By connecting this repository to **Render**, the attached `render.yaml` infrastructure blueprint will automatically construct the Node environment, run dependency installations, and securely bind required environment variables.

### Frontend ➔ Vercel
Optimized specifically for **Vercel** Edge delivery. The React source code utilizes Vite `manualChunks` to intelligently split the compiled JavaScript binaries (isolating Recharts and React Core) to guarantee sub-second initial load speeds on mobile networks. The included `vercel.json` ensures bulletproof Single-Page Application (SPA) routing.

---

## 💻 Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/parking-system.git
