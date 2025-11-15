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

  // Income sources tables with proper numeric types
  db.run(`
    CREATE TABLE IF NOT EXISTS income_salary (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_year TEXT NOT NULL,
      employer_name TEXT,
      gross_salary INTEGER NOT NULL, -- Store in paise to avoid float issues
      basic_salary INTEGER DEFAULT 0,
      hra_received INTEGER DEFAULT 0,
      special_allowance INTEGER DEFAULT 0,
      other_allowances INTEGER DEFAULT 0,
      tds_deducted INTEGER DEFAULT 0,
      professional_tax INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS income_interest (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_year TEXT NOT NULL,
      savings_interest INTEGER DEFAULT 0,
      fd_interest INTEGER DEFAULT 0,
      rd_interest INTEGER DEFAULT 0,
      bond_interest INTEGER DEFAULT 0,
      other_interest INTEGER DEFAULT 0,
      total_tds INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS income_capital_gains (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_year TEXT NOT NULL,
      short_term_gains INTEGER DEFAULT 0,
      long_term_gains INTEGER DEFAULT 0,
      short_term_losses INTEGER DEFAULT 0,
      long_term_losses INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS income_property (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_year TEXT NOT NULL,
      rental_income INTEGER DEFAULT 0,
      property_tax INTEGER DEFAULT 0,
      home_loan_interest INTEGER DEFAULT 0,
      other_expenses INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS income_crypto (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_year TEXT NOT NULL,
      crypto_gains INTEGER DEFAULT 0,
      crypto_losses INTEGER DEFAULT 0,
      tds_deducted INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS income_other (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_year TEXT NOT NULL,
      other_income INTEGER DEFAULT 0,
      exempt_income INTEGER DEFAULT 0,
      tds_deducted INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS deductions_data (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_year TEXT NOT NULL,
      section_80c INTEGER DEFAULT 0,
      section_80d INTEGER DEFAULT 0,
      section_80tta INTEGER DEFAULT 0,
      section_80ccd INTEGER DEFAULT 0,
      other_deductions INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tax_calculations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_year TEXT NOT NULL,
      regime TEXT NOT NULL,
      calculation_data TEXT NOT NULL, -- JSON string of full calculation
      total_tax_liability INTEGER NOT NULL,
      refund_or_due INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Deductions tables with proper schema
  db.run(`
    CREATE TABLE IF NOT EXISTS deductions_80c (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_year TEXT NOT NULL,
      idempotency_key TEXT,
      components TEXT NOT NULL, -- JSON array of components
      total_amount_paise INTEGER NOT NULL,
      cap_applied BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, assessment_year, idempotency_key)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS deductions_80d (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_year TEXT NOT NULL,
      idempotency_key TEXT,
      premiums TEXT NOT NULL, -- JSON array of premiums
      preventive_checkup_amount_paise INTEGER DEFAULT 0,
      total_amount_paise INTEGER NOT NULL,
      cap_breakdown TEXT NOT NULL, -- JSON of cap calculations
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, assessment_year, idempotency_key)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS deductions_taxes_paid (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_year TEXT NOT NULL,
      idempotency_key TEXT,
      tds_entries TEXT NOT NULL, -- JSON array of TDS entries
      tcs_entries TEXT DEFAULT '[]', -- JSON array of TCS entries
      total_tds_paise INTEGER NOT NULL,
      total_tcs_paise INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, assessment_year, idempotency_key)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS deductions_carry_forward (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_year TEXT NOT NULL,
      idempotency_key TEXT,
      losses TEXT NOT NULL, -- JSON array of loss entries
      available_offsets TEXT NOT NULL, -- JSON of calculated offsets
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, assessment_year, idempotency_key)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS deductions_other (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_year TEXT NOT NULL,
      idempotency_key TEXT,
      entries TEXT NOT NULL, -- JSON array of other deduction entries
      total_amount_paise INTEGER NOT NULL,
      section_breakdown TEXT NOT NULL, -- JSON of section-wise breakdown
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, assessment_year, idempotency_key)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS computation_runs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_year TEXT NOT NULL,
      computation_data TEXT NOT NULL, -- Full computation JSON
      input_hash TEXT NOT NULL, -- Hash of all inputs for idempotency
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_income_salary_user_ay ON income_salary(user_id, assessment_year)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_income_interest_user_ay ON income_interest(user_id, assessment_year)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_income_capital_gains_user_ay ON income_capital_gains(user_id, assessment_year)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_income_property_user_ay ON income_property(user_id, assessment_year)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_income_crypto_user_ay ON income_crypto(user_id, assessment_year)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_income_other_user_ay ON income_other(user_id, assessment_year)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_deductions_user_ay ON deductions_data(user_id, assessment_year)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_tax_calculations_user_ay ON tax_calculations(user_id, assessment_year)`);
  
  // Deductions indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_deductions_80c_user_ay ON deductions_80c(user_id, assessment_year)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_deductions_80d_user_ay ON deductions_80d(user_id, assessment_year)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_deductions_taxes_paid_user_ay ON deductions_taxes_paid(user_id, assessment_year)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_deductions_carry_forward_user_ay ON deductions_carry_forward(user_id, assessment_year)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_deductions_other_user_ay ON deductions_other(user_id, assessment_year)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_computation_runs_user_ay ON computation_runs(user_id, assessment_year)`);

  saveDB();
  console.log('✅ Database initialized successfully with tax calculation tables');
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
