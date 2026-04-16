import React from 'react'

const StatsCard = ({ title, value }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{title}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsCard