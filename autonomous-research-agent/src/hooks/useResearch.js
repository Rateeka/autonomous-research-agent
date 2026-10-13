import { useState } from "react";
import api from "../api/api";

export default function useResearch() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const startResearch = async (query) => {
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/research", {
        query,
      });

      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Research Failed"
      );
    }

    setLoading(false);
  };

  return {
    loading,
    result,
    error,
    startResearch,
  };
}