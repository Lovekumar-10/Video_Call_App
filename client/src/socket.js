import { io } from "socket.io-client";

const socket = io("https://videocallbackend-production-02d1.up.railway.app/", { autoConnect: true });
export default socket;
