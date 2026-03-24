try {
    const authController = require('../controllers/authController');
    console.log('authController loaded successfully');
    console.log('Register exported:', !!authController.register);
    console.log('Login exported:', !!authController.login);
} catch (error) {
    console.error('Error loading authController:', error);
}
