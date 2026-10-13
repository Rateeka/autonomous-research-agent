function AnalysisCard({

analysis

}){

if(!analysis) return null;

return(

<div className="bg-white shadow-lg rounded-xl p-6 mt-8">

<h2 className="text-2xl font-bold mb-6">

AI Analysis

</h2>

<div className="grid grid-cols-2 gap-5">

<div>

<h3 className="font-bold">

Objective

</h3>

<p>

{analysis.objective}

</p>

</div>

<div>

<h3 className="font-bold">

Dataset

</h3>

<p>

{analysis.dataset}

</p>

</div>

<div>

<h3 className="font-bold">

Model

</h3>

<p>

{analysis.model}

</p>

</div>

<div>

<h3 className="font-bold">

Accuracy

</h3>

<p>

{analysis.accuracy}

</p>

</div>

</div>

</div>

);

}

export default AnalysisCard;