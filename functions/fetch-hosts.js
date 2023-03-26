export async function onRequestPost({ request, env }) {
	return await submitHandler({ request, env });
}

async function submitHandler({ request, env }) {
  if (request.method === "OPTIONS") {
    // Handle preflight requests
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } else if (request.method === "GET") {
    return new Response("You are using this wrong :)", {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } else if (
    request.method === "POST" &&
    request.url.endsWith("/fetch-hosts")
  ) {
    const { url } = await request.json();

    try {
      let domains = [];
      let response = await fetch(url);
      let responseBody = await response.text();
      let lines = responseBody.split("\n");
      lines = lines.filter((line) => line.startsWith("0.0.0.0"));
      lines = lines.slice(1, 5000);
      var len = lines.length;
      var i = 0;
      while (i < len) {
        let domain = lines[i].split(" ")[1];
        domains.push(domain);
        i++;
      }

      // Convert the domains to a CSV string
      const csvString = domains.join("\n");

      // Get the filename from the URL
      const urlObj = new URL(url);
      const filename = urlObj.pathname.split("/").pop();

      // Create a new Response object with the CSV string and set its MIME type to "text/csv"
      const csvResponse = new Response(csvString, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
          "Access-Control-Allow-Origin": "*",
        },
      });

      return csvResponse;
    } catch (error) {
      return new Response(error.message, {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }
  }

  return new Response("Not found", {
    status: 404,
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
