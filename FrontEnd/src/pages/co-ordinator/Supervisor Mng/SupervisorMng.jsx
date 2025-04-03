"use client"

import { useEffect, useState } from "react"
import { Loader2, UserPlus, Filter } from "lucide-react"

// Simple Card component
import PropTypes from "prop-types"

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
}

export default function SupervisorMng() {
  const [users, setUsers] = useState([])
  const [supervisors, setSupervisors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingSupervisor, setAddingSupervisor] = useState(null)
  const [showAllUsers, setShowAllUsers] = useState(false)
  const [activeTab, setActiveTab] = useState("eligible")

  // List of eligible staff positions for supervisors
  const eligibleStaffPosts = [
    "Chancellor",
    "Vice-Chancellor",
    "Deans",
    "Department Chairs/Heads",
    "Professors",
    "Associate Professors",
    "Assistant Professors",
  ]

  // Fetch users and supervisors
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch users
        const usersResponse = await fetch("http://localhost:510/user")
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users")
        }
        const usersData = await usersResponse.json()

        // Fetch existing supervisors - UPDATED API ENDPOINT
        const supervisorsResponse = await fetch("http://localhost:510/supervisorList/")
        const supervisorsData = supervisorsResponse.ok ? await supervisorsResponse.json() : []

        setUsers(usersData)
        setSupervisors(supervisorsData || [])
      } catch (err) {
        setError("Error fetching data. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter users based on eligible staff posts
  const getEligibleUsers = () => {
    if (showAllUsers) {
      return users
    }
    return users.filter((user) => eligibleStaffPosts.includes(user.staffPost))
  }

  // Check if user is already a supervisor
  const isSupervisor = (user) => {
    return supervisors.some((supervisor) => supervisor.email === user.email)
  }

  // Handle adding a user as supervisor - UPDATED API ENDPOINT
  const handleAddSupervisor = async (user) => {
    // Set the user being added to show loading state on button
    setAddingSupervisor(user._id)

    // Show SweetAlert confirmation
    if (typeof window !== "undefined" && window.Swal) {
      const result = await window.Swal.fire({
        title: "Confirm",
        text: `Are you sure you want to add ${user.firstName} ${user.lastName} as a supervisor?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, add supervisor!",
      })

      if (result.isConfirmed) {
        try {
          const response = await fetch("http://localhost:510/supervisorList/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              staffPost: user.staffPost,
              contactNo: user.contactNo,
              role: user.role,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to add supervisor")
          }

          const newSupervisor = await response.json()

          // Update supervisors list
          setSupervisors([...supervisors, newSupervisor])

          // Show success message
          window.Swal.fire("Added!", `${user.firstName} ${user.lastName} has been added as a supervisor.`, "success")
        } catch (error) {
          console.error("Error adding supervisor:", error)
          window.Swal.fire("Error!", error.message || "Failed to add supervisor.", "error")
        }
      }
    } else {
      // Fallback if SweetAlert is not available
      if (confirm(`Are you sure you want to add ${user.firstName} ${user.lastName} as a supervisor?`)) {
        try {
          const response = await fetch("http://localhost:510/supervisorList/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              staffPost: user.staffPost,
              contactNo: user.contactNo,
              role: user.role,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Failed to add supervisor")
          }

          const newSupervisor = await response.json()
          setSupervisors([...supervisors, newSupervisor])
          alert(`${user.firstName} ${user.lastName} has been added as a supervisor.`)
        } catch (error) {
          console.error("Error adding supervisor:", error)
          alert(error.message || "Failed to add supervisor.")
        }
      }
    }

    // Reset adding state
    setAddingSupervisor(null)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Loading data...</span>
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

  const eligibleUsers = getEligibleUsers()

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Supervisor Management</h1>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("eligible")}
            className={`px-4 py-2 font-medium ${
              activeTab === "eligible" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Eligible Users
          </button>
          <button
            onClick={() => setActiveTab("supervisors")}
            className={`px-4 py-2 font-medium ${
              activeTab === "supervisors"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Current Supervisors
          </button>
        </div>
      </div>

      {activeTab === "eligible" && (
        <Card>
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Eligible Users for Supervisor Role</h2>
              <div className="flex items-center">
                <label className="inline-flex items-center mr-4">
                  <input
                    type="checkbox"
                    checked={showAllUsers}
                    onChange={() => setShowAllUsers(!showAllUsers)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm">Show All Users</span>
                </label>
                <div className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-sm">
                  <Filter className="h-4 w-4 mr-1" />
                  {showAllUsers ? "Showing all users" : "Filtered by eligible positions"}
                </div>
              </div>
            </div>

            {eligibleUsers.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No eligible users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Position</th>
                      <th className="px-4 py-2 text-left">Roles</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {eligibleUsers.map((user) => {
                      const isUserSupervisor = isSupervisor(user)
                      return (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`${eligibleStaffPosts.includes(user.staffPost) ? "text-green-600 font-medium" : ""}`}
                            >
                              {user.staffPost}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {Array.from(new Set(user.role.map((r) => r.trim()))).map((r, i) => (
                                <span key={i} className="inline-block rounded-full bg-gray-200 px-2 py-1 text-xs">
                                  {r.trim()}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleAddSupervisor(user)}
                              disabled={isUserSupervisor || addingSupervisor === user._id}
                              className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                                isUserSupervisor
                                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                  : "bg-green-50 text-green-700 hover:bg-green-100"
                              }`}
                            >
                              {addingSupervisor === user._id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <UserPlus className="mr-2 h-4 w-4" />
                              )}
                              {isUserSupervisor ? "Already Supervisor" : "Add as Supervisor"}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === "supervisors" && (
        <Card>
          <div className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Current Supervisors</h2>
            {supervisors.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No supervisors found. Add supervisors from the &quot;Eligible Users&quot; tab.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Position</th>
                      <th className="px-4 py-2 text-left">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {supervisors.map((supervisor) => (
                      <tr key={supervisor._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {supervisor.firstName} {supervisor.lastName}
                        </td>
                        <td className="px-4 py-3">{supervisor.email}</td>
                        <td className="px-4 py-3">{supervisor.staffPost}</td>
                        <td className="px-4 py-3">{supervisor.contactNo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

