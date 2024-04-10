// inputs DOM elements

const homeValue = document.getElementById('homeValue');
const downPayment = document.getElementById('downPayment');
const loanAmount = document.getElementById('loanAmount');
const interestRate = document.getElementById('interestRate');
const loanDuration = document.getElementById('loanDuration');
// form const
const form = document.getElementById('mortgage');

downPayment.addEventListener('keyup',()=>{
    loanAmount.value= homeValue.value-downPayment.value;

    let loanAmountValue= loanAmount.value;
    return loanAmountValue;
})


// lets now calculate the mortgage down here

function calculateMortgage (loanAmount, interestRate, numberOfMonthlyPayments){
function percentageToDecimal(percent){
    return percent/12/100;
}
interestRate = percentageToDecimal(interestRate);


function yearsToMonths(year){
return year*12;
}

numberOfMonthlyPayments=yearsToMonths(numberOfMonthlyPayments);

let mortgage = (interestRate * loanAmount)/(1-Math.pow(1+ interestRate, -numberOfMonthlyPayments));

return parseFloat(mortgage.toFixed(2));
}

form.onsubmit=(e)=>{
    e.preventDefault();
    Validate();

    let loanAmount= homeValue.value - downPayment.value;

    let monthlyPayment = calculateMortgage(loanAmount, interestRate.value, loanDuration.value);

    document.getElementById('monthlyPayment').innerHTML = `ZAR ${monthlyPayment} `;
}

function Validate(){
    if(
        homeValue.value=== '' ||
        downPayment.value=== ''||
        interestRate.value=== ''||
        loanDuration.value=== '' 
     )
    {


let alert = document.createElement('div');
//alert.className = 'btn red btn-large';
alert.innerHTML = `<span>Please complete all fields</span>`;
alert.style.color= 'red';
alert.style.margin= ' 0  auto';
alert.style.textAlign='center';
alert.style.width= '90%';
form.parentNode.insertBefore(alert, form);

alert.onclick=()=>alert.remove();
setTimeout(()=>alert.remove(), '3000');
    }
}


const images =[
    'MortgagePictures/img1.png',
    'MortgagePictures/img3.jpg',
    'MortgagePictures/img4.jpg',
    'MortgagePictures/img6.jpg',
    'MortgagePictures/img7.jpg'
    
    
]
// this is the index to track the background image
let currentIndex = 0 ;

//let create the function to change dynamically the background image

function changeBackgroundImage(){
    document.body.style.backgroundImage = `url('${images[currentIndex]}')`;
    currentIndex = (currentIndex +1) %  images.length;
}

// we now call the function

changeBackgroundImage();

setInterval(changeBackgroundImage, 7000);