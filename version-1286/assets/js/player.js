(function () {
  function attachSource(video, source) {
    if (video.dataset.initialized === 'true') {
      return;
    }

    video.dataset.initialized = 'true';

    if (source.indexOf('.m3u8') !== -1 && window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;

      hls.on(window.Hls.Events.ERROR, function (_event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }

        hls.destroy();
        video.src = source;
      });

      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    video.src = source;
  }

  function initializePlayer(player) {
    var video = player.querySelector('video[data-m3u8]');
    var button = player.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-m3u8');

    function startPlayback() {
      attachSource(video, source);
      player.classList.add('is-playing');

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        player.classList.remove('is-playing');
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(initializePlayer);
})();
