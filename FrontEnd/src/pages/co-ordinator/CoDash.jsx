"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import CoordinatorWelcomeCard from "../../components/CoordinatorWelcomeCard";

// Simple Card component defined directly in the file
import PropTypes from "prop-types";

function Card({ className, children, ...props }) {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ""}`} {...props}>
      {children}
    </div>
  )
}

Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  props: PropTypes.object,
};

// Define all possible roles and their colors
const roleColors = {
  staff: "#4338ca", // indigo-700
  supervisor: "#0891b2", // cyan-600
  member: "#059669", // emerald-600
  coordinator: "#d97706", // amber-600
  admin: "#dc2626", // red-600
  student: "#7c3aed", // violet-600
  guest: "#6b7280", // gray-500
}

export default function CoDash() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:510/user")
        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }
        const data = await response.json()
        setUsers(data)
      } catch (err) {
        setError("Error fetching user data. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Count users by role (accounting for users with multiple roles)
  const getRoleCounts = () => {
    const counts = {}

    users.forEach((user) => {
      // Clean up roles (remove any whitespace/newlines)
      const cleanRoles = user.role.map((role) => role.trim())

      // Count unique roles for each user
      const uniqueRoles = Array.from(new Set(cleanRoles))

      uniqueRoles.forEach((role) => {
        counts[role] = (counts[role] || 0) + 1
      })
    })

    return counts
  }

  // Group users by role
  const getUsersByRole = () => {
    const usersByRole = {}

    users.forEach((user) => {
      // Clean up roles (remove any whitespace/newlines)
      const cleanRoles = user.role.map((role) => role.trim())

      // Get unique roles for this user
      const uniqueRoles = Array.from(new Set(cleanRoles))

      uniqueRoles.forEach((role) => {
        if (!usersByRole[role]) {
          usersByRole[role] = []
        }
        usersByRole[role].push(user)
      })
    })

    return usersByRole
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Loading user data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  const roleCounts = getRoleCounts()
  const usersByRole = getUsersByRole()

  return (
    <div className="container mx-auto p-6">
      <CoordinatorWelcomeCard />
      

      {/* Role Count Cards */}
      <div className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">User Count by Role</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Object.entries(roleCounts).map(([role, count]) => (
            <Card key={role} className="overflow-hidden">
              <div
                className="flex items-center justify-between p-4"
                style={{ backgroundColor: roleColors[role] || "#6b7280" }}
              >
                <h3 className="text-lg font-medium capitalize text-white">{role}</h3>
                <span
                  className="rounded-full bg-white px-3 py-1 text-lg font-bold"
                  style={{ color: roleColors[role] || "#6b7280" }}
                >
                  {count}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Users by Role */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Users by Role</h2>

        {Object.entries(usersByRole).map(([role, roleUsers]) => (
          <div key={role} className="mb-8">
            <h3
              className="mb-3 rounded-md px-4 py-2 text-lg font-medium capitalize text-white"
              style={{ backgroundColor: roleColors[role] || "#6b7280" }}
            >
              {role} ({roleUsers.length})
            </h3>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Position</th>
                    <th className="px-4 py-2 text-left">Contact</th>
                    <th className="px-4 py-2 text-left">All Roles</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {roleUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.staffPost}</td>
                      <td className="px-4 py-3">{user.contactNo}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(user.role.map((r) => r.trim()))).map((r, i) => (
                            <span
                              key={i}
                              className="inline-block rounded-full px-2 py-1 text-xs text-white"
                              style={{ backgroundColor: roleColors[r.trim()] || "#6b7280" }}
                            >
                              {r.trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

