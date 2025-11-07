import React, { useState, useEffect, useContext } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import "./additem.css";
import Nav from "./Nav";
import { SessionContext } from "../App";

function AddItem() {
  const [name, setNameProduct] = useState("");
  const [price, setPrice] = useState(0);
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("");
  const [image, setImage] = useState(null);
  const [model, setModel] = useState(null);
  const [amount, setAmount] = useState(0);
  
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  // const [depth, setDepth] = useState(0);
  // const [longest, setLongest] = useState(0);
  
  const navigate = useNavigate();

  const handleNameChange = (e) => setNameProduct(e.target.value);
  const handlePriceChange = (e) => setPrice(e.target.value);
  const handleDescChange = (e) => setDesc(e.target.value);
  const handleTypeChange = (e) => setType(e.target.value);
  const handleAmountChange = (e) => setAmount(e.target.value);

  const handleWidthChange = (e) => setWidth(e.target.value);
  const handleHeightChange = (e) => setHeight(e.target.value);
  // const handleDepthChange = (e) => setDepth(e.target.value);
  // const handleLongestChange = (e) => setLongest(e.target.value);

  const handleImageChange = (e) => {
    if (e.target.files[0]) setImage(e.target.files[0]);
  };

  const handleModelChange = (e) => {
    if (e.target.files[0]) setModel(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // --- เพิ่มการตรวจสอบ field ใหม่ ---
      if (!image || !model || !name || !price || !desc || !type || !amount) {
        throw new Error("กรุณาใส่ข้อมูลให้ครบถ้วน");
      }

      // อัปโหลดไฟล์รูปภาพ
      const imageRef = ref(storage, `images/${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      // อัปโหลดไฟล์โมเดล 3D
      const modelRef = ref(storage, `models/${model.name}`);
      await uploadBytes(modelRef, model);
      const modelUrl = await getDownloadURL(modelRef);
      
      const amountNum = parseInt(amount);
      const priceNum = parseInt(price);
      const widthNum = parseFloat(width);
      const heightNum = parseFloat(height);
      // const depthNum = parseFloat(depth);
      // const longestNum = parseFloat(longest);

      // บันทึกข้อมูลใน Firestore
      await addDoc(collection(db, "product"), {
        name: name,
        imageUrl: imageUrl,
        price: priceNum,
        model: modelUrl,
        desc: desc,
        type: type,
        amount: amountNum,
        width: widthNum,
        height: heightNum,
        // depth_m: depthNum,
        // longest_dimension_m: longestNum,
      });

      // --- เคลียร์ค่าในฟอร์ม ---
      setNameProduct("");
      setPrice(0);
      setDesc("");
      setType("");
      setImage(null);
      setModel(null);
      setAmount(0);
      // setWidth(0);
      // setHeight(0);
      // setDepth(0);
      // setLongest(0);
      
      alert("อัปโหลดสำเร็จ");
      navigate("/");
    } catch (error) {
      console.error("Error uploading data: ", error);
      alert(`เกิดข้อผิดพลาดในการอัปโหลด: ${error.message}`);
    }
  };

  return (
    <>
      <Nav />
      <form onSubmit={handleSubmit}>
        <div>
          <label>ชื่อสินค้า</label>
          <input type="text" value={name} onChange={handleNameChange} />
        </div>

        <div>
          <label>ราคา</label>
          <input type="number" value={price} onChange={handlePriceChange} />
        </div>
        <div>
          <label>คำอธิบายสินค้า</label>
          <input type="text" value={desc} onChange={handleDescChange} />
        </div>
        <div>
          <label>หมวดหมู่</label>
          <select value={type} onChange={handleTypeChange}>
            <option value="">-- เลือกหมวดหมู่ --</option>
            <option value="โต๊ะ">โต๊ะ</option>
            <option value="ตู้">ตู้</option>
            <option value="เก้าอี้">เก้าอี้</option>
          </select>
        </div>
        <div>
          <label>เพิ่มจำนวนสินค้า</label>
          <input type="number" min="0" value={amount} onChange={handleAmountChange}/>
        </div>

        <div>
          <label>ความกว้าง (หน่วยเมตร)</label>
          <input type="number" step="0.01" min="0" value={width} onChange={handleWidthChange} />
        </div>
        <div>
          <label>ความสูง (หน่วยเมตร)</label>
          <input type="number" step="0.01" min="0" value={height} onChange={handleHeightChange} />
        </div>
        {/* <div>
          <label>ความลึก (เมตร)</label>
          <input type="number" step="0.01" min="0" value={depth} onChange={handleDepthChange} />
        </div>
        <div>
          <label>ด้านที่ยาวที่สุด (เมตร)</label>
          <input type="number" step="0.01" min="0" value={longest} onChange={handleLongestChange} />
        </div> */}
        
        <div>
          <label>อัปโหลดรูปภาพ :</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <div>
          <label>อัปโหลด 3D Model (.glb) :</label>
          <input type="file" accept=".glb" onChange={handleModelChange} />
        </div>
        <button type="submit">บันทึก</button>
      </form>
    </>
  );
}

export default AddItem;