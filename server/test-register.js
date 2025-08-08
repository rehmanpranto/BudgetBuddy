async function testRegistration() {
  try {
    const response = await fetch('http://localhost:4000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
}

testRegistration();
