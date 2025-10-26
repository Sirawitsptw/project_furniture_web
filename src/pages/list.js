import React, { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./list.css";
import Nav from "./Nav";

function Listdata() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("all"); // all | new | shipping | failed | done
  const navigate = useNavigate();

  const handleRowClick = (order) => {
    navigate("/logorder", { state: { order } });
  };

  const handleStatusChange = async (postId, newStatus) => {
    try {
      const currentOrder = data.find((item) => item.id === postId);
      const currentTime = serverTimestamp();

      const newLogEntry = { status: newStatus, time: currentTime };
      const updatedLog = currentOrder.deliveryTimeLog
        ? [...currentOrder.deliveryTimeLog, newLogEntry]
        : [newLogEntry];

      const postRef = doc(db, "order", postId);
      await updateDoc(postRef, {
        deliveryStatus: newStatus,
        deliveryTimeNow: currentTime,
        deliveryTimeLog: updatedLog,
      });

      setData((prevData) =>
        prevData.map((item) =>
          item.id === postId
            ? {
              ...item,
              deliveryStatus: newStatus,
              deliveryTimeNow: currentTime,
              deliveryTimeLog: updatedLog,
            }
            : item
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
        querySnapshot.forEach((d) => {
          const docData = d.data();

          // จัดการเวลาให้ทั้ง "แสดงผล" และ "เรียงลำดับ" ได้
          let timeOrderMs = 0;
          let timeOrderStr = "-";
          if (docData.timeOrder?.seconds) {
            const date = new Date(docData.timeOrder.seconds * 1000);
            timeOrderMs = date.getTime();
            timeOrderStr = date.toLocaleString();
          } else if (typeof docData.timeOrder === "string") {
            const date = new Date(docData.timeOrder);
            if (!isNaN(date)) {
              timeOrderMs = date.getTime();
              timeOrderStr = docData.timeOrder;
            }
          }

          items.push({
            id: d.id,
            ...docData,
            timeOrderMs,
            timeOrderStr,
          });
        });

        // เรียงเวลาล่าสุดขึ้นก่อน
        items.sort((a, b) => (b.timeOrderMs || 0) - (a.timeOrderMs || 0));
        setData(items);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchData();
  }, []);

  // utility
  const normalizeStatus = (s) => s || "รอดำเนินการ";
  const isCompleted = (s) => normalizeStatus(s) === "จัดส่งสำเร็จ" || normalizeStatus(s) === "ลูกค้ารับสินค้าแล้ว";
  const isNewOrder = (s) => normalizeStatus(s) === "รอดำเนินการ";
  const isShipping = (s) => normalizeStatus(s) === "กำลังจัดส่ง";
  const isFailed = (s) => normalizeStatus(s) === "จัดส่งไม่สำเร็จ";

  // นับจำนวนแต่ละหมวดเพื่อโชว์ในปุ่ม
  const counts = useMemo(() => {
    const total = data.length;
    let newCount = 0, shippingCount = 0, failedCount = 0, doneCount = 0;
    for (const it of data) {
      const s = it.deliveryStatus;
      if (isCompleted(s)) doneCount++;
      if (isNewOrder(s)) newCount++;
      if (isShipping(s)) shippingCount++;
      if (isFailed(s)) failedCount++;
    }
    return { total, newCount, shippingCount, failedCount, doneCount };
  }, [data]);

  // กรอง
  const filteredData = useMemo(() => {
    if (filter === "new") return data.filter((it) => isNewOrder(it.deliveryStatus));
    if (filter === "shipping") return data.filter((it) => isShipping(it.deliveryStatus));
    if (filter === "failed") return data.filter((it) => isFailed(it.deliveryStatus));
    if (filter === "done") return data.filter((it) => isCompleted(it.deliveryStatus));
    return data;
  }, [data, filter]);

  // status chip
  const renderStatusChip = (statusRaw) => {
    const s = normalizeStatus(statusRaw);
    const color =
      s === "จัดส่งสำเร็จ" || s === "ลูกค้ารับสินค้าแล้ว"
        ? "bg-green-100 text-green-700 border-green-300"
        : s === "กำลังจัดส่ง"
          ? "bg-blue-100 text-blue-700 border-blue-300"
          : s === "จัดส่งไม่สำเร็จ"
            ? "bg-red-100 text-red-700 border-red-300"
            : "bg-yellow-100 text-yellow-700 border-yellow-300"; // รอดำเนินการ/อื่นๆ
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${color}`}>
        {s}
      </span>
    );
  };

  return (
    <>
      <Nav />
      <div className="table-container">
        <div className="flex items-center justify-between mb-3">
          <h1 className="table-heading">รายการคำสั่งซื้อ</h1>

          {/* ปุ่มกรองแบบ pill */}
          <div className="flex gap-2 flex-wrap">
            <button
              className={`px-3 py-1.5 rounded-full text-sm border transition ${filter === "all"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
              onClick={() => setFilter("all")}
              title="แสดงทั้งหมด"
            >
              ทั้งหมด <span className="opacity-80">({counts.total})</span>
            </button>

            <button
              className={`px-3 py-1.5 rounded-full text-sm border transition ${filter === "new"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
              onClick={() => setFilter("new")}
            >
              รอดำเนินการ <span className="opacity-80">({counts.newCount})</span>
            </button>

            <button
              className={`px-3 py-1.5 rounded-full text-sm border transition ${filter === "shipping"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
              onClick={() => setFilter("shipping")}
              title="คำสั่งซื้อที่กำลังจัดส่ง"
            >
              กำลังจัดส่ง <span className="opacity-80">({counts.shippingCount})</span>
            </button>

            <button
              className={`px-3 py-1.5 rounded-full text-sm border transition ${filter === "failed"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
              onClick={() => setFilter("failed")}
              title="คำสั่งซื้อที่จัดส่งไม่สำเร็จ"
            >
              จัดส่งไม่สำเร็จ <span className="opacity-80">({counts.failedCount})</span>
            </button>

            <button
              className={`px-3 py-1.5 rounded-full text-sm border transition ${filter === "done"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
              onClick={() => setFilter("done")}
              title="ออเดอร์ที่จัดส่งสำเร็จแล้ว"
            >
              เสร็จสิ้น <span className="opacity-80">({counts.doneCount})</span>
            </button>
          </div>
        </div>

        {filteredData.length > 0 ? (
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
                <th>ผู้จัดส่ง</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((post, index) => (
                <tr
                  key={post.id}
                  onClick={() => handleRowClick(post)}
                  style={{ cursor: "pointer" }}
                  className="clickable-row"
                >
                  <td>{index + 1}</td>
                  <td>{post.nameCustomer}</td>
                  <td>{post.nameOrderProduct}</td>
                  <td>{post.priceOrder}</td>
                  <td>{post.address}</td>
                  <td>{post.deliveryOption}</td>
                  <td>{post.phone}</td>
                  <td>{post.timeOrderStr || "-"}</td>
                  <td>{renderStatusChip(post.deliveryStatus)}</td>
                  <td>{post.paymentMethod}</td>
                  <td>{post.paymentStatus}</td>
                  <td>
                    {post.cardNumber
                      ? "**** **** **** " + post.cardNumber.slice(-4)
                      : "-"}
                  </td>
                  <td>{post.nameCard || "-"}</td>
                  <td>{post.expMonth || "-"}</td>
                  <td>{post.expYear || "-"}</td>
                  <td>{post.rider || "-"  }</td>
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
