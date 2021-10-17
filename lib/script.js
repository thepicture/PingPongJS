'use strict';

const FIELD_WIDTH = 15;
const FIELD_HEIGHT = 20;
const BLOCK_SIZE_PX = 30;
const PLATFORM_SIZE_INITIAL_PLAYER = 2;
const PLATFORM_SIZE_INITIAL_ENEMY = 2;
const INITIAL_INTERVAL_MS = 5;
const BALL_X_MIN_SPEED = 1;
const BALL_X_MAX_SPEED = 2;
const BALL_Y_MIN_SPEED = 1;
const BALL_Y_MAX_SPEED = 2;
const BALL_SHADOW_TIME_MS = 200;
const COLOR_INTERVAL_MS = 100;

let PLATFORM_PLAYER_DELTA_X = 2;
let PLATFORM_ENEMY_DELTA_X = 1;
let BALL_DELTA_X = 1;
let BALL_DELTA_Y = 1;
let isStarted = false;

document.addEventListener('keydown', event => {
    event.preventDefault();

    if (isStarted) return;

    if (event.code === "Enter" || event.code === "Space") {
        interfaceButton.click();
    }
})

const background = document.querySelector('#background');

for (let i = 0; i < FIELD_WIDTH; i++) {
    for (let j = -2; j < FIELD_HEIGHT; j++) {
        let bgBlock = document.createElement('div');
        bgBlock.classList.add('game');
        bgBlock.style.width = bgBlock.style.height = BLOCK_SIZE_PX + 'px';
        bgBlock.style.left = BLOCK_SIZE_PX * i + 'px';
        bgBlock.style.top = BLOCK_SIZE_PX * j + 'px';
        background.append(bgBlock);
    }
}

let iteration = 0;

setInterval(() => {
    if (iteration++ < BLOCK_SIZE_PX) {
        background.style.top = background.offsetTop + 1 + "px";
    } else {
        background.style.top = background.offsetTop - BLOCK_SIZE_PX + "px";
        iteration = 0;
    }
}, 20);

const infoPanel = document.querySelector('.info-panel');
infoPanel.style.width = BLOCK_SIZE_PX * FIELD_WIDTH + 'px';
infoPanel.style.height = BLOCK_SIZE_PX * 4 + 'px';
infoPanel.style.top = BLOCK_SIZE_PX * FIELD_HEIGHT + 'px';
infoPanel.style.left = (0).toString(10);

const interfaceButton = document.querySelector('.interface-button');

interfaceButton.addEventListener('click', () => {
    InterfaceButton.hide();
    Game.setGameLoop();
    playerPointer.hidden = true;
});

const score = document.querySelector('.score');
score.style.left = BLOCK_SIZE_PX + 'px';
score.style.top = BLOCK_SIZE_PX * FIELD_HEIGHT + 'px';
score.style.height = BLOCK_SIZE_PX * 4 + 'px';

document.addEventListener('DOMContentLoaded', () => {
    interfaceButton.style.left =
        (FIELD_WIDTH * BLOCK_SIZE_PX - interfaceButton.clientWidth) / 2 + 'px';
    interfaceButton.style.top = BLOCK_SIZE_PX * (FIELD_HEIGHT + 1) + 'px';
});

const player = document.querySelector('#player');
player.style.width = BLOCK_SIZE_PX * PLATFORM_SIZE_INITIAL_PLAYER + 'px';
player.style.height = BLOCK_SIZE_PX + 'px';
player.style.top = BLOCK_SIZE_PX * (FIELD_HEIGHT - 1) + 'px';
player.style.left =
    (BLOCK_SIZE_PX * FIELD_WIDTH - player.clientWidth) / 2 + 'px';

const enemy = document.querySelector('#enemy');
enemy.style.width = BLOCK_SIZE_PX * PLATFORM_SIZE_INITIAL_ENEMY + 'px';
enemy.style.height = BLOCK_SIZE_PX + 'px';
enemy.style.top = '0px';
enemy.style.left = (BLOCK_SIZE_PX * FIELD_WIDTH - enemy.clientWidth) / 2 + 'px';

const divisor = document.querySelector('.divisor');
divisor.style.width = BLOCK_SIZE_PX * FIELD_WIDTH + 'px';
divisor.style.height = (BLOCK_SIZE_PX * FIELD_HEIGHT) / 2 + 'px';
divisor.style.borderBottom = BLOCK_SIZE_PX / 4 + 'px dashed white';

