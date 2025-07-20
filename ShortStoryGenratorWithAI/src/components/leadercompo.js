import React, { useState, useEffect } from 'react';

export default function Leadercompo() {
  const backendUrl = "http://localhost:5000";
  const [storyData, setData] = useState([]);
  
  useEffect(() => {
    fetch(`${backendUrl}/leaderboard`)
      .then(response => {
        console.log("Response from server:", response);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => {
        setData(data);
        console.log("Data received from server:", data);
      })
      .catch(error => {
        console.error("Error:", error);
      });
  }, []);
  // Use an empty dependency array to run this effect only once on component mount

  return (
    <div>
      {storyData.map((item, index) => (
        <div key={index} className=" leadercompo w-[100%] h-[15vh] rounded-3xl mt-[8%] flex flex-row ">
            <h1 className='text-[500%] left-[5%] absolute font-extrabold text-[white]'>{index+1}</h1>
          <h1 className='text-[300%] left-[20%] absolute font-extrabold text-[white] mt-[20px] '>{item.prompt}</h1>
          <h1 className='text-[350%] right-[5%] absolute font-extrabold text-[#000000] mt-[20px]'>{item.likemetre}/100</h1>
        </div>
      ))}
    </div>
  );
}
