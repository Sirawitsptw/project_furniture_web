import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Nav from "./Nav";
import "./logorder.css";

function LogOrder() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    navigate("/Listdata");
    return null;
  }

  const handleBackToList = () => {
    navigate("/Listdata");
  };

  return (
    <>
      <Nav />
      <div className="log-container">
        <div className="log-header">
          <h1 className="log-heading">รายละเอียดคำสั่งซื้อ</h1>
          <button onClick={handleBackToList} className="back-button">
            กลับไปรายการคำสั่งซื้อ
          </button>
        </div>

        <div className="order-details">
          <div className="detail-section">
            <h2>ข้อมูลลูกค้า</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <label>ชื่อลูกค้า:</label>
                <span>{order.nameCustomer || "-"}</span>
              </div>
              <div className="detail-item">
                <label>เบอร์โทร:</label>
                <span>{order.phone || "-"}</span>
              </div>
              <div className="detail-item">
                <label>ที่อยู่:</label>
                <span>{order.address || "-"}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2>ข้อมูลสินค้า</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <label>ชื่อสินค้า:</label>
                <span>{order.nameOrderProduct || "-"}</span>
              </div>
              <div className="detail-item">
                <label>ราคา:</label>
                <span>{order.priceOrder || "-"} บาท</span>
              </div>
              <div className="detail-item">
                <label>เวลาสั่งซื้อ:</label>
                <span>{order.timeOrder || "-"}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2>ข้อมูลการจัดส่ง</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <label>วิธีจัดส่ง:</label>
                <span>{order.deliveryOption || "-"}</span>
              </div>
              <div className="detail-item">
                <label>สถานะจัดส่ง:</label>
                <span className={`status ${order.deliveryStatus?.toLowerCase()}`}>
                  {order.deliveryStatus || "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2>ข้อมูลการชำระเงิน</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <label>วิธีชำระเงิน:</label>
                <span>{order.paymentMethod || "-"}</span>
              </div>
              <div className="detail-item">
                <label>สถานะชำระเงิน:</label>
                <span className={`status ${order.paymentStatus?.toLowerCase()}`}>
                  {order.paymentStatus || "-"}
                </span>
              </div>
              {order.cardNumber && (
                <>
                  <div className="detail-item">
                    <label>เลขบัตร:</label>
                    <span>**** **** **** {order.cardNumber.slice(-4)}</span>
                  </div>
                  <div className="detail-item">
                    <label>ชื่อเจ้าของบัตร:</label>
                    <span>{order.nameCardCustomer || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <label>วันหมดอายุ:</label>
                    <span>
                      {order.expMonth || "-"}/{order.expYear || "-"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h2>รหัสคำสั่งซื้อ</h2>
            <div className="order-id">
              <span>{order.id}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LogOrder;
