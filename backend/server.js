const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); // for hashing passwords
const jwt = require('jsonwebtoken'); // for generating tokens

const app = express();
const port = 5000; // Port number for the server

app.use(cors());
app.use(express.json()); // Use express.json() instead of bodyParser.json()

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'healthcare'
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the MySQL database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// API endpoint for location suggestions
app.get('/api/suggestions/locations', (req, res) => {
  const query = req.query.q || '';
  const sql = 'SELECT name FROM locations WHERE name LIKE ? LIMIT 10';
  connection.query(sql, [`%${query}%`], (err, results) => {
    if (err) {
      console.error('Error fetching locations:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results.map(result => result.name));
  });
});

// API endpoint for doctor suggestions
app.get('/api/suggestions/doctors', (req, res) => {
  const query = req.query.q || '';
  const sql = 'SELECT name FROM doctors WHERE name LIKE ? LIMIT 10';
  connection.query(sql, [`%${query}%`], (err, results) => {
    if (err) {
      console.error('Error fetching doctors:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results.map(result => result.name));
  });
});

// API endpoint for user signup
app.post('/api/auth/signup', async (req, res) => {
  const { firstName, lastName, email, gender, username, mobileNumber, address, password } = req.body;

  // Check if user already exists
  const checkUserSql = 'SELECT * FROM users WHERE email = ?';
  connection.query(checkUserSql, [email], async (err, results) => {
    if (err) {
      console.error('Error checking user existence:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length > 0) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into database
    const insertUserSql = 'INSERT INTO users (firstName, lastName, email, gender, username, mobileNumber, address, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(insertUserSql, [firstName, lastName, email, gender, username, mobileNumber, address, hashedPassword], (err, results) => {
      if (err) {
        console.error('Error inserting user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

// API endpoint for user login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const sql = 'SELECT * FROM users WHERE email = ?';
  connection.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = results[0];
    // Compare hashed password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  });
});

// API endpoint to get cart items for a user
app.get('/api/cart/:userId', (req, res) => {
  const userId = req.params.userId;
  connection.query(
    `
    SELECT c.id, c.quantity, m.name, m.price, m.description, m.image
    FROM cart_items c
    JOIN medicines m ON c.medicine_id = m.id
    WHERE c.user_id = ?
    `,
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching cart items:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(results);
    }
  );
});

// API endpoint to add an item to the cart
app.post('/api/cart', (req, res) => {
  const { userId, medicineId, quantity } = req.body;

  if (!userId || !medicineId || !quantity) {
    return res.status(400).json({ error: 'User ID, Medicine ID, and Quantity are required' });
  }

  // Check if item already exists in the cart
  const checkSql = 'SELECT * FROM cart_items WHERE user_id = ? AND medicine_id = ?';
  connection.query(checkSql, [userId, medicineId], (err, results) => {
    if (err) {
      console.error('Error checking cart item:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length > 0) {
      // Item exists, update quantity
      const updateSql = 'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND medicine_id = ?';
      connection.query(updateSql, [quantity, userId, medicineId], (err, results) => {
        if (err) {
          console.error('Error updating cart item:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        res.json({ message: 'Cart item updated successfully' });
      });
    } else {
      // Item does not exist, insert new
      const insertSql = 'INSERT INTO cart_items (user_id, medicine_id, quantity) VALUES (?, ?, ?)';
      connection.query(insertSql, [userId, medicineId, quantity], (err, results) => {
        if (err) {
          console.error('Error adding cart item:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        res.json({ message: 'Cart item added successfully' });
      });
    }
  });
});

// API endpoint to remove an item from the cart
app.delete('/api/cart/:userId/:medicineId', (req, res) => {
  const { userId, medicineId } = req.params;
  connection.query('DELETE FROM cart_items WHERE user_id = ? AND medicine_id = ?', [userId, medicineId], (err, results) => {
    if (err) {
      console.error('Error removing cart item:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.status(204).end();
  });
});

// API endpoint to update item quantity
app.put('/api/cart', (req, res) => {
  const { userId, medicineId, quantity } = req.body;
  connection.query('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND medicine_id = ?', [quantity, userId, medicineId], (err, results) => {
    if (err) {
      console.error('Error updating cart item:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ message: 'Cart item updated successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
