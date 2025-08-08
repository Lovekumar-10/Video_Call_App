import { io } from "socket.io-client";

const socket = io("https://video-call-app-3a8h.vercel.app/", { autoConnect: true });
export default socket;
