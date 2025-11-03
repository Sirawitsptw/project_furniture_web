import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import { db } from "../firebase";
import {
  collection, getDocs, query, orderBy,
  doc, runTransaction
} from "firebase/firestore";

export default function AddStock() {
  const [allProducts, setAllProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [mode, setMode] = useState("increase"); // "increase" | "decrease"
  const [delta, setDelta] = useState(0);

  // โหลดสินค้าเรียงตามชื่อ
  useEffect(() => {
    const fetch = async () => {
      const qs = await getDocs(query(collection(db, "product"), orderBy("name")));
      const items = [];
      qs.forEach(d => items.push({ id: d.id, ...d.data() }));
      setAllProducts(items);
    };
    fetch();
  }, []);

  // ตั้ง selectedProduct จาก selectedId
  useEffect(() => {
    if (!selectedId) { 
        setSelectedProduct(null); 
        return; 
    }
    const p = allProducts.find(it => it.id === selectedId);
    setSelectedProduct(p || null);
  }, [selectedId, allProducts]);

  const applyAdjust = async () => {
    const n = parseInt(delta, 10);
    if (!selectedProduct) return alert("กรุณาเลือกสินค้า");
    if (!n || n <= 0) return alert("กรุณาใส่จำนวนที่มากกว่า 0");

    const productRef = doc(db, "product", selectedProduct.id);

    try {
      const nextAmount = await runTransaction(db, async (tx) => {
        const snap = await tx.get(productRef);
        if (!snap.exists()) throw new Error("ไม่พบสินค้า");

        const current = parseInt(snap.data().amount || 0, 10);
        const change = (mode === "increase") ? n : -n;
        const next = current + change;

        // กันสต็อกติดลบ
        if (next < 0) throw new Error("สต๊อกติดลบไม่ได้");

        tx.update(productRef, { amount: next });
        return next; // ใช้ sync UI ภายหลัง
      });

      alert("ปรับสต็อกสำเร็จ");

      // sync UI ด้วยค่าจริงจากทรานแซกชัน
      setAllProducts(prev => prev.map(it =>
        it.id === selectedProduct.id ? { ...it, amount: nextAmount } : it
      ));
      setDelta(0);
    } catch (e) {
      console.error(e);
      alert(e.message || "เกิดข้อผิดพลาดในการปรับสต็อก");
    }
  };

  return (
    <>
      <Nav />
      <div className="max-w-3xl mx-auto p-5">
        <h1 className="text-2xl font-bold mb-4">เพิ่ม/ลดสต็อกสินค้า</h1>

        <div className="grid gap-4 mb-6">
          <select
            className="border rounded px-3 py-2"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            <option value="">-- เลือกสินค้า --</option>
            {allProducts.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ▸ ID: {p.id}
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="border rounded-lg p-4 mb-6 bg-white">
            <div className="flex gap-4">
              <img
                src={selectedProduct.imageUrl}
                alt=""
                className="w-28 h-28 object-cover rounded"
              />
              <div>
                <div className="text-lg font-semibold">{selectedProduct.name}</div>
                <div className="text-sm text-gray-600">ประเภท: {selectedProduct.type || "-"}</div>
                <div className="text-sm">ราคา: ฿{selectedProduct.price}</div>
                <div className="text-sm font-semibold mt-1">
                  คงเหลือ: {selectedProduct.amount ?? 0} ชิ้น
                </div>
              </div>
            </div>

            <div className="mt-4 grid md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={mode === "increase"}
                    onChange={() => setMode("increase")}
                  />
                  เพิ่มสต็อก
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={mode === "decrease"}
                    onChange={() => setMode("decrease")}
                  />
                  ลดสต็อก
                </label>
              </div>
              <input
                type="number"
                min={1}
                className="border rounded px-3 py-2"
                placeholder="จำนวนที่เปลี่ยน"
                value={delta}
                onChange={e => setDelta(e.target.value)}
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={applyAdjust}
              >
                บันทึกการปรับสต็อก
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
