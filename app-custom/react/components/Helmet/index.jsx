import React, { useEffect } from "react";
import { Helmet } from "vtex.render-runtime";
// import {GlobalStyles} from "../global-css/index"
import '../global-css/style.css'

export const headCustom = () => {
  useEffect(() => {
    let loaded = false;
    let script;

    const loadOctadesk = () => {
      if (loaded) return;
      loaded = true;

      script = document.createElement("script");
      script.defer = true;
      script.innerHTML = `
        (function (o, c, t, a, d, e, s) {
          o.octadesk = o.octadesk || {};
          o.octadesk.chatOptions = {
            subDomain: a,
            showButton: d,
            openOnMessage: e,
            hide: s,
          };
          const bd = c.getElementsByTagName("body")[0];
          const sc = c.createElement("script");
          sc.async = true;
          sc.src = t;
          bd.appendChild(sc);
        })(window, document, 'https://cdn.octadesk.com/embed.js', 'o167017-6bc', 'true', 'true', 'false');
      `;
      document.body.appendChild(script);

      events.forEach((evt) =>
        window.removeEventListener(evt, loadOctadesk)
      );
      clearTimeout(timeoutId);
    };

    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((evt) =>
      window.addEventListener(evt, loadOctadesk, { passive: true, once: true })
    );
    const timeoutId = setTimeout(loadOctadesk, 5000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, loadOctadesk));
      clearTimeout(timeoutId);
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const organizationSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GUESS Brasil",
    "url": "https://www.guessbrasil.com.br",
    "logo": "https://guessbr.vtexassets.com/assets/vtex/assets-builder/guessbr.fg-store/1.0.167/logo/new-logo-guess-small___27ee63f1c7bf362b14233e6c9c9630c7.png",
    "sameAs": [
      "https://www.instagram.com/guessbrasil/",
      "https://www.facebook.com/GUESSBrazil/"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Portuguese"
    }
  });

  return (
    <>
      <Helmet>
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
          rel="stylesheet"
        />        
        <link rel="preload" as="image" href="https://guessbr.vtexassets.com/assets/vtex.file-manager-graphql/images/50e246aa-ce34-4142-9e10-d79e000fe6ec___e010f2a5524e93b9d137b0f1cf54d9cf.jpeg" type="image/jpeg"/>
        <link rel="preload" as="image" href="https://guessbr.vtexassets.com/assets/vtex.file-manager-graphql/images/b53cdbaf-fadb-4f53-bf4c-8eb0e2224f4e___18908525d436d79dd984b59de518be2e.jpg" type="image/jpeg"/>
        <link rel="preload" as="image" href="https://guessbr.vtexassets.com/assets/vtex.file-manager-graphql/images/ea709ffc-7ef1-4feb-b4c0-cc16a6f199c8___0b6506de8dbd3cc88193221bcc2f4335.png" type="image/png"/>
        <link rel="preload" as="image" href="https://guessbr.vtexassets.com/assets/vtex.file-manager-graphql/images/0d8a7620-5169-417b-a6fe-45d0ab2ab227___56773a2d95246bf4d374bc2f0872b5a9.png" type="image/png"/>
        {/* Organization Schema */}
        <script type="application/ld+json">{organizationSchema}</script>
        {/* <GlobalStyles/> */}
      </Helmet>
    </>
  );
};