// Debug script to test API providers directly
const https = require('https');
const http = require('http');

// Test Polygon API
function testPolygonAPI() {
  const url = 'https://api.polygon.io/v2/aggs/ticker/SPY/prev?apikey=HezsmKKgW1YfVUBniRnTvz_3c73i8b7x';
  
  console.log('Testing Polygon API...');
  console.log('URL:', url);
  
  https.get(url, (res) => {
    console.log('Polygon Status Code:', res.statusCode);
    console.log('Polygon Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Polygon Response:', data);
      testFinnhubAPI();
    });
  }).on('error', (err) => {
    console.error('Polygon Error:', err.message);
    testFinnhubAPI();
  });
}

// Test Finnhub API
function testFinnhubAPI() {
  const url = 'https://finnhub.io/api/v1/quote?symbol=SPY&token=ctta3f1r01qqhvb03n90ctta3f1r01qqhvb03n9g';
  
  console.log('\nTesting Finnhub API...');
  console.log('URL:', url);
  
  https.get(url, (res) => {
    console.log('Finnhub Status Code:', res.statusCode);
    console.log('Finnhub Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Finnhub Response:', data);
      testFetchAPI();
    });
  }).on('error', (err) => {
    console.error('Finnhub Error:', err.message);
    testFetchAPI();
  });
}

// Test using fetch (like the app does)
function testFetchAPI() {
  console.log('\nTesting with fetch API...');
  
  const testFetch = async () => {
    try {
      const url = 'https://api.polygon.io/v2/aggs/ticker/SPY/prev?apikey=HezsmKKgW1YfVUBniRnTvz_3c73i8b7x';
      console.log('Fetch URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Fetch Status:', response.status);
      console.log('Fetch OK:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetch Response:', JSON.stringify(data, null, 2));
      } else {
        console.log('Fetch Error:', response.statusText);
      }
    } catch (error) {
      console.error('Fetch Exception:', error.message);
      console.error('Fetch Error Type:', error.constructor.name);
      console.error('Fetch Stack:', error.stack);
    }
  };
  
  testFetch();
}

// Start testing
testPolygonAPI();