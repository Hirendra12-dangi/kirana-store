import React, { useState, useEffect } from 'react'
import { customersAPI } from '../lib/api'
import CustomerForm from '../components/CustomerForm'
import DataTable from '../components/DataTable'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const data = await customersAPI.getAll()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (customerData) => {
    try {
      await customersAPI.create(customerData)
      fetchCustomers()
      setShowForm(false)
    } catch (error) {
      console.error('Error creating customer:', error)
    }
  }

  const handleUpdate = async (id, customerData) => {
    try {
      await customersAPI.update(id, customerData)
      fetchCustomers()
      setEditingCustomer(null)
    } catch (error) {
      console.error('Error updating customer:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await customersAPI.delete(id)
      fetchCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'total_due', header: 'Total Due', render: (customer) => `₹${customer.total_due || 0}` },
    { key: 'status', header: 'Status', render: (customer) => customer.total_due > 0 ? 'Debtor' : 'Clear' },
    { key: 'actions', header: 'Actions', render: (customer) => (
      <div className="space-x-2">
        <button onClick={() => setEditingCustomer(customer)} className="text-blue-500">Edit</button>
        <button onClick={() => handleDelete(customer.id)} className="text-red-500">Delete</button>
        <button onClick={() => {/* view ledger */}} className="text-green-500">View Ledger</button>
      </div>
    )}
  ]

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-500 text-white px-4 py-2 rounded">Add Customer</button>
      </div>
      {showForm && <CustomerForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
      {editingCustomer && <CustomerForm customer={editingCustomer} onSubmit={(data) => handleUpdate(editingCustomer.id, data)} onCancel={() => setEditingCustomer(null)} />}
      <DataTable data={customers} columns={columns} />
    </div>
  )
}

export default Customers