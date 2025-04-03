"use client"

import { useEffect, useState } from "react"
import { Loader2, UserPlus, Filter, Eye, Trash, X, AlertTriangle } from "lucide-react"


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
};

// Modal component
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default function SupervisorMng() {
  const [users, setUsers] = useState([])
  const [supervisors, setSupervisors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingSupervisor, setAddingSupervisor] = useState(null)
  const [deletingSupervisor, setDeletingSupervisor] = useState(null)
  const [showAllUsers, setShowAllUsers] = useState(false)
  const [activeTab, setActiveTab] = useState("eligible")
  const [selectedSupervisor, setSelectedSupervisor] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

        // Fetch existing supervisors 
        const supervisorsResponse = await fetch("http://localhost:510/supervisor/")
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

  // Check if user's position is eligible
  const isEligiblePosition = (user) => {
    return eligibleStaffPosts.includes(user.staffPost)
  }

  // Check if supervisor has groups
  const hasGroups = (supervisor) => {
    return supervisor.groups && supervisor.groups.length > 0
  }

  // Handle adding a user as supervisor
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

  // Handle viewing supervisor details
  const handleViewSupervisor = (supervisor) => {
    setSelectedSupervisor(supervisor)
    setIsModalOpen(true)
  }

  // Handle deleting supervisor
  const handleDeleteSupervisor = async (supervisor) => {
    // Check if supervisor has groups
    if (hasGroups(supervisor)) {
      if (typeof window !== "undefined" && window.Swal) {
        window.Swal.fire(
          "Cannot Delete",
          `${supervisor.firstName} ${supervisor.lastName} is supervising groups and cannot be removed.`,
          "warning",
        )
      } else {
        alert(`${supervisor.firstName} ${supervisor.lastName} is supervising groups and cannot be removed.`)
      }
      return
    }

    setDeletingSupervisor(supervisor._id)

    if (typeof window !== "undefined" && window.Swal) {
      const result = await window.Swal.fire({
        title: "Are you sure?",
        text: `You are about to remove ${supervisor.firstName} ${supervisor.lastName} from supervisors.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete!",
      })

      if (result.isConfirmed) {
        try {
          // Here you would make an API call to delete the supervisor
          // For example:
          // const response = await fetch(`http://localhost:510/supervisor/delete/${supervisor._id}`, {
          //   method: "DELETE"
          // })

          // For now, we'll just update the local state
          setSupervisors(supervisors.filter((s) => s._id !== supervisor._id))

          window.Swal.fire(
            "Deleted!",
            `${supervisor.firstName} ${supervisor.lastName} has been removed from supervisors.`,
            "success",
          )
        } catch (error) {
          console.error("Error deleting supervisor:", error)
          window.Swal.fire("Error!", error.message || "Failed to delete supervisor.", "error")
        }
      }
    } else {
      if (confirm(`Are you sure you want to remove ${supervisor.firstName} ${supervisor.lastName} from supervisors?`)) {
        // Here you would make an API call to delete the supervisor
        setSupervisors(supervisors.filter((s) => s._id !== supervisor._id))
        alert(`${supervisor.firstName} ${supervisor.lastName} has been removed from supervisors.`)
      }
    }

    setDeletingSupervisor(null)
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
                      const isEligible = isEligiblePosition(user)
                      return (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className={`${isEligible ? "text-green-600 font-medium" : ""}`}>
                              {user.staffPost}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {Array.from(new Set(user.role?.map((r) => r.trim()) || [])).map((r, i) => (
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
                                  : isEligible
                                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              }`}
                            >
                              {addingSupervisor === user._id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : !isEligible ? (
                                <AlertTriangle className="mr-2 h-4 w-4" />
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
                      <th className="px-4 py-2 text-left">Groups</th>
                      <th className="px-4 py-2 text-left">Actions</th>
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
                        <td className="px-4 py-3">
                          {hasGroups(supervisor) ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              {supervisor.groups.length} groups
                            </span>
                          ) : (
                            <span className="text-gray-500">No groups</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewSupervisor(supervisor)}
                              className="inline-flex items-center rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteSupervisor(supervisor)}
                              disabled={hasGroups(supervisor) || deletingSupervisor === supervisor._id}
                              className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                                hasGroups(supervisor)
                                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                  : "bg-red-50 text-red-700 hover:bg-red-100"
                              }`}
                            >
                              {deletingSupervisor === supervisor._id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash className="mr-2 h-4 w-4" />
                              )}
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Supervisor Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          selectedSupervisor
            ? `${selectedSupervisor.firstName} ${selectedSupervisor.lastName} Details`
            : "Supervisor Details"
        }
      >
        {selectedSupervisor && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p>
                  {selectedSupervisor.firstName} {selectedSupervisor.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p>{selectedSupervisor.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Position</p>
                <p>{selectedSupervisor.staffPost}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Contact</p>
                <p>{selectedSupervisor.contactNo || "N/A"}</p>
              </div>
              {selectedSupervisor.level && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Level</p>
                  <p>{selectedSupervisor.level}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Groups Supervising</p>
              {hasGroups(selectedSupervisor) ? (
                <div className="space-y-2">
                  {selectedSupervisor.groups.map((group, index) => (
                    <div key={index} className="rounded-md bg-gray-50 p-2">
                      <p className="font-medium">{group}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Not supervising any groups</p>
              )}
            </div>

            {selectedSupervisor.tittles && selectedSupervisor.tittles.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Titles</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSupervisor.tittles.map((title, index) => (
                    <span
                      key={index}
                      className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

