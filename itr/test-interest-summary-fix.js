/**
 * Test script to verify Interest Summary API fix for FY 2024-25
 * This script tests the exact scenario that should produce:
 * - Total Interest Income = ₹20,000
 * - Total TDS Deducted = ₹4,500 (NOT ₹6,499)
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

// Test data that should produce the correct totals
const testPayload = {
  fiscalYear: '2024-25',
  interest: {
    savings: 3500,
    fd: 12000,
    rd: 2000,
    bonds: 1500,
    other: 1000
  },
  bankEntries: [
    { bankName: 'Bank A', interest: 8000, tdsDeducted: 2000 },
    { bankName: 'Bank B', interest: 7000, tdsDeducted: 1500 },
    { bankName: 'Bank C', interest: 5000, tdsDeducted: 1000 }
  ]
};

async function testInterestSummaryAPI() {
  console.log('🧪 Testing Interest Summary API Fix for FY 2024-25');
  console.log('=' .repeat(60));
  
  try {
    // Test the new Interest Summary API
    console.log('📤 Sending test payload to /api/v1/interest-summary...');
    console.log('Input Data:');
    console.log('- Category Interest: Savings(₹3,500) + FD(₹12,000) + RD(₹2,000) + Bonds(₹1,500) + Other(₹1,000) = ₹20,000');
    console.log('- Bank TDS: Bank A(₹2,000) + Bank B(₹1,500) + Bank C(₹1,000) = ₹4,500');
    console.log('');

    const response = await axios.post(`${API_BASE_URL}/api/v1/interest-summary`, testPayload);
    
    if (response.status === 200) {
      const result = response.data;
      
      console.log('✅ API Response received successfully!');
      console.log('📊 Results:');
      console.log(`- Total Interest Income: ₹${result.totalInterest.toLocaleString('en-IN')}`);
      console.log(`- Total TDS Deducted: ₹${result.totalTDS.toLocaleString('en-IN')}`);
      console.log(`- Fiscal Year: ${result.fiscalYear}`);
      console.log('');
      
      // Validation checks
      console.log('🔍 Validation Checks:');
      
      const expectedInterest = 20000;
      const expectedTDS = 4500;
      
      if (result.totalInterest === expectedInterest) {
        console.log('✅ Total Interest Income is CORRECT: ₹20,000');
      } else {
        console.log(`❌ Total Interest Income is WRONG: Expected ₹${expectedInterest.toLocaleString('en-IN')}, Got ₹${result.totalInterest.toLocaleString('en-IN')}`);
      }
      
      if (result.totalTDS === expectedTDS) {
        console.log('✅ Total TDS Deducted is CORRECT: ₹4,500 (Bug Fixed!)');
      } else {
        console.log(`❌ Total TDS Deducted is WRONG: Expected ₹${expectedTDS.toLocaleString('en-IN')}, Got ₹${result.totalTDS.toLocaleString('en-IN')}`);
        if (result.totalTDS === 6499) {
          console.log('🐛 This is the OLD BUG - TDS is being double-counted!');
        }
      }
      
      if (result.validation) {
        console.log(`- Interest Mismatch: ${result.validation.interestMismatch ? 'Yes' : 'No'}`);
        console.log(`- Bank Interest Sum: ₹${result.validation.bankInterestSum.toLocaleString('en-IN')}`);
        console.log(`- Category Interest Sum: ₹${result.validation.categoryInterestSum.toLocaleString('en-IN')}`);
      }
      
      console.log('');
      console.log('📋 Breakdown:');
      if (result.breakdown) {
        console.log('Category Interest:');
        Object.entries(result.breakdown.categoryInterest).forEach(([key, value]) => {
          console.log(`  - ${key}: ₹${value.toLocaleString('en-IN')}`);
        });
        
        console.log('Bank Summary:');
        result.breakdown.bankSummary.forEach((bank, index) => {
          console.log(`  - ${bank.bankName}: Interest ₹${bank.interest.toLocaleString('en-IN')}, TDS ₹${bank.tdsDeducted.toLocaleString('en-IN')}`);
        });
      }
      
      // Final verdict
      console.log('');
      console.log('🎯 FINAL VERDICT:');
      if (result.totalInterest === expectedInterest && result.totalTDS === expectedTDS) {
        console.log('🎉 SUCCESS! Interest Summary API is working correctly for FY 2024-25');
        console.log('✅ The ₹6,499 bug has been FIXED!');
      } else {
        console.log('❌ FAILURE! There are still issues with the calculation');
      }
      
    } else {
      console.log(`❌ API request failed with status: ${response.status}`);
    }
    
  } catch (error) {
    console.log('❌ Error testing Interest Summary API:');
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
  console.log('🚀 Starting Interest Summary Fix Verification');
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
  await testInterestSummaryAPI();
  
  console.log('');
  console.log('📝 Next Steps:');
  console.log('1. If tests pass, the backend fix is working');
  console.log('2. Test the frontend at: http://localhost:6461/itr/income-sources/interest');
  console.log('3. Enter the test data and verify UI shows ₹20,000 and ₹4,500');
  console.log('4. Run unit tests: cd backend && npm test');
}

runTests();
