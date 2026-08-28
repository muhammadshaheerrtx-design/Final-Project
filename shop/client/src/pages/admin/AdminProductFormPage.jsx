import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, createProduct, updateProduct } from "../../api/client.js";
import { LoadingState, ErrorState } from "../../components/StateMessages.jsx";

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("");

  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;
    async function fetchProduct() {
      setLoading(true);
      setLoadError(null);
      try {
        const result = await getProduct(id);
        if (cancelled) return;
        const p = result.data;
        setName(p.name);
        setDescription(p.description);
        setPrice(String(p.price));
        setCategory(p.category);
        setImageUrl(p.imageUrl || "");
        setStock(String(p.stock));
      } catch (err) {
        if (!cancelled) setLoadError(err.response?.data?.error || "Couldn't load this product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    const payload = {
      name,
      description,
      price: Number(price),
      category,
      imageUrl,
      stock: Number(stock),
    };

    try {
      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate("/admin/products");
    } catch (err) {
      setSaveError(err.response?.data?.error || "Couldn't save product.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page-content"><LoadingState label="Loading product…" /></div>;
  if (loadError) return <div className="page-content"><ErrorState message={loadError} /></div>;

  return (
    <div className="page-content">
      <h1 className="page-title">{isEdit ? "Edit Product" : "New Product"}</h1>

      <form onSubmit={handleSubmit} className="admin-form">
        <label className="field">
          <span>Name</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Price</span>
            <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </label>
          <label className="field">
            <span>Stock</span>
            <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required />
          </label>
        </div>

        <label className="field">
          <span>Category</span>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
        </label>

        <label className="field">
          <span>Image URL (optional)</span>
          <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </label>

        {saveError && <ErrorState message={saveError} />}

        <div className="admin-form-actions">
          <button type="button" className="btn-ghost" onClick={() => navigate("/admin/products")}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}
