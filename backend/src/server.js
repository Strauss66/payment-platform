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

// Serve React frontend in production (static files only; SPA fallback handled by Nginx)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
}



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
// 404 handler – must come *after* all routes and *before* the error handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not found' });
});

// Central error handler should remain last
app.use((err, req, res, next) => {
  // your existing error handler code
});


// Start the server
startServer();