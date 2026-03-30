const WebSocket = require("ws");

const WS_URL = "ws://localhost:8787/?npcId=test-npc-1";

async function runTest() {
  console.log(`Connecting to ${WS_URL}...`);
  const ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log("Connected to WebSocket edge server.");
    console.log("Sending: Hello there, what are you doing?");
    ws.send("Hello there, what are you doing?");
  });

  ws.on('message', (data, isBinary) => {
    if (isBinary) {
      console.log(`[Audio chunk] Received ${data.length} bytes`);
    } else {
      console.log(`[Text response] ${data.toString()}`);
    }
  });

  ws.on('error', (err) => {
    console.error("WebSocket error:", err);
  });

  ws.on('close', () => {
    console.log("WebSocket closed");
  });

  setTimeout(() => {
    console.log("Closing WebSocket test");
    ws.close();
    process.exit(0);
  }, 15000);
}

runTest();
