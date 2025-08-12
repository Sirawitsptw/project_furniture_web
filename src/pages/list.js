import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./list.css";
import Nav from "./Nav";

function Listdata() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const handleRowClick = (order) => {
    navigate("/logorder", { state: { order } });
  };

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
          if (docData.timeOrder?.seconds) {
            docData.timeOrder = new Date(
              docData.timeOrder.seconds * 1000
            ).toLocaleString();
          }
          items.push({ id: doc.id, ...docData });
        });
        setData(items);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Nav />
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
                <th>จัดส่ง</th>
                <th>เบอร์โทร</th>
                <th>เวลาสั่งซื้อ</th>
                <th>สถานะจัดส่ง</th>
                <th>วิธีชำระเงิน</th>
                <th>สถานะชำระเงิน</th>
                <th>เลขบัตร</th>
                <th>ชื่อเจ้าของบัตร</th>
                <th>เดือนหมดอายุ</th>
                <th>ปีหมดอายุ</th>
              </tr>
            </thead>
            <tbody>
              {data.map((post, index) => (
                <tr
                  key={post.id}
                  onClick={() => handleRowClick(post)}
                  style={{ cursor: 'pointer' }}
                  className="clickable-row"
                >
                  <td>{index + 1}</td>
                  <td>{post.nameCustomer}</td>
                  <td>{post.nameOrderProduct}</td>
                  <td>{post.priceOrder}</td>
                  <td>{post.address}</td>
                  <td>{post.deliveryOption}</td>
                  <td>{post.phone}</td>
                  <td>{post.timeOrder}</td>
                  <td>{post.deliveryStatus}</td>
                  <td>{post.paymentMethod}</td>
                  <td>{post.paymentStatus}</td>
                  <td>
                    {post.cardNumber
                      ? "**** **** **** " + post.cardNumber.slice(-4)
                      : "-"}
                  </td>
                  <td>{post.nameCardCustomer || "-"}</td>
                  <td>{post.expMonth || "-"}</td>
                  <td>{post.expYear || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>ไม่มีข้อมูลคำสั่งซื้อ</p>
        )}
      </div>
    </>
  );
}

export default Listdata;
