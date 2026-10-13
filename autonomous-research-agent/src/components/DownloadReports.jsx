function DownloadReports({

reports

}){

if(!reports) return null;

return(

<div className="bg-white shadow-lg rounded-xl p-6 mt-8">

<h2 className="text-2xl font-bold mb-6">

Reports

</h2>

<div className="flex gap-4">

<a

href={reports.pdf}

className="bg-red-600 text-white px-6 py-3 rounded-lg"

>

Download PDF

</a>

<a

href={reports.docx}

className="bg-blue-600 text-white px-6 py-3 rounded-lg"

>

Download DOCX

</a>

<a

href={reports.ppt}

className="bg-green-600 text-white px-6 py-3 rounded-lg"

>

Download PPT

</a>

</div>

</div>

);

}

export default DownloadReports;