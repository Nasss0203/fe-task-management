import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;
let socketToken: string | null = null;

const socketUrl =
	process.env.NEXT_PUBLIC_SOCKET_URL ??
	process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v\d+\/?$/, "") ??
	"http://localhost:8080";

const realtimeNamespace = "/realtime";

export const connectRealtimeSocket = (accessToken: string) => {
	if (socket && socketToken === accessToken) {
		if (!socket.connected) {
			socket.connect();
		}

		return socket;
	}

	if (socket) {
		socket.disconnect();
	}

	socketToken = accessToken;
	socket = io(`${socketUrl}${realtimeNamespace}`, {
		transports: ["websocket"],
		auth: {
			token: accessToken,
		},
	});

	socket.on("connect", () => {
		console.log("Socket connected FE:", socket?.id);
	});

	socket.on("connect_error", (error) => {
		console.error("Socket connect error:", error.message);
	});

	socket.on("disconnect", (reason) => {
		console.log("Socket disconnected:", reason);
	});

	return socket;
};

export const getRealtimeSocket = () => socket;

export const disconnectRealtimeSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
	}

	socketToken = null;
};
