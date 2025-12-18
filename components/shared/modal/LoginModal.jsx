import { useState, useEffect } from "react";

export default function Modal({ onClose }) {
  const [username, setUsername] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) setLoggedInUser(storedUser);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username) return;
    localStorage.setItem("username", username);
    setLoggedInUser(username);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    setLoggedInUser(null);
  };

  if (loggedInUser) {
    return (
      <div className="p-4 border rounded">
        <p>Logged in as {loggedInUser}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-2 p-4 border rounded">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-1 rounded"
      />
      <button type="submit" className="bg-blue-500 text-white p-1 rounded">Login</button>
      <button type="button" onClick={onClose} className="p-1 mt-1 border rounded">
        Cancel
      </button>
    </form>
  );
}