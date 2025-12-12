import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import AceEditor from "react-ace";
import "brace/mode/c_cpp"; // for C++
import "brace/mode/python"; // for Python
import "brace/theme/github"; // you can choose another theme

import "./App.css";
import stubs from "./stubs";

function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);

  useEffect(() => {
    setCode(stubs[language]);
  }, [language]);

  useEffect(() => {
    const defaultLang = localStorage.getItem("default-language") || "cpp";
    setLanguage(defaultLang);
  }, []);

  let pollInterval;

  const handleSubmit = async () => {
    const payload = {
      language,
      code,
    };
    try {
      setOutput("");
      setStatus(null);
      setJobId(null);
      setJobDetails(null);
      const { data } = await axios.post("https://online-compiler-backend-deployment.vercel.app/run", payload);
      if (data.jobId) {
        setJobId(data.jobId);
        setStatus("Submitted.");

        pollInterval = setInterval(async () => {
          const { data: statusRes } = await axios.get(
            `https://online-compiler-backend-deployment.vercel.app/status`,
            {
              params: { id: data.jobId },
            }
          );
          const { success, job, error } = statusRes;
          if (success) {
            const { status: jobStatus, output: jobOutput } = job;
            setStatus(jobStatus);
            setJobDetails(job);
            if (jobStatus === "pending") return;
            setOutput(jobOutput);
            clearInterval(pollInterval);
          } else {
            setOutput(error);
            setStatus("error");
            clearInterval(pollInterval);
          }
        }, 1000);
      } else {
        setOutput("Retry again.");
      }
     } catch (error) {
  // Defensive parsing of errors from axios
      let errObj = null;
      if (error && error.response && error.response.data) {
        // Prefer structured payloads returned by the server
        const d = error.response.data;
        // server may return { success:false, error: {...} }
        if (d.error) errObj = d.error;
        else errObj = d;
      } else if (error && error.message) {
        errObj = { message: error.message };
      } else {
        errObj = { message: "Unknown network error" };
      }

      // Prefer stderr when present, otherwise message or details
      const errMsg = errObj.stderr || errObj.message || errObj.details || JSON.stringify(errObj);
      setOutput(String(errMsg));
      setStatus("error");
}
    
  };

  const setDefaultLanguage = () => {
    localStorage.setItem("default-language", language);
  };

  const renderTimeDetails = () => {
    if (!jobDetails) return "";
    let { submittedAt, startedAt, completedAt } = jobDetails;
    let result = `Job Submitted At: ${moment(submittedAt).toString()} `;
    if (!startedAt || !completedAt) return result;
    const diff = moment(completedAt).diff(moment(startedAt), "seconds", true);
    result += `Execution Time: ${diff}s`;
    return result;
  };

  return (
    <div className="App">
      {/* Left side: Code editor */}
      <div className="editor-container">
        <h1>Online Code Compiler</h1>
        
        <label>Language: </label>
        <select
          value={language}
          onChange={(e) => {
            if (window.confirm("Your current code will be lost. Continue?")) {
              setLanguage(e.target.value);
            }
          }}
        >
          <option value="cpp">C++</option>
          <option value="py">Python</option>
        </select>
        
        <button onClick={setDefaultLanguage}>Set Default</button>

        <AceEditor
          mode={language === "cpp" ? "c_cpp" : "python"}
          theme="github"
          value={code}
          onChange={setCode}
          name="code-editor"
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            useWorker: false, // Disable syntax checking for simplicity
          }}
          style={{ width: "100%", height: "100%" }}
        />

        <button onClick={handleSubmit}>Submit</button>

        <p className={`status ${status === "error" ? "error" : "success"}`}>
          {status}
        </p>
      </div>

      {/* Right side: Output */}
      <div className="output-container">
        <h2>Output</h2>
        {jobId && <p>Job ID: {jobId}</p>}
        <p>{renderTimeDetails()}</p>
        <div className="output-box">
          <pre>{output}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;
