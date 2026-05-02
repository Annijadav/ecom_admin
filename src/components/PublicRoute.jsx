import React, { Component } from "react";
import { Navigate } from "react-router-dom";

class PublicRoute extends Component {
  // Check if user is authenticated
  isAuthenticated() {
    const authToken = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    return authToken && userData;
  }

  render() {
    const { children, restricted = false } = this.props;

    // If restricted is true, redirect authenticated users to dashboard
    // If restricted is false, allow access regardless of authentication
    return this.isAuthenticated() && restricted ? (
      <Navigate to="/dashboard" replace />
    ) : (
      children
    );
  }
}

export default PublicRoute;
