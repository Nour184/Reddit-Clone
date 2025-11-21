import React from "react";
import "../../styles/login.css";

export default function Login({ setShowLogin }) {
  return (
    <div className="overlay" onClick={() => setShowLogin(false)}>
      <div className="login-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="title">Log In</h2>
        <p className="subtitle">
          By continuing, you agree to our <span>User Agreement</span> and acknowledge the <span>Privacy Policy</span>.
        </p>

        <div className="button-group">
          <button className="login-btn phone">Continue With Phone Number</button>
          <button className="login-btn google">Continue With Google</button>
          <button className="login-btn apple">Continue With Apple</button>
          <button className="login-btn link">Email me a one-time link</button>
        </div>

        <div className="divider">
          <div></div>
          <span>OR</span>
          <div></div>
        </div>

        <form className="form">
            <input type="text" placeholder="Email or username" />
            <input type="password" placeholder="Password" />
            <p className="subtitle1"><span>Forgot password?</span></p>
            <p className="subtitle1">New to reddit? <span>Signup</span></p>
            <button className="submit-btn">Log In</button>
        </form>
      </div>
    </div>
  );
}
