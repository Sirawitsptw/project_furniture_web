import React, { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function HomePage() {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!image) {
        throw new Error("กรุณาเลือกไฟล์ภาพ");
      }

      const imageRef = ref(storage, 'images/${image.name}');
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, "posts"), {
        text: text,
        imageUrl: imageUrl,
        timestamp: new Date(),
      });

      setText("");
      setImage(null);
      alert("อัปโหลดสำเร็จ");
    } catch (error) {
      console.error("Error uploading data: ", error);
      alert('เกิดข้อผิดพลาดในการอัปโหลด: ${error.message}');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>ข้อความ:</label>
        <input type="text" value={text} onChange={handleTextChange} />
      </div>
      <div>
        <label>อัปโหลดรูปภาพ:</label>
        <input type="file" onChange={handleImageChange} />
      </div>
      <button type="submit">บันทึก</button>
    </form>
  );
}

export default HomePage;