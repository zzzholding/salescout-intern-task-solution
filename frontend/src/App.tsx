
import { useState } from "react";
import "./App.css";

interface Competitor {
  seller: string;
  price: number;
  inStock: boolean;
}

interface Product {
  sku: string;
  name: string;
  myPrice: number;
  minPrice: number;
  maxPrice: number;
  step: number;
  competitors: Competitor[];
}

interface PriceResult {
  sku: string;
  oldPrice: number;
  newPrice: number;
  reason: "UNDERCUT" | "AT_MIN" | "AT_MAX" | "NO_COMPETITORS";
}

const products: Product[] = [
  {
    sku: "IPH15-128-BLK",
    name: "Apple iPhone 15 128Gb",
    myPrice: 389990,
    minPrice: 370000,
    maxPrice: 420000,
    step: 10,
    competitors: [
      { seller: "TechnoMarket", price: 384990, inStock: true },
      { seller: "GadgetKZ", price: 379990, inStock: false },
      { seller: "AlmatyPhone", price: 386500, inStock: true },
    ],
  },
  {
    sku: "SAM-A55-256",
    name: "Samsung Galaxy A55 256Gb",
    myPrice: 189000,
    minPrice: 180000,
    maxPrice: 210000,
    step: 100,
    competitors: [
      { seller: "MobiStore", price: 175000, inStock: true },
    ],
  },
  {
    sku: "XIA-RN13-128",
    name: "Xiaomi Redmi Note 13 128Gb",
    myPrice: 89990,
    minPrice: 80000,
    maxPrice: 99990,
    step: 50,
    competitors: [
      { seller: "Shop1", price: 85000, inStock: false },
    ],
  },
  {
    sku: "AIRPODS-PRO2",
    name: "Apple AirPods Pro 2",
    myPrice: 119990,
    minPrice: 100000,
    maxPrice: 125000,
    step: 1,
    competitors: [
      { seller: "EarShop", price: 150000, inStock: true },
    ],
  },
  {
    sku: "DYSON-V15",
    name: "Dyson V15 Detect",
    myPrice: 359000,
    minPrice: 330000,
    maxPrice: 380000,
    step: 0.5,
    competitors: [
      { seller: "HomeTech", price: 349999.9, inStock: true },
    ],
  },
  {
    sku: "JBL-FLIP6",
    name: "JBL Flip 6",
    myPrice: 54990,
    minPrice: 45000,
    maxPrice: 60000,
    step: 10,
    competitors: [],
  },
];

function formatPrice(price: number): string {
  return `${price.toLocaleString("ru-RU")} ₸`;
}

export default function App() {
  const [results, setResults] = useState<PriceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function repriceProducts() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/reprice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(products),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: PriceResult[] = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError(
        "Не удалось получить цены. Проверь, запущен ли сервер Express на порту 3000."
      );
    } finally {
      setLoading(false);
    }
  }

  const changedCount = results.filter(
    (result) => result.oldPrice !== result.newPrice
  ).length;

  return (
    <main className="page">
      <header className="header">
        <div>
          <p className="eyebrow">SMART PRICING PLATFORM</p>
          <h1>SaleScout</h1>
          <p className="subtitle">
            Управление ценами и анализ конкурентов
          </p>
        </div>

        <button onClick={repriceProducts} disabled={loading}>
          {loading ? "Рассчитываем..." : "Пересчитать цены"}
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="stats">
        <article className="stat-card">
          <span>Всего товаров</span>
          <strong>{products.length}</strong>
        </article>

        <article className="stat-card">
          <span>Рассчитано</span>
          <strong>{results.length}</strong>
        </article>

        <article className="stat-card">
          <span>Изменения цены</span>
          <strong>{changedCount}</strong>
        </article>
      </section>

      <section className="table-card">
        <div className="table-heading">
          <div>
            <h2>Цены товаров</h2>
            <p>Результаты расчёта на основе данных конкурентов</p>
          </div>

          <span className="count">{products.length} товаров</span>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>SKU / Товар</th>
                <th>Старая цена</th>
                <th>Новая цена</th>
                <th>Изменение</th>
                <th>Причина</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const result = results.find(
                  (item) => item.sku === product.sku
                );

                const difference = result
                  ? result.newPrice - result.oldPrice
                  : 0;

                return (
                  <tr key={product.sku}>
                    <td>
                      <strong>{product.name}</strong>
                      <span className="sku">{product.sku}</span>
                    </td>

                    <td>{formatPrice(product.myPrice)}</td>

                    <td className="new-price">
                      {result ? formatPrice(result.newPrice) : "—"}
                    </td>

                    <td
                      className={
                        difference > 0
                          ? "increase"
                          : difference < 0
                            ? "decrease"
                            : ""
                      }
                    >
                      {result
                        ? `${difference > 0 ? "+" : ""}${formatPrice(difference)}`
                        : "—"}
                    </td>

                    <td>
                      {result ? (
                        <span className={`reason ${result.reason}`}>
                          {result.reason}
                        </span>
                      ) : (
                        <span className="pending">Ожидает</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {results.length === 0 && (
          <p className="empty">
            Нажми «Пересчитать цены», чтобы получить результаты с сервера.
          </p>
        )}
      </section>

      <footer>SaleScout · Учебный проект для стажировки</footer>
    </main>
  );
}
