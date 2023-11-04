import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import CSS from "./css/app.css";
import { ExternalScriptsHandle, ExternalScripts } from "remix-utils/external-scripts";
import { useEffect, useState } from "react";
export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: CSS },
  { rel: "stylesheet", href: '/global.css' }
];
export let handle: ExternalScriptsHandle = {
  scripts: [
    {
      src: "https://dapi.kakao.com/v2/maps/sdk.js?appkey=a0bf728be4ea8a8be3c00464e7c70c98&libraries=services&autoload=false",
    }
  ],
};
// export const scripts

export default function App() {
  const [isLoad, setIsLoad] = useState(false)
  useEffect(() => {
    if (!isLoad) {
      kakao.maps.load(() => {
        setIsLoad(true)
      })
    }
  }, [isLoad])
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <ExternalScripts />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={{ isLoad }} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
