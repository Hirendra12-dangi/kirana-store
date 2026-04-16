import React, { useState, useEffect } from 'react'
import { productsAPI } from '../lib/api'
import ProductForm from '../components/ProductForm'
import DataTable from '../components/DataTable'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAll()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (productData) => {
    try {
      await productsAPI.create(productData)
      fetchProducts()
      setShowForm(false)
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleUpdate = async (id, productData) => {
    try {
      await productsAPI.update(id, productData)
      fetchProducts()
      setEditingProduct(null)
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await productsAPI.delete(id)
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const getStockStatus = (product) => {
    if (!product.current_stock || product.current_stock <= 0) return '🔴 Out'
    if (product.current_stock < (product.min_stock_alert || 0)) return '🟡 Low'
    return '🟢 Good'
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'current_stock', header: 'Stock' },
    { key: 'purchase_price', header: 'Purchase Price' },
    { key: 'selling_price', header: 'Sell Price' },
    { key: 'profit_margin', header: 'Profit %', render: (product) => {
      const margin = product.purchase_price ? ((product.selling_price - product.purchase_price) / product.purchase_price * 100).toFixed(2) : 0
      return `${margin}%`
    }},
    { key: 'status', header: 'Status', render: getStockStatus },
    { key: 'actions', header: 'Actions', render: (product) => (
      <div className="space-x-2">
        <button onClick={() => setEditingProduct(product)} className="text-blue-500">Edit</button>
        <button onClick={() => handleDelete(product.id)} className="text-red-500">Delete</button>
        <button onClick={() => {/* restock logic */}} className="text-green-500">Restock</button>
      </div>
    )}
  ]

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-500 text-white px-4 py-2 rounded">Add Product</button>
      </div>
      {showForm && <ProductForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
      {editingProduct && <ProductForm product={editingProduct} onSubmit={(data) => handleUpdate(editingProduct.id, data)} onCancel={() => setEditingProduct(null)} />}
      <DataTable data={products} columns={columns} />
    </div>
  )
}

export default Products