const frame = document.querySelector('.frame');
frame.style.left = frame.style.top = '0px';
frame.style.width = BLOCK_SIZE_PX * FIELD_WIDTH + 'px';
frame.style.height = BLOCK_SIZE_PX * FIELD_HEIGHT + 'px';

const title = document.querySelector('.title');
title.style.left = (0).toString(10);
title.style.top = 2 * BLOCK_SIZE_PX + 'px';
title.style.width = BLOCK_SIZE_PX * FIELD_WIDTH + 'px';

let playerPointer = document.querySelector('.player-pointer');
playerPointer.style.left = BLOCK_SIZE_PX * PLATFORM_SIZE_INITIAL_PLAYER * (-1) + "px";

class InGameSound {

    static play(elementId, isLoop, volume) {

        if (!isLoop) isLoop = false;

        if (!volume) volume = 0.8;

        let audio = document.querySelector("#" + elementId);
        audio.loop = isLoop;
        audio.volume = volume;
        audio.play();
    }

    static stopAll() {
        for (let audio of document.documentElement.getElementsByTagName('audio')) {
            audio.pause();
        }
    }
}

class Title {

    static show() {
        title.hidden = false;
    }

    static hide() {
        title.hidden = true;
    }

    static setText(text) {
        title.textContent = text;
    }
}

class ScoreTable {

    static setScore(player, enemy) {
        ScoreTable.playerScore = player;
        ScoreTable.enemyScore = enemy;

        score.innerHTML = `Player: ${ScoreTable.playerScore}<br>Enemy: ${ScoreTable.enemyScore}`;
    }

    static addScore(deltaPlayer, deltaEnemy) {
        ScoreTable.playerScore += deltaPlayer;
        ScoreTable.enemyScore += deltaEnemy;
        this.setScore(ScoreTable.playerScore, ScoreTable.enemyScore);
    }

    static show() {
        score.hidden = false;
    }

    static hide() {
        score.hidden = true;
    }
}

ScoreTable.playerScore = 0;
ScoreTable.enemyScore = 0;

class InputChecker {

    static connect() {
        document.addEventListener('keydown', (event) => {
            event.preventDefault();
            InputChecker.heldKeySet.add(event.code);
        });
        document.body.addEventListener('keyup', (event) => {
            event.preventDefault();
            InputChecker.heldKeySet.delete(event.code);
        });
    }

    static disconnect() {
        document.removeEventListener('keydown', (event) => {
            event.preventDefault();
            InputChecker.heldKeySet.add(event.code);
        });
        document.body.removeEventListener('keyup', (event) => {
            event.preventDefault();
            InputChecker.heldKeySet.delete(event.code);
        });
    }

    static processInput() {
        if (InputChecker.heldKeySet.has('KeyA')) {
            playerPlatform.moveLeft(PLATFORM_PLAYER_DELTA_X);
        } else if (InputChecker.heldKeySet.has('KeyD')) {
            playerPlatform.moveRight(PLATFORM_PLAYER_DELTA_X);
        } else if (InputChecker.heldKeySet.has('Escape')) {
            Title.setText('Game was aborted');
            Game.clearGameLoop();
        }
    }
}

InputChecker.heldKeySet = new Set();

class Platform {

    connect(platformElement) {
        if (platformElement) {
            this.platformElement = platformElement;
            this.platformElement.style.transition = "background-color " + COLOR_INTERVAL_MS + "ms";
        }
    }

    centralize() {
        this.platformElement.style.left =
            (BLOCK_SIZE_PX * FIELD_WIDTH - enemy.clientWidth) / 2 + 'px';
    }

    canMoveLeft() {
        return this.platformElement.offsetLeft > 0;
    }

    canMoveRight() {
        return (
            this.platformElement.offsetLeft + this.platformElement.clientWidth <
            BLOCK_SIZE_PX * FIELD_WIDTH
        );
    }

    moveLeft(speed) {
        if (!this.canMoveLeft()) return;

        this.platformElement.style.left =
            this.platformElement.offsetLeft - speed + 'px';
    }

    moveRight(speed) {
        if (!this.canMoveRight()) return;

        this.platformElement.style.left =
            this.platformElement.offsetLeft + speed + 'px';
    }

