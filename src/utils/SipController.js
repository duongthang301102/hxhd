import { UserAgent, Registerer, Inviter, SessionState } from "sip.js";

class SipController {
  constructor() {
    this.userAgent = null;
    this.registerer = null;
    this.session = null;
    this.audioElement = null; 
  }

  // 1. Khởi tạo và Kết nối đến FreePBX
  async connect(config) {
    if (this.userAgent && this.userAgent.state === "Started") return; // Nếu đã kết nối rồi thì thôi

    const uri = UserAgent.makeURI(`sip:${config.extension}@${config.domain}`);
    
    const transportOptions = {
      server: `wss://${config.domain}:${config.port}/ws`, // WSS Server
    };

    this.userAgent = new UserAgent({
      uri: uri,
      transportOptions: transportOptions,
      authorizationUsername: config.extension,
      authorizationPassword: config.password,
      delegate: {
        onConnect: () => {
          console.log("✅ Đã kết nối Socket WSS!");
          this.registerer = new Registerer(this.userAgent);
          this.registerer.register();
        },
        onDisconnect: (error) => {
          console.log("❌ Mất kết nối Socket!", error);
        }
      },
    });

    await this.userAgent.start();
  }

  // 2. Thực hiện cuộc gọi
  async call(targetNumber, domain, audioElement, onStateChange) {
    if (!this.userAgent) throw new Error("Chưa kết nối tổng đài!");
    
    this.audioElement = audioElement;

    // --- BƯỚC SỬA LỖI QUAN TRỌNG ---
    // Tạo URI từ số điện thoại và domain được truyền vào
    const target = UserAgent.makeURI(`sip:${targetNumber}@${domain}`);

    // Kiểm tra ngay: Nếu tạo thất bại (do số sai hoặc thiếu domain) -> Báo lỗi rõ ràng chứ không để crash
    if (!target) {
        throw new Error(`Không thể tạo cuộc gọi. Kiểm tra lại số: "${targetNumber}" hoặc Domain: "${domain}"`);
    }
    // --------------------------------

    // Tạo session (Invite)
    this.session = new Inviter(this.userAgent, target);

    // Lắng nghe trạng thái
    this.session.stateChange.addListener((newState) => {
      console.log("📞 Trạng thái Call:", newState);
      
      switch (newState) {
        case SessionState.Establishing:
          onStateChange("Đang đổ chuông...");
          break;
        case SessionState.Established:
          onStateChange("Đang thoại");
          this._setupRemoteAudio(); // Bật tiếng khi bắt máy
          break;
        case SessionState.Terminated:
          onStateChange("Cuộc gọi kết thúc");
          break;
        default:
          break;
      }
    });

    // Bắt đầu gọi (Chỉ lấy Audio)
    return this.session.invite({
      sessionDescriptionHandlerOptions: {
        constraints: { audio: true, video: false },
      },
    });
  }

  // 3. Xử lý âm thanh
  _setupRemoteAudio() {
    if (!this.session || !this.audioElement) return;

    const remoteStream = new MediaStream();
    const pc = this.session.sessionDescriptionHandler.peerConnection;
    
    pc.getReceivers().forEach((receiver) => {
      if (receiver.track) {
        remoteStream.addTrack(receiver.track);
      }
    });

    this.audioElement.srcObject = remoteStream;
    this.audioElement.play().catch(e => console.error("Lỗi phát audio:", e));
  }

  // 4. Ngắt máy
  hangup() {
    if (this.session) {
      switch (this.session.state) {
        case SessionState.Initial:
        case SessionState.Establishing:
          this.session.cancel();
          break;
        case SessionState.Established:
          this.session.bye();
          break;
      }
    }
  }

  // 5. Mute/Unmute
  toggleMute(isMuted) {
    if (!this.session) return;
    const pc = this.session.sessionDescriptionHandler.peerConnection;
    pc.getSenders().forEach((sender) => {
        if(sender.track) sender.track.enabled = !isMuted;
    });
  }
}

export const sipController = new SipController();