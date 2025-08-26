import React, { useEffect, useRef, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";

function CodeEditor({ socket, roomId, onCodeChange, onLanguageSelect }) {
  const editorRef = useRef(null);
  const applyingRemoteRef = useRef(false); // prevent feedback loops
  const pendingCodeRef = useRef(null); // Store code before editor mount

  const [language, setLanguage] = useState("javascript");
  const [value, setValue] = useState(CODE_SNIPPETS["javascript"]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    // If code arrived before mount, apply it now
    if (pendingCodeRef.current !== null) {
      editorRef.current.setValue(pendingCodeRef.current);
      pendingCodeRef.current = null;
    }

    if (onCodeChange) {
      onCodeChange(editor.getValue());
    }

    // Local edits → emit to room
    editor.onDidChangeModelContent(() => {
      if (applyingRemoteRef.current) return; // ignore remote-applied changes
      const code = editor.getValue();
      onCodeChange(code);
      if (socket) {
        socket.emit("code-change", { roomId, code });
      }
    });
  };

  // Remote edits → apply to this editor
  useEffect(() => {
    if (!socket) return;

    const onRemoteChange = ({ code }) => {
      // If editor not mounted yet, store for later
      if (!editorRef.current) {
        pendingCodeRef.current = code;
        return;
      }

      if (!editorRef.current || code == null) return;
      const current = editorRef.current.getValue();
      if (code === current) return;

      const model = editorRef.current.getModel();
      if (!model) return;

      applyingRemoteRef.current = true;
      // Replace entire content but keep undo/redo coherent
      editorRef.current.pushUndoStop();
      model.pushEditOperations(
        [],
        [{ range: model.getFullModelRange(), text: code }],
        () => null
      );
      editorRef.current.pushUndoStop();
      applyingRemoteRef.current = false;
      
      if (onCodeChange) {
        onCodeChange(code);
      }
    };

    // Handle sync request from server
    const onSyncRequest = ({ socketId }) => {
      if (editorRef.current) {
        const currentCode = editorRef.current.getValue();
        socket.emit("sync-code", { socketId, code: currentCode });
      }
    };

    // Receive remote language change
    const onLanguageChangeRemote = ({ language }) => {
      setLanguage(language);
      const snippet = CODE_SNIPPETS[language];
      setValue(snippet);
      if (editorRef.current) {
        editorRef.current.setValue(snippet);
      }
    };

    socket.on("code-change", onRemoteChange);
    socket.on("sync-request", onSyncRequest);
    socket.on("language-change", onLanguageChangeRemote);

    return () => {
      socket.off("code-change", onRemoteChange);
      socket.off("sync-request", onSyncRequest);
      socket.off("language-change", onLanguageChangeRemote);
    };
  }, [socket]);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    const snippet = CODE_SNIPPETS[newLanguage];
    setValue(snippet);

    // Update editor immediately
    if (editorRef.current) {
      editorRef.current.setValue(snippet);
    }

    if (socket) {
      socket.emit("language-change", { roomId, language: newLanguage });
    }

    if (onLanguageSelect) {
      onLanguageSelect(newLanguage);
    }
  };

  return (
    <>
      <LanguageSelector
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
      />
      <MonacoEditor
        height="100vh"
        language={language}
        value={value}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </>
  );
}

export default CodeEditor;
