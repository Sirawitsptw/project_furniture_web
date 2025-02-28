import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {collection, getDocs, doc, deleteDoc, updateDoc} from "firebase/firestore";
import "./list.css"
import Nav from "./Nav";

function Listdata() {
  const [data, setData] = useState([]);
  const handleStatusChange = async (postId, newStatus) => {
    try {
      const postRef = doc(db, "order", postId);
      await updateDoc(postRef, { deliveryStatus: newStatus });
      setData((prevData) =>
        prevData.map((item) =>
          item.id === postId ? { ...item, deliveryStatus: newStatus } : item
        )
      );
    } catch (error) {
      console.error("Error updating deliveryStatus:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "order"));
        const items = [];
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          if (docData.timeOrder && docData.timeOrder.seconds) {
            docData.timeOrder = new Date(
              docData.timeOrder.seconds * 1000
            ).toLocaleString();
          }
          items.push({ id: doc.id, ...docData });
        });
        setData(items);
      } catch (error) {}
    };

    fetchData();
  }, []);

  return (
    <>
      <Nav></Nav>
      <div className="table-container">
        <h1 className="table-heading">รายการคำสั่งซื้อ</h1>

        {data.length > 0 ? (
          <table className="order-table">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>ชื่อลูกค้า</th>
                <th>สินค้า</th>
                <th>ราคา</th>
                <th>ที่อยู่</th>
                <th>การจัดส่ง</th>
                <th>เบอร์โทรศัพท์</th>
                <th>เวลาสั่งซื้อ</th>
                <th>การจัดส่ง</th>
                <th>ชำระเงิน</th>
              </tr>
            </thead>
            <tbody>
              {data.map((post, index) => (
                <tr key={post.id}>
                  <td>{index + 1}</td>{" "}
                  <td>{post.nameCustomer}</td>
                  <td>{post.nameOrderProduct}</td>
                  <td>{post.priceOrder}</td>
                  <td>{post.address}</td>
                  <td>{post.deliveryOption}</td>
                  <td>{post.phone}</td>
                  <td>{post.timeOrder}</td>
                  <td>
                    <select
                      value={post.deliveryStatus}
                      onChange={(e) => handleStatusChange(post.id, e.target.value)} 
                    >
                      <option value="รอดำเนินการ">รอดำเนินการ</option>
                      <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                      <option value="จัดส่งสำเร็จ">จัดส่งแล้ว</option>
                    </select>
                  </td>
                  <td>{post.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No data available</p>
        )}
      </div>
    </>
  );
}

export default Listdata;
