import React from 'react'

const DueAlertBanner = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Overdue Alert!</strong>
      <span className="block sm:inline"> Customers with overdue dues: {alerts.join(', ')}</span>
    </div>
  )
}

export default DueAlertBanner