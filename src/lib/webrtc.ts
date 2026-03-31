/**
 * webrtc.ts — Manages WebRTC peer connections for private room voice chat.
 * Uses the ArenaRoomDurableObject as the WebSocket signaling channel.
 * Actual audio is always peer-to-peer — the server never receives audio.
 */
import { emitWebRTCSignal } from "./socket";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const peers: Map<string, RTCPeerConnection> = new Map();
let localStream: MediaStream | null = null;
let isEnabled = false;

/** Start the microphone and set up event listener for incoming signals */
export async function enableVoice(): Promise<void> {
  if (isEnabled) return;
  isEnabled = true;

  localStream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
    video: false,
  });

  window.addEventListener("webrtc-signal", handleIncomingSignal as EventListener);
  console.log("[WebRTC] Voice enabled, microphone active.");
}

/** Stop mic and close all peer connections */
export function disableVoice(): void {
  isEnabled = false;
  localStream?.getTracks().forEach((t) => t.stop());
  localStream = null;
  peers.forEach((pc) => pc.close());
  peers.clear();
  window.removeEventListener("webrtc-signal", handleIncomingSignal as EventListener);
  console.log("[WebRTC] Voice disabled.");
}

/** Called when a new player joins the room — initiate connection as offerer */
export async function connectToPeer(peerId: string): Promise<void> {
  if (!isEnabled || !localStream) return;
  if (peers.has(peerId)) return;

  const pc = createPeerConnection(peerId);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  emitWebRTCSignal(peerId, { type: "offer", sdp: pc.localDescription });
  console.log("[WebRTC] Offer sent to", peerId);
}

/** Called when a player leaves — clean up their peer connection */
export function disconnectPeer(peerId: string): void {
  const pc = peers.get(peerId);
  if (pc) {
    pc.close();
    peers.delete(peerId);
  }
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function createPeerConnection(peerId: string): RTCPeerConnection {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  peers.set(peerId, pc);

  // Attach local audio tracks
  localStream?.getTracks().forEach((track) => pc.addTrack(track, localStream!));

  // Send ICE candidates through the signaling server
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      emitWebRTCSignal(peerId, { type: "ice-candidate", candidate: event.candidate });
    }
  };

  // Play remote audio when tracks arrive
  pc.ontrack = (event) => {
    console.log("[WebRTC] Remote track received from", peerId);
    const audioEl = document.createElement("audio");
    audioEl.autoplay = true;
    audioEl.srcObject = event.streams[0];
    audioEl.setAttribute("data-peer", peerId);
    document.body.appendChild(audioEl);
  };

  pc.onconnectionstatechange = () => {
    console.log(`[WebRTC] Connection to ${peerId}:`, pc.connectionState);
    if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
      // Remove old audio element
      document.querySelector(`audio[data-peer="${peerId}"]`)?.remove();
      peers.delete(peerId);
    }
  };

  return pc;
}

async function handleIncomingSignal(event: CustomEvent): Promise<void> {
  const { from, signal } = event.detail as {
    from: string;
    signal: { type: string; sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit };
  };

  if (signal.type === "offer") {
    const pc = createPeerConnection(from);
    await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    emitWebRTCSignal(from, { type: "answer", sdp: pc.localDescription });
    console.log("[WebRTC] Answer sent to", from);
  } else if (signal.type === "answer") {
    const pc = peers.get(from);
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!));
  } else if (signal.type === "ice-candidate") {
    const pc = peers.get(from);
    if (pc && signal.candidate) await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
  }
}
