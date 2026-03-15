async function testGetUsers() {
  const url = 'http://localhost:5000/api/users';
  console.log('Testing GET', url);
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    const body = await res.json();
    console.log("Data count:", body.data ? body.data.length : 'no data');
    if (body.data) {
      console.log("First user:", JSON.stringify(body.data[0]));
    }
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

testGetUsers();
