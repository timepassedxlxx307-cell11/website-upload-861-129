import { H as Hls } from "./hls-vendor-dru42stk.js";

function bindPlayer(frame) {
    const video = frame.querySelector("video");
    const overlay = frame.querySelector("[data-play-overlay]");
    const stream = frame.getAttribute("data-stream") || "";
    let ready = false;
    let hls = null;

    const prepare = () => {
        if (ready || !video || !stream) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
        } else if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
        } else {
            video.src = stream;
        }
        video.controls = true;
        ready = true;
    };

    const play = async () => {
        prepare();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        try {
            await video.play();
        } catch (error) {
            video.controls = true;
        }
    };

    if (overlay) {
        overlay.addEventListener("click", play);
    }
    if (video) {
        video.addEventListener("click", () => {
            if (!ready || video.paused) {
                play();
            }
        });
    }
    window.addEventListener("pagehide", () => {
        if (hls) {
            hls.destroy();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-player]").forEach(bindPlayer);
});
