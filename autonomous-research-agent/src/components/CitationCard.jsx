function CitationCard({

citations

}){

if(!citations) return null;

return(

<div className="bg-white shadow-lg rounded-xl p-6 mt-8">

<h2 className="text-2xl font-bold mb-5">

APA Citations

</h2>

{

citations.map((citation,index)=>(

<p

key={index}

className="border-b py-3"

>

{citation}

</p>

))

}

</div>

);

}

export default CitationCard;