import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import socket from "../socket";

const VideoPlayer = forwardRef(({ roomId, isHost }, ref) => {
  const localVideoRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);

  //  Expose controls to parent
  useImperativeHandle(ref, () => ({
    toggleMic: (isOn) => {
      const audioTracks = localStreamRef.current?.getAudioTracks?.();
      if (audioTracks && audioTracks.length > 0) {
        audioTracks[0].enabled = isOn;
      }
    },
    toggleCamera: (isOn) => {
      const videoTracks = localStreamRef.current?.getVideoTracks?.();
      if (videoTracks && videoTracks.length > 0) {
        videoTracks[0].enabled = isOn;
      }
    },
    startScreenShare: async () => {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        const sender = peerConnectionRef.current
          .getSenders()
          .find((s) => s.track.kind === "video");

        if (sender) {
          sender.replaceTrack(screenTrack);

          // Show screen in local preview
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }

          // When screen share stops → switch back to camera
          screenTrack.onended = async () => {
            const camStream = await getLocalStream();
            if (camStream) {
              const camTrack = camStream.getVideoTracks()[0];
              if (sender) sender.replaceTrack(camTrack);
              if (localVideoRef.current) localVideoRef.current.srcObject = camStream;
              localStreamRef.current = camStream;
            }
          };
        }
      } catch (err) {
      }
    }
  }));

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      // console.error("Failed to get local stream:", err);
      return null;
    }
  };

  useEffect(() => {
    const pc = new RTCPeerConnection();
    peerConnectionRef.current = pc;
    socketRef.current = socket;

    const setupMediaAndSocket = async () => {
      const localStream = await getLocalStream();
      if (!localStream) return;

      // Show local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.onloadedmetadata = () => {
          localVideoRef.current.play().catch((err) => {
            // console.warn("⚠️ Local video play error:", err);
          });
        };
      }

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      socket.emit("join-room", roomId);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { candidate: event.candidate, roomId });
        }
      };

      socket.on("ice-candidate", async ({ candidate }) => {
        if (candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            // console.error("❄️ Error adding ice candidate", err);
          }
        }
      });

      socket.on("offer", async ({ sdp }) => {
        if (pc.signalingState !== "stable") {
          // console.warn("⚠️ Ignored offer: Not in stable state");
          return;
        }

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { sdp: pc.localDescription, roomId });
        } catch (err) {
          // console.error("❌ Error during offer handling:", err);
        }
      });

      socket.on("answer", async ({ sdp }) => {
        if (pc.signalingState === "stable") {
          // console.warn("⚠️ Skipping answer: Already stable");
          return;
        }

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        } catch (err) {
          // console.error("❌ Error setting remote answer:", err);
        }
      });

      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setRemoteStreams((prev) => {
          const exists = prev.find((s) => s.id === remoteStream.id);
          return exists ? prev : [...prev, remoteStream];
        });
      };

      socket.on("start-call", async () => {
        if (isHost && pc.signalingState === "stable") {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("offer", { sdp: pc.localDescription, roomId });
          } catch (err) {
            // console.error("❌ Error starting call:", err);
          }
        }
      });
    };

    setupMediaAndSocket();

    return () => {
      // console.log("📴 Cleanup VideoPlayer");
      socket.off("ice-candidate");
      socket.off("offer");
      socket.off("answer");
      socket.off("start-call");

      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (localStreamRef.current)
        localStreamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, [roomId, isHost]);

 
const videoWidth = window.innerWidth <= 768 ? 300 : 480;
const videoHeight = window.innerWidth <= 768 ? 200 : 280;

return (
  <div
    style={{
      display: "flex",
      flexDirection: window.innerWidth <= 768 ? "column" : "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      gap: "16px",
      width: "100%",
      padding: "0px",
      boxSizing: "border-box",
    }}
  >
    {/* LOCAL VIDEO */}
    <div
      className="position-relative border rounded shadow bg-dark overflow-hidden"
      style={{ width: `${videoWidth}px`, height: `${videoHeight}px` }}
    >
      <video
        ref={localVideoRef}
        className="w-100 h-100 object-fit-cover border border-3 border-primary rounded bg-dark"
        autoPlay
        muted
        playsInline
      />
      
    </div>

    {/* REMOTE VIDEOS */}
    {remoteStreams.map((stream, idx) => (
      <video
        key={stream.id || idx}
        className="border border-3 border-warning rounded bg-dark "
        autoPlay
        playsInline
        style={{
          width: `${videoWidth}px`,
          height: `${videoHeight}px`,
          objectFit: "cover",
        }}
        ref={(video) => {
          if (video && stream) {
            video.srcObject = stream;
            video.onloadedmetadata = () => {
              video.play().catch((err) => {
                // console.warn("⚠️ Remote video play error:", err);
              });
            };
          }
        }}
      />
    ))}
  </div>
);

});

export default VideoPlayer;


