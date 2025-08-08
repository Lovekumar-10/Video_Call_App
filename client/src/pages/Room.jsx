import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import socket from "../socket";
import ChatBox from "../components/ChatBox";
import VideoPlayer from "../components/VideoPlayer";
import JoinRequestPopup from "../components/JoinRequestPopup";

const Room = () => {

  //  Route and state initialization
  const { roomId } = useParams();
  const location = useLocation();
  const name = location.state?.username || "Guest";
  const navigate = useNavigate();


  // Chat & UI State 
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const videoPlayerRef = useRef(null);
  const [copied, setCopied] = useState(false);




  //  Host and Approval Logic
  const [isHost, setIsHost] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);


  const messagesEndRef = useRef(null);





  // Auto-scroll on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);



  //  Connect and emit join request
  useEffect(() => {
    const handleConnect = () => {
      socket.emit("request-to-join", { roomId, name });
    };

    if (socket.connected) {
      socket.emit("request-to-join", { roomId, name });
    } else {
      socket.once("connect", handleConnect);
    }

      return () => {
      socket.off("connect", handleConnect);
    };

  }, [roomId, name]);




  // 👑 Assign role
 useEffect(() => {
  const handleRoleAssigned = ({ isHost }) => {
    setIsHost(isHost);

    if (isHost) {
      setWaitingApproval(false);
    } else {
      setWaitingApproval(true); // ⏳ Participant shows waiting
    }

  };

  socket.on("role-assigned", handleRoleAssigned);
  return () => socket.off("role-assigned", handleRoleAssigned);
 }, []);





  //  Handle new join requests (host)
  useEffect(() => {
    const handleUserRequested = ({ name, requesterId }) => {
      setPendingRequests((prev) => [...prev, { name, id: requesterId }]);
    };

    socket.on("user-requested", handleUserRequested);
    return () => socket.off("user-requested", handleUserRequested);
  }, []);





  //  Approval handling (participant)
  useEffect(() => {
    const handleApproved = ({ roomId, hostId }) => {
      // console.log(" Approved to join. Room:", roomId, "Host:", hostId);
      setWaitingApproval(false);
    };

    const handleRejected = () => {
      alert(" You were denied access to the meeting.");
      navigate("/leave");
    };

    socket.on("join-approved", handleApproved);
    socket.on("join-rejected", handleRejected);

    return () => {
      socket.off("join-approved", handleApproved);
      socket.off("join-rejected", handleRejected);
    };
  }, [navigate]);




 // 🧑‍🤝‍🧑 Room entry log
 useEffect(() => {
  const handleUserJoined = (data) => {
    console.log("🟢 Another user joined:", data.name);
  };

  const handleSelfJoined = ({ name }) => {
    // console.log(`🎉 You (${name}) officially joined the room.`);
  };

  socket.on("user-joined", handleUserJoined);           // others
  socket.on("join-room-confirmed", handleSelfJoined);   // yourself

  return () => {
    socket.off("user-joined", handleUserJoined);
    socket.off("join-room-confirmed", handleSelfJoined);
  };
 }, []);





  //  Handle user leaving the room
  useEffect(() => {
    const handleUserLeft = ({ name, id }) => {
      // console.log(`👋 ${name} (${id}) left the room.`);
    };

    socket.on("user-left", handleUserLeft);
    return () => socket.off("user-left", handleUserLeft);
  }, []);





  // Host approves or rejects

