const axios = require('axios');

async function testFullFlow() {
    try {
        console.log('--- Phase 1: Login ---');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@vitam.edu',
            password: 'admin123'
        });
        console.log('Login Status:', loginRes.status);
        const userId = loginRes.data.userId;

        console.log('\n--- Phase 2: 2FA ---');
        const tfaRes = await axios.post('http://localhost:5000/api/auth/verify-2fa', {
            userId: userId,
            token: '123456'
        });
        console.log('2FA Status:', tfaRes.status);

        console.log('\n--- Phase 3: Biometric ---');
        const bioRes = await axios.post('http://localhost:5000/api/auth/biometric', {
            userId: userId,
            biometricToken: 'mock-token'
        });
        console.log('Biometric Status:', bioRes.status);
        console.log('Final Data:', JSON.stringify(bioRes.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testFullFlow();
