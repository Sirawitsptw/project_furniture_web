import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  } from "firebase/firestore";
import { db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import "./homepage.css";
import Nav from "./Nav";

export default function HomePage() {
  const [data, setData] = useState([]);
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );
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
      let updatedData = {
        name: editData.name,
        price: parseInt(editData.price),
        desc: editData.desc,
        type: editData.type,
        amount: parseInt(editData.amount),
        width: parseFloat(editData.width),
        height: parseFloat(editData.height),
        // depth: parseFloat(editData.depth),
        // longest: parseFloat(editData.longest),
      };

      if (editData.img && editData.img instanceof File) {
        const imageRef = ref(storage, `images/${editData.img.name}`);
        await uploadBytes(imageRef, editData.img);
        const imgUrl = await getDownloadURL(imageRef);
        updatedData.imageUrl = imgUrl;
      }

      if (editData.modelFile && editData.modelFile instanceof File) {
        const modelRef = ref(storage, `models/${editData.modelFile.name}`);
        await uploadBytes(modelRef, editData.modelFile);
        const modelUrl = await getDownloadURL(modelRef);
        updatedData.model = modelUrl;
      }

      const itemRef = doc(db, "product", editData.id);
      await updateDoc(itemRef, updatedData);

      setData(
        data.map((item) =>
          item.id === editData.id ? { ...item, ...updatedData } : item
        )
      );
      setIsEditing(false);
      alert("Item updated successfully!");
    } catch (error) {
      console.error("Error updating item: ", error);
      alert(`Error updating item: ${error.message}`);
    }
  };

  const filteredData = selectedCategory
    ? data.filter((item) => item.type === selectedCategory)
    : data;

  return (
    <>
      <Nav></Nav>
      <div className="px-5 bg-gray-50 min-h-screen">
        <link
          href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
          rel="stylesheet"
        />

        <div className="py-8 grid grid-cols-3 items-center">
          <select
            className="w-40 border px-3 py-2 rounded-lg"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">ทั้งหมด</option>
            <option value="โต๊ะ">โต๊ะ</option>
            <option value="ตู้">ตู้</option>
            <option value="เก้าอี้">เก้าอี้</option>
          </select>
          <h1 className="text-4xl font-bold text-gray-800 mb-4 hover:text-indigo-600 transition-colors duration-300 text-center">
            สินค้า
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {filteredData.map((post) => (
            <div
              className="transform hover:scale-105 transition-all duration-300 bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-100"
              key={post.id}
            >
              <div className="relative h-56 overflow-hidden rounded-t-xl">
                <img
                  src={post.imageUrl}
                  alt="card-image"
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-300"
                />
              </div>

              <div className="p-5">
                <p className="text-gray-800 text-xl font-semibold mb-2">{post.name}</p>
                <p className="text-indigo-500 text-lg font-bold">฿{post.price}</p>
                <p className="text-gray-600 text-sm mt-2">จำนวน {post.amount} ชิ้น</p>
              </div>
              <div className="px-5 pb-5 flex gap-3">
                <button
                  className="flex-1 bg-green-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-emerald-600 active:bg-emerald-700 transition-colors duration-300 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
                  type="button"
                  onClick={() => handleEdit(post)}
                >
                  แก้ไข
                </button>
                <button
                  className="flex-1 bg-red-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors duration-300 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  type="button"
                  onClick={() => handleDelete(post.id)}
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
              <div className="p-6 overflow-y-auto flex-1">
                <h2 className="text-2xl font-bold mb-20 text-black">แก้ไขสินค้า</h2>
                <label className="block mb-2 text-black">
                  ชื่อสินค้า:
                  <input type="text" className="w-full border px-3 py-2 rounded-lg" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                </label>
                <label className="block mb-4 text-black">
                  ราคา:
                  <input type="number" className="w-full border px-3 py-2 rounded-lg" value={editData.price} onChange={(e) => setEditData({ ...editData, price: e.target.value })} />
                </label>
                <label className="block mb-4 text-black">
                  คำอธิบายสินค้า:
                  <input type="text" className="w-full border px-3 py-2 rounded-lg" value={editData.desc} onChange={(e) => setEditData({ ...editData, desc: e.target.value })} />
                </label>
                <label className="block mb-4 text-black">
                  หมวดหมู่:
                  <select className="w-full border px-3 py-2 rounded-lg" value={editData.type} onChange={(e) => setEditData({ ...editData, type: e.target.value })}>
                    <option value="โต๊ะ">โต๊ะ</option>
                    <option value="ตู้">ตู้</option>
                    <option value="เก้าอี้">เก้าอี้</option>
                  </select>
                </label>
                <label className="block mb-4 text-black">
                  จำนวนสินค้า:
                  <input type="number" className="w-full border px-3 py-2 rounded-lg bg-gray-200" min={0} value={editData.amount} readOnly />
                </label>

                <label className="block mb-4 text-black">
                  ความกว้าง (หน่วยเมตร):
                  <input type="number" step="0.01" min="0" className="w-full border px-3 py-2 rounded-lg" value={editData.width} onChange={(e) => setEditData({ ...editData, width: e.target.value })}/>
                </label>
                <label className="block mb-4 text-black">
                  ความสูง (หน่วยเมตร):
                  <input type="number" step="0.01" min="0" className="w-full border px-3 py-2 rounded-lg" value={editData.height} onChange={(e) => setEditData({ ...editData, height: e.target.value })}/>
                </label>
                {/* <label className="block mb-4 text-black">
                  ความลึก (เมตร):
                  <input type="number" step="0.01" min="0" className="w-full border px-3 py-2 rounded-lg" value={editData.depth} onChange={(e) => setEditData({ ...editData, depth: e.target.value })}/>
                </label>
                <label className="block mb-4 text-black">
                  ด้านที่ยาวที่สุด (เมตร):
                  <input type="number" step="0.01" min="0" className="w-full border px-3 py-2 rounded-lg" value={editData.longest} onChange={(e) => setEditData({ ...editData, longest: e.target.value })}/>
                </label> */}

                <label className="block mb-4 text-black">
                  อัปโหลดรูปภาพใหม่:
                  <input type="file" accept="image/*" className="w-full border px-3 py-2 rounded-lg" onChange={(e) => handleFileChange(e, "img")} />
                </label>
                <label className="block mb-4 text-black">
                  อัปโหลด 3D Model ใหม่:
                  <input type="file" accept=".glb" className="w-full border px-3 py-2 rounded-lg" onChange={(e) => handleFileChange(e, "modelFile")} />
                </label>
              </div>
              <div className="p-6 pt-0 border-t bg-white flex justify-end gap-3">
                <button className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600" onClick={handleSaveEdit}>
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