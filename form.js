const form = document.getElementById("url-form");
const resultDiv = document.getElementById("result");

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
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      resultDiv.innerHTML = `Error: ${response.status} ${response.statusText}`;
      return;
    }

    const csvBlob = await response.blob();
    const csvUrl = window.URL.createObjectURL(csvBlob);

    resultDiv.innerHTML = `
  <p>Download the ${type} CSV file:</p>
  <a href="${csvUrl}" download="${lastPart}-${type}.csv">${lastPart}-${type}.csv</a>
        `;
    var html_to_insert = "<p>New paragraph</p>";
    resultDiv.innerHTML += html_to_insert;
  } catch (error) {
    resultDiv.innerHTML = `ERROR... ${error}...`;
  }
  // Cloudflare API call
  // Create Zero Trust List
  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Email": `${email}`,
        // "X-Auth-Key": `${token}`, // Get Global API key (legacy)
        "Authorization": `Bearer ${token}`,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: `{"description":"This is a test here","items":[{"value":"example.com"}],"name":"${lastPart}","type":"${list_type}"}`,
    };
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${identifier}/gateway/lists`,
      options
    )
      .then((response) => response.json())
      .then((response) => console.log(response))
      .catch((err) => console.error(err));

    if (!response.ok) {
      resultDiv.innerHTML = `Error: ${response.status} ${response.statusText}`;
      return;
    } else {
      resultDiv.innerHTML = `List ${lastPart} created...`;
    }
  } catch (error) {
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
