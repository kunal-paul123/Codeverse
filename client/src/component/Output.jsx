import React, { useState } from "react";
import { executeCode } from "../api";
import toast from "react-hot-toast";

function Output({ code, language }) {
  const [output, setOutput] = useState(null);
  const [isloading, setIsloading] = useState(false);
  const [iserror, setIserror] = useState(false);

  const runCode = async () => {
    if (!code) return;
    try {
      setIsloading(true);
      const { run } = await executeCode(language, code);
      setOutput(run.output);
      run.stderr ? setIserror(true) : setIserror(false);
    } catch (error) {
      console.error("Execution failed:", error);
      setOutput("Error running code!");
      toast.error(error.message || "Unable to run code");
    } finally {
      setIsloading(false);
    }
  };

  return (
    <div className="d-flex flex-column h-100 bg-dark text-light p-3">
      <button
        onClick={runCode}
        className="btn btn-success mb-3 align-self-start"
      >
        {isloading ? (
          <>
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            Running...
          </>
        ) : (
          "Run Code"
        )}
      </button>

      <div className="border rounded bg-dark p-3 flex-grow-1 overflow-auto">
        <pre className={`m-0 ${iserror ? "text-danger" : "text-light"}`}>
          {output ? output : 'Click "Run Code" to see the output'}
        </pre>
      </div>
    </div>
  );
}

export default Output;
