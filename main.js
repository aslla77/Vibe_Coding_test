const generateBtn = document.getElementById('generate-btn');
const numbersContainer = document.querySelector('.numbers-container');

const lottoColors = [
    '#fbc400', // Yellow
    '#69c8f2', // Blue
    '#ff7272', // Red
    '#aaa', // Gray
    '#b0d840'  // Green
];

function generateNumbers() {
    numbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    sortedNumbers.forEach((number, index) => {
        const circle = document.createElement('div');
        circle.classList.add('number');
        circle.textContent = number;

        let colorIndex = 0;
        if (number > 10) colorIndex = 1;
        if (number > 20) colorIndex = 2;
        if (number > 30) colorIndex = 3;
        if (number > 40) colorIndex = 4;
        
        circle.style.backgroundColor = lottoColors[colorIndex];
        circle.style.color = 'white';

        numbersContainer.appendChild(circle);
    });
}

generateBtn.addEventListener('click', generateNumbers);

// Generate numbers on initial load
generateNumbers();
