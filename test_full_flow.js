async function testFullFlow() {
  const loginUrl = 'http://localhost:5000/api/auth/login';
  const usersUrl = 'http://localhost:5000/api/users';
  
  try {
    console.log('Logging in...');
    const loginRes = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "test1773598502110@example.com",
        password: "password123"
      })
    });
    
    if (loginRes.status !== 200) {
      console.error("Login failed with status:", loginRes.status);
      return;
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("Logged in! Token found.");
    
    console.log('Fetching users with token...');
    const usersRes = await fetch(usersUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log("Status:", usersRes.status);
    const usersData = await usersRes.json();
    console.log("Data count:", usersData.data ? usersData.data.length : 'no data');
    if (usersData.data && usersData.data.length > 0) {
        console.log("Success! Users found.");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

testFullFlow();
