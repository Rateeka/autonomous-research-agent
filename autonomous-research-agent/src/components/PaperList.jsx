function PaperList({ papers }) {
  return (
    <div className="mt-8">

      <h2 className="text-2xl font-bold mb-4">
        Papers
      </h2>

      {papers.map((paper, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow p-5 mb-4"
        >
          <h3 className="font-semibold">
            {paper.title}
          </h3>

          <p>
            {paper.authors.join(", ")}
          </p>

          <a
            href={paper.pdf_url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600"
          >
            Open PDF
          </a>
        </div>
      ))}

    </div>
  );
}

export default PaperList;