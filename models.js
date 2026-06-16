var gameCanvas = {
    setup: function() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width = 800;
        this.canvas.height = this.height = 600;
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    }
};

var events = {
    _events: {},
    sub: function(e, cb) {
        if (!this._events[e]) this._events[e] = [];
        this._events[e].push(cb);
    },
    unsub: function(e, cb) {
        if (!this._events[e]) return;
        var index = this._events[e].indexOf(cb);
        if (index !== -1) this._events[e].splice(index, 1);
    },
    pub: function(e, data) {
        if (this._events[e]) {
            for (var i = 0; i < this._events[e].length; i++) {
                this._events[e][i](data);
            }
        }
    }
};

var gameState = {
    grid: null,
    level: 1,
    points: 0,
    player: null,
    topMenu: null,
    balls: null,
    nextLive: 10000,
    startTime: null,
    sizeX: 0,
    sizeY: 0,
    stopGame: null,
    startGame: null,
    restartGame: null,
    reset: function() {
        this.level = 1;
        this.points = 0;
        this.balls = { blue: 0, red: 0, darkRed: 0, brown: 0 };
        this.nextLive = 10000;
        this.startLevel();
        this.startTime = Date.now();
        this.player.resurrect();
    },
    startLevel: function() {
        this.generateGrid();
        if (!this.player) {
            this.player = new Player({ parent: gameStage.player }, this);
        }
        if (!this.topMenu) {
            this.topMenu = new TopMenu();
            gameStage.stage.push(this.topMenu);
        }
        this.player.reset(this.grid);
        if (this.level >= 2) {
            if (!this.bureaucratObj) {
                this.bureaucratObj = new Bureaucrat({ parent: gameStage.bureaucrat });
            }
            this.bureaucratObj.reset(this.grid);
        } else if (this.bureaucratObj) {
            this.bureaucratObj.alive = false;
        }
        this.topMenu.update();
    },
    levelUp: function() {
        var _this = this;
        setTimeout(function() {
            gameStage.stage.render();
            _this.stopGame();
            setTimeout(function() {
                ++_this.level;
                _this.startGame();
                _this.startLevel();
                _this.topMenu.update();
            }, 1000);
        });
    },
    catchBall: function(type) {
        this.balls[type]++;
    },
    addPoints: function(points) {
        this.points = Math.max(0, this.points + points * this.level);
        if (this.points > this.nextLive) {
            this.player.lives++;
            soundPlayer.play('extra_life');
            this.nextLive = this.nextLive << 1;
        }
        this.topMenu.update();
    },
    kill: function(cause) {
        var _this = this;
        if (cause === 'buro') {
            soundPlayer.play('death_from_buro');
        } else {
            soundPlayer.play('sink');
        }
        this.player.kill();
        setTimeout(function() {
            gameStage.stage.render();
            _this.topMenu.update();
            _this.stopGame();
            if (_this.player.lives === 0) {
                setTimeout(function() {
                    gameStage.showSummaryScreen({
                        points: _this.points,
                        balls: _this.balls,
                        startTime: _this.startTime
                    });
                    var cb = function() {
                        gameStage.hideSummaryScreen();
                        _this.reset();
                        _this.restartGame();
                        document.removeEventListener('keydown', cb);
                        document.removeEventListener('click', cb);
                    };
                    setTimeout(function() {
                        document.addEventListener('keydown', cb);
                        document.addEventListener('click', cb);
                    }, 200);
                }, 1000);
            } else {
                setTimeout(function() {
                    _this.startGame();
                    _this.startLevel();
                    _this.topMenu.update();
                }, 1000);
            }
        });
    },
    generateGrid: function() {
        this.grid = [];
        this.sizeX = Math.min(this.level + 6, 14);
        this.sizeY = Math.min((this.level + 7) >> 1, 8);
        gameStage.leafGrid.reset();
        for (var i = 0; i < this.sizeX; ++i) {
            for (var j = 0; j < this.sizeY; ++j) {
                if (this.grid[i] === undefined) {
                    this.grid[i] = [];
                }
                var special = null;
                if (i === 0 && j === this.sizeY - 1) {
                    special = { start: true };
                }
                if (i === this.sizeX - 1 && j === 0) {
                    special = { coin: true };
                }
                this.grid[i][j] = new Leaf({ x: i, y: j, special: special, parent: gameStage.leafGrid });
                if (i === 0 && j === this.sizeY - 1) {
                    this.grid[i][j].speed = Math.random() / 2000;
                    this.grid[i][j].show();
                }
                if (i === this.sizeX - 1 && j === 0) {
                    this.grid[i][j].speed = 0;
                    this.grid[i][j].show();
                }
            }
        }
    }
};

