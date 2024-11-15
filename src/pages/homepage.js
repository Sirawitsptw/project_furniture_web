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
      <div className="px-5 bg-gray-50 min-h-screen">
        <link
          href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
          rel="stylesheet"
        />

        {/* Header Section */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 hover:text-indigo-600 transition-colors duration-300">
            Firestore Data
          </h1>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {data.map((post) => (
            <div
              className="transform hover:scale-105 transition-all duration-300 bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-100"
              key={post.id}
            >
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden rounded-t-xl">
                <img
                  src={post.imageUrl}
                  alt="card-image"
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-5">
                <h6 className="mb-3 text-xl font-semibold text-gray-800 hover:text-indigo-600 transition-colors duration-300">
                  {post.text}
                </h6>
                <p className="text-gray-600 text-sm mb-4">{post.name}</p>
              </div>

              {/* Buttons */}
              <div className="px-5 pb-5 flex gap-3">
                <button
                  className="flex-1 bg-green-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-emerald-600 active:bg-emerald-700 transition-colors duration-300 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="flex-1 bg-red-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors duration-300 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
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
