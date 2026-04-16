import React from 'react'

const InterestBadge = ({ interest }) => {
  return (
    <span className={`px-2 py-1 rounded text-xs ${interest > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
      Interest: ₹{interest}
    </span>
  )
}

export default InterestBadge