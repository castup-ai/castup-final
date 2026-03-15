import axios from 'axios';

const testForgotPassword = async () => {
    const email = 'sabareeshk55@gmail.com'; // Use the email from the user's screenshot
    console.log(`Testing forgot-password for ${email}...`);
    
    try {
        const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
};

testForgotPassword();
