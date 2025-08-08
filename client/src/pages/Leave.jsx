import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Leave = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const lastRoomId = sessionStorage.getItem("lastRoomId");
    const lastUsername = sessionStorage.getItem("lastUsername");
    console.log("🔁 Last meeting:", lastRoomId, lastUsername);
  }, []);

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light px-3">
      {/* Emoji */}
      <span className="mb-3" > <i
            className="bi bi-camera-video-fill mb-2"
            style={{ fontSize: "4rem", color: "#2066fd" }}
          ></i></span>
      {/* Main message */}
      <h3
        className="fw-bold text-center mb-2"
        style={{ fontSize: "2rem", lineHeight: 1.18 }}
      >
        You have left the meeting.
      </h3>
      <p
        className="text-muted text-center mb-4"
        style={{ fontSize: "1.1rem", maxWidth: 340 }}
      >
        Thank you for choosing us.<br />Let’s connect again soon!
      </p>
      <div className="d-grid gap-2 mb-1 w-100" style={{ maxWidth: 300 }}>
        <button
          className="btn btn-outline-primary btn-lg fw-semibold"
          onClick={() => navigate("/")}
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

export default Leave;
