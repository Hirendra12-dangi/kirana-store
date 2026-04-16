import React from 'react'

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Kirana Store</h1>
            </div>
          </div>
          <div className="flex items-center">
            <button className="text-gray-500 hover:text-gray-700">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar