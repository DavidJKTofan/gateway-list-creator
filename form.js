const form = document.getElementById("url-form");
const resultDiv = document.getElementById("result");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const url = formData.get("url");
  const type = formData.get("type");

  if (!isValidUrl(url)) {
    resultDiv.innerHTML = "Error: Please enter a valid URL.";
    return;
  }

  let endpoint;
  if (type === "domains") {
    endpoint = "/fetch-domains";
  } else {
    endpoint = "/fetch-hosts";
  }

  resultDiv.innerHTML = `Fetching ${type}...`;

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

  const lastPart = url
    .substring(url.lastIndexOf("/") + 1)
    .replace(/\.[^/.]+$/, "");

  resultDiv.innerHTML = `
  <p>Download the ${type} CSV file:</p>
  <a href="${csvUrl}" download="${lastPart}-${type}.csv">${lastPart}-${type}.csv</a>
        `;
});

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}
