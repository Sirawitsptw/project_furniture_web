import React, { useState, useEffect, useContext } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import "./additem.css";
import Nav from "./Nav";
import { SessionContext } from "../App";

function AddItem() {
  // const { session, setSession } = useContext(SessionContext);
  // console.log(session);
  const [name, setNameProduct] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const [model, setModel] = useState(null);
  const navigate = useNavigate();

  const handleNameChange = (e) => {
    setNameProduct(e.target.value);
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
  };

  const handleDescChange = (e) => {
    setDesc(e.target.value);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleModelChange = (e) => {
    if (e.target.files[0]) {
      setModel(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      /*if (!image) {
        throw new Error("กรุณาเลือกไฟล์ภาพ");
      }*/

      /*if (!model) {
        throw new Error("กรุณาเลือกไฟล์โมเดล 3D");
      }*/

      // อัปโหลดไฟล์รูปภาพ
      const imageRef = ref(storage, `images/${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      // อัปโหลดไฟล์โมเดล 3D
      const modelRef = ref(storage, `models/${model.name}`);
      await uploadBytes(modelRef, model);
      const modelUrl = await getDownloadURL(modelRef);

      // บันทึกข้อมูลใน Firestore
      await addDoc(collection(db, "product"), {
        name: name,
        imageUrl: imageUrl,
        price: price,
        model: modelUrl,
        //timestamp: new Date(),
      });

      setNameProduct("");
      setPrice("");
      setDesc("");
      setImage(null);
      setModel(null);
      alert("อัปโหลดสำเร็จ");
      navigate("/");
    } catch (error) {
      console.error("Error uploading data: ", error);
      alert(`เกิดข้อผิดพลาดในการอัปโหลด: ${error.message}`);
    }
  };

  return (
    <>
      {/* {session.isLoggedIn && <Nav />} */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>ชื่อสินค้า</label>
          <input type="text" value={name} onChange={handleNameChange} />
        </div>

        <div>
          <label>ราคา</label>
          <input type="text" value={price} onChange={handlePriceChange} />
        </div>
        <div>
          <label>คำอธิบายสินค้า</label>
          <input type="text" value={desc} onChange={handleDescChange} />
        </div>
        <div>
          <label>อัปโหลดรูปภาพ :</label>
          <input type="file" accept="image/*" onChange={handleImageChange} /> {}
        </div>
        <div>
          <label>อัปโหลด 3D Model :</label>
          <input type="file" accept=".obj,.glb" onChange={handleModelChange} />
        </div>
        <button type="submit">บันทึก</button>
      </form>
    </>
  );
}

export default AddItem;
