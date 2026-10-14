
import express from "express";
import { calculatePrice } from "../src/pricing";
import type { Product } from "../src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/reprice", (req, res) => {
  const body: unknown = req.body;

  if (!Array.isArray(body)) {
    return res.status(400).json({
      error: "Request body must be an array of products",
    });
  }

  const products = body as Product[];
  const results = products.map(calculatePrice);

  return res.status(200).json(results);
});

app.listen(PORT, () => {
  console.log(`SaleScout API is running at http://localhost:${PORT}`);
});
