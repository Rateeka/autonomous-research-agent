import { useState } from "react";

function SearchPanel({ onSearch }) {
  const [query, setQuery] = useState("");

  const submit = () => {
    if (!query.trim()) return;

    onSearch(query);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <input
        className="border w-full p-3 rounded-lg"
        placeholder="Enter research topic..."
        value={query}
        onChange={(e) =>
          setQuery(e.target.value)
        }
      />

      <button
        onClick={submit}
        className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        Start Research
      </button>

    </div>
  );
}

export default SearchPanel;