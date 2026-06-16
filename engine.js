var kbd = {
    keyCodes: { 38: 'up', 40: 'down', 37: 'left', 39: 'right' },
    cb: null,
    _callbacks: { up: [], down: [], left: [], right: [] },
    start: function() {
        if (this.cb) return;
        var _this = this;
        this.cb = function(e) {
            if (_this.keyCodes[e.keyCode]) {
                var cbs = _this._callbacks[_this.keyCodes[e.keyCode]];
                for (var i = 0; i < cbs.length; i++) {
                    cbs[i]();
                }
            }
        };
        document.addEventListener('keydown', this.cb);
    },
    stop: function() {
        document.removeEventListener('keydown', this.cb);
        this.cb = null;
    },
    on: function(keyCode, callback) {
        var availableKeys = Object.keys(this._callbacks);
        if (availableKeys.indexOf(keyCode) === -1) {
            throw new Error('keyCode ' + keyCode + ' not found. Available: ' + availableKeys.join(', '));
        }
        this._callbacks[keyCode].push(callback);
    }
};

var screenState = 'INIT';

var introCurtain = {
    progress: 0,
    active: false
};

var blinkState = {
    visible: true,
    lastToggle: 0
};

var introBgImage = new Image();
introBgImage.src = 'src/intro_screen.jpg';

function onInteraction() {
    resumeAudio();
    if (screenState === 'INIT') {
        screenState = 'INTRO';
        introCurtain.progress = 0;
        introCurtain.active = true;
        initLastTimestamp = Date.now();
        soundPlayer.playIntroMusic();
    } else if (screenState === 'READY') {
        screenState = 'PLAYING';
        soundPlayer.stopIntroMusic();
        gameStage.setup();
        var game = new Toppler();
        game.start();
    }
}

document.addEventListener('click', onInteraction);
document.addEventListener('keydown', onInteraction);

var initLastTimestamp = 0;

function initLoop() {
    if (screenState === 'PLAYING') return;

    var now = Date.now();
    var ctx = gameCanvas.ctx;

    if (screenState === 'INTRO') {
        var delta = initLastTimestamp ? now - initLastTimestamp : 0;
        initLastTimestamp = now;

        introCurtain.progress += delta / 2500;
        if (introCurtain.progress >= 1) {
            introCurtain.progress = 1;
            introCurtain.active = false;
            screenState = 'READY';
        }

        if (introBgImage.complete) {
            ctx.drawImage(introBgImage, 0, 0, 800, 600);
        }
        var blackHeight = Math.round(600 * (1 - introCurtain.progress));
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 600 - blackHeight, 800, blackHeight);
    } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 800, 600);

        if (screenState === 'INIT') {
            if (now - blinkState.lastToggle > 500) {
                blinkState.visible = !blinkState.visible;
                blinkState.lastToggle = now;
            }
            if (blinkState.visible) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '32px "PxPlus IBM VGA"';
                ctx.textAlign = 'center';
                ctx.fillText('Click to start', 400, Math.round(300));
                ctx.textAlign = 'start';
            }
        } else if (screenState === 'READY' && introBgImage.complete) {
            ctx.drawImage(introBgImage, 0, 0, 800, 600);
        }
    }

    requestAnimationFrame(initLoop);
}

class Toppler {
    constructor() {
        this.canvas = gameCanvas.canvas;
        this.ctx = gameCanvas.ctx;
        this.frame = null;
        this.lastTimestamp = null;
        kbd.start();
        var _this = this;
        gameState.stopGame = function() { _this.stop(); };
        gameState.startGame = function() {
            _this.lastTimestamp = Date.now();
            _this.loop();
            kbd.start();
        };
        gameState.restartGame = function() { _this.start(); };
    }
    startLevel(level) {
        gameState.level = level;
        gameState.reset();
        kbd.start();
    }
    start() {
        this.startLevel(1);
        this.lastTimestamp = Date.now();
        this.loop();
    }
    loop() {
        var _this = this;
        this.frame = window.requestAnimationFrame(function() {
            _this.loop();
            var timestamp = Date.now();
            var delta = timestamp - _this.lastTimestamp;
            gameStage.stage.calculate(delta, timestamp, _this.lastTimestamp);
            gameStage.stage.render();
            _this.lastTimestamp = timestamp;
        });
    }
    stop() {
        window.cancelAnimationFrame(this.frame);
        kbd.stop();
    }
}

function disableSmoothing(ctx) {
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
}

var loadDiv = document.getElementById('loading');

var fontPromise = document.fonts && document.fonts.load
    ? document.fonts.load('16px "PxPlus IBM VGA"').catch(function() {})
    : Promise.resolve();

Promise.all([soundPlayer.loadAll(), fontPromise]).then(function() {
    if (loadDiv) loadDiv.style.display = 'none';
    gameCanvas.setup();
    disableSmoothing(gameCanvas.ctx);
    if (!topMenuBg) topMenuBg = createTopMenuBg();
    blinkState.lastToggle = Date.now();
    initLoop();
});
