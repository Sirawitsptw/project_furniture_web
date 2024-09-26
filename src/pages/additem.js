import React, { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

function AddItem() {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  //const [model, setModel] = useState(null);  // เพิ่มสถานะสำหรับไฟล์โมเดล 3D
  const navigate = useNavigate();

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  /*const handleModelChange = (e) => {  // เพิ่มการจัดการไฟล์โมเดล
    if (e.target.files[0]) {
      setModel(e.target.files[0]);
    }
  };*/

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

      /*// อัปโหลดไฟล์โมเดล 3D
      const modelRef = ref(storage, `models/${model.name}`);
      await uploadBytes(modelRef, model);
      const modelUrl = await getDownloadURL(modelRef);*/

      // บันทึกข้อมูลใน Firestore
      await addDoc(collection(db, "posts"), {
        text: text,
        imageUrl: imageUrl,
        //modelUrl: modelUrl,  // เก็บ URL ของโมเดล 3D
        timestamp: new Date(),
      });

      setText("");
      setImage(null);
      //setModel(null);
      alert("อัปโหลดสำเร็จ");
      navigate("/HomePage");
    } catch (error) {
      console.error("Error uploading data: ", error);
      alert(`เกิดข้อผิดพลาดในการอัปโหลด: ${error.message}`);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit}>
      <div>
        <label>ชื่อสินค้า</label>
        <input
          type="text"
          placeholder="Product Name"
          value={text}
          onChange={handleTextChange}
        />
      </div>
      <div>
        <label>อัปโหลดรูปภาพ:</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />  {/* เพิ่ม accept เพื่อกรองไฟล์รูปภาพ */}
      </div>
      <button type="submit">บันทึก</button>
    </form>
    
    </>
  );
}

export default AddItem;