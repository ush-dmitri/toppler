function disableSmoothing(ctx) {
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
}

function ellipse(ctx, x, y, r1, r2, stroke, fill) {
    ctx.beginPath();
    ctx.moveTo(x - r1 / 2, y);
    ctx.bezierCurveTo(x - r1 / 2, y - r2 / 2, x + r1 / 2, y - r2 / 2, x + r1 / 2, y);
    ctx.bezierCurveTo(x + r1 / 2, y + r2 / 2, x - r1 / 2, y + r2 / 2, x - r1 / 2, y);
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

function drawBall(ctx, x, y, colorStop) {
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ellipse(ctx, x + 1.5, y + 1.5, 15, 15, false, true);
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    var radgrad = ctx.createRadialGradient(x - 1.5, y - 1.5, 0, x, y, 20);
    radgrad.addColorStop(0, '#ffffff');
    radgrad.addColorStop(0.2, colorStop);
    ctx.lineWidth = 0.5;
    ctx.fillStyle = radgrad;
    ellipse(ctx, x, y, 15, 15, true, true);
}

var water = (function() {
    var canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    var ctx = canvas.getContext('2d');
    disableSmoothing(ctx);
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.lineWidth = 1;
    var x1 = 0, x2 = 800, y1 = 0, y2 = 600, l = 20;
    var tmpY = y1;
    ctx.fillStyle = "rgb(85,85,170)";
    ctx.fillRect(0, 0, 800, 600);
    ctx.beginPath();
    while ((tmpY += l * 0.3) < y2) {
        var tmpX = x1 - l;
        ctx.moveTo(tmpX, tmpY - l * 0.2);
        while ((tmpX += l) < x2) {
            ctx.lineTo(tmpX + 0.5 * l, tmpY + l * 0.15);
            ctx.lineTo(tmpX + l, tmpY - l * 0.15);
        }
    }
    ctx.stroke();
    return canvas;
})();

var coin = (function() {
    var canvas = document.createElement('canvas');
    canvas.width = 45;
    canvas.height = 45;
    var ctx = canvas.getContext('2d');
    disableSmoothing(ctx);
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = 0.5;
    ctx.fillStyle = "rgba(170,170,0,1)";
    ellipse(ctx, 25, 22, 37, 45, true, true);
    ctx.fillStyle = "rgba(255,255,85,1)";
    ellipse(ctx, 22, 22, 40, 45, true, true);
    ctx.strokeStyle = "rgba(170,170,0,1)";
    ellipse(ctx, 22, 22, 35, 40, true, false);
    return canvas;
})();

var cross = (function() {
    var canvas = document.createElement('canvas');
    canvas.width = 35;
    canvas.height = 75;
    var ctx = canvas.getContext('2d');
    disableSmoothing(ctx);
    ctx.fillStyle = 'black';
    var x = canvas.width >> 1;
    var y = canvas.height >> 1;
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'white';
    ctx.strokeRect(x - 2.5, y - 25, 5, 50);
    ctx.strokeRect(x - 15, y - 12, 30, 5);
    ctx.strokeStyle = '#ffaa55';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 2.5, y - 25, 5, 50);
    ctx.strokeRect(x - 15, y - 12, 30, 5);
    ctx.fillRect(x - 2.5, y - 25, 5, 50);
    ctx.fillRect(x - 15, y - 12, 30, 5);
    return canvas;
})();

var topMenuBg = null;

