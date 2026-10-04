const CACHE_NAME = "myexpense-v1";


const ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.webmanifest"
];


/* INSTALL */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    cache =>
                        cache.addAll(ASSETS)
                )
                .then(
                    () =>
                        self.skipWaiting()
                )

        );
    }
);


/* ACTIVATE */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()
                .then(
                    keys => {

                        return Promise.all(

                            keys
                                .filter(
                                    key =>
                                        key !== CACHE_NAME
                                )
                                .map(
                                    key =>
                                        caches.delete(key)
                                )

                        );
                    }
                )
                .then(
                    () =>
                        self.clients.claim()
                )

        );
    }
);


/* FETCH */

self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !== "GET"
        ) {

            return;
        }


        event.respondWith(

            caches
                .match(event.request)
                .then(
                    cachedResponse => {

                        if (
                            cachedResponse
                        ) {

                            return cachedResponse;
                        }


                        return fetch(
                            event.request
                        )
                        .then(
                            response => {

                                if (
                                    !response ||
                                    response.status !== 200 ||
                                    response.type !== "basic"
                                ) {

                                    return response;
                                }


                                const copy =
                                    response.clone();


                                caches
                                    .open(CACHE_NAME)
                                    .then(
                                        cache => {

                                            cache.put(
                                                event.request,
                                                copy
                                            );
                                        }
                                    );


                                return response;
                            }
                        )
                        .catch(
                            () =>
                                caches.match(
                                    "./index.html"
                                )
                        );

                    }
                )

        );
    }
);
