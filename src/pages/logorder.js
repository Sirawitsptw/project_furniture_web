import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import Nav from "./Nav";
import "./logorder.css";

function LogOrder() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(true);

  const PICKUP = "รับสินค้าด้วยตนเอง";

  // ถ้าไม่มี order ส่งกลับหน้าก่อนหน้า
  useEffect(() => {
    if (!location.state?.order) {
      navigate(-1);
    }
  }, [location.state?.order, navigate]);

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
  }, [location.state?.order?.id]);

  const handleBack = () => navigate(-1);

  const toDateSafe = (ts) => {
    try {
      return !ts ? null : new Date(ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6));
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
    const isPickup = order?.deliveryOption === PICKUP;

    if (order?.timeOrder) {
      list.push({ time: order.timeOrder, status: "รอดำเนินการ" });
    }

    if (!isPickup) {
      if (order?.shippingAt) {
        list.push({ time: order.shippingAt, status: "กำลังจัดส่ง" });
      }
      if (order?.deliveredAt) {
        list.push({ time: order.deliveredAt, status: "จัดส่งสำเร็จ" });
      }
    }

    if (order?.pickUpAt) {
      list.push({ time: order.pickUpAt, status: "ลูกค้ารับสินค้าแล้ว" });
    }

    if (order?.failedAt) {
      list.push({ time: order.failedAt, status: "จัดส่งไม่สำเร็จ" });
    }

    list.sort((a, b) => {
      const ta = toDateSafe(a.time)?.getTime() ?? 0;
      const tb = toDateSafe(b.time)?.getTime() ?? 0;
      return ta - tb;
    });
    return list;
  }, [
    order?.timeOrder,
    order?.shippingAt,
    order?.deliveredAt,
    order?.pickUpAt,
    order?.failedAt,
    order?.deliveryOption,
  ]);

  const displayDeliveryStatus = order?.deliveryStatus || "-";

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
            {displayDeliveryStatus && (
              <div className="current-status">
                สถานะปัจจุบัน: <strong>{displayDeliveryStatus}</strong>
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