function createTopMenuBg() {
    var canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 60;
    var ctx = canvas.getContext('2d');
    disableSmoothing(ctx);
    ctx.fillStyle = '#55aaff';
    ctx.fillRect(0, 0, canvas.width, 60);
    ctx.fillStyle = '#000000';
    ctx.font = '16px "PxPlus IBM VGA"';
    ctx.fillText('COINS:', 10, Math.round(34));
    var width = ctx.measureText('LIVES:').width;
    ctx.fillText('LIVES:', 360, Math.round(34));
    ctx.fillStyle = '#000000';
    ctx.font = '16px "PxPlus IBM VGA"';
    width = ctx.measureText('POINTS:').width;
    ctx.fillText('POINTS:', 560, Math.round(34));
    ctx.fillStyle = '#cce6ff';
    var dx = 50, dy = 0;
    var pi2 = Math.PI * 2;
    ctx.beginPath(); ctx.arc(600 + dx, 34 + dy, 18, 0, pi2, true); ctx.fill();
    ctx.beginPath(); ctx.arc(625 + dx, 38 + dy, 18, 0, pi2, true); ctx.fill();
    ctx.beginPath(); ctx.arc(635 + dx, 20 + dy, 18, 0, pi2, true); ctx.fill();
    ctx.beginPath(); ctx.arc(640 + dx, 38 + dy, 18, 0, pi2, true); ctx.fill();
    ctx.beginPath(); ctx.arc(660 + dx, 30 + dy, 18, 0, pi2, true); ctx.fill();
    ctx.beginPath(); ctx.arc(680 + dx, 15 + dy, 10, 0, pi2, true); ctx.fill();
    ctx.beginPath(); ctx.arc(580 + dx, 50 + dy, 7.5, 0, pi2, true); ctx.fill();
    return canvas;
}

var blueBall = (function() {
    var canvas = document.createElement('canvas');
    canvas.width = 25; canvas.height = 25;
    var ctx = canvas.getContext('2d');
    disableSmoothing(ctx);
    drawBall(ctx, 12, 12, 'rgb(0,0,255)');
    return canvas;
})();

var redBall = (function() {
    var canvas = document.createElement('canvas');
    canvas.width = 25; canvas.height = 25;
    var ctx = canvas.getContext('2d');
    disableSmoothing(ctx);
    drawBall(ctx, 12, 12, 'rgb(255,0,85)');
    return canvas;
})();

var brownBall = (function() {
    var canvas = document.createElement('canvas');
    canvas.width = 25; canvas.height = 25;
    var ctx = canvas.getContext('2d');
    disableSmoothing(ctx);
    drawBall(ctx, 12, 12, 'rgb(228,175,86)');
    return canvas;
})();

var darkRedBall = (function() {
    var canvas = document.createElement('canvas');
    canvas.width = 25; canvas.height = 25;
    var ctx = canvas.getContext('2d');
    disableSmoothing(ctx);
    drawBall(ctx, 12, 12, 'rgb(164,4,4)');
    return canvas;
})();

var playerUp = (function() {
    var canvas = document.createElement('canvas');
    canvas.width = 80; canvas.height = 80;
    var ctx = canvas.getContext('2d');
    disableSmoothing(ctx);
    var x = 40, y = 40;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 2, y + 3.5);
    ctx.bezierCurveTo(x - 2, y + 8.5, x - 2, y + 8.5, x - 9, y + 8.5);
    ctx.moveTo(x + 2, y + 3.5);
    ctx.bezierCurveTo(x + 2, y + 8.5, x + 2, y + 8.5, x + 9, y + 8.5);
    ctx.stroke();
    ctx.lineWidth = 0.5;
    var radgrad = ctx.createRadialGradient(x - 5, y - 3, 1, x, y, 20);
    radgrad.addColorStop(0, 'rgba(255,255,255,0.8)');
    radgrad.addColorStop(0.2, '#00ff00');
    ctx.fillStyle = radgrad;
    ellipse(ctx, x, y, 18, 17, true, true);
    radgrad = ctx.createRadialGradient(x + 6, y - 10, 0, x, y, 20);
    radgrad.addColorStop(0, 'rgba(255,255,255,0.5)');
    radgrad.addColorStop(0.2, '#0000ff');
    ctx.fillStyle = radgrad;
    ellipse(ctx, x + 5, y - 8, 8, 7, true, true);
    radgrad = ctx.createRadialGradient(x - 4, y - 10, 0, x, y, 20);
    radgrad.addColorStop(0, 'rgba(255,255,255,0.5)');
    radgrad.addColorStop(0.2, '#0000ff');
    ctx.fillStyle = radgrad;
    ellipse(ctx, x - 5, y - 8, 8, 7, true, true);
    ctx.fillStyle = 'rgb(255,170,0)';
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.beginPath();
    ctx.moveTo(x, y - 4);
    ctx.bezierCurveTo(x - 2, y + 1, x - 3, y + 1, x, y + 6);
    ctx.stroke();
    return canvas;
})();

