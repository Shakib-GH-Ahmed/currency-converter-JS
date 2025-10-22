
const API_KEY = '835f520ca08f438cb16682f91b7513bb';
const BASE_URL = 'https://api.currencyfreaks.com/v2.0/rates/latest';

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");
const swapBtn = document.querySelector(".dropdown i");

for (let select of dropdowns) {
  for (let currCode in countryList) {
    let newOption = document.createElement("option");
    newOption.innerText = currCode;
    newOption.value = currCode;
    if (select.name === "from" && currCode === "USD") {
      newOption.selected = "selected";
    } else if (select.name === "to" && currCode === "BDT") {
      newOption.selected = "selected";
    }
    select.append(newOption);
  }
  select.addEventListener("change", (evt) => {
    updateFlag(evt.target);
  });
}

const updateFlag = (element) => {
  let currCode = element.value;
  let countryCode = countryList[currCode];
  let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
  let img = element.parentElement.querySelector("img");
  img.src = newSrc;
};

const swapCurrencies = () => {
  // Get current values
  const fromValue = fromCurr.value;
  const toValue = toCurr.value;
  
  fromCurr.value = toValue;
  toCurr.value = fromValue;

  updateFlag(fromCurr);
  updateFlag(toCurr);
  
  updateExchangeRate();
};

const updateExchangeRate = async () => {
  let amountInput = document.querySelector(".amount input");
  let amtVal = parseFloat(amountInput.value);
  
  if (isNaN(amtVal) || amtVal < 1) {
    amtVal = 1;
    amountInput.value = "1";
  }
  
  const from = fromCurr.value;
  const to = toCurr.value;
  
  if (from === to) {
    msg.innerText = `${amtVal} ${from} = ${amtVal} ${to}`;
    return;
  }
  
  msg.innerText = "Getting exchange rate...";
  
  try {
    const url = `${BASE_URL}?apikey=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.rates) {
      const rates = data.rates;

      if (!rates[from] || !rates[to]) {
        msg.innerText = `Error: Unable to get rates for ${from} or ${to}.`;
        return;
      }

      let result;
      if (from === 'USD') {
        result = amtVal * parseFloat(rates[to]);
      } else if (to === 'USD') {
        result = amtVal / parseFloat(rates[from]);
      } else {
        const amountInUSD = amtVal / parseFloat(rates[from]);
        result = amountInUSD * parseFloat(rates[to]);
      }
         
      msg.innerText = `${amtVal} ${from} = ${result.toFixed(2)} ${to}`;
      
    } else {
      msg.innerText = "Error: Invalid data received from API.";
    }
  } catch (err) {
    console.error("API fetch error:", err);
    msg.innerText = "Failed to fetch exchange rates. Please check your API key and connection.";
  }
};

swapBtn.addEventListener("click", (evt) => {
  evt.preventDefault();
  swapCurrencies();
});

btn.addEventListener("click", (evt) => {
  evt.preventDefault();
  updateExchangeRate();
});

window.addEventListener("load", updateExchangeRate);