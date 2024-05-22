//IMPORTANT URL
//https://upstox.com/developer/api-documentation/example-code/login/get-token

//Import required Libraries
const express = require('express');
const axios = require('axios');
var UpstoxClient = require("upstox-js-sdk");
const WebSocket = require("ws").WebSocket;
const protobuf = require("protobufjs");
const cors = require('cors');
const dotenv = require('dotenv');

//Create an express object (express application)
const app = express();
const PORT = 3000;
dotenv.config()

const apiKey = process.env.API_KEY;
const secretKey = process.env.SECRET_KEY;
const redirectUri = 'http://localhost:3000/callback';
let protobufRoot = null;
let defaultClient = UpstoxClient.ApiClient.instance;
let apiVersion = "2.0";
let OAUTH2 = defaultClient.authentications["OAUTH2"];
const ltpValues = {};

//Base URL
//https://api.upstox.com/v2

// Upstox Authorization Endpoint
const upstoxAuthorizationUrl = 'https://api.upstox.com/v2/login/authorization/dialog';
const url1 = "https://api.upstox.com/v2/login/authorization/token"

//Middle-ware checking for right host and parssing data into json object
app.use(cors({
  origin:'http://localhost:3000'
}));
app.use(express.json());

// Redirect user to Upstox authorization page
app.get('/', (req, res) => {
  const upstoxRedirectUrl = `${upstoxAuthorizationUrl}?client_id=d922ff62-5b44-484d-9635-6240665d3133&redirect_uri=${redirectUri}&response_type=code`;
  
  axios.get(upstoxRedirectUrl)
  .then((response) => {
    data = response;
  });
  res.redirect(upstoxRedirectUrl);
  res.end();
});


// Handle callback from Upstox
app.get('/callback', (req, res) => { 

  // Extract authorization code from the callback URL
  const authorizationCode = req.query.code;
  console.log(authorizationCode);

const headers = {
  'accept': 'application/json',
  'Content-Type' : 'application/x-www-form-urlencoded'
};

const body  = {
  'code' : authorizationCode,
  'client_id': apiKey,
  'client_secret' : secretKey,
  'redirect_uri' : "http://localhost:3000/callback",
  'grant_type' : 'authorization_code'
}

const performPostRequest = async () => {
  try {
    const response = await axios.post(url1, new URLSearchParams(body), { headers });
    console.log(response.status);
    var access_token = response.data.access_token; 
     
    OAUTH2.accessToken = access_token; 

    let config = {
      method: 'get',
    maxBodyLength: Infinity,
      url: 'https://api.upstox.com/v2/feed/market-data-feed',
      headers: { 
        'Accept': '*/*',
        'Authorization': `Bearer ${access_token}`}
    };

// Initialize global variables
let protobufRoot = null;
let defaultClient = UpstoxClient.ApiClient.instance;
let apiVersion = "2.0";
OAUTH2.accessToken = access_token; // Replace "ACCESS_TOKEN" with your actual token

// Function to authorize the market data feed
const getMarketFeedUrl = async () => {
  return new Promise((resolve, reject) => {
    let apiInstance = new UpstoxClient.WebsocketApi(); // Create new Websocket API instance

    // Call the getMarketDataFeedAuthorize function from the API
    apiInstance.getMarketDataFeedAuthorize(
      apiVersion,
      (error, data, response) => {
        if (error) reject(error); // If there's an error, reject the promise
        else resolve(data.data.authorizedRedirectUri); // Else, resolve the promise with the authorized URL
      }
    );
  });
};

// Function to establish WebSocket connection
const connectWebSocket = async (wsUrl) => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl, {
      headers: {
        "Api-Version": apiVersion,
        Authorization: "Bearer " + OAUTH2.accessToken,
      },
      followRedirects: true,
    });




    // WebSocket event handlers
    ws.on("open", () => {
      console.log("connected");
      resolve(ws); // Resolve the promise once connected

      // Set a timeout to send a subscription message after 1 second
      setTimeout(() => {
        const data = {
          guid: "someguid",
          method: "sub",
          data: {
            mode: "full",
            // instrumentKeys: ["NSE_INDEX|Nifty Bank", "NSE_INDEX|Nifty 50"],
            instrumentKeys: [
              "NSE_INDEX|Nifty 50",
              "NSE_INDEX|NIFTY50 EQL Wgt",
              "NSE_INDEX|NIFTY100 EQL Wgt",
              "NSE_INDEX|NIFTY100 LowVol30",
              "NSE_INDEX|NIFTY Alpha 50",
              "NSE_INDEX|NIFTY MIDCAP 150",
              "NSE_INDEX|NIFTY SMLCAP 50",
              "NSE_INDEX|NIFTY SMLCAP 250",
              "NSE_INDEX|NIFTY MIDSML 400",
              "NSE_INDEX|NIFTY200 QUALTY30",
              "NSE_INDEX|Nifty FinSrv25 50",
              "NSE_INDEX|NIFTY AlphaLowVol",
              "NSE_INDEX|Nifty200Momentm30",
              "NSE_INDEX|Nifty100ESGSecLdr",
              "NSE_INDEX|NIFTY100 ESG",
              "NSE_INDEX|NIFTY M150 QLTY50",
              "NSE_INDEX|NIFTY INDIA MFG",
              "NSE_INDEX|Nifty200 Alpha 30",
              "NSE_INDEX|NiftyM150Momntm50",
              "NSE_INDEX|Nifty IT",
              "NSE_INDEX|Nifty Next 50",
              "NSE_INDEX|Nifty Bank",
              "NSE_INDEX|NIFTY MIDCAP 100",
              "NSE_INDEX|Nifty 500",
              "NSE_INDEX|Nifty 100",
              "NSE_INDEX|Nifty Midcap 50",
              "NSE_INDEX|Nifty Realty",
              "NSE_INDEX|Nifty Infra",
              "NSE_INDEX|Nifty Energy",
              "NSE_INDEX|Nifty FMCG",
              "NSE_INDEX|Nifty MNC",
              "NSE_INDEX|Nifty Pharma",
              "NSE_INDEX|Nifty PSE",
              "NSE_INDEX|Nifty PSU Bank",
              "NSE_INDEX|Nifty Serv Sector",
              "NSE_INDEX|India VIX",
              "NSE_INDEX|Nifty Auto",
              "NSE_INDEX|Nifty Metal",
              "NSE_INDEX|Nifty Media",
              "NSE_INDEX|NIFTY SMLCAP 100",
              "NSE_INDEX|Nifty 200",
              "NSE_INDEX|Nifty Div Opps 50",
              "NSE_INDEX|Nifty Commodities",
              "NSE_INDEX|Nifty Consumption",
              "NSE_INDEX|Nifty Fin Service",
              "NSE_INDEX|Nifty50 Div Point",
              "NSE_INDEX|Nifty100 Liq 15",
              "NSE_INDEX|Nifty CPSE",
              "NSE_INDEX|Nifty GrowSect 15",
              "NSE_INDEX|Nifty50 PR 2x Lev",
              "NSE_INDEX|Nifty50 PR 1x Inv",
              "NSE_INDEX|Nifty50 TR 2x Lev",
              "NSE_INDEX|Nifty50 TR 1x Inv",
              "NSE_INDEX|Nifty50 Value 20",
              "NSE_INDEX|Nifty Mid Liq 15",
              "NSE_INDEX|Nifty Pvt Bank",
              "NSE_INDEX|NIFTY100 Qualty30",
              "NSE_INDEX|Nifty GS 8 13Yr",
              "NSE_INDEX|Nifty GS 10Yr",
              "NSE_INDEX|Nifty GS 10Yr Cln",
              "NSE_INDEX|Nifty GS 4 8Yr",
              "NSE_INDEX|Nifty GS 11 15Yr",
              "NSE_INDEX|Nifty GS 15YrPlus",
              "NSE_INDEX|Nifty GS Compsite",
              "NSE_INDEX|NIFTY HEALTHCARE",
              "NSE_INDEX|NIFTY CONSR DURBL",
              "NSE_INDEX|NIFTY OIL AND GAS",
              "NSE_INDEX|NIFTY500 MULTICAP",
              "NSE_INDEX|NIFTY LARGEMID250",
              "NSE_INDEX|NIFTY MID SELECT",
              "NSE_INDEX|NIFTY TOTAL MKT",
              "NSE_INDEX|NIFTY MICROCAP250",
              "NSE_INDEX|NIFTY IND DIGITAL"
          ]
          ,
          },
        };
        ws.send(Buffer.from(JSON.stringify(data)));
      }, 1000);
    });

    ws.on("message", (data) => {
      //event occurs once the data is received
      // Assuming data is received as a Buffer, you may need to convert it to a string if necessary
      const jsonData = JSON.stringify(decodeProfobuf(data));

      // Parse JSON data
      const parsedData = JSON.parse(jsonData);
      // Process the data after receiving
      
      for (const stockName in parsedData.feeds) {
        const ltp = parsedData.feeds[stockName].ff.indexFF.ltpc.ltp;
        ltpValues[stockName] = ltp;
        console.log(ltpValues);
      }
    });

    ws.on("close", () => {
      console.log("disconnected");
    });

    ws.on("error", (error) => {
      console.log("error:", error);
      reject(error); // Reject the promise on error
    });
  });
};

