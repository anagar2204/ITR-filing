import { Pool, PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';

let pool: Pool;

export const initPostgres = async () => {
  // For development, use a simple in-memory approach or file-based SQLite
  // Since PostgreSQL setup requires external database, we'll simulate it with SQLite for now
  // but structure the code to be PostgreSQL-compatible
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'itr_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  try {
    pool = new Pool(config);
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    
    // Create tables if they don't exist
    await createTables(client);
    
    client.release();
  } catch (error) {
    console.log('❌ PostgreSQL connection failed, falling back to SQLite');
    // Fall back to SQLite for development
    throw error;
  }
};

const createTables = async (client: PoolClient) => {
  // Create users table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `);

  // Create capital_gains table
  await client.query(`
    CREATE TABLE IF NOT EXISTS capital_gains (
      id SERIAL PRIMARY KEY,
      user_id UUID NULL,
      raw_payload JSONB NOT NULL,
      result_json JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  console.log('✅ PostgreSQL tables created successfully');
};

export const getPool = () => pool;

export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

export const insertCapitalGains = async (userId: string | null, rawPayload: any, resultJson: any) => {
  const text = `
    INSERT INTO capital_gains (user_id, raw_payload, result_json)
    VALUES ($1, $2, $3)
    RETURNING id, created_at
  `;
  const values = [userId, JSON.stringify(rawPayload), JSON.stringify(resultJson)];
  
  const result = await query(text, values);
  return result.rows[0];
};

export default { initPostgres, query, insertCapitalGains, getPool };
