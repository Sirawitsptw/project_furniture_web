import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./list.css"; // Assuming you're using an external CSS file for styling
import Nav from "./Nav";

function Listdata() {
  const [data, setData] = useState([]);

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
        console.log(items);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Nav></Nav>
      <div className="table-container">
        {/* Heading for the table */}
        <h1 className="table-heading">รายการคำสั่งซื้อ</h1>

        {data.length > 0 ? (
          <table className="order-table">
            <thead>
              <tr>
                <th>ลำดับ</th> {/* Add a column for the row number */}
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
                  {/* Display the row number (index + 1) */}
                  <td>{post.nameCustomer}</td>
                  <td>{post.nameOrderProduct}</td>
                  <td>{post.priceOrder}</td>
                  <td>{post.address}</td>
                  <td>{post.deliveryOption}</td>
                  <td>{post.phone}</td>
                  <td>{post.timeOrder}</td>
                  <td>
                    <select>
                      <option value="รอการจัดส่ง">รอการจัดส่ง</option>
                      <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                      <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                    </select>
                  </td>
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