// Function to initialize the protobuf part
const initProtobuf = async () => {
  protobufRoot = await protobuf.load(__dirname + "/MarketDataFeed.proto");
  console.log("Protobuf part initialization complete");
};

// Function to decode protobuf message
const decodeProfobuf = (buffer) => {
  if (!protobufRoot) {
    console.warn("Protobuf part not initialized yet!");
    return null;
  }

  const FeedResponse = protobufRoot.lookupType(
    "com.upstox.marketdatafeeder.rpc.proto.FeedResponse"
  );
  return FeedResponse.decode(buffer);
}; 


// Initialize the protobuf part and establish the WebSocket connection
(async () => {
  try {
    await initProtobuf(); // Initialize protobuf
    const wsUrl = await getMarketFeedUrl(); // Get the market feed URL
    // console.log(wsUrl);//websock url
    const ws = await connectWebSocket(wsUrl); // Connect to the WebSocket
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
  
  } catch (error) {
    console.error(error);
  }
};

// Call the asynchronous function
performPostRequest();
res.end();     
});

//My WebSocket Server to send the data from the backend to the frontend
const WebSocket2 = require('ws');
const wss = new WebSocket2.Server({ port: 3002 });

wss.on('connection', 
function connection(wss) {
  // console.log('Client connected');
  wss.send(JSON.stringify(ltpValues));
  wss.on('message', function incoming(message) {
    // console.log('Received message:', message);
  });

  wss.on('close', function() {
    console.log('Client disconnected');
  });
});

app.post('/stock-price', async (req, res) => {
  const { stockNames } = req.body;

  const stockPrices = {};
  stockNames.forEach(stockName => {
    if (ltpValues[stockName]) { // Check if LTP exists
      stockPrices[stockName] = ltpValues[stockName];
    }
  });

  res.status(200).json(stockPrices); // Respond with an object
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});
 