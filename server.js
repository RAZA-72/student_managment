import express from "express";
import { configDotenv } from "dotenv";
import hbs from "hbs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import router from "./routes/Admin.js";
import { testConnection } from "./config/db.js"; // Adjust path as needed

configDotenv();

const app = express();
const PORT = process.env.PORT || 4000;

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.disable('x-powered-by');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.engine("html", hbs.__express);
app.set("view engine", "html");
app.set("views", path.join(__dirname, "views"));


// Register 'eq' helper globally
hbs.registerHelper("eq", function (a, b) {
  return a === b;
});


// ... your existing imports ...


// Add these new helpers for the dashboard
hbs.registerHelper('round', function(value, decimals) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return Number(value).toFixed(decimals);
});

hbs.registerHelper('add', function(a, b) {
  return Number(a) + Number(b);
});

hbs.registerHelper('divide', function(a, b, multiplier) {
  if (!b || b === 0 || isNaN(a) || isNaN(b)) return 0;
  return (Number(a) / Number(b)) * Number(multiplier);
});

hbs.registerHelper('capitalize', function(str) {
  if (typeof str === 'string' && str.length > 0) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return str;
});

hbs.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

hbs.registerHelper('gt', function(a, b) {
  return a > b;
});

hbs.registerHelper('lt', function(a, b) {
  return a < b;
});

// ✅ Register partials with error handling
const registerPartials = () => {
  try {
    const partialsDir = path.join(__dirname, "views/partials");
    if (fs.existsSync(partialsDir)) {
      fs.readdirSync(partialsDir).forEach((file) => {
        if (path.extname(file) === ".hbs" || path.extname(file) === ".html") {
          const name = path.basename(file, path.extname(file));
          const template = fs.readFileSync(path.join(partialsDir, file), "utf8");
          hbs.registerPartial(name, template);
        }
      });
      console.log('✅ Partials registered successfully');
    }
  } catch (error) {
    console.error('❌ Error registering partials:', error);
  }
};

registerPartials();

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", router);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Error:', error);
  res.status(500).render('error', { 
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong!' 
  });
});

// Start server with database connection test
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`✅ Server running at: http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();