var playerDown = (function() {
    var canvas = document.createElement('canvas');
    canvas.width = 80; canvas.height = 80;
    var ctx = canvas.getContext('2d');
    disableSmoothing(ctx);
    var x = 40, y = 40;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 2, y + 3.5);
    ctx.bezierCurveTo(x - 2, y + 8.5, x - 2, y + 8.5, x - 9, y + 8.5);
    ctx.moveTo(x + 2, y + 3.5);
    ctx.bezierCurveTo(x + 2, y + 8.5, x + 2, y + 8.5, x + 9, y + 8.5);
    ctx.stroke();
    ctx.lineWidth = 0.5;
    var radgrad = ctx.createRadialGradient(x - 5, y - 3, 1, x, y, 20);
    radgrad.addColorStop(0, 'rgba(255,255,255,0.8)');
    radgrad.addColorStop(0.2, '#00ff00');
    ctx.fillStyle = radgrad;
    ellipse(ctx, x, y, 18, 17, true, true);
    radgrad = ctx.createRadialGradient(x + 6, y - 10, 0, x, y, 20);
    radgrad.addColorStop(0, 'rgba(255,255,255,0.5)');
    radgrad.addColorStop(0.2, '#0000ff');
    ctx.fillStyle = radgrad;
    ellipse(ctx, x + 5, y - 8, 8, 7, true, true);
    radgrad = ctx.createRadialGradient(x - 4, y - 10, 0, x, y, 20);
    radgrad.addColorStop(0, 'rgba(255,255,255,0.5)');
    radgrad.addColorStop(0.2, '#0000ff');
    ctx.fillStyle = radgrad;
    ellipse(ctx, x - 5, y - 8, 8, 7, true, true);
    radgrad = ctx.createRadialGradient(x - 2, y - 3, 0, x, y, 20);
    radgrad.addColorStop(0, '#ffeaa2');
    radgrad.addColorStop(0.2, 'rgb(255,170,0)');
    ctx.fillStyle = radgrad;
    ellipse(ctx, x, y - 1.5, 11.5, 11.5, true, true);
    return canvas;
})();

var playerLeft = (function() {
    var canvas = document.createElement('canvas');
    canvas.width = 80; canvas.height = 80;
    var ctx = canvas.getContext('2d');
    disableSmoothing(ctx);
    var x = 40, y = 40;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 3.5);
    ctx.bezierCurveTo(x + 4, y + 6.5, x, y + 6.5, x + 11, y + 6.5);
    ctx.moveTo(x - 2, y + 3.5);
    ctx.bezierCurveTo(x - 2, y + 8.5, x - 2, y + 8.5, x - 9, y + 8.5);
    ctx.stroke();
    ctx.lineWidth = 0.5;
    var radgrad = ctx.createRadialGradient(x, y - 3, 1, x, y, 20);
    radgrad.addColorStop(0, 'rgba(255,255,255,0.8)');
    radgrad.addColorStop(0.2, '#00ff00');
    ctx.fillStyle = radgrad;
    ellipse(ctx, x, y - 1, 18, 17, true, true);
    radgrad = ctx.createRadialGradient(x + 4, y - 10, 0, x, y, 20);
    radgrad.addColorStop(0, 'rgba(255,255,255,0.5)');
    radgrad.addColorStop(0.2, '#0000ff');
    ctx.fillStyle = radgrad;
    ellipse(ctx, x + 3, y - 8, 8, 7, true, true);
    radgrad = ctx.createRadialGradient(x - 7, y - 10, 0, x, y, 20);
    radgrad.addColorStop(0, 'rgba(255,255,255,0.5)');
    radgrad.addColorStop(0.2, '#0000ff');
    ctx.fillStyle = radgrad;
    ellipse(ctx, x - 8, y - 8, 8, 7, true, true);
    radgrad = ctx.createRadialGradient(x - 5.5, y - 4.5, 0, x, y, 20);
    radgrad.addColorStop(0, '#FFDA92');
    radgrad.addColorStop(0.2, 'rgb(255,170,0)');
    ctx.fillStyle = radgrad;
    ctx.beginPath();
    ctx.moveTo(x, y - 3);
    ctx.bezierCurveTo(x - 3, y - 10, x - 14, y - 8, x - 11, y + 2);
    ctx.moveTo(x, y - 3);
    ctx.bezierCurveTo(x - 1, y + 8, x - 7, y - 3, x - 11, y + 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y - 3);
    ctx.bezierCurveTo(x - 3, y - 10, x - 14, y - 8, x - 11, y + 2);
    ctx.moveTo(x, y - 3);
    ctx.bezierCurveTo(x - 1, y + 8, x - 7, y - 3, x - 11, y + 2);
    ctx.stroke();
    return canvas;
})();

