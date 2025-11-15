const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

async function checkDatabase() {
  console.log('🔍 Checking Capital Gains Database Records');
  console.log('=' .repeat(60));
  
  try {
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'database.sqlite');
    
    if (!fs.existsSync(dbPath)) {
      console.log('❌ Database file not found:', dbPath);
      return;
    }
    
    const buffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(buffer);
    
    // Check if capital_gains table exists
    const tableCheck = db.exec(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='capital_gains'
    `);
    
    if (tableCheck.length === 0) {
      console.log('❌ capital_gains table does not exist');
      return;
    }
    
    console.log('✅ capital_gains table exists');
    
    // Get all capital gains records
    const records = db.exec('SELECT * FROM capital_gains ORDER BY id DESC LIMIT 10');
    
    if (records.length === 0 || records[0].values.length === 0) {
      console.log('📭 No capital gains records found in database');
    } else {
      console.log(`📊 Found ${records[0].values.length} capital gains record(s):`);
      console.log('');
      
      const columns = records[0].columns;
      records[0].values.forEach((row, index) => {
        console.log(`Record ${index + 1}:`);
        columns.forEach((col, colIndex) => {
          let value = row[colIndex];
          if (col === 'raw_payload' || col === 'result_json') {
            try {
              value = JSON.stringify(JSON.parse(value), null, 2);
            } catch (e) {
              // Keep as string if not valid JSON
            }
          }
          console.log(`  ${col}: ${value}`);
        });
        console.log('');
      });
    }
    
    // Show table schema
    console.log('📋 Table Schema:');
    const schema = db.exec('PRAGMA table_info(capital_gains)');
    if (schema.length > 0) {
      schema[0].values.forEach(row => {
        console.log(`  ${row[1]} (${row[2]}) - ${row[3] ? 'NOT NULL' : 'NULL'} ${row[5] ? 'PRIMARY KEY' : ''}`);
      });
    }
    
    db.close();
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

if (require.main === module) {
  checkDatabase();
}

module.exports = { checkDatabase };