    colorize(color) {
        if (!this.platformElement) return;

        if (!color) color = 'red';

        this.platformElement.style.backgroundColor = color;

        let timeout = setTimeout(() => {
            this.platformElement.style.backgroundColor = "white";
            clearTimeout(timeout);
            timeout = null;
        }, COLOR_INTERVAL_MS);
    }
}

class PlayerPlatform extends Platform {

    constructor() {
        super();
    }
}

class EnemyPlatform extends Platform {
    constructor() {
        super();
    }

    move() {
        if (this.isBallOnTheLeft()) {
            this.moveLeft(PLATFORM_ENEMY_DELTA_X);
        } else {
            this.moveRight(PLATFORM_ENEMY_DELTA_X);
        }
    }

    isBallOnTheLeft() {
        return (
            ball.ballElement.offsetLeft + ball.ballElement.clientWidth <
            this.platformElement.offsetLeft + this.platformElement.clientWidth / 2
        );
    }
}

class Ball {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isGoingLeft = false;
        this.isGoingUp = false;
        this.isMoving = false;
    }

    randomizeFlyingY() {
        this.isGoingUp = Math.round(Math.random());
    }

    setPosition(x, y) {
        this.ballElement.style.left = BLOCK_SIZE_PX * x + 'px';
        this.ballElement.style.top = BLOCK_SIZE_PX * y + 'px';
        this.x = x;
        this.y = y;
    }

    centralize() {
        if (!this.ballElement) return;

        this.setPosition(
            Math.round((FIELD_WIDTH - 1) / 2),
            Math.round((FIELD_HEIGHT - 1) / 2)
        );
    }

    generate() {
        if (this.ballElement) return;

        this.isMoving = true;

        this.ballElement = this.getBallElement();

        document.body.append(this.ballElement);
    }

    getBallElement() {
        let ballElement = document.createElement('div');
        ballElement.classList.add('ball');
        ballElement.style.width = BLOCK_SIZE_PX + 'px';
        ballElement.style.height = BLOCK_SIZE_PX + 'px';
        ballElement.style.left = BLOCK_SIZE_PX * this.x + 'px';
        ballElement.style.top = BLOCK_SIZE_PX * this.y + 'px';
        ballElement.style.borderRadius = BLOCK_SIZE_PX + 'px';

        return ballElement;
    }

    canMoveLeft() {
        return this.ballElement.offsetLeft > 0;
    }

    canMoveRight() {
        return (
            this.ballElement.offsetLeft + this.ballElement.clientWidth <
            BLOCK_SIZE_PX * FIELD_WIDTH
        );
    }

    canMoveUp() {
        return this.ballElement.offsetTop > 0;
    }

    canMoveDown() {
        return (
            this.ballElement.offsetTop + this.ballElement.clientHeight <
            BLOCK_SIZE_PX * FIELD_HEIGHT
        );
    }

    isHitPlayerPlatform() {
        return (
            this.ballElement.offsetLeft + this.ballElement.clientWidth >
            playerPlatform.platformElement.offsetLeft &&
            this.ballElement.offsetLeft <
            playerPlatform.platformElement.offsetLeft +
            playerPlatform.platformElement.clientWidth &&
            this.ballElement.offsetTop +
            BALL_DELTA_Y +
            this.ballElement.clientHeight >
            playerPlatform.platformElement.offsetTop
        );
    }

    isHitEnemyPlatform() {
        return (
            this.ballElement.offsetLeft + this.ballElement.clientWidth >
            enemyPlatform.platformElement.offsetLeft &&
            this.ballElement.offsetLeft <
            enemyPlatform.platformElement.offsetLeft +
            enemyPlatform.platformElement.clientWidth &&
            this.ballElement.offsetTop - BALL_DELTA_Y <
            enemyPlatform.platformElement.offsetTop +
            enemyPlatform.platformElement.clientHeight
        );
    }

    moveLeft() {
        if (!this.canMoveLeft()) {
            this.isGoingLeft = false;
            this.updateDeltaX();
            this.updateDeltaY();
            return;
        }

        this.ballElement.style.left =
            this.ballElement.offsetLeft - BALL_DELTA_X + 'px';
    }

    moveUp() {
        if (!this.canMoveUp()) {
            Title.setText("You win");
            Game.clearGameLoop();
        }

        if (this.isHitEnemyPlatform()) {
            this.isGoingUp = false;
            this.isGoingLeft = Math.round(Math.random());
            this.updateDeltaX();
            this.updateDeltaY();
            ScoreTable.addScore(0, 1);
            InGameSound.play('enemy-hit');
            enemyPlatform.colorize('red');
            return;
        }

        this.ballElement.style.top =
            this.ballElement.offsetTop - BALL_DELTA_Y + 'px';
    }

    moveDown() {
        if (!this.canMoveDown()) {
            Title.setText("You lose");
            Game.clearGameLoop();
        }

        if (this.isHitPlayerPlatform()) {
            this.isGoingUp = true;
            this.isGoingLeft = Math.round(Math.random());
            this.updateDeltaX();
            this.updateDeltaY();
            ScoreTable.addScore(1, 0);
            InGameSound.play('player-hit');
            playerPlatform.colorize('red');
            return;
        }

        this.ballElement.style.top =
            this.ballElement.offsetTop + BALL_DELTA_Y + 'px';
    }

    moveRight() {
        if (!this.canMoveRight()) {
            this.isGoingLeft = true;
            this.updateDeltaX();
            this.updateDeltaY();
            return;
        }

        this.ballElement.style.left =
            this.ballElement.offsetLeft + BALL_DELTA_X + 'px';
    }

    run() {
        if (!this.isMoving) return;

        this.drawShadow();

        if (this.isGoingLeft) {
            this.moveLeft();
        } else {
            this.moveRight();
        }

        if (this.isGoingUp) {
            this.moveUp();
        } else {
            this.moveDown();
        }
    }

    drawShadow() {

        if (!this.ballElement) return;

        let ballShadow = this.getBallElement();
        ballShadow.style.zIndex = (this.ballElement.style.zIndex - 1).toString(10);

        ballShadow.style.left = this.ballElement.offsetLeft + 'px';
        ballShadow.style.top = this.ballElement.offsetTop + 'px';
        ballShadow.style.transition =
            'opacity ' + BALL_SHADOW_TIME_MS + 'ms ease-in-out';
        document.body.append(ballShadow);
        ballShadow.style.backgroundColor = 'red';
        ballShadow.style.opacity = 0.1.toString(10);

        let timeout = setTimeout(() => {
            ballShadow.remove();
            ballShadow = null;
            clearTimeout(timeout);
            timeout = null;
        }, BALL_SHADOW_TIME_MS);
    }

    freeze() {
        if (!this.ballElement) return;

        this.isMoving = false;
    }

    updateDeltaX() {
        BALL_DELTA_X = Math.round(
            Math.random() * (BALL_X_MAX_SPEED - BALL_X_MIN_SPEED) + BALL_X_MIN_SPEED
        );
    }

    updateDeltaY() {
        BALL_DELTA_Y = Math.round(
            Math.random() * (BALL_Y_MAX_SPEED - BALL_Y_MIN_SPEED) + BALL_Y_MIN_SPEED
        );
    }
}

class InterfaceButton {

    static setText(text) {
        interfaceButton.textContent = text;
    }

    static hide() {
        interfaceButton.hidden = true;
    }

    static show() {
        interfaceButton.hidden = false;
    }
}

class Game {

    static update() {
        ball.run();
        enemyPlatform.move();
    }

    static setGameLoop() {
        if (this.gameLoop) return;

        isStarted = true;
        InGameSound.stopAll();
        InGameSound.play('ingame-' + Math.round(Math.random() * (2 - 1) + 1), true, 1);
        ScoreTable.setScore(0, 0);
        ScoreTable.show();
        Title.hide();
        ball.centralize();
        ball.randomizeFlyingY();
        enemyPlatform.centralize();
        playerPlatform.centralize();

        this.gameLoop = setInterval(() => {
            InputChecker.processInput();
            this.update();
        }, INITIAL_INTERVAL_MS);
    }

    static clearGameLoop() {
        if (!this.gameLoop) return;

        isStarted = false;

        InterfaceButton.show();
        Title.show();
        InGameSound.play('ball-explosion', false, 0.2);

        clearInterval(this.gameLoop);
        this.gameLoop = null;
    }
}

let playerPlatform = new PlayerPlatform();
playerPlatform.connect(player);

let enemyPlatform = new EnemyPlatform();
enemyPlatform.connect(enemy);

let ball = new Ball(
    Math.round((FIELD_WIDTH - 1) / 2),
    Math.round((FIELD_HEIGHT - 1) / 2)
);
ball.generate();

InputChecker.connect();

ScoreTable.setScore(0, 0);

InterfaceButton.setText('Start');