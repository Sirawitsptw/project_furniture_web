import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

function Listdata() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "order"));
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

    return (
        <div>
            {data.length > 0 ? (
                data.map((post) => (
                    <div>
                        <h3 className="font-bold">{post.nameProductOrder}</h3>
                        <p className="text-lg text-gray-700">${post.priceOrder}</p>      
                    </div>
                ))
            ) : (
                <p>No data available</p>
            )}
        </div>
    );
}

export default Listdata;
