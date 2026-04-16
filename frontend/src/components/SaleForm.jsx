import React, { useState, useEffect } from 'react'

const SaleForm = ({ products, customers, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    product_id: '',
    customer_id: '',
    quantity: '',
    unit_price: '',
    total_amount: '',
    payment_mode: 'cash',
    sale_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const selectedProduct = products.find(p => p.id === formData.product_id)

  useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        unit_price: selectedProduct.selling_price || '',
        total_amount: (prev.quantity * (selectedProduct.selling_price || 0)).toFixed(2)
      }))
    }
  }, [selectedProduct, formData.quantity])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'quantity' || name === 'unit_price') {
        updated.total_amount = (updated.quantity * updated.unit_price).toFixed(2)
      }
      return updated
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
      <select name="product_id" value={formData.product_id} onChange={handleChange} required className="w-full p-2 border">
        <option value="">Select Product</option>
        {products.map(product => (
          <option key={product.id} value={product.id}>{product.name} (Stock: {product.current_stock})</option>
        ))}
      </select>
      <input name="quantity" type="number" step="0.01" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required className="w-full p-2 border" />
      <input name="unit_price" type="number" step="0.01" value={formData.unit_price} onChange={handleChange} placeholder="Unit Price" required className="w-full p-2 border" />
      <input name="total_amount" type="number" step="0.01" value={formData.total_amount} onChange={handleChange} placeholder="Total Amount" required className="w-full p-2 border" />
      <select name="payment_mode" value={formData.payment_mode} onChange={handleChange} className="w-full p-2 border">
        <option value="cash">Cash</option>
        <option value="credit">Credit</option>
        <option value="upi">UPI</option>
      </select>
      <select name="customer_id" value={formData.customer_id} onChange={handleChange} className="w-full p-2 border">
        <option value="">Select Customer (Optional)</option>
        {customers.map(customer => (
          <option key={customer.id} value={customer.id}>{customer.name}</option>
        ))}
      </select>
      <input name="sale_date" type="date" value={formData.sale_date} onChange={handleChange} required className="w-full p-2 border" />
      <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes" className="w-full p-2 border"></textarea>
      <div className="flex space-x-2">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save Sale</button>
        <button onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
      </div>
    </form>
  )
}

export default SaleForm