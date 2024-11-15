import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase"; // Assuming you have firebase storage setup
import "./homepage.css";

function HomePage() {
  const [data, setData] = useState([]);
  const [editData, setEditData] = useState(null); // For editing
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "product"));
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setData(items);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "product", id));
        setData(data.filter((item) => item.id !== id));
        alert("Item deleted successfully!");
      } catch (error) {
        console.error("Error deleting item: ", error);
      }
    }
  };

  const handleEdit = (item) => {
    setEditData(item);
    setIsEditing(true);
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setEditData({ ...editData, [field]: file });
    }
  };

  const handleSaveEdit = async () => {
    try {
      let updatedData = { name: editData.name, price: editData.price, desc: editData.desc, model: editData.model };

      // If a new image is selected, upload it to Firebase Storage
      if (editData.img) {
        const imageRef = ref(storage, `products/${editData.img.name}`);
        await uploadBytes(imageRef, editData.img);
        const imgUrl = await getDownloadURL(imageRef);
        updatedData.img = imgUrl; // Store the image URL in Firestore
      }

      // If a new 3D model is selected, upload it to Firebase Storage
      if (editData.modelFile) {
        const modelRef = ref(storage, `products/${editData.modelFile.name}`);
        await uploadBytes(modelRef, editData.modelFile);
        const modelUrl = await getDownloadURL(modelRef);
        updatedData.model = modelUrl; // Store the model URL in Firestore
      }

      // Update the Firestore document
      const itemRef = doc(db, "product", editData.id);
      await updateDoc(itemRef, updatedData);
      setData(data.map((item) => (item.id === editData.id ? { ...item, ...updatedData } : item)));
      setIsEditing(false);
      alert("Item updated successfully!");
    } catch (error) {
      console.error("Error updating item: ", error);
    }
  };

  return (
    <>
      <div className="px-5 bg-gray-50 min-h-screen">
        <link
          href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
          rel="stylesheet"
        />

        {/* Header Section */}
        <div className="py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 hover:text-indigo-600 transition-colors duration-300">
            สินค้า
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
                  onClick={() => handleEdit(post)}
                >
                  Edit
                </button>
                <button
                  className="flex-1 bg-red-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors duration-300 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  type="button"
                  onClick={() => handleDelete(post.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">แก้ไขสินค้า</h2>
              <label className="block mb-2">
                ชื่อสินค้า:
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </label>
              <label className="block mb-4">
                ราคา:
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg"
                  value={editData.price}
                  onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                />
              </label>
              <label className="block mb-4">
                คำอธิบายสินค้า:
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg"
                  value={editData.desc}
                  onChange={(e) => setEditData({ ...editData, desc: e.target.value })}
                />
              </label>
              <label className="block mb-4">
                รูปภาพสินค้า:
                <input
                  type="file"
                  className="w-full border px-3 py-2 rounded-lg"
                  onChange={(e) => handleFileChange(e, 'img')}
                />
              </label>
              <label className="block mb-4">
                3D Model:
                <input
                  type="file"
                  className="w-full border px-3 py-2 rounded-lg"
                  onChange={(e) => handleFileChange(e, 'modelFile')}
                />
              </label>
              <div className="flex justify-end gap-3">
                <button
                  className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600"
                  onClick={handleSaveEdit}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default HomePage;
