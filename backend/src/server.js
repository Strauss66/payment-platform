import cors from "cors";
import helmet, { contentSecurityPolicy } from "helmet";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { sequelize, assertDb } from "./config/db.js";
import { assertSafeDb } from "./utils/safety.js";
import { User, Role, Permission, RolePermission, UserRole } from "./models/index.js";
import tenancyRoutes from "./routes/tenancy.routes.js";
import adminCatalogRoutes from "./routes/admin.catalog.routes.js";
import authRoutes from "./routes/auth.routes.js";
import tenancy from "./middleware/tenancy.js";
import healthRoutes from "./routes/health.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import coursesRoutes from "./routes/courses.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import paymentRoutes from "./routes/payment.route.js";
import invoicingEntitiesRoutes from "./routes/billing.invoicing-entities.routes.js";
import cashRegistersRoutes from "./routes/billing.cash-registers.routes.js";
import cashierRoutes from "./routes/cashier.routes.js";
import portalStatementRoutes from "./routes/portal.statement.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import announcementsRoutes from "./routes/announcements.routes.js";
import calendarsRoutes from "./routes/calendars.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import uploadsRoutes from "./routes/uploads.routes.js";
import peopleRoutes from "./routes/people.routes.js";
import diagRoutes from "./routes/diag.routes.js";
import metricsRoutes from "./routes/metrics.routes.js";
import searchRoutes from "./routes/search.routes.js";
import lateFeesRoutes from "./routes/billing.latefees.routes.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Load environment variables (optional - will use defaults if .env doesn't exist)
try {
  dotenv.config({ path: path.resolve(__dirname, ".env") });
} catch (error) {
  console.log("No .env file found, using configuration from config.json");
}

// Load configuration from config.json
let config = {};
try {
  const configPath = path.resolve(__dirname, "../../config/config.json");
  const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const env = process.env.NODE_ENV || 'development';
  config = configData[env] || configData.development;
  console.log('✅ Server configuration loaded for environment:', env);
} catch (error) {
  console.error('❌ Could not load server configuration:', error.message);
  process.exit(1);
}

// CORS Configuration
const rawOrigins = process.env.CORS_ORIGIN || "http://localhost:3000";
const allowedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: function(origin, callback){
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow localhost variants in development
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'), false);
  },
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization,X-School-Id",
  credentials: false
}));
app.options('*', cors());

// Basic HTTP request logging (minimal)
if (process.env.NODE_ENV !== 'test') {
  app.use((req, _res, next) => {
    try {
      const ts = new Date().toISOString();
      console.log(`[${ts}] ${req.method} ${req.originalUrl}`);
    } catch {}
    next();
  });
}

// Middleware
app.use(express.json());
// Content Security Policy for images (S3/CDN)
const IMG_SOURCES = [
  "'self'",
  "data:",
  "blob:",
  "https://weglon-app-uploads.s3.us-east-1.amazonaws.com",
  "https://*.s3.us-east-1.amazonaws.com",
  "https://*.amazonaws.com",
  process.env.CDN_BASE_URL || ""
].filter(Boolean);
const defaultDirectives = contentSecurityPolicy.getDefaultDirectives();
const mergedDirectives = { ...defaultDirectives, 'img-src': IMG_SOURCES };
app.use(helmet({ contentSecurityPolicy: { directives: mergedDirectives } }));
// Tenancy context after auth is parsed in route-level; for global routes, we apply per-router

// Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/dashboard", tenancy, dashboardRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/tenancy", tenancyRoutes);
app.use("/api/admin/catalog", adminCatalogRoutes);
app.use("/api/billing/invoices", tenancy, invoiceRoutes);
app.use("/api/billing/payments", tenancy, paymentRoutes);
app.use("/api/billing/invoicing-entities", tenancy, invoicingEntitiesRoutes);
app.use("/api/billing/cash-registers", tenancy, cashRegistersRoutes);
app.use("/api/billing", tenancy, cashierRoutes);
app.use("/api/billing/late-fees", lateFeesRoutes);
app.use("/api/portal", tenancy, portalStatementRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/calendars", tenancy, calendarsRoutes);
app.use("/api/events", tenancy, eventsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/people", peopleRoutes);
app.use("/api/diag", diagRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/search", searchRoutes);

// API root endpoint
app.get("/api", (req, res) => {
  res.json({ 
    message: "School Platform API", 
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      health: "/api/health",
      root: "/api"
    },
    status: "running",
    timestamp: new Date().toISOString()
  });
});

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "School Platform API is running", 
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// Start server function
async function startServer() {
  try {
    // Safety preflight to avoid wrong DB usage
    assertSafeDb();
    // Test database connection
    const dbConnected = await assertDb();
    if (!dbConnected) {
      console.error('❌ Cannot start server without database connection');
      process.exit(1);
    }

    // Enforce migrations-only; refuse to start if pending migrations exist
    // We rely on sequelize-cli migrations in package.json
    // Optionally we could check a migration table; for now, do not sync here
    console.log("✅ Skipping sync; expecting migrations to be applied before start");

    // Start server
    const port = config.server_port || process.env.PORT || 5001;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📱 Frontend should be running on http://localhost:3000`);
      console.log(`🔌 API available at http://localhost:${port}/api`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
}

// Global error handler
app.use((err, req, res, next) => {
  const status = Number(err?.status || err?.statusCode || 500);
  const code = err?.code || 'INTERNAL_ERROR';
  const msg = err?.message || 'Internal server error';
  if (status >= 500) {
    console.error("❌ Internal Server Error:", err);
  } else {
    console.warn(`⚠️  Error ${status} [${code}]:`, msg);
  }
  res.status(status).json({ 
    message: msg,
    code,
    ...(process.env.NODE_ENV === 'development' ? { stack: err?.stack } : {})
  });
});

// Start the server
startServer();