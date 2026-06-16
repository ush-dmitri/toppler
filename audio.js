var audioContext = new (window.AudioContext || window.webkitAudioContext)();

function resumeAudio() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}
document.addEventListener('click', resumeAudio);
document.addEventListener('keydown', resumeAudio);

var soundPlayer = {
    buffers: {},

    load: function(name, url) {
        var _this = this;
        return new Promise(function(resolve) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function() {
                if (xhr.status === 0 || xhr.status === 200) {
                    audioContext.decodeAudioData(xhr.response,
                        function(buffer) { _this.buffers[name] = buffer; resolve(); },
                        function() { resolve(); }
                    );
                } else {
                    resolve();
                }
            };
            xhr.onerror = function() { resolve(); };
            xhr.send();
        });
    },

    loadAll: function() {
        var _this = this;
        var files = {
            'jump': 'src/jump.mp3',
            'buro_jump': 'src/buro_jump.mp3',
            'splash1': 'src/splash1.mp3',
            'splash2': 'src/splash2.mp3',
            'blue': 'src/blue.mp3',
            'orange': 'src/orange.mp3',
            'red': 'src/red.mp3',
            'purple': 'src/purple.mp3',
            'extra_life': 'src/extra_life.mp3',
            'sink': 'src/sink.mp3',
            'death_from_buro': 'src/death_from_buro.mp3',
            'buro_death': 'src/buro_death.mp3',
            'finish': 'src/finish.mp3'
        };
        var promises = [];
        for (var key in files) {
            promises.push(_this.load(key, files[key]));
        }
        return Promise.all(promises).then(function() {
            _this.initIntroMusic();
        });
    },

    play: function(name) {
        if (name === 'leaf') {
            name = Math.random() < 0.5 ? 'splash1' : 'splash2';
        }
        var buffer = this.buffers[name];
        if (!buffer) return;
        var source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
    },

    introMusic: null,

    initIntroMusic: function() {
        this.introMusic = new Audio('src/intro.mp3');

    },

    playIntroMusic: function() {
        if (this.introMusic) {
            this.introMusic.currentTime = 0;
            this.introMusic.play().catch(function(){});
        }
    },

    stopIntroMusic: function() {
        if (this.introMusic) {
            this.introMusic.pause();
            this.introMusic.currentTime = 0;
        }
    }
};
