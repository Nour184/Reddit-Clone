import "../styles/navbar.css";


export default function Navbar({ setShowLogin }) {

    return(
        <nav className="navbar">
            <span className="redditLogo">reddit</span>
            <input placeholder="Search Reddit" className="navSearch"></input>
            <button className="loginBtn" onClick={() => setShowLogin(true)}>Log In</button>
        </nav>
    );
}