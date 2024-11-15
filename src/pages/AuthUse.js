// import React, { useState, useEffect } from "react";
// import { auth } from "../firebase/config";

// function AuthUse() {
//   const [session, setSession] = useState({
//     isLoggedIn: false,
//     currentUser: null,
//     errorMessage: null,
//   });
//   return (
//     <>
//       {useEffect(() => {
//         const handleAuth = auth.onAuthStateChanged((user) => {
//           if (user) {
//             setSession({
//               isLoggedIn: true,
//               currentUser: user,
//               errorMessage: null,
//             });
//           }
//         });
//         return () => {
//           handleAuth();
//         };
//       }, [])}
//     </>
//   );
// }

// export default AuthUse;