class Drawable {
    constructor(data) {
        if (!gameCanvas.ctx) {
            throw new Error('gameCanvas service not configured');
        }
        if (!data || !data.parent || !data.parent.internalCanvas) {
            this.ctx = gameCanvas.ctx;
            this.canvas = gameCanvas.canvas;
        } else {
            this.setCanvas(data.parent.internalCanvas);
            data.parent.push(this);
        }
        this.data = data;
        if (this._generateCache) {
            this._generateCache();
        }
    }
    calculate(delta, timestamp, lastTimestamp) {}
    setParent(container) {
        this.parent = container;
        if (container.internalCanvas) {
            this.setCanvas(container.internalCanvas);
        }
    }
    resetParent() {
        this.parent = null;
    }
    setCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        disableSmoothing(this.ctx);
    }
    render() {
        throw new Error('Render method not initialized');
    }
}

class Container extends Drawable {
    constructor(data) {
        super(data);
        this.items = [];
        if (data && data.internalCanvas) {
            var margin = data.margin ? data.margin << 1 : 0;
            var canvas = document.createElement('canvas');
            canvas.width = this.canvas.width - margin - (data.x || 0);
            canvas.height = this.canvas.height - margin - (data.y || 0);
            this.internalCanvas = canvas;
            this.internalCtx = canvas.getContext('2d');
            disableSmoothing(this.internalCtx);
            this.x = (data.x || 0) + margin;
            this.y = (data.y || 0) + margin;
        }
    }
    push(item) {
        this.items.push(item);
        item.setParent(this);
    }
    unshift(item) {
        this.items.unshift(item);
        item.setParent(this);
    }
    pop() {
        var item = this.items.pop();
        if (item) item.resetParent();
        return item;
    }
    reset() {
        for (var i = 0; i < this.items.length; i++) {
            this.items[i].resetParent();
        }
        this.items = [];
    }
    calculate(delta, timestamp, lastTimestamp) {
        for (var i = 0; i < this.items.length; i++) {
            this.items[i].calculate(delta, timestamp, lastTimestamp);
        }
    }
    render() {
        if (this.internalCanvas) {
            this.internalCtx.clearRect(0, 0, this.internalCanvas.width, this.internalCanvas.height);
        }
        for (var i = 0; i < this.items.length; i++) {
            this.items[i].render();
        }
        if (this.internalCanvas) {
            this.ctx.drawImage(this.internalCanvas, this.x, this.y);
        }
    }
}

class Water extends Drawable {
    render() {
        this.ctx.drawImage(water, this.data.x, this.data.y);
    }
}

class Coin extends Drawable {
    render() {
        this.ctx.drawImage(this._cache, this.data.x - (this._cache.width >> 1), this.data.y - this._cache.height * 0.65);
    }
    _generateCache() {
        this._cache = Coin.renderCoin(this.data.level);
    }
    static renderCoin(level) {
        var render = coin.cloneNode();
        var ctx = render.getContext('2d');
        disableSmoothing(ctx);
        ctx.drawImage(coin, 0, 0);
        ctx.font = '16px "basis33"';
        var size = ctx.measureText(level);
        ctx.fillText(level, Math.round((render.width - size.width) >> 1), Math.round((render.height + 14) >> 1));
        return render;
    }
}

