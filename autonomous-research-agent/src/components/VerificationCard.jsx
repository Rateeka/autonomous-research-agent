function VerificationCard({

verification

}){

if(!verification) return null;

return(

<div className="bg-white shadow-lg rounded-xl p-6 mt-8">

<h2 className="text-2xl font-bold">

Verification

</h2>

<div className="mt-5">

<h3>

Reliable :

{

verification.is_reliable ?

" ✅ Yes"

:

" ❌ No"

}

</h3>

{

verification.issues.map((issue,index)=>(

<p

key={index}

className="text-red-500 mt-2"

>

• {issue}

</p>

))

}

</div>

</div>

);

}

export default VerificationCard;