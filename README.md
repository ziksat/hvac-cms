# HVAC CMS - Customer Management System

A comprehensive, production-ready HVAC Customer Management System similar to ServiceTitan. This application enables HVAC businesses to manage customers, dispatch technicians, send job costs/estimates, and provide real-time truck tracking to customers.

![HVAC CMS](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue.svg)

## 🚀 Features

### Core Features
- **Authentication & Authorization** - Login, registration, role-based access (Admin, Dispatcher, Technician, Customer)
- **Customer Management** - CRUD operations, customer profiles, service history, equipment tracking
- **Job/Work Order Management** - Create/assign jobs, status workflow, parts tracking, photo uploads
- **Scheduling & Dispatch** - Calendar view, drag-and-drop assignment, technician availability
- **Job Costing & Estimates** - Create estimates, send to customers, approval workflow, invoicing
- **Real-Time Truck Tracking** - Azure Maps integration showing technician location with ETA
- **Notifications** - SMS/Email via Azure Communication Services
- **Dashboard & Reports** - KPIs, revenue tracking, technician performance

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** with shadcn/ui components
- **Azure Maps** for real-time truck tracking
- **React Query** and **Zustand** for state management

### Backend
- **Node.js** with Express.js and TypeScript
- **Prisma ORM** with Azure SQL Database
- **JWT authentication**
- **Azure SignalR Service** for real-time updates

### Azure Services
- Azure App Service (hosting)
- Azure SQL Database (data storage)
- Azure Maps (GPS tracking and ETA)
- Azure SignalR Service (real-time updates)
- Azure Blob Storage (file storage)
- Azure Communication Services (SMS/Email)

## 📁 Project Structure

```
hvac-cms/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── stores/          # Zustand state stores
│   │   └── types/           # TypeScript types
│   └── Dockerfile
├── backend/                  # Express.js API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── prisma/              # Prisma schema and migrations
│   └── Dockerfile
├── infrastructure/          # Azure Bicep templates
│   ├── main.bicep
│   └── parameters.*.json
├── .github/workflows/       # GitHub Actions CI/CD
├── docs/                    # Documentation
└── docker-compose.yml       # Local development setup
```

## 🚦 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Docker and Docker Compose (for local development)
- Azure subscription (for cloud deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/hvac-cms.git
   cd hvac-cms
   ```

2. **Start with Docker Compose** (recommended)
   ```bash
   docker-compose up -d
   ```
   This starts:
   - SQL Server on port 1433
   - Backend API on port 4000
   - Frontend on port 3000
   - Azurite (Azure Storage emulator) on ports 10000-10002

3. **Or run manually**

   Backend:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000/api
   - API Health Check: http://localhost:4000/api/health

### Database Setup

Run Prisma migrations to set up your database schema:

```bash
cd backend
npx prisma migrate dev --name init
```

Generate the Prisma client:

```bash
npx prisma generate
```

View and manage data with Prisma Studio:

```bash
npx prisma studio
```

## 🔒 Environment Variables

### Backend (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=4000

# Database (Azure SQL)
DATABASE_URL="sqlserver://..."

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=...

# Azure Communication Services
AZURE_COMMUNICATION_CONNECTION_STRING=...

# Azure Maps
AZURE_MAPS_SUBSCRIPTION_KEY=...

# Azure SignalR Service
AZURE_SIGNALR_CONNECTION_STRING=...
```

### Frontend (.env)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_AZURE_MAPS_KEY=...
NEXT_PUBLIC_SIGNALR_URL=...
```

## 🚀 Deployment

### Azure Deployment

1. **Create Azure resources using Bicep**
   ```bash
   az deployment group create \
     --resource-group your-resource-group \
     --template-file infrastructure/main.bicep \
     --parameters infrastructure/parameters.dev.json \
     --parameters sqlAdminPassword=YourSecurePassword
   ```

2. **Configure GitHub Secrets**
   - `AZURE_CREDENTIALS` - Azure service principal credentials
   - `AZURE_RESOURCE_GROUP` - Resource group name
   - `AZURE_BACKEND_APP_NAME` - Backend App Service name
   - `AZURE_BACKEND_PUBLISH_PROFILE` - Backend publish profile
   - `AZURE_FRONTEND_APP_NAME` - Frontend App Service name
   - `AZURE_FRONTEND_PUBLISH_PROFILE` - Frontend publish profile

3. **Push to main branch** to trigger CI/CD pipelines

### Manual Deployment

Backend:
```bash
cd backend
npm run build
# Deploy dist/ folder to Azure App Service
```

Frontend:
```bash
cd frontend
npm run build
# Deploy .next/ folder to Azure App Service
```

## 📚 API Documentation

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | User login |
| `/api/auth/profile` | GET | Get current user profile |
| `/api/auth/profile` | PUT | Update user profile |

### Customers

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/customers` | GET | List all customers |
| `/api/customers` | POST | Create customer |
| `/api/customers/:id` | GET | Get customer by ID |
| `/api/customers/:id` | PUT | Update customer |
| `/api/customers/:id` | DELETE | Delete customer |
| `/api/customers/:id/history` | GET | Get service history |

### Jobs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/jobs` | GET | List all jobs |
| `/api/jobs` | POST | Create job |
| `/api/jobs/:id` | GET | Get job by ID |
| `/api/jobs/:id` | PUT | Update job |
| `/api/jobs/:id/assign` | POST | Assign technician |
| `/api/jobs/:id/status` | PATCH | Update job status |

### Estimates

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/estimates` | GET | List all estimates |
| `/api/estimates` | POST | Create estimate |
| `/api/estimates/:id/send` | POST | Send to customer |
| `/api/estimates/:id/approve` | POST | Approve estimate |
| `/api/estimates/:id/reject` | POST | Reject estimate |

### Invoices

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/invoices` | GET | List all invoices |
| `/api/invoices` | POST | Create invoice |
| `/api/invoices/:id/send` | POST | Send to customer |
| `/api/invoices/:id/payment` | POST | Record payment |

### Dashboard

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/stats` | GET | Get dashboard statistics |
| `/api/dashboard/revenue` | GET | Get revenue report |
| `/api/dashboard/technician-performance` | GET | Get technician metrics |

## 🧪 Testing

Run backend tests:
```bash
cd backend
npm test
```

Run frontend tests:
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.