var playerRight = (function() {
    var canvas = document.createElement('canvas');
    canvas.width = 80; canvas.height = 80;
    var ctx = canvas.getContext('2d');
    disableSmoothing(ctx);
    var x = 40, y = 40;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 3.5);
    ctx.bezierCurveTo(x - 4, y + 6.5, x, y + 6.5, x - 11, y + 6.5);
    ctx.moveTo(x + 2, y + 3.5);
    ctx.bezierCurveTo(x + 2, y + 8.5, x + 2, y + 8.5, x + 9, y + 8.5);
    ctx.stroke();
    ctx.lineWidth = 0.5;
    var radgrad = ctx.createRadialGradient(x - 5, y - 3, 1, x, y, 20);
    radgrad.addColorStop(0, 'rgba(255,255,255,0.8)');
    radgrad.addColorStop(0.2, '#00ff00');
    ctx.fillStyle = radgrad;
    ellipse(ctx, x, y - 1, 18, 17, true, true);
    radgrad = ctx.createRadialGradient(x - 2, y - 10, 0, x, y, 20);
    radgrad.addColorStop(0, 'rgba(255,255,255,0.5)');
    radgrad.addColorStop(0.2, '#0000ff');
    ctx.fillStyle = radgrad;
    ellipse(ctx, x - 3, y - 8, 8, 7, true, true);
    radgrad = ctx.createRadialGradient(x + 9, y - 10, 0, x, y, 20);
    radgrad.addColorStop(0, 'rgba(255,255,255,0.5)');
    radgrad.addColorStop(0.2, '#0000ff');
    ctx.fillStyle = radgrad;
    ellipse(ctx, x + 8, y - 8, 8, 7, true, true);
    radgrad = ctx.createRadialGradient(x + 4.5, y - 4.5, 0, x, y, 20);
    radgrad.addColorStop(0, '#FFDA92');
    radgrad.addColorStop(0.2, 'rgb(255,170,0)');
    ctx.fillStyle = radgrad;
    ctx.beginPath();
    ctx.moveTo(x, y - 3);
    ctx.bezierCurveTo(x + 3, y - 10, x + 14, y - 8, x + 11, y + 2);
    ctx.moveTo(x, y - 3);
    ctx.bezierCurveTo(x + 1, y + 8, x + 7, y - 3, x + 11, y + 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y - 3);
    ctx.bezierCurveTo(x + 3, y - 10, x + 14, y - 8, x + 11, y + 2);
    ctx.moveTo(x, y - 3);
    ctx.bezierCurveTo(x + 1, y + 8, x + 7, y - 3, x + 11, y + 2);
    ctx.stroke();
    return canvas;
})();

var bureaucratSprite = (function() {
    var canvas = document.createElement('canvas');
    canvas.width = 80; canvas.height = 80;
    var ctx = canvas.getContext('2d');
    disableSmoothing(ctx);
    ctx.clearRect(0, 0, 80, 80);
    ctx.save();
    ctx.translate(20, 20);
    ctx.scale(0.5, 0.5);
    ctx.fillStyle = '#A00000'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(40, 44, 24, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FF66FF';
    ctx.beginPath(); ctx.ellipse(28, 28, 12, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(52, 28, 12, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFF';
    ctx.fillRect(30, 40, 4, 6); ctx.fillRect(38, 40, 4, 6); ctx.fillRect(46, 40, 4, 6);
    ctx.lineWidth = 4; ctx.beginPath();
    ctx.moveTo(30, 60); ctx.lineTo(30, 70); ctx.lineTo(22, 70);
    ctx.moveTo(50, 60); ctx.lineTo(50, 70); ctx.lineTo(58, 70); ctx.stroke();
    ctx.restore();
    return canvas;
})();
