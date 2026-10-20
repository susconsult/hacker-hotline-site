// Eigen videospeler voor Hacker Hotline.
// Zonder JavaScript blijft de gewone browserspeler (controls) werken.
(function () {
  document.querySelectorAll('[data-player]').forEach(setup);

  function setup(root) {
    var video = root.querySelector('video');
    if (!video) return;

    var L = {};
    try { L = JSON.parse(root.getAttribute('data-labels') || '{}'); } catch (e) {}

    var big = root.querySelector('[data-act="big"]');
    var bigLabel = root.querySelector('.hh-big-label');
    var bar = root.querySelector('.hh-bar');
    var btnPlay = root.querySelector('[data-act="play"]');
    var btnMute = root.querySelector('[data-act="mute"]');
    var btnFs = root.querySelector('[data-act="fs"]');
    var btnSpeed = root.querySelector('[data-act="speed"]');
    var track = root.querySelector('[data-track]');
    var rest = root.querySelector('[data-rest]');
    var buffer = root.querySelector('[data-buffer]');
    var thumb = root.querySelector('[data-thumb]');
    var cur = root.querySelector('[data-cur]');
    var dur = root.querySelector('[data-dur]');

    // Overnemen van de gewone speler.
    video.controls = false;
    root.classList.add('is-enhanced');
    big.hidden = false;
    bar.hidden = false;
    root.classList.add('is-idle'); // balk pas tonen na de eerste klik

    var started = false;
    var speeds = [1, 1.25, 1.5, 0.75];

    function fmt(s) {
      s = Math.max(0, Math.floor(s || 0));
      var m = Math.floor(s / 60), r = s % 60;
      return m + ':' + (r < 10 ? '0' : '') + r;
    }

    function toggle() {
      if (video.paused || video.ended) {
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        video.pause();
      }
    }

    function progress() {
      var d = video.duration || 0;
      var pct = d ? (video.currentTime / d) * 100 : 0;
      rest.style.left = pct + '%';
      thumb.style.left = pct + '%';
      cur.textContent = fmt(video.currentTime);
      track.setAttribute('aria-valuenow', Math.floor(video.currentTime));
      track.setAttribute('aria-valuetext', fmt(video.currentTime) + ' / ' + fmt(d));
    }

    function buffered() {
      var d = video.duration || 0;
      if (!d || !video.buffered.length) return;
      var end = video.buffered.end(video.buffered.length - 1);
      buffer.style.left = Math.min(100, (end / d) * 100) + '%';
    }

    // Balk verbergen als er niets gebeurt.
    var idleTimer = null;
    function wake() {
      if (!started) return;
      root.classList.remove('is-idle');
      clearTimeout(idleTimer);
      if (!video.paused) {
        idleTimer = setTimeout(function () {
          if (!video.paused && !root.classList.contains('is-seeking')) root.classList.add('is-idle');
        }, 2500);
      }
    }

    // Afspelen / pauzeren
    big.addEventListener('click', function () { toggle(); });
    btnPlay.addEventListener('click', toggle);
    video.addEventListener('click', toggle);

    video.addEventListener('play', function () {
      started = true;
      big.hidden = true;
      root.classList.add('is-playing');
      root.classList.remove('is-ended');
      btnPlay.setAttribute('aria-label', L.pause || 'Pause');
      wake();
    });
    video.addEventListener('pause', function () {
      root.classList.remove('is-playing');
      btnPlay.setAttribute('aria-label', L.play || 'Play');
      wake();
    });
    video.addEventListener('ended', function () {
      root.classList.add('is-ended');
      root.classList.remove('is-idle');
      bigLabel.textContent = L.again || bigLabel.textContent;
      big.hidden = false;
    });
    video.addEventListener('waiting', function () { root.classList.add('is-waiting'); });
    ['playing', 'canplay', 'pause'].forEach(function (ev) {
      video.addEventListener(ev, function () { root.classList.remove('is-waiting'); });
    });

    video.addEventListener('loadedmetadata', function () {
      dur.textContent = fmt(video.duration);
      track.setAttribute('aria-valuemax', Math.floor(video.duration));
      progress();
    });
    video.addEventListener('timeupdate', progress);
    video.addEventListener('progress', buffered);

    // Zoeken in de meter (muis en aanraken)
    function seekTo(clientX) {
      var r = track.getBoundingClientRect();
      var pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      if (video.duration) {
        video.currentTime = pct * video.duration;
        progress();
      }
    }
    track.addEventListener('pointerdown', function (e) {
      if (!started) toggle();
      root.classList.add('is-seeking');
      try { track.setPointerCapture(e.pointerId); } catch (x) {}
      seekTo(e.clientX);
    });
    track.addEventListener('pointermove', function (e) {
      if (root.classList.contains('is-seeking')) seekTo(e.clientX);
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      track.addEventListener(ev, function () { root.classList.remove('is-seeking'); wake(); });
    });
    track.addEventListener('keydown', function (e) {
      var step = { ArrowLeft: -5, ArrowRight: 5, PageDown: -30, PageUp: 30 }[e.key];
      if (e.key === 'Home') { video.currentTime = 0; e.preventDefault(); }
      else if (e.key === 'End') { video.currentTime = video.duration || 0; e.preventDefault(); }
      else if (step) { video.currentTime = Math.max(0, video.currentTime + step); e.preventDefault(); }
      progress(); wake();
    });

    // Geluid
    function syncMute() {
      root.classList.toggle('is-muted', video.muted);
      btnMute.setAttribute('aria-label', video.muted ? (L.unmute || 'Unmute') : (L.mute || 'Mute'));
    }
    btnMute.addEventListener('click', function () { video.muted = !video.muted; syncMute(); });
    video.addEventListener('volumechange', syncMute);

    // Snelheid
    btnSpeed.addEventListener('click', function () {
      var i = (speeds.indexOf(video.playbackRate) + 1) % speeds.length;
      video.playbackRate = speeds[i];
      btnSpeed.textContent = String(speeds[i]).replace('.', ',') + '×';
    });

    // Volledig scherm (op de speler zelf, zodat de eigen balk zichtbaar blijft)
    function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement; }
    btnFs.addEventListener('click', function () {
      if (fsElement()) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      } else if (root.requestFullscreen) {
        root.requestFullscreen().catch(function () {});
      } else if (root.webkitRequestFullscreen) {
        root.webkitRequestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen(); // iPhone: alleen de eigen speler van iOS
      }
    });
    function syncFs() {
      var on = fsElement() === root;
      root.classList.toggle('is-fullscreen', on);
      btnFs.setAttribute('aria-label', on ? (L.fs_exit || 'Exit full screen') : (L.fs || 'Full screen'));
    }
    document.addEventListener('fullscreenchange', syncFs);
    document.addEventListener('webkitfullscreenchange', syncFs);

    // Toetsen als de speler focus heeft
    root.addEventListener('keydown', function (e) {
      if (e.target === track) return;
      var k = e.key.toLowerCase();
      if (k === ' ' || k === 'k') {
        if (e.target.tagName === 'BUTTON' && k === ' ') return; // knop handelt zelf af
        toggle(); e.preventDefault();
      } else if (k === 'm') { video.muted = !video.muted; }
      else if (k === 'f') { btnFs.click(); }
      else if (k === 'arrowleft') { video.currentTime = Math.max(0, video.currentTime - 5); }
      else if (k === 'arrowright') { video.currentTime = video.currentTime + 5; }
      wake();
    });

    root.addEventListener('pointermove', wake);
    root.addEventListener('focusin', wake);
    root.addEventListener('touchstart', wake, { passive: true });

    syncMute();
    progress();
  }
})();
