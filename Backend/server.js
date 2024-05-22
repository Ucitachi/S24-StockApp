const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const Sign = require('./Models/RegistrationSchema');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(64).toString('hex');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // For secure password hashing
const axios=require("axios");

const app = express();
const PORT = process.env.PORT || 5000;


// Connection URI
const uri = 'mongodb://localhost:27017/Sign';

// Connect to MongoDB
mongoose.connect(uri);

// Get the default connection
const db = mongoose.connection;

// Event listener for successful connection
db.on('connected', () => {
    console.log('Connected to MongoDB');
});

// Event listener for connection error
db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Event listener for disconnection
db.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});

// Close MongoDB connection when Node.js process exits
process.on('SIGINT', () => {
    db.close(() => {
        console.log('MongoDB connection disconnected through app termination');
        process.exit(0);
    });
});

// const allowedOrigins = ['http://localhost:3001', 'http://localhost:5173'];
//all cors from 3000
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Register endpoint
app.post('/register', async (req, res) => {
  try {
      const {email, mobile, password, equity} = req.body;
      const virtualMoney=200000;
      console.log(email);
      const newUser = new Sign({ email, mobile, password, virtualMoney});
      await newUser.save();
      console.log("Success");
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Login endpoint
  app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(process.env.secretKey);
        // 1. Find the user by email
        const user = await Sign.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log("called here")
        // 2. Compare the entered password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // 3. Generate a JWT token
            const token = jwt.sign({ id: user.id, username: user.username }, process.env.secretKey, { expiresIn: '1h' });

            // 4. Set the token as a secure cookie
            // console.log("TOKEN ",token)
             res.cookie('token', token, {
                httpOnly: true, 
                secure: false,   
                sameSite: 'Lax', 
                maxAge: 24 * 60 * 60 * 1000 
            });
            res.send(JSON.stringify({token,httpOnly:true,secure:true,sameSite:"strict",maxAge:24 * 60 * 60 * 1000 }));

            // 5. Send a success response
            // res.status(200).json({ message: 'Login successful' }); 
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
  


  // Logout endpoint
app.post('/logout', (req, res) => {
    try {
        res.clearCookie('token'); // Clear the authToken cookie
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


function authenticateToken(req, res, next) {
  const token = req.body.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.secretKey);
    // Attach user details to the request object
    req.user = payload;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.log(error)
    res.status(403).json({ message: 'Invalid token' }); 
  }
}

app.post('/api/buy-stock', authenticateToken, async (req, res) => { 
  try {
    const { stock_name, quantity,isBuy } = req.body;
    console.log("stock",stock_name,quantity,isBuy);
    const user = req.user; // Access user details
    const response = await buySellStock(user, stock_name, quantity, isBuy); 
    console.log("here",response);
    if(response.error ===  'Insufficient stock quantity'){
    console.log("This response");
    res.status(206).json(response);
    }
    else{
      res.status(200).json(response);
    }
  } catch (error) {
    console.log(error)
    // ... error handling 
  }
});

//axios.post('/api/get-stock-values',token);

app.post('/api/get-stock-values',authenticateToken, async (req, res) => {
  const user = req.user;
  try {
    const userdata = await Sign.findById(user.id);
    const stockData = userdata.equity.map(stock => [stock.stock_name, stock.purchased_value]);
    const username =  userdata.email;
    const balance = userdata.virtualMoney;
    // 2. Extract stock names
    if(stockData != []){
    const stockNames = stockData.map(stock => stock[0]); 
    // 3. Fetch current prices
    const currentPrices = await fetchStockPrice(stockNames);
    // 4. Combine data into response
    const response = [];

  for (let i = 0; i < stockData.length; i++) {
    const [stockName, purchasedValue] = stockData[i];
    const currentPrice = currentPrices[stockName];

      response.push({
        stockName,
        purchasedValue,
        currentPrice,
      });
    }
    response.push({ username, balance });

    // console.log(response);
    res.status(200).json(response);
  }
  else{
    res.status(206).json("No Stocks Bought");
  }
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Error fetching stock data' });
  }
});


  async function buySellStock(userDetails, stock_name, quantity, isBuy) {
    try {
      const user = await Sign.findById(userDetails.id);
    //  console.log(user);
      const stock = await fetchStockPrice([stock_name]); // Call your data fetching function
      // console.log(stock);
      const currentPrice = stock[stock_name];
      let totalCost = 0;
      if (isBuy) {
        console.log("Buying");
        totalCost = currentPrice * quantity;

        if (user.virtualMoney < totalCost) {
          throw new Error('Insufficient virtual money');
        }
        user.virtualMoney -= totalCost;
        // console.log("USER",currentPrice)
        const existingHolding = user.equity?.find(holding => holding.stock_name===stock_name);
        if (existingHolding) {
          existingHolding.quantity += quantity;
          // Update averagePrice if tracked
        } else {
          user.equity.push({ 
            stock_name, 
            quantity, 
            purchased_value: currentPrice // Store the purchase price
          });
        }
      } 
      else { // Selling
        console.log("Selling",stock_name);
        const existingHolding = user.equity.find(holding => holding.stock_name===stock_name);
        console.log("user:",existingHolding);
        
        if (!existingHolding || existingHolding.quantity < quantity) {
          throw new Error('Insufficient stock quantity');
        }
        existingHolding.quantity -= quantity;
        totalCost = currentPrice * quantity;
        user.virtualMoney += totalCost;
        // console.log("EXISTING ",existingHolding.quantity)
        if (existingHolding.quantity == 0) {

          user.equity = user.equity.filter(holding => holding.stock_name!==stock_name);
        }
      }

      await user.save();
      return { message: 'Transaction successful' };
    } catch (error) {
      console.log("check");
      return { error: error.message };
    }
  }

  async function fetchStockPrice(stockNames) { // Notice it accepts 'stockNames' now
    if (Array.isArray(stockNames)) {
      // Handle an array of stock names
      const response = await axios.post('http://localhost:3000/stock-price', { stockNames }); 
      return response.data; // Assuming your endpoint returns prices as an object or array
  
    } else {
      // Handle a single stock name
      const response = await axios.post('http://localhost:3000/stock-price', { stock_name: stockNames }); // Modified key
      const price = response.data.message;
      return price;
    }
  }
  

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });