const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let foodEaten = 0;
const currentH3 = document.querySelector(".current-score h3");
const currentScore = document.querySelector(".current-score");
let poisonText = document.createElement('p');
let current_score = 0;
let isVisibilityReduced = false;

const foodImage = new Image();
foodImage.src = 'chicken.svg';
const snakeHeadImage = new Image();
snakeHeadImage.src = 'snakehead.svg';
const snakeBodyImage = new Image();
snakeBodyImage.src = 'snakebody.svg';
const starImage = new Image();
starImage.src = 'star.svg';
const poisonImage = new Image();
poisonImage.src = 'poison.svg';

const gridSize = 25;

let snake = [
    { x: 5 * gridSize, y: 5 * gridSize },
    { x: 4 * gridSize, y: 5 * gridSize },
    { x: 3 * gridSize, y: 5 * gridSize }
];

// Initialize the food
let food = {
    x: getRandomInt(0, canvas.width / gridSize) * gridSize,
    y: getRandomInt(0, canvas.height / gridSize) * gridSize
};

let poisons = [];

function generatePoisons() {
    poisons = []; // Réinitialise les poisons pour chaque boucle
    while (poisons.length < 3) {
        let newPoison = {
            x: getRandomInt(0, canvas.width / gridSize) * gridSize,
            y: getRandomInt(0, canvas.height / gridSize) * gridSize
        };

        // Vérifie si le nouveau poison est à la même position que la nourriture ou un autre poison
        let isOverlapping = poisons.some(poison => poison.x === newPoison.x && poison.y === newPoison.y)
            || (newPoison.x === food.x && newPoison.y === food.y);

        if (!isOverlapping) {
            poisons.push(newPoison);
        }
    }
    // Vérifie que des poisons sont générés
    console.log('Poisons générés :', poisons);
}

let star = null;

function generateStar() {
    // Générer la position de l'étoile
    let starX, starY;
    do {
        starX = getRandomInt(0, canvas.width / gridSize) * gridSize;
        starY = getRandomInt(0, canvas.height / gridSize) * gridSize;
    } while (starX === food.x && starY === food.y); // Vérifiez que l'étoile n'est pas à la même position que la nourriture

    star = { x: starX, y: starY }; // Assigner la position de l'étoile
}

let dx = gridSize;
let dy = 0;

let speed = 400;
let ticks = 0;

let gameInterval = setInterval(gameLoop, speed);

document.addEventListener('keydown', changeDirection);

function gameLoop() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        food = {
            x: getRandomInt(0, canvas.width / gridSize) * gridSize,
            y: getRandomInt(0, canvas.height / gridSize) * gridSize
        };
        foodEaten++;
        current_score += 10;
        currentH3.textContent = "Score : " + current_score;
        generatePoisons();

        if(foodEaten == 5) {
            if(speed > 100) {
                speed - 75;
            } else {
                speed = 100;
            }
        } else if(foodEaten == 10) {
            foodEaten = 0;

            if(speed > 100) {
                speed - 75;
            } else {
                speed = 100;
            }

            generateStar();
        }
    } else {
        snake.pop();
    }

    if(star) {
        if (head.x === star.x && head.y === star.y) {
            star = null;
            
            current_score += 35;
            currentH3.textContent = "Score : " + current_score;
            speed += 50;
        }
    }

    poisons.forEach(poison => {
        if (head.x === poison.x && head.y === poison.y) {
            isVisibilityReduced = true;
            current_score -= 40;
            ticks = 0;
            currentScore.appendChild(poisonText);
            poisonText.textContent = "Poison : 15 ticks";
            speed = speed - 100;
            console.log(speed);
        }
    });

    if (isCollision(head)) {
        clearInterval(gameInterval);
        alert('Game Over! Press OK to restart.');
        window.location.reload();
    }

    if (isVisibilityReduced) {

        setTimeout(function() {
			ticks++;
		}, speed);

        currentH3.textContent = "Score : " + current_score;

        const visibilityMask = document.querySelector('.circle');
        visibilityMask.style.zIndex = "2";
        setTimeout(function() {
			visibilityMask.style.opacity = "1";
		}, 300);
        visibilityMask.style.left = head.x - 37 + 'px';
        visibilityMask.style.top = head.y - 37 + 'px';
        poisonText.textContent = "Poison : " + (15 - ticks) + " ticks";

        if(ticks == 25) {
            isVisibilityReduced = false;

            speed = speed + 100;

            if(poisonText) {
                poisonText.remove();
            }
        }
    } else {
        const visibilityMask = document.querySelector('.circle');
        visibilityMask.style.opacity = "0";
        setTimeout(function() {
			visibilityMask.style.zIndex = "-1000";
		}, 300);
        visibilityMask.style.left = "0";
        visibilityMask.style.top = "0";
    }
    draw();
}

function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    // Draw the food
    ctx.drawImage(foodImage, food.x, food.y, gridSize, gridSize);

    if(poisons) {
        poisons.forEach(poison => {
            ctx.drawImage(poisonImage, poison.x, poison.y, gridSize, gridSize);
        });
    }

    if(star) {
        ctx.drawImage(starImage, star.x, star.y, gridSize, gridSize);
    }

    // Draw the snake's body
    for (let i = 0; i < snake.length; i++) {
        // Draw the head with snakeHeadImage for the first segment
        if (i === 0) {
            // Save the current state of the canvas context
            ctx.save();

            // Set the pivot point to the center of the image
            ctx.translate(snake[i].x + gridSize / 2, snake[i].y + gridSize / 2);

            // Rotate the context based on the direction of the snake
            let angle = 0;
            if (dx === gridSize) {
                angle = 0;  // Moving right
            } else if (dx === -gridSize) {
                angle = Math.PI;  // Moving left
            } else if (dy === gridSize) {
                angle = Math.PI / 2;  // Moving down
            } else if (dy === -gridSize) {
                angle = -Math.PI / 2;  // Moving up
            }

            // Apply the rotation
            ctx.rotate(angle);

            // Draw the rotated snake head image
            ctx.drawImage(snakeHeadImage, -gridSize / 2, -gridSize / 2, gridSize, gridSize);

            // Restore the context to its original state
            ctx.restore();
        } else {
            // Draw the body with snakeBodyImage for the other segments
            ctx.drawImage(snakeBodyImage, snake[i].x, snake[i].y, gridSize, gridSize);
        }
    }
}

function drawGrid() {
    // Set the grid line color
    ctx.strokeStyle = '#393B40';
    ctx.lineWidth = 0.5;

    // Draw vertical grid lines
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function changeDirection(event) {
    const keyPressed = event.key;

    // Prevent the snake from reversing
    if (keyPressed === 'ArrowUp' && dy === 0) {
        dx = 0;
        dy = -gridSize;
    } else if (keyPressed === 'ArrowDown' && dy === 0) {
        dx = 0;
        dy = gridSize;
    } else if (keyPressed === 'ArrowLeft' && dx === 0) {
        dx = -gridSize;
        dy = 0;
    } else if (keyPressed === 'ArrowRight' && dx === 0) {
        dx = gridSize;
        dy = 0;
    }
}

function isCollision(head) {
    // Check wall collision
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return true;
    }

    // Check self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}