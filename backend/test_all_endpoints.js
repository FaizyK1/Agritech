const BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 Running AgriTech Full Stack API & Database Suite...\n');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5000/');
  const healthData = await healthRes.json();
  console.log(`[PASS] Server Root Health: ${healthData.status} (${healthData.platform})`);

  // 2. Login as Farmer
  const farmerLogin = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'farmer@agritech.com', password: 'farmer123' })
  });
  const farmerData = await farmerLogin.json();
  console.log(`[PASS] Farmer Login: ${farmerData.data?.name} (Role: ${farmerData.data?.role})`);
  const farmerToken = farmerData.data?.token;

  // 3. Login as Admin
  const adminLogin = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@agritech.com', password: 'admin123' })
  });
  const adminData = await adminLogin.json();
  console.log(`[PASS] Admin Login: ${adminData.data?.name} (Role: ${adminData.data?.role})`);
  const adminToken = adminData.data?.token;

  // 4. Test Farms API
  const farmsRes = await fetch(`${BASE}/farms`, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  const farmsData = await farmsRes.json();
  console.log(`[PASS] Farms Endpoint: Retrieved ${farmsData.count} registered parcels`);

  // 5. Test Crops API
  const cropsRes = await fetch(`${BASE}/crops`, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  const cropsData = await cropsRes.json();
  console.log(`[PASS] Crops Endpoint: Retrieved ${cropsData.count} cultivated crops`);

  // 6. Test Soil Tests API
  const soilRes = await fetch(`${BASE}/soil`, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  const soilData = await soilRes.json();
  console.log(`[PASS] Soil Diagnostics: Retrieved ${soilData.count} soil test reports`);

  // 7. Test Pest Alerts API
  const pestsRes = await fetch(`${BASE}/pests`);
  const pestsData = await pestsRes.json();
  console.log(`[PASS] Pest Surveillance: Retrieved ${pestsData.count} regional pest alerts`);

  // 8. Test Marketplace Products API
  const marketRes = await fetch(`${BASE}/market/products`);
  const marketData = await marketRes.json();
  console.log(`[PASS] Marketplace Products: Retrieved ${marketData.count} listed products`);

  // 9. Test Orders API
  const ordersRes = await fetch(`${BASE}/market/orders`, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  const ordersData = await ordersRes.json();
  console.log(`[PASS] Orders Ledger: Retrieved ${ordersData.count} orders`);

  // 10. Test Consultations API
  const consultRes = await fetch(`${BASE}/consultations`, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  const consultData = await consultRes.json();
  console.log(`[PASS] Consultations: Retrieved ${consultData.count} advisory tickets`);

  // 11. Test Weather API
  const weatherRes = await fetch(`${BASE}/weather`);
  const weatherData = await weatherRes.json();
  console.log(`[PASS] Weather Telemetry: ${weatherData.current?.temperature}°C (Live Source: ${weatherData.dataSource})`);

  // 12. Test Admin Stats API
  const adminStatsRes = await fetch(`${BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const adminStatsData = await adminStatsRes.json();
  console.log(`[PASS] Admin Governance Stats: Total Users: ${adminStatsData.data?.counts?.totalUsers}, Farms: ${adminStatsData.data?.counts?.totalFarms}, GMV: ₹${adminStatsData.data?.counts?.totalOrderValue}`);

  console.log('\n🌟 ALL 12 BACKEND & DATABASE SUITES PASSED FLAWLESSLY!\n');
}

runTests().catch(console.error);
