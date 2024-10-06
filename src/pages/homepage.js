import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "./homepage.css";

function HomePage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "product"));
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
    <>
      <div class="px-5">
        {}
        <link
          href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
          rel="stylesheet"
        ></link>
        <div className="text-center pt-5">
          <h1 class="text-3xl font-bold mb-4">Firestore Data</h1>
        </div>
        <div class="grid grid-cols-4 pl-12 text-center">
          {data.map((post) => (
            <div
              class="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-96 "
              key={post.id}
            >
              <div class="relative h-56 m-2.5 overflow-hidden text-white rounded-md text-center">
                <img src={post.imageUrl} alt="card-image" />
              </div>
              <div class="p-4">
                <h6 class="mb-2 text-slate-800 text-xl font-semibold">
                  {post.text}
                </h6>
                <p class="text-slate-600 leading-normal font-light">
                  The place is close to Barceloneta Beach and bus stop just 2
                  min by walk and near to &quot;Naviglio&quot; where you can
                  enjoy the main night life in Barcelona.
                </p>
              </div>
              <div class="px-4 pb-4 pt-0 mt-2 space-x-2">
                <button
                  class="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-400"
                  type="button"
                >
                  Edit
                </button>
                <button
                  class="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-400"
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default HomePage;
