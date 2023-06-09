export async function onRequestPost({ request, env }) {
  return await submitHandler({ request, env });
}

async function submitHandler({ request, env }) {
  if (request.method === "OPTIONS") {
    // Handle CORS preflight requests
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } else if (request.method === "GET") {
    console.log("You are using this wrong :)");
    return new Response("You are using this wrong :)", {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } else if (
    request.method === "POST" &&
    request.url.endsWith("/fetch-networks")
  ) {
    const { url } = await request.json();
    // Get network IPs
    try {
      let networks = [];
      let response = await fetch(url);
      let responseBody = await response.text();
      let lines = responseBody.split("\n");
      //lines = lines.filter((line) => !line.startsWith("#") && line.includes("/") );
      // Limit the number of lines to a maximum of 4999 rows
      lines = lines.slice(0, 4999);
      var len = lines.length;
      var i = 0;
      while (i < len) {
        networks.push(lines[i]);
        i++;
      }

      // Convert the network IPs to a CSV string
      const csvString = networks.join("\n");

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
      // Return CSV file
      return csvResponse;
      // if (csvResponse.length <= 1 || csvResponse[0].length === 0) {
      //   return new Response("The CSV file is empty", { status: 200 });
      // } else {
      //   return csvResponse;
      // }
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
