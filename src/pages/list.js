import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Listdata() {
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
          try {
            const querySnapshot = await getDocs(collection(db, "cart"));
            const items = [];
            querySnapshot.forEach((doc) => {
              items.push({ id: doc.id, ...doc.data() });
            });
            setData(items);
            console.log(items);
          } catch (error) {
            console.error("Error fetching data: ", error);
          }
        };
    
        fetchData();
      }, []);
      
    return(
        <>
            <div class="grid grid-cols-4 pl-12 text-center">
          {data.map((cart) => (
            <div
              class="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-96 "
              key={cart.nameCart}
            >
              <div class="relative h-56 m-2.5 overflow-hidden text-white rounded-md text-center">
                <img src={cart.imageUrl} alt="card-image" />
              </div>
              <div class="p-4">
                <h6 class="mb-2 text-slate-800 text-xl font-semibold">
                  {cart.text}
                </h6>
                <p class="text-slate-600 leading-normal font-light">
                  The place is close to Barceloneta Beach and bus stop just 2
                  min by walk and near to &quot;Naviglio&quot; where you can
                  enjoy the main night life in Barcelona.
                </p>
              </div>
            </div>
          ))}
        </div>
        </>
    );
}
export default Listdata;