import { useState } from "react";
import api from "../api/api";

export default function useResearchTask() {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const startTask = async (query) => {
    setLoading(true);
    setProgress(5);
    setCurrentStep("started");
    setStatusMessage("Initializing background research thread...");
    setLogs(["[INFO] Initiating request to backend research engine..."]);
    setError("");
    setResult(null);

    try {
      // 1. Post to the async endpoint
      const response = await api.post("/research/async", { query });
      const { task_id } = response.data;
      
      setTask(task_id);
      setLogs((prev) => [
        ...prev,
        `[INFO] Task registered on server. Task ID: ${task_id}`,
        `[INFO] Establishing Server-Sent Events (SSE) stream connection...`
      ]);

      // 2. Open EventSource for SSE
      const eventSource = new EventSource(`http://127.0.0.1:5000/api/research/stream/${task_id}`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.progress !== undefined) setProgress(data.progress);
          if (data.step) setCurrentStep(data.step);
          if (data.message) {
            setStatusMessage(data.message);
            
            // Format log prefixes nicely for the terminal log dashboard widget
            let prefix = "[INFO]";
            if (data.status === "failed") prefix = "[ERROR]";
            else if (data.status === "completed") prefix = "[SUCCESS]";
            else if (data.step === "analyze" || data.step === "verify") prefix = "[RESEARCH-AGENT]";
            else if (data.step === "embed" || data.step === "index") prefix = "[VECTOR-STORE]";
            
            setLogs((prev) => [...prev, `${prefix} ${data.message}`]);
          }

          if (data.status === "completed") {
            setResult(data.data);
            setLoading(false);
            eventSource.close();
          } else if (data.status === "failed") {
            setError(data.message || "Research agent execution failed.");
            setLoading(false);
            eventSource.close();
          }
        } catch (parseErr) {
          console.error("Error parsing stream message:", parseErr);
        }
      };

      eventSource.onerror = (err) => {
        console.error("EventSource connection error:", err);
        setError("Connection to research stream was disrupted.");
        setLoading(false);
        eventSource.close();
      };

    } catch (err) {
      console.error("API call failed:", err);
      setError(
        err.response?.data?.message || 
        "Failed to initiate background research job."
      );
      setLoading(false);
    }
  };

  return {
    loading,
    progress,
    currentStep,
    statusMessage,
    logs,
    error,
    result,
    startTask
  };
}
