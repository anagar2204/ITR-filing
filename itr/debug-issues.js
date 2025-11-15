// Debug Tax Genie Issues
const fs = require('fs');
const path = require('path');

function debugTaxGenieIssues() {
  console.log('🔍 Debugging Tax Genie Issues...\n');

  try {
    // Check 1: Verify mascot image
    console.log('1. Checking mascot image...');
    const mascotPath = path.join(__dirname, 'frontend', 'public', 'tax-genie-mascot.png');
    if (fs.existsSync(mascotPath)) {
      const stats = fs.statSync(mascotPath);
      console.log(`✅ Mascot image found (${Math.round(stats.size / 1024)}KB)`);
    } else {
      console.log('❌ Mascot image missing');
    }

    // Check 2: Verify main page
    console.log('\n2. Checking main page...');
    const pagePath = path.join(__dirname, 'frontend', 'app', 'page.tsx');
    if (fs.existsSync(pagePath)) {
      const pageContent = fs.readFileSync(pagePath, 'utf8');
      console.log(`✅ Main page exists (${pageContent.length} characters)`);
      
      if (pageContent.includes('Tax Genie')) {
        console.log('✅ Tax Genie branding found');
      } else {
        console.log('❌ Tax Genie branding missing');
      }
    }

    // Check 3: Verify components
    console.log('\n3. Checking components...');
    const loaderPath = path.join(__dirname, 'frontend', 'components', 'TaxGenieLoader.tsx');
    const providerPath = path.join(__dirname, 'frontend', 'components', 'LoadingProvider.tsx');
    
    if (fs.existsSync(loaderPath)) {
      console.log('✅ TaxGenieLoader component exists');
    } else {
      console.log('❌ TaxGenieLoader component missing');
    }
    
    if (fs.existsSync(providerPath)) {
      console.log('✅ LoadingProvider component exists');
    } else {
      console.log('❌ LoadingProvider component missing');
    }

    // Check 4: Verify layout
    console.log('\n4. Checking layout...');
    const layoutPath = path.join(__dirname, 'frontend', 'app', 'layout.tsx');
    if (fs.existsSync(layoutPath)) {
      const layoutContent = fs.readFileSync(layoutPath, 'utf8');
      if (layoutContent.includes('LoadingProvider')) {
        console.log('✅ LoadingProvider integrated in layout');
      } else {
        console.log('❌ LoadingProvider not integrated in layout');
      }
    }

    // Check 5: Common issues
    console.log('\n5. Checking for common issues...');
    
    // Check package.json
    const packagePath = path.join(__dirname, 'frontend', 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageContent = fs.readFileSync(packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);
      
      if (packageJson.dependencies['framer-motion']) {
        console.log('✅ Framer Motion dependency found');
      } else {
        console.log('❌ Framer Motion dependency missing');
      }
    }

    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Make sure the server is running on http://localhost:3000');
    console.log('2. Check browser console for JavaScript errors');
    console.log('3. Verify all imports are correct');
    console.log('4. Clear browser cache and reload');
    console.log('5. Check if any components have syntax errors');

    console.log('\n📱 Current Server Status:');
    console.log('- Frontend should be running on: http://localhost:3000');
    console.log('- Browser preview available at: http://127.0.0.1:63729');
    console.log('- Check the browser preview to see the current state');

  } catch (error) {
    console.error('❌ Error during debugging:', error.message);
  }
}

// Run the debug
debugTaxGenieIssues();
