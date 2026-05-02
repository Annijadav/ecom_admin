import React from 'react'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children }) => {
  // Check if user is authenticated
  const isAuthenticated = () => {
    const authToken = localStorage.getItem('authToken')
    const userData = localStorage.getItem('userData')

    // You can add more validation logic here if needed
    // For example, check if token is expired
    return authToken && userData
  }

  // If authenticated, render the children (protected component)
  // If not authenticated, redirect to login
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

export default PrivateRoute
