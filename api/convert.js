export default async function handler(req, res) {
  const { from, to, amount } = req.query;

  const API_KEY = process.env.API_KEY;
  
  try {
    const response = await fetch(
      `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${API_KEY}`
    );
    const data = await response.json();
    
    if (data && data.rates) {
      const rates = data.rates;
      
      if (!rates[from] || !rates[to]) {
        return res.status(400).json({ 
          success: false, 
          error: `Unable to get rates for ${from} or ${to}` 
        });
      }

      let result;
      const amtVal = parseFloat(amount);
      
      if (from === 'USD') {
        result = amtVal * parseFloat(rates[to]);
      } else if (to === 'USD') {
        result = amtVal / parseFloat(rates[from]);
      } else {
        const amountInUSD = amtVal / parseFloat(rates[from]);
        result = amountInUSD * parseFloat(rates[to]);
      }
      
      res.status(200).json({ success: true, result });
    } else {
      res.status(500).json({ success: false, error: "Invalid data from API" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch rates" });
  }
}