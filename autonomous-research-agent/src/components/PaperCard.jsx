function PaperCard({ paper }) {

    return (

        <div className="bg-white shadow rounded-xl p-5">

            <h2 className="text-xl font-bold">

                {paper.title}

            </h2>

            <p className="mt-3 text-gray-500">

                {paper.authors.join(", ")}

            </p>

            <a

                href={paper.pdf_url}

                target="_blank"

                rel="noreferrer"

                className="inline-block mt-5 bg-blue-600 text-white px-4 py-2 rounded-lg"

            >

                View PDF

            </a>

        </div>

    );

}

export default PaperCard;