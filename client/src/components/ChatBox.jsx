import { useRef, useEffect } from "react";
import { getUserColor } from "../utils/getUserColor";

const ChatBox = ({ name, roomId, messages, setMessages, message, setMessage, socket }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim() === "") return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    socket.emit("send-message", {
      roomId,
      name,
      text: message,
      time,
    });

    setMessage("");
  };

  return (
    <div className="col-md-4 d-flex flex-column border-start p-0">
      
      {/*  Chat Messages Area */}
      <div
        className="flex-grow-1 overflow-auto p-3 bg-white"
        style={{
          height: "100%",
          maxHeight: "490px",
          overflowY: "auto",
          overflowX: "hidden"
        }}
      >
        {messages.map((msg, index) => {
          const isMine = msg.name === name;
          return (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: isMine ? "flex-end" : "flex-start",
                marginBottom: "10px"
              }}
            >
              <div
                style={{
                  backgroundColor: isMine ? "#d1e7dd" : "#f8d7da",
                  color: "#000",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  maxWidth: "75%",
                  wordBreak: "break-word",
                  fontSize: "15px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}
              >
                <div>
                  <strong style={{ color: getUserColor(msg.name), fontSize: "15px" }}>
                    {msg.name}
                  </strong>
                </div>
                <div style={{ marginTop: "3px" }}>{msg.text}</div>
                <div style={{ textAlign: "right", fontSize: "10px", color: "#6c757d", marginTop: "4px" }}>
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/*  Input Box */}
      <div className="p-3 border-top d-flex">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="btn btn-primary" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
