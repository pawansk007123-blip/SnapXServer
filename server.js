const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({
    port: PORT,
    host: "0.0.0.0"
});

const clients = new Map();

console.log(`SnapX signaling server started on port ${PORT}`);

wss.on("connection", (ws) => {

    let clientId = null;

    ws.on("message", (data) => {

        try {
            const message = JSON.parse(data.toString());

            if (message.type === "register") {

                clientId = message.id;
                clients.set(clientId, ws);

                console.log("Connected:", clientId);

                ws.send(JSON.stringify({
                    type: "registered",
                    id: clientId
                }));

                return;
            }

            if (message.to && clients.has(message.to)) {

                const target = clients.get(message.to);

                target.send(JSON.stringify({
                    ...message,
                    from: clientId
                }));
            }

        } catch (error) {
            console.log("Invalid message:", error.message);
        }
    });

    ws.on("close", () => {

        if (clientId) {
            clients.delete(clientId);
            console.log("Disconnected:", clientId);
        }
    });
});
