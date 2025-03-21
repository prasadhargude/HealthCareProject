const connection = require('../config/db');

const User = {
    create: (userData, callback) => {
        const { profilePic, firstName, lastName, email, gender, username, mobileNumber, address, password } = userData;
        const sql = 'INSERT INTO users (profilePic, firstName, lastName, email, gender, username, mobileNumber, address, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        connection.query(sql, [profilePic, firstName, lastName, email, gender, username, mobileNumber, address, password], callback);
    }
};

module.exports = User;
