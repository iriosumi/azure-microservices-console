import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("services.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    region TEXT NOT NULL,
    lastDeployed TEXT,
    iconName TEXT,
    instance TEXT,
    version TEXT,
    credentials TEXT
  )
`);

// Seed initial data if empty
const count = db.prepare("SELECT count(*) as count FROM services").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO services (id, name, description, status, region, lastDeployed, iconName, instance, version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insert.run('1', 'auth-service', 'Centralized Identity Provider', 'RUNNING', 'East US 2', '2h ago', 'Database', 'prod-us-east-001', 'Spring Boot v3.2.1');
  insert.run('2', 'order-api', 'Transaction Management', 'STOPPED', 'East US 2', '1d ago', 'ShoppingCart', 'prod-us-east-002', 'Spring Boot v3.2.1');
  insert.run('3', 'inventory-service', 'Real-time Stock Tracking', 'RUNNING', 'East US 2', '3d ago', 'Package', 'prod-us-east-003', 'Spring Boot v3.2.1');
  insert.run('4', 'notification-worker', 'Async Email & SMS', 'RUNNING', 'East US 2', '5h ago', 'Mail', 'prod-us-east-004', 'Spring Boot v3.2.1');
  insert.run('5', 'payment-gateway', 'Stripe Integration Service', 'RUNNING', 'East US 2', '12m ago', 'CreditCard', 'prod-us-east-005', 'Spring Boot v3.2.1');
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/services", (req, res) => {
    const services = db.prepare("SELECT * FROM services").all();
    res.json(services);
  });

  app.post("/api/services", (req, res) => {
    const { name, description, region, iconName, credentials } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    const status = 'STOPPED';
    const lastDeployed = 'Never';
    const instance = `prod-${region.toLowerCase().replace(/ /g, '-')}-${id.substr(0, 3)}`;
    const version = 'Spring Boot v3.2.1';

    const insert = db.prepare(`
      INSERT INTO services (id, name, description, status, region, lastDeployed, iconName, instance, version, credentials)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(id, name, description, status, region, lastDeployed, iconName, instance, version, credentials);
    
    const newService = db.prepare("SELECT * FROM services WHERE id = ?").get(id);
    res.status(201).json(newService);
  });

  app.put("/api/services/:id", (req, res) => {
    const { id } = req.params;
    const { name, description, region, iconName, credentials } = req.body;
    
    const update = db.prepare(`
      UPDATE services 
      SET name = ?, description = ?, region = ?, iconName = ?, credentials = ?
      WHERE id = ?
    `);
    update.run(name, description, region, iconName, credentials, id);
    
    const updatedService = db.prepare("SELECT * FROM services WHERE id = ?").get(id);
    res.json(updatedService);
  });

  app.post("/api/services/:id/action", (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'START', 'STOP', 'RESTART'
    
    let newStatus = 'RUNNING';
    if (action === 'STOP') newStatus = 'STOPPED';
    
    const update = db.prepare("UPDATE services SET status = ? WHERE id = ?");
    update.run(newStatus, id);
    
    const updatedService = db.prepare("SELECT * FROM services WHERE id = ?").get(id);
    res.json(updatedService);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
