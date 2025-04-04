import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors({ origin: "*" }));
const PORT = process.env.PORT;

// Base URL for the Tripadvisor API
const TRIPADVISOR_BASE_URL = "https://api.content.tripadvisor.com/api/v1";
const API_KEY = process.env.TRIPADVISOR_API_KEY; // Store API Key securely

app.use(express.json()); // Middleware to parse JSON bodies

// Proxy Route: Handles all requests to Tripadvisor API
app.get("/api/tripadvisor/*", async (req, res) => {
	// ! LOGS
	console.log("Hit!");
	console.log("✅ Backend received request:", req.url);
	try {
		const endpoint = req.path.replace("/api/tripadvisor/", "").trim(); // Extract the correct endpoint
		console.log("✅ Extracted Endpoint:", endpoint); // Debug log

		if (!endpoint) {
			return res.status(400).json({ error: "Missing API endpoint" });
		}
		let { limit = 10, offset = 0, ...queryParams } = req.query; // Extract limit, offset & other params

		// Convert limit & offset to numbers to prevent string issues
		limit = parseInt(limit, 10);
		offset = parseInt(offset, 10);

		// Construct query parameters for Tripadvisor API
		const queryString = new URLSearchParams({
			key: API_KEY, // API key must always be included
			// limit,
			// offset,
			...queryParams, // Spread remaining query parameters (like location ID, search term, etc.)
		}).toString();

		// Construct full API URL
		const apiUrl = `${TRIPADVISOR_BASE_URL}/${endpoint}?${queryString}`;

		// ! Logs
		console.log("Requesting:", apiUrl);

		// Make request to Tripadvisor API
		const { data } = await axios.get(apiUrl, {
			// headers: { "X-TripAdvisor-API-Key": API_KEY }, // ✅ Send API key in headers
			timeout: 10000,
		});

		// Send back Tripadvisor’s response
		res.json(data);
	} catch (error) {
		console.error("Error fetching Tripadvisor data:", error.response?.data || error.message);
		res.status(error.response?.status || 500).json({
			error: "Failed to fetch data from Tripadvisor",
			details: error.response?.data || error.message,
		});
	}
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