class Leaf extends Drawable {
    constructor(data) {
        super(data);
        this.waveH = 100;
        this.waveSpeed = 11.5;
        this.health = 100;
        var _this = this;
        this.state = {
            visible: !!Math.round(Math.random()),
            waves: false,
            get hidden() {
                return !this.waves && !this.visible;
            }
        };
        this.speed = Math.random() * 0.035;
        this.respawnProb = Math.random();
        this.playerOn = false;
        this.extra = null;
        this.coin = null;
        if (!gameCanvas.width || !gameState.sizeX) {
            throw new Error('gameCanvas.width or gameState.sizeX not defined');
        }
        var gridWidth = this.gridWidth = this.canvas.width / gameState.sizeX;
        var gridHeight = this.gridHeight = this.canvas.height / gameState.sizeY;
        this.x = ~~((this.data.x + 0.5) * gridWidth);
        this.y = ~~((this.data.y + 0.5) * gridHeight);
        if (!data.special) {
            var extra = ~~(Math.random() * 100);
            if (extra === 2 && gameState.level > 2) {
                this.extra = 'darkRed';
            } else if (extra === 3 && gameState.level > 2) {
                this.extra = 'brown';
            } else if (extra >= 60 && extra < 90) {
                this.extra = 'blue';
            } else if (extra >= 93) {
                this.extra = 'red';
            }
        } else if (data.special && data.special.coin) {
            this.coin = new Coin({ level: gameState.level, x: this.x, y: this.y });
            this.coin.setCanvas(this.canvas);
        }
    }
    hide() {
        this.state.visible = false;
        if (this.playerOn) {
            gameState.kill();
        }
        this.state.waves = true;
        soundPlayer.play('leaf');
    }
    clear() {
        this.state.waves = false;
    }
    show() {
        this.state.visible = true;
        this.state.waves = false;
        this.health = 100;
    }
    calculate(delta, timestamp, lastTimestamp) {
        if (this.state.visible) {
            this.health -= this.speed * delta;
            if (this.health < 0) {
                this.hide();
            }
        }
        if (this.state.waves) {
            this.waveH -= this.waveSpeed * delta * 0.025;
            if (this.waveH <= 0) {
                this.waveH = 100;
                this.state.waves = false;
            }
        }
        if (this.state.hidden) {
            if (Math.random() >= 0.01 * this.respawnProb + 0.99) {
                this.show();
            }
        }
    }
    render() {
        if (this.state.visible) {
            this._renderLeaf();
        }
        if (this.state.waves) {
            this._renderWaves();
        }
    }
    _getLeafSize() {
        var max = (this.canvas.width / gameState.sizeX) * 0.8;
        var min = 28;
        return ((max - min) * this.health / 100) + min;
    }
    _getWaveSize() {
        return ((this.canvas.width / gameState.sizeX) * 0.8) * ((100 - this.waveH) / 100) * 0.8;
    }
    _renderLeaf() {
        this.ctx.fillStyle = 'rgb(170, 170, 85)';
        this.ctx.strokeStyle = 'rgb(0, 255, 170)';
        this.ctx.lineWidth = 1.5;
        var size = this._getLeafSize();
        ellipse(this.ctx, this.x, this.y, size, size, true, true);
        switch (this.extra) {
            case 'blue':
                this.ctx.drawImage(blueBall, this.x - (blueBall.width >> 1), this.y - (blueBall.height >> 1));
                break;
            case 'red':
                this.ctx.drawImage(redBall, this.x - (redBall.width >> 1), this.y - (redBall.height >> 1));
                break;
            case 'brown':
                this.ctx.drawImage(brownBall, this.x - (brownBall.width >> 1), this.y - (brownBall.height >> 1));
                break;
            case 'darkRed':
                this.ctx.drawImage(darkRedBall, this.x - (darkRedBall.width >> 1), this.y - (darkRedBall.height >> 1));
                break;
        }
        if (this.coin && !this.playerOn) {
            this.coin.render();
        }
    }
    _renderWaves() {
        var r = this._getWaveSize();
        this.ctx.strokeStyle = 'rgba(255,255,255,' + (this.waveH / 100) + ')';
        this.ctx.lineWidth = 1;
        ellipse(this.ctx, this.x, this.y, r, r, true, false);
        this.ctx.lineWidth = 2;
        ellipse(this.ctx, this.x, this.y, r >> 1, r >> 1, true, false);
    }
    stepOn() {
        if (!this.state.visible) return false;
        this.playerOn = true;
        if (this.extra) {
            switch (this.extra) {
                case 'blue':
                    gameState.addPoints(50);
                    soundPlayer.play('blue');
                    break;
                case 'red':
                    gameState.addPoints(1000);
                    soundPlayer.play('red');
                    break;
                case 'brown':
                    gameState.addPoints(-500);
                    soundPlayer.play('orange');
                    break;
                case 'darkRed':
                    soundPlayer.play('purple');
                    var rand = Math.random();
                    if (rand > 0.4) {
                        gameState.player.lives++;
                        soundPlayer.play('extra_life');
                    } else {
                        this.hide();
                    }
                    if (gameState.bureaucratObj && !gameState.bureaucratObj.alive && Math.random() < 0.3) {
                        gameState.bureaucratObj.reset(gameState.grid);
                    }
                    break;
            }
            gameState.catchBall(this.extra);
            this.extra = null;
        } else {
            soundPlayer.play('jump');
        }
        return true;
    }
    stepOff() {
        this.playerOn = false;
    }
}

