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
    request.url.endsWith("/create-list")
  ) {
    const { url } = await request.json();
    // Get Domains / Hostnames
    try {
      let domains = [];
      let list_domains = [];
      let response = await fetch(url);
      let responseBody = await response.text();
      let lines = responseBody.split("\n");
      // Limit the number of lines to a maximum of 4999 rows
      lines = lines.slice(1, 5000);
      // Loop through the lines
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line.startsWith("||")) {
          // Adblock Plus syntax rule
          let domain = line.slice(2).split("^")[0];
          domains.push(domain);
          list_domains.push({"value": domain });
        } else if (line.startsWith("0.0.0.0")) {
          // Hosts file syntax rule
          let domain = line.split(" ")[1];
          domains.push(domain);
          list_domains.push({"value": domain });
        }
      }
      // const joineddomains = list_domains.join("\n");
      const joineddomains = JSON.stringify(list_domains);
      // Create a new Response object
      const dataResponse = new Response(joineddomains, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      return dataResponse;
      // if (csvResponse.length <= 1 || csvResponse[0].length === 0) {
      //   return new Response("The CSV file is empty", { status: 200 });
      // } else {
      //   return csvResponse;
      // }
    } catch (error) {
      console.log("Something went wrong here...");
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
