import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;
let socketToken: string | null = null;
let lastConnectErrorMessage: string | null = null;

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
		transports: ["polling", "websocket"],
		reconnectionAttempts: 3,
		reconnectionDelay: 1000,
		reconnectionDelayMax: 5000,
		timeout: 10000,
		auth: {
			token: accessToken,
		},
	});

	socket.on("connect", () => {
		lastConnectErrorMessage = null;
		console.log("Socket connected FE:", socket?.id);
	});

	socket.on("connect_error", (error) => {
		if (lastConnectErrorMessage === error.message) return;

		lastConnectErrorMessage = error.message;
		console.warn("Socket connect error:", error.message);
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
	lastConnectErrorMessage = null;
};
