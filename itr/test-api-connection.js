// Test script to verify API connectivity
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPIConnectivity() {
  console.log('🧪 Testing ITR Platform API Connectivity...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Health Check:', healthResponse.data);

    // Test 2: Personal Info Endpoint
    console.log('\n2. Testing Personal Info Endpoint...');
    const personalInfoData = {
      firstName: 'John',
      lastName: 'Doe',
      pan: 'ABCDE1234F',
      email: 'john.doe@example.com',
      mobile: '9876543210'
    };

    const personalInfoResponse = await axios.post(`${API_BASE}/itr/personal-info`, personalInfoData, {
      headers: {
        'Content-Type': 'application/json',
        'user-id': 'test-user-123'
      }
    });
    console.log('✅ Personal Info Save:', personalInfoResponse.data);

    // Test 3: Income Sources Endpoint
    console.log('\n3. Testing Income Sources Endpoint...');
    const incomeData = {
      salary: 1200000,
      interest: 50000,
      rental: 0,
      businessProfession: 0,
      capitalGains: 0,
      otherSources: 0
    };

    const incomeResponse = await axios.post(`${API_BASE}/itr/income-sources`, incomeData, {
      headers: {
        'Content-Type': 'application/json',
        'user-id': 'test-user-123'
      }
    });
    console.log('✅ Income Sources Save:', incomeResponse.data);

    // Test 4: Tax Savings Endpoint
    console.log('\n4. Testing Tax Savings Endpoint...');
    const taxSavingData = {
      deductions: {
        section80C: 150000,
        section80D: 25000,
        section80G: 0,
        section80E: 0
      },
      tdsPaid: 120000,
      tcsPaid: 0
    };

    const taxSavingResponse = await axios.post(`${API_BASE}/itr/tax-saving`, taxSavingData, {
      headers: {
        'Content-Type': 'application/json',
        'user-id': 'test-user-123'
      }
    });
    console.log('✅ Tax Savings Save:', taxSavingResponse.data);

    // Test 5: Tax Summary Endpoint
    console.log('\n5. Testing Tax Summary Endpoint...');
    const summaryResponse = await axios.get(`${API_BASE}/itr/summary`, {
      headers: {
        'user-id': 'test-user-123'
      }
    });
    console.log('✅ Tax Summary:', summaryResponse.data);

    console.log('\n🎉 All API tests passed! Frontend-Backend connection is working perfectly.');
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure backend is running on port 5000');
    console.log('- Check if all routes are properly configured');
    console.log('- Verify CORS settings allow frontend requests');
  }
}

// Run the test
testAPIConnectivity();
