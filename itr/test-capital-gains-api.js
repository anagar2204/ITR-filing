const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

// Test payloads from the unit tests
const testPayloads = [
  {
    name: 'Short-term equity gains',
    payload: {
      assetType: 'equity',
      purchaseDate: '2023-01-01',
      saleDate: '2023-06-01',
      purchasePrice: '₹1,00,000',
      salePrice: '₹1,20,000',
      indexationBenefit: false,
      expenses: '₹2,000'
    }
  },
  {
    name: 'Long-term equity gains',
    payload: {
      assetType: 'equity',
      purchaseDate: '2022-01-01',
      saleDate: '2023-06-01',
      purchasePrice: 100000,
      salePrice: 200000,
      indexationBenefit: false,
      expenses: 5000
    }
  },
  {
    name: 'Long-term property gains with indexation',
    payload: {
      assetType: 'property',
      purchaseDate: '2020-01-01',
      saleDate: '2023-01-01',
      purchasePrice: 1000000,
      salePrice: 1500000,
      indexationBenefit: true,
      expenses: 50000
    }
  }
];

async function testCapitalGainsAPI() {
  console.log('🧪 Testing Capital Gains API');
  console.log('=' .repeat(60));
  
  for (let i = 0; i < testPayloads.length; i++) {
    const { name, payload } = testPayloads[i];
    
    try {
      console.log(`\n📤 Test ${i + 1}: ${name}`);
      console.log('Input:', JSON.stringify(payload, null, 2));
      
      const response = await axios.post(`${API_BASE_URL}/api/capital-gains`, payload);
      
      if (response.status === 200) {
        console.log('✅ API Response received successfully!');
        console.log('📊 Results:');
        console.log(`- Asset Type: ${response.data.assetType}`);
        console.log(`- Holding Period: ${response.data.holdingPeriodDays} days`);
        console.log(`- Is Long Term: ${response.data.isLongTerm}`);
        console.log(`- Purchase Price: ₹${response.data.purchasePrice.toLocaleString('en-IN')}`);
        console.log(`- Sale Price: ₹${response.data.salePrice.toLocaleString('en-IN')}`);
        console.log(`- Capital Gain: ₹${response.data.capitalGain.toLocaleString('en-IN')}`);
        console.log(`- Final Capital Gain: ₹${response.data.finalCapitalGain.toLocaleString('en-IN')}`);
        console.log(`- Tax Rate: ${(response.data.taxRate * 100)}%`);
        console.log(`- Tax Liability: ₹${response.data.taxLiability.toLocaleString('en-IN')}`);
        console.log(`- Indexation Applied: ${response.data.indexationApplied}`);
        console.log(`- DB ID: ${response.data.dbId}`);
        console.log(`- Created At: ${response.data.createdAt}`);
        
        // Store for database verification
        testPayloads[i].response = response.data;
      } else {
        console.log(`❌ API request failed with status: ${response.status}`);
      }
      
    } catch (error) {
      console.log('❌ Error testing Capital Gains API:');
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else if (error.request) {
        console.log('No response received. Is the server running on port 5000?');
        console.log('Start the server with: cd backend && npm run dev');
      } else {
        console.log(`Error: ${error.message}`);
      }
    }
  }
  
  console.log('\n📋 Summary of API Tests:');
  testPayloads.forEach((test, i) => {
    if (test.response) {
      console.log(`✅ Test ${i + 1}: ${test.name} - SUCCESS (DB ID: ${test.response.dbId})`);
    } else {
      console.log(`❌ Test ${i + 1}: ${test.name} - FAILED`);
    }
  });
  
  return testPayloads;
}

async function testHealthCheck() {
  try {
    console.log('🏥 Checking server health...');
    const response = await axios.get(`${API_BASE_URL}/health`);
    if (response.status === 200) {
      console.log('✅ Server is healthy and running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server health check failed');
    console.log('Make sure the backend server is running on port 5000');
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting Capital Gains API Verification');
  console.log('');
  
  const serverHealthy = await testHealthCheck();
  if (!serverHealthy) {
    console.log('');
    console.log('💡 To start the server:');
    console.log('1. cd backend');
    console.log('2. npm install');
    console.log('3. npm run dev');
    return;
  }
  
  console.log('');
  const results = await testCapitalGainsAPI();
  
  console.log('');
  console.log('📝 Next Steps:');
  console.log('1. Check database for stored records');
  console.log('2. Verify JSON structure matches expectations');
  console.log('3. Run unit tests: cd backend && npm test');
  
  return results;
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testCapitalGainsAPI, testHealthCheck };
