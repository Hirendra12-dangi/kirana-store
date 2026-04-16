import React, { useState } from 'react'
import { salesAPI, expensesAPI } from '../lib/api'

const Reports = () => {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [report, setReport] = useState({})

  const generateReport = async () => {
    try {
      const [salesSummary, expensesSummary, salesByProduct] = await Promise.all([
        salesAPI.getSummary(dateFrom, dateTo),
        expensesAPI.getSummary(dateFrom, dateTo),
        salesAPI.getByProduct(dateFrom, dateTo)
      ])
      const totalExpenses = Object.values(expensesSummary).reduce((a, b) => a + b, 0)
      setReport({
        revenue: salesSummary.total_revenue,
        costOfGoods: salesSummary.total_revenue - salesSummary.total_profit,
        grossProfit: salesSummary.total_profit,
        expenses: totalExpenses,
        netProfit: salesSummary.total_profit - totalExpenses,
        salesByProduct
      })
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  const exportCSV = () => {
    const csv = 'Product,Units Sold,Revenue,Cost,Profit\n' +
      Object.entries(report.salesByProduct || {}).map(([product, revenue]) => `${product},,${revenue},,`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'report.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="bg-white p-6 rounded shadow space-y-4">
        <div className="flex space-x-4">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="p-2 border" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="p-2 border" />
          <button onClick={generateReport} className="bg-blue-500 text-white px-4 py-2 rounded">Generate Report</button>
        </div>
        {report.revenue !== undefined && (
          <div className="grid grid-cols-2 gap-4">
            <div>Revenue: ₹{report.revenue}</div>
            <div>Cost of Goods: ₹{report.costOfGoods}</div>
            <div>Gross Profit: ₹{report.grossProfit}</div>
            <div>Expenses: ₹{report.expenses}</div>
            <div>Net Profit: ₹{report.netProfit}</div>
          </div>
        )}
        <button onClick={exportCSV} className="bg-green-500 text-white px-4 py-2 rounded">Export to CSV</button>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Product-wise Profit</h3>
        <table className="w-full">
          <thead>
            <tr>
              <th>Product</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(report.salesByProduct || {}).map(([product, revenue]) => (
              <tr key={product}>
                <td>{product}</td>
                <td>₹{revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Reports