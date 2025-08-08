import { io } from "socket.io-client";

const socket = io("https://video-call-app-zfdy.onrender.com/", { autoConnect: true });
export default socket;
