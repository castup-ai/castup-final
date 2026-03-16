import axios from 'axios';

async function testApi() {
    try {
        console.log('Testing forgot password...');
        const res = await axios.post('http://localhost:5000/api/auth/forgot-password', {
            email: 'test@example.com'
        });
        console.log('Forgot Password response:', res.status, res.data);
    } catch(e) {
        console.error('Forgot Password error:', e.response?.status, e.response?.data || e.message);
    }
}

testApi();
