const form = document.getElementById("url-form");
const resultDiv = document.getElementById("result");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const url = formData.get("url");

  const lastPart = url
    .substring(url.lastIndexOf("/") + 1)
    .replace(/\.[^/.]+$/, "");

  resultDiv.innerHTML = "Fetching hosts...";

  const response = await fetch("/fetch-hosts", {
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
          <p>Download the hosts CSV file:</p>
          <a href="${csvUrl}" download="${lastPart}.csv">${lastPart}.csv</a>
        `;
});
