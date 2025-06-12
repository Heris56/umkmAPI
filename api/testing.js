const bcrypt = require('bcrypt');

const storedHash = '$2b$10$YRXkCZfLIq.kfjiuImUFfe3vCwLkourMsdKu554QXTV92AyFobi7m'; // Replace with the hash from the database
const plaintextPassword = 'secureP@ssword123'; // Replace with the password you’re testing

async function verifyPassword() {
    try {
        const isMatch = await bcrypt.compare(plaintextPassword, storedHash);
        console.log('Password match:', isMatch);
    } catch (error) {
        console.error('Error verifying password:', error);
    }
}

verifyPassword();