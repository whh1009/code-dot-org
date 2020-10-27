let cacheName = "oceans-app-v3";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log("=====Add to cache when installing SW=====");
      let resourcesToAdd = [
        "/assets/js/fish.js",
        "/assets/css/code-studio.css",
        "/assets/application.css",
        "/assets/js/webpack-runtime.js",
        "/assets/js/essential.js",
        "/assets/js/vendors.js",
        "/assets/application.js",
        "/assets/js/en_us/common_locale.js",
        "/assets/js/code-studio-common.js",
        "/assets/js/code-studio.js",
        "/assets/js/levels/show.js",
        "/assets/js/layouts/_small_footer.js",
        "/assets/css/common.css",
        "/assets/css/fish.css",
        "/assets/js/blockly.js",
        "/shared/css/hamburger.css",
        "/blockly/video-js/video-js.css",
        "/assets/spinner-big.gif",
        "/assets/fontawesome-webfont.woff2",
        "/assets/fontawesome-webfont.woff",
        "/assets/fontawesome-webfont.ttf",
        "/favicon.ico",
        "/assets/logo.svg",
        "/assets/js/en_us/blockly_locale.js",
        "/assets/js/common.js",
        "/assets/js/en_us/fish_locale.js",
        "/blockly/media/skins/fish/images/ai-bot-body.png",
        "/blockly/media/skins/fish/images/ai-bot-closed.png",
        "/blockly/media/skins/fish/images/ai-bot-no.png",
        "/blockly/media/skins/fish/images/ai-bot-yes.png",
        "/blockly/media/skins/fish/images/blue-prediction-frame.png",
        "/blockly/media/skins/fish/images/blue-scanner.png",
        "/blockly/media/skins/fish/images/green-prediction-frame.png",
        "/blockly/media/skins/fish/images/green-scanner.png",
        "/blockly/media/skins/fish/images/lab-background.png",
        "/blockly/media/skins/fish/images/water-background.png",
        "/blockly/media/skins/fish/images/loading.gif",
        "/s/oceans/stage/1/puzzle/1",
        "/s/oceans/stage/1/puzzle/2",
        "/s/oceans/stage/1/puzzle/3",
        "/s/oceans/stage/1/puzzle/4",
        "/s/oceans/stage/1/puzzle/5",
        "/s/oceans/stage/1/puzzle/6",
        "/s/oceans/stage/1/puzzle/7",
        "/s/oceans/stage/1/puzzle/8"
      ];
      return cache.addAll(resourcesToAdd);
      // TODO: cache dynamic content such as:
      // /api/user_progress/oceans/1/8/17943
    })
  );
});

self.addEventListener("fetch", event => {
  console.log("---Request", event.request.url, "---");

  event.respondWith(
    caches.open(cacheName).then(cache => {
      return cache
        .match(event.request, { ignoreSearch: true })
        .then(response => {
          if (response) {
            console.log("=====Hit ", event.request.url, "=====");
            return response;
          } else {
            console.log("=====Miss ", event.request.url, "=====");
            return fetch(event.request).then(response => {
              if (
                event.request.url.match(/\/127.0.0.1:3000\//) &&
                response.status !== 404
              ) {
                console.log(
                  "=====Cache new request",
                  event.request.url,
                  "====="
                );
                cache.put(event.request, response.clone());
              }
              return response;
            });
          }
        });
    })
  );
});
