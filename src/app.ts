import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import fs from "fs/promises";

// initiating nodejs express and localhost port
const app = express();
const PORT = 3000;

// mysql connection pool details
const pool = mysql.createPool({
  host: "db",   // name of the mysql service in Docker
  user: "root",
  password: "root",
  database: "db_proxy",
  connectionLimit: 10,
});

// parse JSON objecct in request body
app.use(bodyParser.json());

// to execute SQL queries
async function executeQuery(query: string, params: any[] = []): Promise<any> {
  const connection = await pool.getConnection();  // mysql pool connection
  const [rows] = await connection.query(query, params);
  connection.release();   // release connection
  return rows;
}

// loading schema files and building db schema
async function loadSchema() {
  try {
    const schemaFiles = await fs.readdir("./schemas");
    for (const file of schemaFiles) {
      const collectionName = file.split(".")[0];
      const schemaData = await fs.readFile(`./schemas/${file}`, "utf-8");
      const schema = JSON.parse(schemaData);

      // Check if table exists, if not then create it
      await executeQuery(`CREATE TABLE IF NOT EXISTS ${collectionName} (id INT AUTO_INCREMENT PRIMARY KEY)`);
      
      // Check and add columns as required
      
      // for (const key of Object.keys(schema)) {
      //   await executeQuery(`ALTER TABLE ${collectionName} ADD COLUMN IF NOT EXISTS ${key} ${schema[key]}`);
      // }

      for (const key of Object.keys(schema)) {
        const columnCheckQuery = `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ?`;
        const columnExists = await executeQuery(columnCheckQuery, [collectionName, key]);

        if (columnExists[0].count === 0) {
          const addColumnQuery = `ALTER TABLE ${collectionName} ADD COLUMN ${key} ${schema[key]}`;
          await executeQuery(addColumnQuery);
        }
      }  

    }
    console.log("Schema loaded successfully");
  } catch (err) {
    console.error("Error loading schema:", err);
  }
}

// CRUD API Endpoints

// Create a new record
app.post("/:collection", async (req: Request, res: Response) => {
  const collectionName = req.params.collection;
  const data = req.body;

  try {
    const result = await executeQuery(`INSERT INTO ${collectionName} SET ?`, data);
    res.json(result);
  } catch (err) {
    console.error("Error creating record:", err);
    res.status(500).json({ error: "Failed to create record" });
  }
});

// Read a record by ID
app.get("/:collection/:id", async (req: Request, res: Response) => {
  const collectionName = req.params.collection;
  const id = req.params.id;

  try {
    const result = await executeQuery(`SELECT * FROM ${collectionName} WHERE id = ?`, [id]);
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ error: "Record not found" });
    }
  } catch (err) {
    console.error("Error fetching record:", err);
    res.status(500).json({ error: "Failed to fetch record" });
  }
});

// Update a record by ID
app.post("/:collection/:id", async (req: Request, res: Response) => {
  const collectionName = req.params.collection;
  const id = req.params.id;
  const data = req.body;

  try {
    const result = await executeQuery(`UPDATE ${collectionName} SET ? WHERE id = ?`, [data, id]);
    res.json(result);
  } catch (err) {
    console.error("Error updating record:", err);
    res.status(500).json({ error: "Failed to update record" });
  }
});

// Delete a record by ID
app.delete("/:collection/:id", async (req: Request, res: Response) => {
  const collectionName = req.params.collection;
  const id = req.params.id;

  try {
    const result = await executeQuery(`DELETE FROM ${collectionName} WHERE id = ?`, [id]);
    res.json(result);
  } catch (err) {
    console.error("Error deleting record:", err);
    res.status(500).json({ error: "Failed to delete record" });
  }
});


async function startServer() {
  // Load schema on server startup
  await loadSchema();
  // server running on localhost
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// entrypoint
startServer();