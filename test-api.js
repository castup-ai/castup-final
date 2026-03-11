const url = 'https://castup-final.onrender.com/api/auth/signup';

async function testApi() {
  console.log(`Testing POST ${url}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "test testing",
        email: "test" + Date.now() + "@example.com",
        password: "password123",
        department: "Acting"
      })
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch (err) {
    console.error("Error:", err);
  }
}

testApi();
