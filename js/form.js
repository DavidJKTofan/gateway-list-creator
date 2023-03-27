const form = document.getElementById("url-form");
const resultDiv = document.getElementById("result");

// Form Submit Event
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  // Get Form Values
  const url = formData.get("url");
  const type = formData.get("type");
  const email = formData.get("email");
  const token = formData.get("token");
  const identifier = formData.get("identifier");
  // Get List Name
  const lastPart = url
    .substring(url.lastIndexOf("/") + 1)
    .replace(/\.[^/.]+$/, "");
  // Check URL
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
    // Check Status Code OK 200
    if (!response.ok) {
      resultDiv.innerHTML = `Error: ${response.status} ${response.statusText}`;
      resultDiv.innerHTML += `${response}`;
      return;
    }
    // Convert Response to CSV Blob
    const csvBlob = await response.blob();
    const csvUrl = window.URL.createObjectURL(csvBlob);
    // Output
    resultDiv.innerHTML = "Finalising... <br>";
    resultDiv.innerHTML += `<p>Download the ${type} CSV file:</p> <a href="${csvUrl}" download="${lastPart}-${type}.csv">${lastPart}-${type}.csv</a>`;
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
