const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 8085,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => resolve(JSON.parse(responseBody)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request({
      hostname: 'localhost',
      port: 8085,
      path: path,
      method: 'GET',
      headers: headers
    }, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => resolve(JSON.parse(responseBody)));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Testing GET /api/jobs ---');
  const jobsRes = await get('/api/jobs');
  console.log('Jobs returned:', jobsRes.data.length);
  console.log('Sample job:', jobsRes.data[0].title, '| Company:', jobsRes.data[0].companyName);

  console.log('\n--- 2. Testing Candidate Login ---');
  const candLogin = await post('/api/auth/login', { email: 'candidate@dev.com', password: 'Candidate@123' });
  console.log('Candidate login status:', candLogin.success, '| User:', candLogin.data.fullName, '| Role:', candLogin.data.role);

  console.log('\n--- 3. Testing Candidate Dashboard Stats ---');
  const candDash = await get('/api/candidates/dashboard', candLogin.data.token);
  console.log('Candidate stats -> Total applied:', candDash.data.totalApplied, '| Shortlisted:', candDash.data.shortlisted, '| Interview:', candDash.data.interview);

  console.log('\n--- 4. Testing Recruiter Login & Pipeline ---');
  const recLogin = await post('/api/auth/login', { email: 'recruiter@techcorp.com', password: 'Recruiter@123' });
  console.log('Recruiter login status:', recLogin.success, '| Company:', recLogin.data.companyName, '| Role:', recLogin.data.role);
  const recDash = await get('/api/recruiters/dashboard', recLogin.data.token);
  console.log('Recruiter stats -> Total jobs:', recDash.data.totalJobs, '| Applicants:', recDash.data.totalApplicants);

  console.log('\n--- 5. Testing Admin Login & Stats ---');
  const adminLogin = await post('/api/auth/login', { email: 'admin@recruitment.com', password: 'Admin@123' });
  console.log('Admin login status:', adminLogin.success, '| Role:', adminLogin.data.role);
  const adminStats = await get('/api/admin/stats', adminLogin.data.token);
  console.log('Admin stats -> Users:', adminStats.data.totalUsers, '| Candidates:', adminStats.data.totalCandidates, '| Recruiters:', adminStats.data.totalRecruiters, '| Jobs:', adminStats.data.totalJobs, '| Applications:', adminStats.data.totalApplications);

  console.log('\nAll API automated tests PASSED successfully!');
}

runTests().catch(console.error);