const handleApprove = (requester) => {
  socket.emit("host-response", {
    roomId,
    requesterId: requester.id,
    approved: true,
  });

  //  Optional: Only start the call when first participant is approved
  socket.emit("start-call", roomId);

  setPendingRequests((prev) => prev.filter((r) => r.id !== requester.id));
 };


  const handleReject = (requester) => {
    socket.emit("host-response", { roomId, requesterId: requester.id, approved: false });
    setPendingRequests((prev) => prev.filter((r) => r.id !== requester.id));
  };




  // Chat sending
  const handleSend = () => {
    if (message.trim() === "") return;
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
    socket.emit("send-message", { roomId, name, text: message, time });
    setMessage("");
  };



  //  Chat message receive listener
 useEffect(() => {
  const handleReceiveMessage = (msg) => {
    setMessages((prevMessages) => [...prevMessages, msg]);
  };

  socket.on("receive-message", handleReceiveMessage);

  return () => {
    socket.off("receive-message", handleReceiveMessage);
  };
 }, []);






  //  UI Rendering
  return (

  <div className=" vh-100 d-flex flex-column">

      {/*  Top Bar */}
        <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <span className="text-warning fw-bold">{name}</span> - Room Id:{" "}
            <span style={{ fontFamily: "monospace" }}>
              {roomId.slice(0, 8)}...
            </span>
            <span
              onClick={() => {
                navigator.clipboard.writeText(roomId);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              style={{
                cursor: "pointer",
                marginLeft: "10px",
                fontSize: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "white",
                color: "#333",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
              >
                <i
                  className={`bi ${copied ? "bi-clipboard-check" : "bi-clipboard"}`}
                  style={{ fontSize: "16px" }}
                ></i>
                {copied ? "Copied" : "Copy"}
              </span> </h5>

              <button className="btn btn-light btn-sm" onClick={() => setShowChat(!showChat)}>
                {showChat ? "Hide Chat" : "Show Chat"}
              </button>
      </div>


      {/*  Main Content */}
      <div className="row flex-grow-1 m-0">
        <div className={showChat ? "col-md-8" : "col-md-12"} style={{ backgroundColor: "#e9ecef" }}>
          <div className="d-flex flex-wrap justify-content-center align-items-center h-100 overflow-auto">
            <div className="m-2">
               <VideoPlayer ref={videoPlayerRef} roomId={roomId} isHost={isHost} socket={socket} />
            </div>

          </div>
        </div>

        {/* Chat Section */}
        {showChat && (
          <ChatBox
            name={name}
            roomId={roomId}
            messages={messages}
            setMessages={setMessages}
            message={message}
            setMessage={setMessage}
            socket={socket}
          />
        )}
      </div>


      {/* Bottom Controls */}
      <div className="bg-light p-3 d-flex justify-content-center gap-3 border-top">
        {/* Mic Toggle */}
     <button
  onClick={() => {
    setIsMicOn((prev) => {
      const newState = !prev;
      videoPlayerRef.current?.toggleMic(newState);
      return newState;
    });
  }}
  title={isMicOn ? "Mute Mic" : "Unmute Mic"}
  style={{
    border: "none",
    borderRadius: "50%",
    width: window.innerWidth <= 768 ? "36px" : "48px",
    height: window.innerWidth <= 768 ? "36px" : "48px",
    fontSize: window.innerWidth <= 768 ? "1rem" : "1.4rem",
    backgroundColor: isMicOn ? "#2f73b8ff" : "#dc3545",
    color: isMicOn ? "#333" : "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
  }}
>
  <i className={`bi ${isMicOn ? "bi-mic-fill" : "bi-mic-mute-fill"}`}></i>
</button>

 
      {/*  Camera Toggle */}
    <button
  onClick={() => {
    setIsCameraOn((prev) => {
      const newState = !prev;
      videoPlayerRef.current?.toggleCamera(newState);
      return newState;
    });
  }}
  title={isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
  style={{
    border: "none",
    borderRadius: "50%",
    width: window.innerWidth <= 768 ? "36px" : "48px",
    height: window.innerWidth <= 768 ? "36px" : "48px",
    fontSize: window.innerWidth <= 768 ? "1rem" : "1.4rem",
    backgroundColor: isCameraOn ? "#1e81e4ff" : "#a8444eff",
    color: isCameraOn ? "#333" : "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
  }}
>
  <i className={`bi ${isCameraOn ? "bi-camera-video-fill" : "bi-camera-video-off-fill"}`}></i>
</button>



     <button
  className={`btn btn-outline-${isScreenSharing ? "danger" : "secondary"}`}
  onClick={() => {
    const newState = !isScreenSharing;
    setIsScreenSharing(newState);
    if (newState) {
      videoPlayerRef.current?.startScreenShare();
    } else {
      console.log(" Screen share turned OFF (UI state only)");
    }
  }}
  style={{
    minWidth: window.innerWidth <= 768 ? "100px" : "130px",
    fontWeight: "bold",
    fontSize: window.innerWidth <= 768 ? "0.8rem" : "1rem",
    borderRadius: "8px",
    padding: "6px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <i className="bi bi-display-fill me-1"></i>
  {isScreenSharing ? "Stop" : "Share"}
</button>


      <button
  className="btn btn-danger"
  onClick={() => {
    socket.disconnect();
    sessionStorage.setItem("lastRoomId", roomId);
    sessionStorage.setItem("lastUsername", name);
    navigate("/leave");
  }}
  style={{
    fontSize: window.innerWidth <= 768 ? "0.85rem" : "1rem",
    padding: window.innerWidth <= 768 ? "6px 10px" : "8px 14px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  }}
>
  <i className="bi bi-box-arrow-right"></i>
  Leave
</button>

      {isHost && pendingRequests.length > 0 && (
        <JoinRequestPopup
          requester={pendingRequests[0]}
          onAccept={handleApprove}
          onReject={handleReject}
        />
      )}
      </div>
    </div>
  );
};

export default Room;






