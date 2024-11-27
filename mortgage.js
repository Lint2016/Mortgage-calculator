// Dark mode functionality
const toggleSwitch = document.querySelector('#checkbox');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

toggleSwitch.addEventListener('change', switchTheme);

// inputs DOM elements

const homeValue = document.getElementById('homeValue');
const downPayment = document.getElementById('downPayment');
const loanAmount = document.getElementById('loanAmount');
const interestRate = document.getElementById('interestRate');
const loanDuration = document.getElementById('loanDuration');
// form const
const form = document.getElementById('mortgage');

downPayment.addEventListener('keyup', () => {
    loanAmount.value = homeValue.value - downPayment.value;
})

// lets now calculate the mortgage down here

function calculateMortgage(loanAmount, interestRate, numberOfMonthlyPayments) {
    function percentageToDecimal(percent) {
        return percent / 12 / 100;
    }
    interestRate = percentageToDecimal(interestRate);

    function yearsToMonths(year) {
        return year * 12;
    }
    numberOfMonthlyPayments = yearsToMonths(numberOfMonthlyPayments);

    let mortgage = (interestRate * loanAmount) / (1 - Math.pow(1 + interestRate, -numberOfMonthlyPayments));

    return parseFloat(mortgage.toFixed(2));
}

form.onsubmit = (e) => {
    e.preventDefault();
    if (validate()) {
        let loanAmountValue = homeValue.value - downPayment.value;
        let monthlyPayment = calculateMortgage(loanAmountValue, interestRate.value, loanDuration.value);
        document.getElementById('monthlyPayment').innerHTML = `ZAR ${monthlyPayment.toLocaleString()}`;
        
        // Clear all input fields except the monthly payment display
        homeValue.value = '';
        downPayment.value = '';
        loanAmount.value = '';
        interestRate.value = '';
        loanDuration.value = '';
    }
}

function validate() {
    const inputs = [homeValue, downPayment, interestRate, loanDuration];
    let isValid = true;

    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Check if any field is empty
    inputs.forEach(input => {
        if (!input.value) {
            isValid = false;
            input.classList.add('invalid');
        } else {
            input.classList.remove('invalid');
        }
    });

    if (!isValid) {
        const alert = document.createElement('div');
        alert.className = 'alert';
        alert.innerHTML = 'Please complete all fields';
        form.parentNode.insertBefore(alert, form);

        setTimeout(() => {
            alert.remove();
        }, 3000);
    }

    return isValid;
}

const images = [
    'MortgagePictures/img1.png',
    'MortgagePictures/img3.jpg',
    'MortgagePictures/img4.jpg',
    'MortgagePictures/img6.jpg'
]

// this is the index to track the background image
let currentIndex = 0;

//let create the function to change dynamically the background image

function changeBackgroundImage() {
    document.body.style.backgroundImage = `url('${images[currentIndex]}')`;
    currentIndex = (currentIndex + 1) % images.length;
}

// we now call the function

changeBackgroundImage();

setInterval(changeBackgroundImage, 7000);