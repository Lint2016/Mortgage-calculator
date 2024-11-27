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

// DOM elements
const homeValue = document.getElementById('homeValue');
const downPayment = document.getElementById('downPayment');
const loanAmount = document.getElementById('loanAmount');
const interestRate = document.getElementById('interestRate');
const loanDuration = document.getElementById('loanDuration');
const extraPayment = document.getElementById('extraPayment');
const form = document.getElementById('mortgage');
const resultsSection = document.querySelector('.results-section');
const scheduleTable = document.querySelector('.schedule-table');

// Calculate amortization schedule
function calculateAmortizationSchedule(loanAmount, annualRate, years, extraPayment = 0) {
    const monthlyRate = annualRate / 12 / 100;
    const numberOfPayments = years * 12;
    const monthlyPayment = (monthlyRate * loanAmount) / (1 - Math.pow(1 + monthlyRate, -numberOfPayments));
    const totalPayment = monthlyPayment + (extraPayment || 0);
    
    let balance = loanAmount;
    const schedule = [];
    let totalInterest = 0;
    
    for (let payment = 1; balance > 0 && payment <= numberOfPayments; payment++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = Math.min(balance, totalPayment - interestPayment);
        
        totalInterest += interestPayment;
        balance -= principalPayment;
        
        schedule.push({
            payment,
            totalPayment,
            principalPayment,
            interestPayment,
            balance: Math.max(0, balance)
        });
        
        if (balance <= 0) break;
    }
    
    return {
        schedule,
        totalInterest,
        payoffMonths: schedule.length,
        totalPaid: loanAmount + totalInterest
    };
}

// Format currency
function formatCurrency(amount) {
    return 'ZAR ' + amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Update amortization table
function updateAmortizationTable(schedule) {
    const tbody = document.getElementById('amortizationBody');
    tbody.innerHTML = '';
    
    schedule.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.payment}</td>
            <td>${formatCurrency(row.totalPayment)}</td>
            <td>${formatCurrency(row.principalPayment)}</td>
            <td>${formatCurrency(row.interestPayment)}</td>
            <td>${formatCurrency(row.balance)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Toggle amortization schedule visibility
function toggleSchedule() {
    scheduleTable.style.display = scheduleTable.style.display === 'none' ? 'block' : 'none';
    const btn = document.querySelector('.schedule-btn');
    btn.textContent = scheduleTable.style.display === 'none' ? 'Show Schedule' : 'Hide Schedule';
}

// Download PDF of amortization schedule
function downloadSchedule() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Mortgage Amortization Schedule', 14, 20);
    
    doc.setFontSize(12);
    let y = 40;
    
    // Add loan details
    doc.text(`Loan Amount: ${document.getElementById('loanAmount').value}`, 14, y);
    y += 10;
    doc.text(`Interest Rate: ${document.getElementById('interestRate').value}%`, 14, y);
    y += 10;
    doc.text(`Loan Duration: ${document.getElementById('loanDuration').value} years`, 14, y);
    y += 20;
    
    // Add table headers
    const headers = ['#', 'Payment', 'Principal', 'Interest', 'Balance'];
    let xPos = 14;
    headers.forEach(header => {
        doc.text(header, xPos, y);
        xPos += 35;
    });
    
    y += 10;
    
    // Add table rows
    const rows = document.querySelectorAll('#amortizationBody tr');
    rows.forEach((row, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        xPos = 14;
        Array.from(row.cells).forEach(cell => {
            doc.text(cell.textContent, xPos, y);
            xPos += 35;
        });
        
        y += 7;
    });
    
    doc.save('mortgage-schedule.pdf');
}

// Form submission handler
form.onsubmit = (e) => {
    e.preventDefault();
    if (validate()) {
        const loanAmountValue = homeValue.value - downPayment.value;
        const extraPaymentValue = parseFloat(extraPayment.value) || 0;
        
        // Calculate regular monthly payment
        const monthlyPayment = calculateMortgage(loanAmountValue, interestRate.value, loanDuration.value);
        document.getElementById('monthlyPayment').innerHTML = formatCurrency(monthlyPayment);
        
        // Calculate amortization schedule
        const schedule = calculateAmortizationSchedule(
            loanAmountValue,
            parseFloat(interestRate.value),
            parseInt(loanDuration.value),
            extraPaymentValue
        );
        
        // Update summary information
        document.getElementById('totalPayment').textContent = formatCurrency(schedule.totalPaid);
        document.getElementById('totalInterest').textContent = formatCurrency(schedule.totalInterest);
        
        // Calculate and display payoff date
        const payoffDate = new Date();
        payoffDate.setMonth(payoffDate.getMonth() + schedule.payoffMonths);
        document.getElementById('payoffDate').textContent = payoffDate.toLocaleDateString();
        
        // Calculate interest savings from extra payments
        const regularSchedule = calculateAmortizationSchedule(
            loanAmountValue,
            parseFloat(interestRate.value),
            parseInt(loanDuration.value)
        );
        const interestSavings = regularSchedule.totalInterest - schedule.totalInterest;
        document.getElementById('interestSavings').textContent = formatCurrency(interestSavings);
        
        // Update amortization table
        updateAmortizationTable(schedule.schedule);
        
        // Show results section
        resultsSection.style.display = 'block';
        
        // Clear input fields
        homeValue.value = '';
        downPayment.value = '';
        loanAmount.value = '';
        interestRate.value = '';
        loanDuration.value = '';
        extraPayment.value = '';
    }
};

// Input validation
function validate() {
    const inputs = [homeValue, downPayment, interestRate, loanDuration];
    let isValid = true;
    
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
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
        alert.innerHTML = 'Please complete all required fields';
        form.parentNode.insertBefore(alert, form);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
    
    return isValid;
}

// Calculate mortgage
function calculateMortgage(loanAmount, interestRate, numberOfYears) {
    const monthlyRate = interestRate / 12 / 100;
    const numberOfPayments = numberOfYears * 12;
    const mortgage = (monthlyRate * loanAmount) / (1 - Math.pow(1 + monthlyRate, -numberOfPayments));
    return parseFloat(mortgage.toFixed(2));
}

// Update loan amount when down payment changes
downPayment.addEventListener('keyup', () => {
    loanAmount.value = homeValue.value - downPayment.value;
});

// Background image rotation
const images = [
    'MortgagePictures/img1.png',
    'MortgagePictures/img3.jpg',
    'MortgagePictures/img4.jpg',
    'MortgagePictures/img6.jpg'
];

let currentIndex = 0;

function changeBackgroundImage() {
    document.body.style.backgroundImage = `url('${images[currentIndex]}')`;
    currentIndex = (currentIndex + 1) % images.length;
}

changeBackgroundImage();
setInterval(changeBackgroundImage, 7000);