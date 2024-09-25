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
        {data.map(post => ( 
          <li key={post.id}>
            <h2 style ={{color : "#000000"}}>{post.text}</h2>
            <img src={post.imageUrl} alt="Post Image" style={{ width: "200px", height: "auto" }} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;