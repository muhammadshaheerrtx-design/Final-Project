export default function ProductToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  sort,
  onSortChange,
}) {
  return (
    <div className="toolbar">
      <input
        type="text"
        className="toolbar-search"
        placeholder="Search products…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search products"
      />

      <input
        type="text"
        className="toolbar-input"
        placeholder="Category"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        aria-label="Filter by category"
      />

      <input
        type="number"
        className="toolbar-input narrow"
        placeholder="Min $"
        value={minPrice}
        onChange={(e) => onMinPriceChange(e.target.value)}
        aria-label="Minimum price"
      />
      <input
        type="number"
        className="toolbar-input narrow"
        placeholder="Max $"
        value={maxPrice}
        onChange={(e) => onMaxPriceChange(e.target.value)}
        aria-label="Maximum price"
      />

      <select value={sort} onChange={(e) => onSortChange(e.target.value)} aria-label="Sort">
        <option value="newest">Newest</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
      </select>
    </div>
  );
}
