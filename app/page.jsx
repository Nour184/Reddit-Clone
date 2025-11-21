//should contain the Home Feed !!
"use client";

import { useState } from "react";
import Login from "./login/page"
import Navbar from "../components/Navbar"

export default function HomePage() {

  const [showLogin, setShowLogin] = useState(false); //show and hide login form*/

  return (
    <div>
      <Navbar setShowLogin={setShowLogin}></Navbar>
      {showLogin ? <Login setShowLogin={setShowLogin}/> : null} {/*checks for login state to show or hide form*/}
    </div>
  );
}