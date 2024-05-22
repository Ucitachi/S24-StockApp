"use client";
import { useState, useEffect } from 'react';
import { navigate } from './page-server'; 


function LiveFeed() {
    const [ws, setWs] = useState(null);
    const [data, setData] = useState({}); // Initialize as an empty object
    const [error, setError] = useState(null);

    useEffect(() => {
        const initWebSocket = async () => {
            try {
                const ws = new WebSocket('ws://localhost:3002'); // My WebSocket URL From which i am fetchinf the ltp values
                setWs(ws);

                ws.addEventListener('open', () => {
                    console.log('Connected to WebSocket server');
                });

                ws.addEventListener('message', (event) => {
                    try {
                        const jsonData = JSON.parse(event.data);
                        setData(jsonData);
                    } catch (error) {
                        setError(error);
                        console.error('Error parsing JSON data:', error);
                    }
                });

                ws.addEventListener('error', (error) => {
                    setError(error);
                    console.error('WebSocket error:', error);
                });

                ws.addEventListener('close', () => {
                    console.log('WebSocket connection closed');
                });
            } catch (error) {
                setError(error);
                console.error('Error connecting to WebSocket server:', error);
            }
        };

        initWebSocket();

        return () => {
            // Cleanup logic, e.g., closing the WebSocket connection
            if (ws) {
                ws.close();
            }
        };
    }, []);

    const handleBuyStock = async (index: string) => {
        navigate(index);
    
  };

    if (!Object.keys(data).length) {
        return <p>Loading data...</p>;
    }

    return (
        <section id="features" className="py-16 md:py-20 lg:py-28">
            <table className='table table-bordered text-white' style={{ border: '1px solid white' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid white' }}> Index</th>
                        <th style={{ border: '1px solid white' }}>Value</th>
                        <th style={{ border: '1px solid white' }}>Buy Stock</th> 
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(data).map(([index, value]) => ( 
                        <tr key={index}>
                            <td style={{ border: '1px solid white' }}>{index}</td>
                            <td style={{ border: '1px solid white' }}>{value}</td>
                            <td style = {{ border: '1px solid white ', color: 'white' }}>
                                <button onClick={() => handleBuyStock(index)}>Buy Stock</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}

export default LiveFeed;
