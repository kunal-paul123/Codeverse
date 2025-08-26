import React, { useState, useRef, useEffect } from "react";
import Logo from "/codeverse.png";
import Client from "./Client";
import CodeEditor from "./Editor";
import { initSocket } from "../socket";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Output from "./Output";

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [language, setLanguage] = useState("javascript");
  const [socketReady, setSocketReady] = useState(false);
  const [code, setCode] = useState("");
  const socketRef = useRef(null);
  const codeRef = useRef("");

  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  useEffect(() => {
    const init = async () => {
      const socket = await initSocket();
      socketRef.current = socket;

      const handleError = () => {
        toast.error("Socket connection failed");
        navigate("/");
      };

      socket.on("connect_error", handleError);
      socket.on("connect_failed", handleError);

      socket.emit("join", {
        roomId,
        username: location.state?.username,
      });

      socket.on("joined", ({ clients, username, socketId }) => {
        setClients(clients);

        if (username !== location.state?.username) {
          toast.success(`${username} joined`);
        }

        if (username !== location.state?.username) {
          socket.emit("sync-code", {
            socketId,
            code: codeRef.current || "",
          });
        }
      });

      socket.on("disconnected", ({ socketId, username }) => {
        toast.success(`${username} left`);
        setClients((prev) => prev.filter((c) => c.socketId !== socketId));
      });

      setSocketReady(true);
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect_error");
        socketRef.current.off("connect_failed");
        socketRef.current.off("joined");
        socketRef.current.off("disconnected");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied");
    } catch {
      toast.error("Unable to copy Room ID");
    }
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit("leave-room", { roomId });
      socketRef.current.disconnect();
    }
    navigate("/");
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Sidebar */}
        <div className="col-md-2 bg-dark text-light d-flex flex-column h-100">
          <img
            src={Logo}
            alt="CodeVerse"
            className="img-fluid mx-auto"
            style={{ maxWidth: "130px", marginTop: "10px" }}
          />
          <hr />
          <div className="d-flex flex-column overflow-auto">
            <span className="badge rounded-pill text-bg-primary mb-2 bg-opacity-25">
              {clients && `${clients.length} Online`}
            </span>

            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
          <div className="d-flex flex-column mt-auto">
            <hr />
            <button onClick={copyRoomId} className="btn btn-success">
              Copy Room Id
            </button>
            <button onClick={leaveRoom} className="btn btn-danger mt-2 mb-2">
              Leave Room
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="col-md-10 bg-dark text-light d-flex flex-column h-100">
          {socketReady && (
            <div className="row h-100">
              <div className="col-md-6 d-flex flex-column h-100">
                <CodeEditor
                  socket={socketRef.current}
                  roomId={roomId}
                  onCodeChange={(newCode) => {
                    codeRef.current = newCode;
                    setCode(newCode);
                  }}
                  onLanguageSelect={setLanguage}
                />
              </div>

              <div className="col-md-6 d-flex flex-column h-100">
                <Output code={code} language={language} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
