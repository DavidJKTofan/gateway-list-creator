const form = document.getElementById("url-form");
const resultDiv = document.getElementById("result");

// Form Submit Event
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const url = formData.get("url");
  const type = formData.get("type");
  const email = formData.get("email");
  const token = formData.get("token");
  const identifier = formData.get("identifier");

  const lastPart = url
    .substring(url.lastIndexOf("/") + 1)
    .replace(/\.[^/.]+$/, "");

  if (!isValidUrl(url)) {
    resultDiv.innerHTML = "Error: Please enter a valid URL.";
    return;
  }

  // Check type of List
  let endpoint;
  let list_type;
  if (type === "networks") {
    endpoint = "/fetch-networks";
    list_type = "IP";
  } else {
    endpoint = "/fetch-hosts";
    list_type = "DOMAIN";
  }
  resultDiv.innerHTML = `Fetching ${type}...`;
  try {
    // Fetch and process the List
    const [response, list_domains] = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    console.log(list_domains)
    console.log(response)

    if (!response.ok) {
      resultDiv.innerHTML = `Error: ${response.status} ${response.statusText}`;
      return;
    }
    // Convert Response to CSV Blob
    // const csvBlob = await response.blob();
    // const csvUrl = window.URL.createObjectURL(csvBlob);

    //   resultDiv.innerHTML = `<p>Download the ${type} CSV file:</p> <a href="${csvUrl}" download="${lastPart}-${type}.csv">${lastPart}-${type}.csv</a>`;
    var html_to_insert = `Domain list: ${list_domains}`;
    resultDiv.innerHTML += html_to_insert;
  } catch (error) {
    resultDiv.innerHTML = `ERROR... ${error}...`;
  }
  // Cloudflare API call
  // Create Zero Trust List
  try {
    const workers_url = `https://cloudflare-api.cf-testing.workers.dev/?identifier=${identifier}`;
    const response = await fetch(workers_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({
        // include the body data here
        email: `${email}`,
        authorization: `${token}`,
        accountid: `${identifier}`,
        data: JSON.stringify({
          description: "This is a test here",
          items: [{ value: "example.com" }],
          name: `${lastPart}`,
          type: `${list_type}`,
        }),
      }),
    });
    console.log("RESPONSE", response);
    const json = JSON.stringify(response);
    console.log("JSON", json);

    // BLOCKED BY CORS !!!!
    // const gateway_url = `https://api.cloudflare.com/client/v4/accounts/${identifier}/gateway/lists`;
    // const options = {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "X-Auth-Email": `${email}`,
    //     // "X-Auth-Key": `${token}`, // Get Global API key (legacy)
    //     "Authorization": `Bearer ${token}`,
    //     "Access-Control-Allow-Origin": "*",
    //     "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    //     "Access-Control-Allow-Headers": "*",
    //   },
    //   // body: `{"description":"This is a test here","items":[{"value":"example.com"}],"name":"${lastPart}","type":"${list_type}"}`,
    //   body: JSON.stringify({
    //     description: "This is a test here",
    //     items: [{ value: "example.com" }],
    //     name: `${lastPart}`,
    //     type: `${list_type}`,
    //   }),
    // };
    // console.log("OPTIONS: ", options);
    // const response = await fetch(gateway_url, options);
    // console.log("RESPONSE: ", response);
    // const json = await response.json();
    // console.log("JSON: ", json);

    if (!response.ok) {
      resultDiv.innerHTML = `Error: ${response.status} ${response.statusText}`;
      return;
    } else {
      resultDiv.innerHTML = `List ${lastPart} created...`;
      var html_to_insert = `Response: ${response}`;
      resultDiv.innerHTML += html_to_insert;
    }
  } catch (error) {
    console.log("Failed...");
    resultDiv.innerHTML = `ERROR... ${error}...`;
  }
});

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}
