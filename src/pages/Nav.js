import React from "react";
import { useUserAuth } from "../context/UserAuthContext";
import { useNavigate, Link } from "react-router-dom";

function Nav() {
  const { logOut, user } = useUserAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <>
      <header>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
          rel="stylesheet"
        />

        <nav className="bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="grid grid-cols-3 items-center">
              {/* Logo / Homepage */}
              <div className="flex items-center">
                <Link
                  to="/home"
                  className="text-white text-2xl font-bold hover:text-blue-200 transition-colors duration-300"
                >
                  Homepage
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="flex justify-center space-x-8">
                <Link
                  to="/Listdata"
                  className="text-white hover:text-blue-200 font-medium transition-colors duration-300 py-2 border-b-2 border-transparent hover:border-blue-200"
                >
                  รายการคำสั่งซื้อ
                </Link>
                <Link
                  to="/AddItem"
                  className="text-white hover:text-blue-200 font-medium transition-colors duration-300 py-2 border-b-2 border-transparent hover:border-blue-200"
                >
                  เพิ่มสินค้า
                </Link>
              </div>

              {/* User Info & Logout */}
              <div className="flex items-center justify-end space-x-4">
                <div className="flex items-center bg-white/10 rounded-full px-4 py-2">
                  <i className="bi bi-person-circle text-2xl text-blue-200 mr-2"></i>
                  <span className="text-blue-100 font-medium truncate max-w-[200px]">
                    {user?.email}
                  </span>
                </div>

                <button
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-left text-xl mr-2"></i>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

export default Nav;
