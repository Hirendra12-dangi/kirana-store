import React, { useState, useEffect } from 'react'
import { dashboardAPI } from '../lib/api'
import StatsCard from '../components/StatsCard'
import DueAlertBanner from '../components/DueAlertBanner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'

const Dashboard = () => {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardAPI.getStats()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div>Loading...</div>

  const salesData = stats.recent_sales || []
  const paymentModeData = [
    { name: 'Cash', value: 40 }, // Placeholder, calculate from sales
    { name: 'Credit', value: 30 },
    { name: 'UPI', value: 30 },
  ]
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

  return (
    <div className="space-y-6">
      <DueAlertBanner alerts={stats.pending_dues_alert || []} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Today's Sales" value={`₹${stats.today_sales || 0}`} />
        <StatsCard title="Today's Profit" value={`₹${stats.today_profit || 0}`} />
        <StatsCard title="Monthly Revenue" value={`₹${stats.monthly_revenue || 0}`} />
        <StatsCard title="Pending Dues" value={`₹${stats.total_credit_outstanding || 0}`} />
      </div>
      {stats.low_stock_count > 0 && (
        <div className="bg-yellow-100 p-4 rounded">
          <p>Low stock alert: {stats.low_stock_count} products</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Last 7 Days Sales</h3>
          <BarChart width={400} height={300} data={salesData.slice(0,7)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sale_date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_amount" fill="#8884d8" />
          </BarChart>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Sales by Payment Mode</h3>
          <PieChart width={400} height={300}>
            <Pie data={paymentModeData} cx={200} cy={150} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
              {paymentModeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
        <table className="w-full">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map(sale => (
              <tr key={sale.id}>
                <td>{sale.product_name}</td>
                <td>{sale.quantity}</td>
                <td>₹{sale.total_amount}</td>
                <td>{sale.sale_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Top Debtors</h3>
        <table className="w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Due Amount</th>
            </tr>
          </thead>
          <tbody>
            {(stats.top_debtors || []).map(debtor => (
              <tr key={debtor.id}>
                <td>{debtor.name}</td>
                <td>₹{debtor.total_due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard