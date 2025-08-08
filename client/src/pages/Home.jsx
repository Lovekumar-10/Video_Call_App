import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

function Home() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!username) return alert("Please enter your name");
    const id = uuidv4();
    navigate(`/room/${id}`, { state: { username } });
  };

  const handleJoinRoom = () => {
    if (!username || !roomId) return alert("Please enter both name and room ID");
    navigate(`/room/${roomId}`, { state: { username } });
  };

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light px-2">
      {/* min-vh-100 for height, bg-light for bg, px-2 for mobile horizontal spacing */}
      <div
        className="card shadow-lg border-0 w-100 p-3 p-md-5 rounded-4"
        style={{
          maxWidth: "410px", // slightly reduced for mobile
          width: "100%",
        }}
      >
        <div className="text-center mb-4">
          <i
            className="bi bi-camera-video-fill mb-2"
            style={{ fontSize: "3rem", color: "#2066fd" }}
          ></i>
          <h1
            className="fw-bold mb-1"
            style={{ fontSize: "2rem", letterSpacing: ".5px" }}
          >
            One on One
          </h1>
          <div className="mb-2 text-muted" style={{ fontSize: "1.1rem" }}>
            Video Meeting App
          </div>
        </div>
        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control form-control-lg"
            id="usernameInput"
            placeholder="Your Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
          />
          <label htmlFor="usernameInput">
            <i className="bi bi-person-fill me-2"></i>Your Name
          </label>
        </div>
        <div className="form-floating mb-4">
          <input
            type="text"
            className="form-control form-control-lg"
            id="roomIdInput"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            autoComplete="off"
          />
          <label htmlFor="roomIdInput">
            <i className="bi bi-door-open-fill me-2"></i>Room ID (or create new)
          </label>
        </div>
        <div className="row gx-2 gy-2">
          {/* Stack buttons vertically on mobile, side by side on md+ */}
          <div className="col-12 col-md-6">
            <button
              className="btn btn-success btn-lg w-100 fw-semibold"
              onClick={handleCreateRoom}
              tabIndex={0}
            >
              <i className="bi bi-plus-circle me-2"></i>Create Room
            </button>
          </div>
          <div className="col-12 col-md-6">
            <button
              className="btn btn-primary btn-lg w-100 fw-semibold"
              onClick={handleJoinRoom}
              tabIndex={0}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
