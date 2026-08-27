import { useState, useRef, useEffect } from "react";

export default function ProductToolbar({
  category,
  onCategoryChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  sort,
  onSortChange,
}) {
  const [openPopover, setOpenPopover] = useState(null); // "category" | "price" | null
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpenPopover(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const priceLabel =
    minPrice || maxPrice ? `Price: $${minPrice || "0"} - $${maxPrice || "∞"}` : "Price: min - max";
  const categoryLabel = category ? `Category: ${category}` : "Category ▾";

  return (
    <div className="filter-bar" ref={wrapRef}>
      <div className="pill-popover-wrap">
        <button
          type="button"
          className="pill-button"
          onClick={() => setOpenPopover((v) => (v === "category" ? null : "category"))}
        >
          {categoryLabel}
        </button>
        {openPopover === "category" && (
          <div className="price-popover">
            <label className="field">
              <span>Category</span>
              <input
                type="text"
                placeholder="e.g. electronics"
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
                autoFocus
              />
            </label>
          </div>
        )}
      </div>

      <div className="pill-popover-wrap">
        <button
          type="button"
          className="pill-button"
          onClick={() => setOpenPopover((v) => (v === "price" ? null : "price"))}
        >
          {priceLabel}
        </button>
        {openPopover === "price" && (
          <div className="price-popover">
            <label className="field">
              <span>Min price</span>
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Max price</span>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
              />
            </label>
          </div>
        )}
      </div>

      <select
        className="pill-select"
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="Sort"
      >
        <option value="newest">Sort: Newest</option>
        <option value="price_asc">Sort: Price ▾ (low to high)</option>
        <option value="price_desc">Sort: Price ▾ (high to low)</option>
      </select>
    </div>
  );
}
