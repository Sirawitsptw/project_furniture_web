import React, { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import {
  collection, getDocs, doc, serverTimestamp, query, where, runTransaction, Timestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./list.css";
import Nav from "./Nav";

function Listdata() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("new"); // new | shipping | failed | done
  const [riders, setRiders] = useState([]);    // [{id, firstname, ...}]
  const [riderSelect, setRiderSelect] = useState({}); // { [orderId]: riderId }
  const navigate = useNavigate();

  const PICKUP = "รับสินค้าด้วยตนเอง";

  const handleRowClick = (order) => navigate("/logorder", { state: { order } });

  useEffect(() => {
    (async () => {
      const qs = await getDocs(collection(db, "order"));
      const items = [];
      qs.forEach((d) => {
        const x = d.data();
        let timeOrderMs = 0, timeOrderStr = "-";
        if (x.timeOrder?.seconds != null) {
          const dt = new Date(x.timeOrder.seconds * 1000);
          timeOrderMs = dt.getTime(); timeOrderStr = dt.toLocaleString();
        } else if (typeof x.timeOrder === "string") {
          const dt = new Date(x.timeOrder);
          if (!isNaN(dt)) { timeOrderMs = dt.getTime(); timeOrderStr = x.timeOrder; }
        } else if (typeof x.timeOrder === "number") {
          const dt = new Date(x.timeOrder);
          timeOrderMs = dt.getTime(); timeOrderStr = dt.toLocaleString();
        }
        items.push({ id: d.id, ...x, timeOrderMs, timeOrderStr });
      });
      items.sort((a, b) => (b.timeOrderMs || 0) - (a.timeOrderMs || 0));
      setData(items);
    })().catch(console.error);
  }, []);

  useEffect(() => {
    (async () => {
      const qs = await getDocs(query(collection(db, "user"), where("role", "==", "rider")));
      setRiders(qs.docs.map((d) => ({ id: d.id, ...d.data() })));
    })().catch(console.error);
  }, []);

  const status = (s) => s || "รอดำเนินการ";
  const isNew = (s) => status(s) === "รอดำเนินการ";
  const isShipping = (s) => status(s) === "กำลังจัดส่ง";
  const isDone = (s) => ["จัดส่งสำเร็จ", "ลูกค้ารับสินค้าแล้ว"].includes(status(s));
  const isFailed = (s) => status(s) === "จัดส่งไม่สำเร็จ";

  const counts = useMemo(() => {
    let newCount = 0, shippingCount = 0, failedCount = 0, doneCount = 0;
    data.forEach((it) => {
      const s = it.deliveryStatus;
      if (isNew(s)) newCount++;
      else if (isShipping(s)) shippingCount++;
      else if (isFailed(s)) failedCount++;
      else if (isDone(s)) doneCount++;
    });
    return { total: data.length, newCount, shippingCount, failedCount, doneCount };
  }, [data]);

  const filteredData = useMemo(() => {
    if (filter === "new") return data.filter((it) => isNew(it.deliveryStatus));
    if (filter === "shipping") return data.filter((it) => isShipping(it.deliveryStatus));
    if (filter === "failed") return data.filter((it) => isFailed(it.deliveryStatus));
    if (filter === "done") return data.filter((it) => isDone(it.deliveryStatus));
    return data;
  }, [data, filter]);

  const toDate = (v) => {
    if (!v) return null;
    if (typeof v?.toDate === "function") return v.toDate();
    if (v?.seconds != null) return new Date(v.seconds * 1000);
    if (typeof v === "number" || typeof v === "string") {
      const d = new Date(v); return isNaN(d) ? null : d;
    }
    return null;
  };

  // ใช้ค่านี้ทั้งฝั่งคำนวณและบันทึก (หน่วย: นาที)
  const BASE_MINUTES = 60;

  const riderStats = useMemo(() => {
    const stats = {};
    riders.forEach((r) => (stats[r.id] = { active: 0, earliestFinish: null, name: r.firstname || "ไรเดอร์" }));
    data.forEach((o) => {
      if (!isShipping(o.deliveryStatus)) return;
      const rid = o.riderId || riders.find((r) => r.firstname === o.rider)?.id;
      if (!rid) return;
      const st = (stats[rid] ||= { active: 0, earliestFinish: null, name: o.rider || "ไรเดอร์" });
      st.active += 1;
      const start = toDate(o.shippingAt) || (o.timeOrderMs ? new Date(o.timeOrderMs) : null);
      if (start) {
        const est = new Date(start.getTime() + BASE_MINUTES * 60 * 1000);
        if (!st.earliestFinish || est < st.earliestFinish) st.earliestFinish = est;
      }
    });
    return stats;
  }, [data, riders]);

  const sortedRiders = useMemo(() => {
    return [...riders].sort((a, b) => {
      const A = riderStats[a.id] || { active: 0, earliestFinish: null };
      const B = riderStats[b.id] || { active: 0, earliestFinish: null };
      if (A.active !== B.active) return A.active - B.active;
      return (A.earliestFinish?.getTime() || 0) - (B.earliestFinish?.getTime() || 0);
    });
  }, [riders, riderStats]);

  const riderOptionLabel = (r) => {
    const st = riderStats[r.id] || { active: 0, earliestFinish: null };
    const eta = st.earliestFinish
      ? st.earliestFinish.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
      : "พร้อมรับงาน";
    return `${r.firstname} — งาน ${st.active || 0} — ${st.active ? "คาดว่าง " + eta : eta}`;
  };

  // ✅ มอบหมายไรเดอร์: บันทึก shippingAt (server) + etaAt (client) ลง Firestore
  const handleAssignRider = async (orderId) => {
    const riderId = riderSelect[orderId];
    if (!riderId) return alert("กรุณาเลือกไรเดอร์");

    const current = data.find((x) => x.id === orderId);
    if (current?.deliveryOption === PICKUP) {
      return alert("ออเดอร์นี้รับสินค้าด้วยตนเอง ไม่ต้องมอบหมายไรเดอร์");
    }

    const rider = riders.find((r) => r.id === riderId);
    if (!rider) return alert("พบปัญหา: ไรเดอร์ไม่ถูกต้อง");

    try {
      // คำนวณ ETA จากเวลาปัจจุบันฝั่ง client (ต่างจาก server เล็กน้อยได้ แต่พอสำหรับการประมาณ)
      const nowClient = new Date();
      const etaDate = new Date(nowClient.getTime() + BASE_MINUTES * 60 * 1000);
      const etaAt = Timestamp.fromDate(etaDate);

      await runTransaction(db, async (tx) => {
        const ref = doc(db, "order", orderId);
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error("ไม่พบออเดอร์");
        if (status(snap.data().deliveryStatus) !== "รอดำเนินการ")
          throw new Error("ออเดอร์นี้ถูกดำเนินการไปแล้ว");
        if (snap.data().deliveryOption === PICKUP)
          throw new Error("ออเดอร์นี้รับสินค้าด้วยตนเอง ไม่ต้องมอบหมายไรเดอร์");

        tx.update(ref, {
          riderId: rider.id,
          rider: rider.firstname,
          deliveryStatus: "กำลังจัดส่ง",
          shippingAt: serverTimestamp(), // เวลาเริ่มส่ง (ฝั่ง server)
          etaAt,                         // เวลา “คาดว่าจะถึง” (ฝั่ง client)
          etaMinutes: BASE_MINUTES,      // เก็บเป็นเมตาดาต้าเผื่อแก้สูตรภายหลัง
        });
      });

      // อัปเดต UI ให้เห็นทันที
      setData((prev) =>
        prev.map((it) =>
          it.id === orderId
            ? {
                ...it,
                riderId: rider.id,
                rider: rider.firstname,
                deliveryStatus: "กำลังจัดส่ง",
                shippingAt: new Date(),
                etaAt: etaDate,        // เก็บ Date ใน state เพื่อโชว์/ใช้งานต่อได้
                etaMinutes: BASE_MINUTES,
              }
            : it
        )
      );
      setRiderSelect((s) => ({ ...s, [orderId]: "" }));
      alert("มอบหมายไรเดอร์สำเร็จ");
    } catch (e) {
      console.error(e);
      alert(e.message || "มอบหมายไม่สำเร็จ");
    }
  };

  const renderStatusChip = (raw) => {
    const s = status(raw);
    const color =
      s === "จัดส่งสำเร็จ" || s === "ลูกค้ารับสินค้าแล้ว"
        ? "bg-green-100 text-green-700 border-green-300"
        : s === "กำลังจัดส่ง"
        ? "bg-blue-100 text-blue-700 border-blue-300"
        : s === "จัดส่งไม่สำเร็จ"
        ? "bg-red-100 text-red-700 border-red-300"
        : "bg-yellow-100 text-yellow-700 border-yellow-300";
    return <span className={`px-2 py-1 rounded-full text-xs border ${color}`}>{s}</span>;
  };

  return (
    <>
      <Nav />
      <div className="table-container">
        <div className="flex items-center justify-between mb-3">
          <h1 className="table-heading">รายการคำสั่งซื้อ</h1>
          <div className="flex gap-2 flex-wrap">
            <button className={`px-3 py-1.5 rounded-full text-sm border ${filter==="new"?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-700 border-gray-300"}`} onClick={() => setFilter("new")}>
              รอดำเนินการ <span className="opacity-80">({counts.newCount})</span>
            </button>
            <button className={`px-3 py-1.5 rounded-full text-sm border ${filter==="shipping"?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-700 border-gray-300"}`} onClick={() => setFilter("shipping")}>
              กำลังจัดส่ง <span className="opacity-80">({counts.shippingCount})</span>
            </button>
            <button className={`px-3 py-1.5 rounded-full text-sm border ${filter==="failed"?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-700 border-gray-300"}`} onClick={() => setFilter("failed")}>
              จัดส่งไม่สำเร็จ <span className="opacity-80">({counts.failedCount})</span>
            </button>
            <button className={`px-3 py-1.5 rounded-full text-sm border ${filter==="done"?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-700 border-gray-300"}`} onClick={() => setFilter("done")}>
              เสร็จสิ้น <span className="opacity-80">({counts.doneCount})</span>
            </button>
          </div>
        </div>

        {filteredData.length > 0 ? (
          <div className="table-scroll">
            <table className="order-table">
              <thead>
                <tr>
                  <th>ลำดับ</th><th>ชื่อลูกค้า</th><th>สินค้า</th><th>ราคา</th><th>จำนวน</th>
                  <th>ที่อยู่</th><th>จัดส่ง</th><th>เบอร์โทร</th><th>เวลาสั่งซื้อ</th>
                  <th>สถานะจัดส่ง</th><th>วิธีชำระเงิน</th><th>สถานะชำระเงิน</th>
                  <th>เลขบัตร</th><th>ชื่อเจ้าของบัตร</th><th>เดือนหมดอายุ</th><th>ปีหมดอายุ</th>
                  <th>ผู้จัดส่ง</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((post, i) => (
                  <tr key={post.id} onClick={() => handleRowClick(post)} className="clickable-row" style={{ cursor: "pointer" }}>
                    <td>{i + 1}</td>
                    <td>{post.nameCustomer}</td>
                    <td>{post.nameOrderProduct}</td>
                    <td>{post.priceOrder}</td>
                    <td>{post.quantityOrder}</td>
                    <td>{post.address}</td>
                    <td>{post.deliveryOption}</td>
                    <td>{post.phone}</td>
                    <td>{post.timeOrderStr || "-"}</td>
                    <td>{renderStatusChip(post.deliveryStatus)}</td>
                    <td>{post.paymentMethod}</td>
                    <td>{post.paymentStatus}</td>
                    <td>{post.cardNumber ? "**** **** **** " + String(post.cardNumber).slice(-4) : "-"}</td>
                    <td>{post.nameCard || "-"}</td>
                    <td>{post.expMonth || "-"}</td>
                    <td>{post.expYear || "-"}</td>
                    <td>
                      {post.deliveryOption === PICKUP ? (
                        "-"
                      ) : isNew(post.deliveryStatus) ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <select
                            className="border rounded px-2 py-1"
                            value={riderSelect[post.id] || ""}
                            onChange={(e) => setRiderSelect((s) => ({ ...s, [post.id]: e.target.value }))}
                          >
                            <option value="">-- เลือกไรเดอร์ --</option>
                            {sortedRiders.map((r) => (
                              <option key={r.id} value={r.id}>{riderOptionLabel(r)}</option>
                            ))}
                          </select>
                          <button className="px-2 py-1 rounded text-white bg-indigo-600 hover:bg-indigo-700"
                                  onClick={(e) => { e.stopPropagation(); handleAssignRider(post.id); }}>
                            มอบหมาย
                          </button>
                        </div>
                      ) : (post.rider || "-")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (<p>ไม่มีข้อมูลคำสั่งซื้อ</p>)}
      </div>
    </>
  );
}

export default Listdata;
