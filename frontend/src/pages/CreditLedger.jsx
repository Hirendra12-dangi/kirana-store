import React, { useState, useEffect } from 'react'
import { creditAPI, customersAPI } from '../lib/api'
import CreditForm from '../components/CreditForm'
import DataTable from '../components/DataTable'

const CreditLedger = () => {
  const [credits, setCredits] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    fetchData()
  }, [tab])

  const fetchData = async () => {
    try {
      const [creditsData, customersData] = await Promise.all([
        tab === 'overdue' ? creditAPI.getOverdue() : creditAPI.getAll(),
        customersAPI.getAll()
      ])
      setCredits(creditsData)
      setCustomers(customersData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyInterest = async () => {
    try {
      await creditAPI.applyInterest()
      fetchData()
    } catch (error) {
      console.error('Error applying interest:', error)
    }
  }

  const columns = [
    { key: 'customer_name', header: 'Customer', render: (credit) => customers.find(c => c.id === credit.customer_id)?.name },
    { key: 'amount', header: 'Amount', render: (credit) => `₹${credit.amount}` },
    { key: 'transaction_date', header: 'Date' },
    { key: 'due_date', header: 'Due Date' },
    { key: 'days_overdue', header: 'Days Overdue' },
    { key: 'interest', header: 'Interest', render: (credit) => `₹${credit.interest || 0}` },
    { key: 'total_payable', header: 'Total Payable', render: (credit) => `₹${(credit.amount + (credit.interest || 0))}` },
  ]

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Credit Ledger</h1>
        <button onClick={handleApplyInterest} className="bg-red-500 text-white px-4 py-2 rounded">Apply Interest to All Overdue</button>
      </div>
      <div className="flex space-x-4">
        <button onClick={() => setTab('all')} className={`px-4 py-2 ${tab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>All Credits</button>
        <button onClick={() => setTab('overdue')} className={`px-4 py-2 ${tab === 'overdue' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Overdue</button>
        <button onClick={() => setTab('cleared')} className={`px-4 py-2 ${tab === 'cleared' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Cleared</button>
      </div>
      <DataTable data={credits} columns={columns} />
    </div>
  )
}

export default CreditLedger