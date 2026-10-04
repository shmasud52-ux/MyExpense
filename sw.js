const CACHE_NAME = "myexpense-v3";


const ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.webmanifest",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
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


        const url =
            new URL(event.request.url);


        /* skip non-http(s) */

        if (
            !url.protocol.startsWith("http")
        ) {

            return;
        }


        /* network-first for HTML */

        if (
            event.request.mode === "navigate"
        ) {

            event.respondWith(

                fetch(event.request)
                    .then(
                        response => {

                            const copy =
                                response.clone();

                            caches
                                .open(CACHE_NAME)
                                .then(
                                    cache => {

                                        cache.put(
                                            "./index.html",
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
                    )

            );

            return;
        }


        /* cache-first for others */

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
