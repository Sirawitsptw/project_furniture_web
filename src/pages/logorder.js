import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import Nav from "./Nav";
import "./logorder.css";

function LogOrder() {
  const location = useLocation();
  const navigate = useNavigate();

  // ออเดอร์จาก state ก่อน แล้วค่อยเติมข้อมูลล่าสุดจาก Firestore (realtime)
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(true);

  // ถ้าไม่มี order ส่งกลับหน้าก่อนหน้า
  useEffect(() => {
    if (!location.state?.order) {
      navigate(-1);
    }
  }, [location.state?.order, navigate]);

  // subscribe เอกสาร order/{id} แบบ realtime (ไม่มี subcollection แล้ว)
  useEffect(() => {
    const id =
      location.state?.order?.id ||
      location.state?.order?.docId ||
      order?.id;
    if (!id) return;

    const orderRef = doc(db, "order", id);
    const unsub = onSnapshot(
      orderRef,
      (snap) => {
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() });
        }
        setLoading(false);
      },
      (err) => {
        console.error("เกิดข้อผิดพลาดในการอ่านออเดอร์:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [location.state?.order?.id]); // ติดตาม id ที่มาจาก route state

  const handleBack = () => navigate(-1);

  const toDateSafe = (ts) => {
    try {
      if (!ts) return null;
      if (ts.toDate) return ts.toDate();          // Firestore Timestamp
      if (typeof ts === "number") return new Date(ts); // ms epoch
      if (typeof ts === "string") {
        const d = new Date(ts);
        return isNaN(d) ? null : d;
      }
      if (ts.seconds != null) {
        // รูป JSON {seconds, nanoseconds}
        return new Date(ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6));
      }
      return new Date(ts);
    } catch {
      return null;
    }
  };

  const formatLogTime = (timestamp) => {
    const date = toDateSafe(timestamp);
    if (!date) return "-";
    try {
      return date.toLocaleString("th-TH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "รูปแบบเวลาไม่ถูกต้อง";
    }
  };

  const history = useMemo(() => {
    const list = [];
    if (order?.timeOrder) {
      list.push({ time: order.timeOrder, status: "รอดำเนินการ" });
    }
    if (order?.shippingAt) {
      list.push({ time: order.shippingAt, status: "กำลังจัดส่ง" });
    }
    if (order?.deliveredAt) {
      list.push({ time: order.deliveredAt, status: "จัดส่งสำเร็จ" || "ลูกค้ารับสินค้าแล้ว" });
    }
    // เรียงตามเวลา
    list.sort((a, b) => {
      const ta = toDateSafe(a.time)?.getTime() ?? 0;
      const tb = toDateSafe(b.time)?.getTime() ?? 0;
      return ta - tb;
    });
    return list;
  }, [order?.timeOrder, order?.shippingAt, order?.deliveredAt]);

  return (
    <>
      <Nav />
      <div className="log-container">
        <button onClick={handleBack} className="back-btn">
          กลับไปรายการคำสั่งซื้อ
        </button>

        {loading && !order ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : history.length > 0 ? (
          <>
            {/* สรุปสถานะล่าสุดจากเอกสารหลัก */}
            {order?.deliveryStatus && (
              <div className="current-status">
                สถานะปัจจุบัน: <strong>{order.deliveryStatus}</strong>
              </div>
            )}
            {order?.statusChangedAt && (
              <div className="last-updated">
                อัปเดตล่าสุด: <strong>{formatLogTime(order.statusChangedAt)}</strong>
              </div>
            )}

            <ul className="log-history">
              {history.map((log, i) => (
                <li key={i} className="log-item">
                  <div className="log-time">
                    <strong>วันที่ : {formatLogTime(log.time)}</strong>
                  </div>
                  <div className="log-status">
                    สถานะ: {log.status || "ไม่ระบุสถานะ"}
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="no-history">
            <p>ยังไม่มีประวัติการเปลี่ยนแปลงสถานะ</p>
            <p>สถานะจะถูกบันทึกเมื่อมีการอัปเดตจากหน้ารายการคำสั่งซื้อ</p>
          </div>
        )}
      </div>
    </>
  );
}

export default LogOrder;
