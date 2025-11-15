import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';

let db: Database;
const dbPath = path.join(__dirname, '../../database.sqlite');

const initDB = async () => {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  return db;
};

const saveDB = () => {
  if (db) {
    const data = db.export();
    fs.writeFileSync(dbPath, data);
  }
};

// Save database periodically
setInterval(saveDB, 5000);

// Save on exit
process.on('exit', saveDB);
process.on('SIGINT', () => {
  saveDB();
  process.exit();
});

export const initDatabase = async () => {
  await initDB();
  
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tax returns table
  db.run(`
    CREATE TABLE IF NOT EXISTS tax_returns (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_year TEXT NOT NULL,
      financial_year TEXT NOT NULL,
      itr_form_type TEXT DEFAULT 'ITR-1',
      tax_regime TEXT DEFAULT 'new',
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Income data table
  db.run(`
    CREATE TABLE IF NOT EXISTS income_data (
      id TEXT PRIMARY KEY,
      return_id TEXT NOT NULL,
      salary_gross REAL DEFAULT 0,
      salary_exempt REAL DEFAULT 0,
      salary_net REAL DEFAULT 0,
      other_income REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (return_id) REFERENCES tax_returns(id) ON DELETE CASCADE
    )
  `);

  // Deductions table
  db.run(`
    CREATE TABLE IF NOT EXISTS deductions (
      id TEXT PRIMARY KEY,
      return_id TEXT NOT NULL,
      section_80c REAL DEFAULT 0,
      section_80d REAL DEFAULT 0,
      section_80e REAL DEFAULT 0,
      section_80g REAL DEFAULT 0,
      hra_claimed REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (return_id) REFERENCES tax_returns(id) ON DELETE CASCADE
    )
  `);

  // Documents table
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      return_id TEXT,
      document_type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      parsed_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (return_id) REFERENCES tax_returns(id) ON DELETE SET NULL
    )
  `);

  // Tax computation results table
  db.run(`
    CREATE TABLE IF NOT EXISTS tax_computations (
      id TEXT PRIMARY KEY,
      return_id TEXT NOT NULL,
      regime TEXT NOT NULL,
      total_income REAL NOT NULL,
      taxable_income REAL NOT NULL,
      tax_before_rebate REAL NOT NULL,
      rebate_87a REAL DEFAULT 0,
      tax_payable REAL NOT NULL,
      cess REAL NOT NULL,
      total_tax REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (return_id) REFERENCES tax_returns(id) ON DELETE CASCADE
    )
  `);

  // Capital gains table (PostgreSQL-compatible structure using SQLite)
  db.run(`
    CREATE TABLE IF NOT EXISTS capital_gains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NULL,
      raw_payload TEXT NOT NULL,
      result_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  saveDB();
  console.log('✅ Database initialized successfully');
};

export const getDB = () => db;

export const query = (sql: string, params: any[] = []) => {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const result = [];
  while (stmt.step()) {
    result.push(stmt.getAsObject());
  }
  stmt.free();
  return result;
};

export const run = (sql: string, params: any[] = []) => {
  db.run(sql, params);
  saveDB();
};

export const get = (sql: string, params: any[] = []) => {
  const results = query(sql, params);
  return results.length > 0 ? results[0] : null;
};

export const insertCapitalGains = (userId: string | null, rawPayload: any, resultJson: any) => {
  const sql = `
    INSERT INTO capital_gains (user_id, raw_payload, result_json)
    VALUES (?, ?, ?)
  `;
  const params = [userId, JSON.stringify(rawPayload), JSON.stringify(resultJson)];
  
  db.run(sql, params);
  saveDB();
  
  // Get the last inserted row
  const lastId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
  return { id: lastId, created_at: new Date().toISOString() };
};

export default { initDatabase, query, run, get, getDB, insertCapitalGains };