class Player extends Drawable {
    constructor(data, game) {
        super(data);
        this.direction = (data && data.direction) || 'left';
        this.game = game;
        this.dead = false;
        this.lives = 4;
        this.position = null;
        this.grid = null;
        var _this = this;
        kbd.on('up', function() { _this.moveUp(); });
        kbd.on('down', function() { _this.moveDown(); });
        kbd.on('left', function() { _this.moveLeft(); });
        kbd.on('right', function() { _this.moveRight(); });
    }
    reset(grid) {
        this.grid = grid;
        this.position = { x: 0, y: this.grid[0].length - 1 };
        this.dead = false;
    }
    resurrect() {
        this.lives = 4;
    }
    render() {
        if (!this.grid) return;
        var leaf = this.grid[this.position.x][this.position.y];
        if (!this.dead) {
            var posX = leaf.x - (Player.assets[this.direction].width >> 1);
            var posY = leaf.y - (Player.assets[this.direction].height >> 1);
            this.ctx.drawImage(Player.assets[this.direction], posX, posY);
        } else {
            var posX = leaf.x - (cross.width >> 1);
            var posY = leaf.y - (cross.height >> 1);
            this.ctx.drawImage(cross, posX, posY);
        }
    }
    moveUp() {
        this.direction = 'up';
        if (this.position.y === 0) return;
        this.stepOff();
        --this.position.y;
        this._verifyStep();
    }
    moveDown() {
        this.direction = 'down';
        if (this.position.y === this.grid[0].length - 1) return;
        this.stepOff();
        ++this.position.y;
        this._verifyStep();
    }
    moveLeft() {
        this.direction = 'left';
        if (this.position.x === 0) return;
        this.stepOff();
        --this.position.x;
        this._verifyStep();
    }
    moveRight() {
        this.direction = 'right';
        if (this.position.x === this.grid.length - 1) return;
        this.stepOff();
        ++this.position.x;
        this._verifyStep();
    }
    stepOff() {
        this.grid[this.position.x][this.position.y].stepOff();
    }
    kill() {
        this.dead = true;
        --this.lives;
    }
    _verifyStep() {
        var leaf = this.grid[this.position.x][this.position.y];
        if (leaf.coin) {
            this.game.levelUp();
            soundPlayer.play('finish');
        }
        if (!leaf.stepOn()) {
            this.game.kill();
        }
    }
}

Player.assets = {
    up: playerUp,
    down: playerDown,
    left: playerLeft,
    right: playerRight
};

class Bureaucrat extends Drawable {
    constructor(data) {
        super(data);
        this.position = { x: 0, y: 0 };
        this.grid = null;
        this.lastMoveTime = 0;
        this.moveInterval = 1500;
        this.alive = false;
    }
    reset(grid) {
        this.grid = grid;
        this.position = { x: grid.length - 1, y: 0 };
        this.lastMoveTime = Date.now();
        this.alive = true;
    }
    calculate(delta, timestamp) {
        if (!this.alive || !this.grid) return;
        var leaf = this.grid[this.position.x][this.position.y];
        if (!leaf.state.visible) {
            soundPlayer.play('buro_death');
            this.alive = false;
            return;
        }
        var pp = gameState.player.position;
        if (this.position.x === pp.x && this.position.y === pp.y && !gameState.player.dead) {
            gameState.kill('buro');
            return;
        }
        if (timestamp - this.lastMoveTime >= this.moveInterval) {
            this.lastMoveTime = timestamp;
            this._moveTowardsPlayer();
            soundPlayer.play('buro_jump');
        }
    }
    _moveTowardsPlayer() {
        var pp = gameState.player.position;
        var bx = this.position.x, by = this.position.y, bd = Infinity;
        var dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (var d = 0; d < dirs.length; d++) {
            var dx = dirs[d][0], dy = dirs[d][1];
            var nx = this.position.x + dx, ny = this.position.y + dy;
            if (nx < 0 || nx >= this.grid.length || ny < 0 || ny >= this.grid[0].length) continue;
            if (!this.grid[nx][ny].state.visible) continue;
            if (this.grid[nx][ny].health <= 10) continue;
            var dist = Math.abs(nx - pp.x) + Math.abs(ny - pp.y);
            if (dist < bd) { bd = dist; bx = nx; by = ny; }
        }
        this.position.x = bx; this.position.y = by;
    }
    render() {
        if (!this.alive || !this.grid) return;
        var leaf = this.grid[this.position.x][this.position.y];
        this.ctx.drawImage(bureaucratSprite, leaf.x - 40, leaf.y - 40);
    }
}

