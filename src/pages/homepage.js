import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const goToAnotherPage = () => {
    navigate("/AddItem"); // นำทางไปยังเส้นทาง "/another-page"
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "posts"));
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setData(items);
        console.log(items);  // ดูข้อมูลที่ดึงมา
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Firestore Data</h1>
      <button onClick={goToAnotherPage}>Add Product</button>
      <ul>
        {data.length > 0 ? (
          data.map((item) => (
            <li key={item.id}>{item.name}</li> // แสดงข้อมูลในที่นี้
          ))
        ) : (
          <p>No data available</p> // แสดงข้อความหากไม่มีข้อมูล
        )}
      </ul>
    </div>
  );
}

export default HomePage;