// Get the canvas element and adjust its size
const canvas = document.getElementById("gameCanvas");
canvas.width = window.innerWidth * 0.9; // 90% of the screen width
canvas.height = window.innerHeight * 0.7; // 70% of the screen height
const ctx = canvas.getContext("2d");

// Game variables
let score = 0;
let timeLeft = 60; // 1-minute timer
let feedbackText = "";
let feedbackIcon = null; // Can be "check" or "cross"
let gameOver = false;
let startTime = Date.now();

// Bin and waste item details (image paths, positions, etc.)
const wasteItems = {
    gloves: 'images/gloves.png',
    syringe_with_needle: 'images/syringe_with_needle.png',
    syringe_without_needle: 'images/syringe_without_needle.png',
    vial: 'images/vial.png',
    paper: 'images/paper.png',
    paper_cup: 'images/paper_cup.png',
    gauze_piece: 'images/gauze_piece.png',
    diaper: 'images/diaper.png'
};

const bins = {
    Yellow: 'images/yellow_bin.jpg',
    Red: 'images/red_bin.jpg',
    Translucent: 'images/translucent_bin.png',
    Blue: 'images/blue_bin.png',
    Green: 'images/green_bin.png'
};

const binPositions = {
    Yellow: { x: 50, y: 500, width: 150, height: 150 },
    Red: { x: 220, y: 500, width: 150, height: 150 },
    Translucent: { x: 390, y: 500, width: 150, height: 150 },
    Blue: { x: 560, y: 500, width: 150, height: 150 },
    Green: { x: 730, y: 500, width: 150, height: 150 }
};

// Categories of waste items for each bin
const itemCategories = {
    Yellow: ['gauze_piece', 'diaper'],
    Red: ['gloves', 'syringe_without_needle'],
    Translucent: ['syringe_with_needle'],
    Blue: ['vial'],
    Green: ['paper', 'paper_cup']
};

// Load images
function loadImage(path, onload) {
    const img = new Image();
    img.src = path;
    img.onload = onload;
    return img;
}

const wasteImages = Object.fromEntries(
    Object.entries(wasteItems).map(([key, value]) => [key, loadImage(value, () => {})])
);
const binImages = Object.fromEntries(
    Object.entries(bins).map(([key, value]) => [key, loadImage(value, () => {})])
);

// Randomly select a waste item
function randomItem() {
    const keys = Object.keys(wasteItems);
    return keys[Math.floor(Math.random() * keys.length)];
}

// Initialize selectedItem only after wasteItems is fully defined
let selectedItem = randomItem(); // Randomly select an item

// Handle touch event for bin selection
canvas.addEventListener("touchstart", function(event) {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const touchX = event.touches[0].clientX - rect.left;
    const touchY = event.touches[0].clientY - rect.top;

    for (let binName in binPositions) {
        const bin = binPositions[binName];
        if (touchX > bin.x && touchX < bin.x + bin.width && touchY > bin.y && touchY < bin.y + bin.height) {
            if (itemCategories[binName].includes(selectedItem)) {
                score += 10;
                feedbackText = "Correct!";
                feedbackIcon = "check";
            } else {
                score -= 5;
                feedbackText = "Wrong!";
                feedbackIcon = "cross";
            }
            selectedItem = randomItem(); // New item after selection
        }
    }
});

// Main game loop
function gameLoop() {
    if (gameOver) {
        const gameOverMessage = "Game Over! Final Score: " + score;
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText(gameOverMessage, canvas.width / 2 - ctx.measureText(gameOverMessage).width / 2, canvas.height / 2);
        return;
    }

    // Clear the screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate remaining time
    timeLeft = 60 - Math.floor((Date.now() - startTime) / 1000);
    if (timeLeft <= 0) {
        gameOver = true;
        return;
    }

    // Draw timer and score
    ctx.fillStyle = "black";
    ctx.font = "24px Arial";
    ctx.fillText("Time left: " + timeLeft + "s", canvas.width - 200, 20);
    ctx.fillText("Score: " + score, 20, 20);

    // Draw the bins
    for (let binName in binPositions) {
        const bin = binPositions[binName];
        const binImage = binImages[binName];
        if (binImage.complete) {
            ctx.drawImage(binImage, bin.x, bin.y, bin.width, bin.height);
        }
    }

    // Draw the selected waste item
    const item = wasteImages[selectedItem];
    if (item.complete) {
        ctx.drawImage(item, canvas.width / 2 - 75, canvas.height / 2 - 100, 150, 150);
    }

    // Display feedback
    if (feedbackText) {
        ctx.fillText(feedbackText, canvas.width / 2 - ctx.measureText(feedbackText).width / 2, canvas.height / 2 + 100);
    }

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();