class TopMenu extends Drawable {
    constructor() {
        super({});
        this._rendered = false;
    }
    update() {
        this._rendered = false;
    }
    render() {
        if (this._rendered) return;
        this.ctx.drawImage(topMenuBg, 0, 0);
        for (var i = gameState.level - 2; i > 0; --i) {
            this.ctx.drawImage(coin, 60 + i * 7, 7 + 1 * (i % 2));
        }
        if (gameState.level > 1) {
            this.ctx.drawImage(Coin.renderCoin(gameState.level - 1), 60, 7);
        }
        for (var i = 0; i < gameState.player.lives - 1; ++i) {
            this.ctx.drawImage(playerDown, 380 + i * 25, -10);
        }
        this.ctx.fillStyle = '#aa0000';
        this.ctx.font = '16px "basis33"';
        var width = this.ctx.measureText(String(gameState.points)).width;
        this.ctx.fillText(gameState.points, Math.round(680 - (width >> 1)), Math.round(34));
        this._rendered = true;
    }
}

class SummaryScreen extends Drawable {
    render() {
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 0.5;
        this.ctx.fillStyle = '#000000';
        var halfWidth = this.canvas.width >> 1;
        this.ctx.fillRect(halfWidth - 178, 42, 360, 300);
        this.ctx.fillStyle = '#ffaa55';
        this.ctx.fillRect(halfWidth - 180, 40, 360, 300);
        this.ctx.strokeRect(halfWidth - 180, 40, 360, 300);
        this.ctx.font = '16px "basis33"';
        this.ctx.fillStyle = '#000000';
        var width = this.ctx.measureText('RESUME').width;
        this.ctx.fillText('RESUME', Math.round((this.canvas.width - width) >> 1), Math.round(80));
        this.ctx.font = '16px "basis33"';
        this.ctx.fillText('POINTS:', Math.round(halfWidth - 100), Math.round(120));
        this.ctx.fillText(this.data.points, Math.round(halfWidth + 30), Math.round(120));
        this.ctx.fillText('TIME:', Math.round(halfWidth - 100), Math.round(150));
        var time = Math.round(((new Date()).getTime() - this.data.startTime) / 1000);
        var seconds = time % 60;
        var minutes = Math.floor(time / 60);
        this.ctx.fillText(minutes + ' min ' + seconds + ' sec', Math.round(halfWidth + 30), Math.round(150));
        this.ctx.drawImage(blueBall, halfWidth - 120 - (blueBall.width >> 1), 200 - (blueBall.height >> 1));
        this.ctx.drawImage(redBall, halfWidth - 43 - (redBall.width >> 1), 200 - (redBall.height >> 1));
        this.ctx.drawImage(darkRedBall, halfWidth + 43 - (darkRedBall.width >> 1), 200 - (darkRedBall.height >> 1));
        this.ctx.drawImage(brownBall, halfWidth + 120 - (brownBall.width >> 1), 200 - (brownBall.height >> 1));
        this.ctx.fillStyle = '#000000';
        var redW = this.ctx.measureText(this.data.balls.red).width;
        var blueW = this.ctx.measureText(this.data.balls.blue).width;
        var darkRedW = this.ctx.measureText(this.data.balls.darkRed).width;
        var brownW = this.ctx.measureText(this.data.balls.brown).width;
        this.ctx.fillText(this.data.balls.blue, Math.round(((this.canvas.width - blueW) >> 1) - 120), Math.round(225));
        this.ctx.fillText(this.data.balls.red, Math.round(((this.canvas.width - redW) >> 1) - 43), Math.round(225));
        this.ctx.fillText(this.data.balls.darkRed, Math.round(((this.canvas.width - darkRedW) >> 1) + 43), Math.round(225));
        this.ctx.fillText(this.data.balls.brown, Math.round(((this.canvas.width - brownW) >> 1) + 120), Math.round(225));
        this.ctx.font = '16px "basis33"';
        width = this.ctx.measureText('Click to restart').width;
        this.ctx.fillText('Click to restart', Math.round((this.canvas.width - width) / 2), Math.round(280));
    }
}

var gameStage = {
    stage: null,
    game: null,
    leafGrid: null,
    player: null,
    setup: function() {
        this.stage = new Container();
        this.stage.push(new Water({ x: 0, y: 60 }));
        var game = this.game = new Container({ x: 0, y: 60, margin: 10, internalCanvas: true });
        this.stage.push(game);
        this.leafGrid = new Container({ internalCanvas: true, parent: game });
        this.bureaucrat = new Container({ internalCanvas: true, parent: game });
        this.player = new Container({ internalCanvas: true, parent: game });
    },
    showSummaryScreen: function(data) {
        this.game.push(new SummaryScreen(data));
        this.stage.render();
    },
    hideSummaryScreen: function() {
        this.game.pop();
    }
};
