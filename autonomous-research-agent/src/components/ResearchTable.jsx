function ResearchTable() {

const data=[

{

topic:"Plant Disease Detection",

papers:25,

status:"Completed"

},

{

topic:"Medical Image Classification",

papers:12,

status:"Running"

}

];

return(

<div className="bg-white rounded-xl shadow-lg p-6 mt-8">

<h2 className="text-2xl font-bold mb-6">

Recent Research

</h2>

<table className="w-full">

<thead>

<tr className="border-b">

<th className="text-left py-3">

Topic

</th>

<th>

Papers

</th>

<th>

Status

</th>

</tr>

</thead>

<tbody>

{

data.map((item,index)=>(

<tr key={index} className="border-b">

<td className="py-4">

{item.topic}

</td>

<td className="text-center">

{item.papers}

</td>

<td className="text-center">

<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">

{item.status}

</span>

</td>

</tr>

))

}

</tbody>

</table>

</div>

);

}

export default ResearchTable;