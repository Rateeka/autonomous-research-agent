import {
    Stepper,
    Step,
    StepLabel
} from "@mui/material";

const steps = [

    "Searching",

    "Downloading",

    "Extracting",

    "Chunking",

    "Embedding",

    "AI Analysis",

    "Report"

];

function ProgressTracker({

    activeStep

}){

return(

<div className="bg-white p-6 rounded-xl shadow-lg mt-8">

<h2 className="text-2xl font-bold mb-6">

Research Progress

</h2>

<Stepper

activeStep={activeStep}

alternativeLabel

>

{

steps.map(step=>(

<Step key={step}>

<StepLabel>

{step}

</StepLabel>

</Step>

))

}

</Stepper>

</div>

);

}

export default ProgressTracker;