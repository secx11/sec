const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/submit', async (req, res) => {
  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(req.body)) {
    formData.append(key, value);
  }

  try {
    const response = await fetch("https://docs.google.com/forms/d/e/1FAIpQLSfBKCbDVJ-ju6LuwL7qKXP2L7cav0wWQVv99ojK2b_HWpdMFw/formResponse", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    if (response.ok) {
      res.status(200).json({ message: "Form submitted successfully" });
    } else {
      res.status(response.status).json({ error: `Failed to submit form: ${response.statusText}` });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});