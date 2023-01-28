import { serve } from "https://deno.land/std@0.175.0/http/server.ts";
import { contentType } from "https://deno.land/std@0.175.0/media_types/mod.ts";
import { extname } from "https://deno.land/std@0.175.0/path/mod.ts";

function requestHandlerSearch(request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("q") || "";
  const url = new URL(searchTerm).toString();
  if (url) {
    return fetch(url);
  }
  return new Response(null, {
    status: 404,
  });
}
function requestHandlerHome() {
  const templateURL = new URL("./tree.html", import.meta.url);
  return fetch(templateURL);
}

const staticResources = {
  "/style/style.css": "./style/style.css",
  "/script/main.js": "./script/main.js",
  "/images/favicon.svg": "./images/favicon.svg",
  "/package.json": "./package.json",
};

const requestHandlers = {
  "/": requestHandlerHome,
  "/search": requestHandlerSearch,
};

async function requestHandler(request) {
  try {
    const { pathname } = new URL(request.url);

    const staticResource = staticResources[pathname];

    if (staticResource) {
      const response = await Deno.readFile(staticResource);

      return new Response(response, {
        headers: { "content-type": contentType(extname(staticResource)) },
      });
    }

    if (pathname in requestHandlers) {
      return requestHandlers[pathname](request);
    }

    return new Response(null, {
      status: 404,
    });
  } catch (error) {
    console.error(error.message || error.toString());
    return new Response(null, {
      status: 500,
    });
  }
}

if (import.meta?.main) {
  const timestamp = Date.now();
  const humanReadableDateTime = new Intl.DateTimeFormat("default", {
    dateStyle: "full",
    timeStyle: "long",
  }).format(timestamp);

  console.log("Current Date: ", humanReadableDateTime);
  console.info(`Server Listening on http://localhost:8000`);

  serve(requestHandler);
}
