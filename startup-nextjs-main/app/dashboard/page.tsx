"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { navigate } from './page-server'; 
// import { redirect } from 'next/dist/server/api-utils';
import { useRouter } from 'next/navigation';


const dashboard = () => {
    const [purchasedStocks, setPurchasedStocks] = useState([]);
    const [investedValue, setInvestedValue] = useState(0);
    const [currentValue, setCurrentValue] = useState(0);
    const [totalReturns,setTotalReturns] = useState(0);
    const [bal,setBalance] = useState(0);
    const [user,setUser] = useState('');
    const router = useRouter();
  // useEffect( () => {
    // const fetchStockData = async () => {
  
    //   try {

    //     const token = Cookies.get('token');
    //     console.log(token);
    //     if(!token){
    //       router.push('/signin')
    //     };
      

    //     const stockValuesResponse = await axios.post('http://localhost:5000/api/get-stock-values',{token});
    //     // console.log(stockValuesResponse);
    //     const userInfo = stockValuesResponse.data.pop();  
    //     const username = userInfo.username;
    //     const balance = userInfo.balance;

    //     let invested = 0;
    //     let current = 0;
    //     stockValuesResponse.data.forEach(stock => {
    //       invested += stock.purchasedValue; 
    //       current += stock.currentPrice;
    //     });
      
    //     let returns = current - invested;
      
    //     setPurchasedStocks(stockValuesResponse.data);
    //     setInvestedValue(invested);
    //     setCurrentValue(current);
    //     setTotalReturns(returns);
    //     setUser(username);
    //     setBalance(balance);
    
    //   } catch (error) {
    //     console.error('Error fetching stock data:', error);
    //   }
    // };

    // fetchStockData(); 
  // },[]);



  const fetchStockData = async() => {
  
    try {

      const token = Cookies.get('token');
      // console.log(token);
      if(!token){
        router.push('/signin')
      };
    

      const stockValuesResponse =await axios.post('http://localhost:5000/api/get-stock-values',{token});
      // console.log(stockValuesResponse);
      const userInfo = stockValuesResponse.data.pop();  
      const username = userInfo.username;
      const balance = userInfo.balance * 100;

      let invested = 0;
      let current = 0;
      stockValuesResponse.data.forEach(stock => {
        invested += stock.purchasedValue; 
        current += stock.currentPrice;
      });
    
      let returns = (current - invested)*100;
    
      setPurchasedStocks(stockValuesResponse.data);
      setInvestedValue(invested);
      setCurrentValue(current);
      setTotalReturns(Math.round(returns)/100);
      setUser(username);
      setBalance(Math.round(balance));
  
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  fetchStockData(); 


  const handleSellStock = async (e,index: string) => {
    // e.preventdefault();
    // location.replace(`http://localhost:3001/Sell?stock=${index}`);
    router.push('/Sell');
    // navigate(index);
    // console.log('heyy');
    // redirect(`/Sell?stock=${index}`);
};




  return (
    <section id="contact" className="overflow-hidden py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 lg:w-7/12 xl:w-8/12">
            <div
              className="wow fadeInUp shadow-three dark:bg-gray-dark mb-12 rounded-sm bg-white px-8 py-11 sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]"
              data-wow-delay=".15s
              "
            >
              <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl">
              Hey!! {user}<br/>Ka-ching! Those RETURNS are stacking up like pancakes
              </h2>
              <form>
                <div className="-mx-4 flex flex-wrap">
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-8">
                      <label
                        htmlFor="name"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Invested
                      </label>
                      <p
                        placeholder="Invested"
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      >{investedValue}</p>
                    </div>
                  </div>
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-8">
                      <label
                        htmlFor="email"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Current
                      </label>
                      <p
                        placeholder="Current"
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      >{currentValue}</p>
                    </div>
                  </div>
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-8">
                      <label
                        htmlFor="Total returns"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Total Returns
                      </label>
                      <p
                        placeholder="Invested"
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      >{totalReturns}</p>
                    </div>
                  </div>
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-8">
                      <label
                        htmlFor="email"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Balance
                      </label>
                      <p
                        placeholder="Balance"
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      >{bal}</p>
                    </div>
                  </div>
                  <div className="w-full px-4">
                  <div className="mb-8">
  <label
    htmlFor="stocks-table" // Adjust the 'for' attribute if needed
    className="mb-3 block text-sm font-medium text-dark dark:text-white"
  >
     Your Stocks
  </label>

  {/* Table Structure */}
  <table className="w-full table-auto"> {/* Adjust styling as needed */}
    <thead>
      <tr>
        <th className="px-4 py-2">Stock Name</th>
        <th className="px-4 py-2">Value</th>
        <th className="px-4 py-2">Sell Stocks</th>
      </tr>
    </thead>

    <tbody>
      {/* Map through your purchased stocks */}
      {purchasedStocks.map((stock, index) => (
        <tr key={index}> 
          <td className="px-4 py-2">{stock.stockName}</td>
          <td className="px-4 py-2">{stock.currentPrice}</td>
          <td>
          <button onClick={(e) => handleSellStock(e,stock.stockName)} className="shadow-submit dark:shadow-submit-dark rounded-sm bg-primary px-10 py-3 text-base font-medium text-white duration-300 hover:bg-primary/90">
          Sell Stock
          </button></td>
        </tr>
      ))}
    </tbody>
  </table>

</div>

                  </div>
                  <div className="w-full px-4">
                    {/* <button className="shadow-submit dark:shadow-submit-dark rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90">
                      Submit Ticket
                    </button> */}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default dashboard;
