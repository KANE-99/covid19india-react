if (typeof importScripts === 'function') {
  importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js'
  );

  /* global workbox */
  if (workbox) {
    console.log('Workbox is loaded 🚀');
    workbox.core.skipWaiting();

    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute([{"revision":"8ada1e53c1ff9332bcfd2f6f54be2a1a","url":"404.html"},{"revision":"2ec37b867905425ca1d9eb52005b5442","url":"74896c147a826e9ee61f.worker.js"},{"revision":"ad8463d1313fed60e1d10324511efdc3","url":"fonts/Archia/archia-bold-webfont.woff2"},{"revision":"80da55a565ba8976b8e9e84e8c511bf7","url":"fonts/Archia/archia-medium-webfont.woff2"},{"revision":"890ee929da47c4931933ff77fd557520","url":"fonts/Archia/archia-semibold-webfont.woff2"},{"revision":"8ada1e53c1ff9332bcfd2f6f54be2a1a","url":"index.html"},{"revision":"a66872bead1f894a79ea2488187e8ff2","url":"static/css/20.f5f9d973.chunk.css"},{"revision":"aec0263b7091a3a0ab689526fe720e6c","url":"static/css/21.a45f0422.chunk.css"},{"revision":"bd6ef1b6e2b8b26c9960094c3bbfc405","url":"static/js/0.9566e874.chunk.js"},{"revision":"69fd178e0d768cc7cd79c2da7080ba58","url":"static/js/1.173dd8fc.chunk.js"},{"revision":"769b8178f3c65c25bdb44373b1ab27d9","url":"static/js/10.9e98ff4b.chunk.js"},{"revision":"1c865352b2b86f8a247bd3e9a5e34ddf","url":"static/js/11.f5956b5e.chunk.js"},{"revision":"d55bfbf9f0e69ba18c1ac77298355cc0","url":"static/js/12.5a5783db.chunk.js"},{"revision":"b8b1ea6db227d51349ff30de6733d661","url":"static/js/13.d3a0336d.chunk.js"},{"revision":"d924c73fc9db3c1c7f282e00b719f136","url":"static/js/14.56eb67d9.chunk.js"},{"revision":"8d2a70c08ead545d0f0c3e4550ff5cc1","url":"static/js/15.31ca5f7a.chunk.js"},{"revision":"57cfe3bc9c533db8bb097419a06b9b21","url":"static/js/16.101e619d.chunk.js"},{"revision":"468932454f67587ee5790b8ed01f1a7e","url":"static/js/17.a3f5d68f.chunk.js"},{"revision":"6cce9cd680c04fea5e11e2ecbaeffabc","url":"static/js/18.cd89148d.chunk.js"},{"revision":"241944b31c049c1f385cad1c97886ae2","url":"static/js/19.845f6a5d.chunk.js"},{"revision":"dc83222c76cef8513e4d43e2df1502f9","url":"static/js/2.0ffb00f7.chunk.js"},{"revision":"20fc705e4260381272ddfbae0b7b7004","url":"static/js/20.4dbf8a58.chunk.js"},{"revision":"01d14689575009e0fe717c3c3b1cc845","url":"static/js/21.96b7fcf7.chunk.js"},{"revision":"0b248647951990e123a093f8c0ac69e8","url":"static/js/22.e097aab9.chunk.js"},{"revision":"d8a19042832f21245f0909691e6ba97b","url":"static/js/23.153d5299.chunk.js"},{"revision":"eda8aa98b684c7e311d37c6f0a30b987","url":"static/js/24.219b5456.chunk.js"},{"revision":"d1bef91db4a35691f15cf695070ba24d","url":"static/js/25.85a5b518.chunk.js"},{"revision":"6b032cde5d0871331ab81f6ea019c920","url":"static/js/26.cc4aa3bb.chunk.js"},{"revision":"df1d8a681dccc67e2f94db86d6b8802d","url":"static/js/27.d3abd2df.chunk.js"},{"revision":"8892bd6d54409e90e0a1595495f95fb1","url":"static/js/28.8b29fca7.chunk.js"},{"revision":"fd8461b4cfd9144b3eb2b5037ab6334d","url":"static/js/29.0cea22f5.chunk.js"},{"revision":"4dd82e6484fdf82730d76b203e3ea6c2","url":"static/js/3.c0b1f7fb.chunk.js"},{"revision":"1f652b29d0d7254304a287509eff1b50","url":"static/js/30.6bf823b9.chunk.js"},{"revision":"d20353dca020d183e8953652aeb11340","url":"static/js/31.b330fa28.chunk.js"},{"revision":"63a99f551a5daf717e6c24e5314119de","url":"static/js/32.22168364.chunk.js"},{"revision":"b9138d83c346b41ad4e96cf04217ee25","url":"static/js/33.778715e1.chunk.js"},{"revision":"b667d8a05b47f6f1972003d87c64236c","url":"static/js/34.7eed0e3c.chunk.js"},{"revision":"2bf944cef4350fa8a4a340c912792250","url":"static/js/35.d8ee86e9.chunk.js"},{"revision":"a8b1bbe68302b945fd3156b6c5b32252","url":"static/js/36.583cecef.chunk.js"},{"revision":"d4777ba6f3f3e7b5a7d5a38820e7fc99","url":"static/js/37.67cca9ec.chunk.js"},{"revision":"7672c03ab8c142171feb92f6480a88a8","url":"static/js/38.e06dd333.chunk.js"},{"revision":"a0282a66d871d2126f7d4c5e5610b030","url":"static/js/39.ba3da673.chunk.js"},{"revision":"945daa7fe4ffbf5338808dba96f76175","url":"static/js/4.0b49e78b.chunk.js"},{"revision":"c7fc498d845e1330d7dcf00f52758971","url":"static/js/40.a00d9aa1.chunk.js"},{"revision":"9d2b451048891a2175851694ebde15bd","url":"static/js/41.4b92d480.chunk.js"},{"revision":"a5f257a44949b710f0c5b86e1b518e0e","url":"static/js/42.5c69be7a.chunk.js"},{"revision":"58ef2ea51bfc54a11d5101e473c27a19","url":"static/js/43.f9be3615.chunk.js"},{"revision":"e5f7c38347ed703a3cb79d8af775437b","url":"static/js/44.b916d8ab.chunk.js"},{"revision":"42bfac1bdd884e3a18e9d63a4be927e1","url":"static/js/45.3138b0ec.chunk.js"},{"revision":"e05678062222d28bbc4c948b75378d15","url":"static/js/46.a42055e6.chunk.js"},{"revision":"dc8ba0ce917c9c7a1e9a051079bf55fa","url":"static/js/47.1543f9d2.chunk.js"},{"revision":"601e09cbda02f543fbcc6266ab89256e","url":"static/js/5.160c1da6.chunk.js"},{"revision":"ed4febfad871047965d7309bbf8014e9","url":"static/js/6.932b0ca7.chunk.js"},{"revision":"3c47b210566d53d4965c32a93e67ed22","url":"static/js/7.78e898a3.chunk.js"},{"revision":"cfa1c5f2f3e4ac5d1e097ccf97bc730e","url":"static/js/main.eb2259b9.chunk.js"},{"revision":"8ab50ec0e06ded14bd5782328aa3bae9","url":"static/js/runtime-main.497aa0f4.js"}]);

    /* custom cache rules */
    workbox.routing.registerRoute(
      new workbox.routing.NavigationRoute(
        new workbox.strategies.NetworkFirst({
          cacheName: 'PRODUCTION',
        })
      )
    );

    // Adding staleWhileRevalidate for all js files. Provide faster access from cache while revalidating in the background
    workbox.routing.registerRoute(
      /.*\.js$/,
      new workbox.strategies.StaleWhileRevalidate()
    );

    // Adding staleWhileRevalidate for all html files
    workbox.routing.registerRoute(
      /.*\.html/,
      new workbox.strategies.StaleWhileRevalidate()
    );

    // Adding staleWhileRevalidate for all css files
    workbox.routing.registerRoute(
      /.*\.css/,
      new workbox.strategies.StaleWhileRevalidate()
    );

    // Adding networkFirst for all json data. In offline mode will be fetched from cache
    workbox.routing.registerRoute(
      new RegExp('https://api\\.covid19india\\.org/.*\\.json'),
      new workbox.strategies.NetworkFirst(),
      'GET'
    );
  } else {
    console.log('Workbox could not be loaded. Hence, no offline support.');
  }
}
