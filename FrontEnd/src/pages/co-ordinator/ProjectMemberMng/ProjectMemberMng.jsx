"use client"

import { useEffect, useState } from "react"
import { Loader2, UserPlus, Edit, Trash, Eye } from "lucide-react"
import CoordinatorWelcomeCard from "../../../components/CoordinatorWelcomeCard"

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

// Simple Tab component
function Tabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="border-b mb-6">
      <div className="flex space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium ${activeTab === tab.id ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
}

export default function ProjectMemberMng() {
  const [users, setUsers] = useState([])
  const [projectMembers, setProjectMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("assign")
  const [addingMember, setAddingMember] = useState(null)

  const tabs = [
    { id: "assign", label: "Assign Project Members" },
    { id: "manage", label: "Manage Project Members" },
  ]

  // Fetch all users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch users
        const usersResponse = await fetch("http://localhost:510/user")
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users")
        }
        const usersData = (await usersResponse.ok) ? await usersResponse.json() : []

        // Fetch existing project members
        const membersResponse = await fetch("http://localhost:510/prmember")
        const membersData = membersResponse.ok ? await membersResponse.json() : []

        setUsers(usersData)
        setProjectMembers(membersData || [])
      } catch (err) {
        setError("Error fetching data. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Check if user is already a project member
  const isProjectMember = (user) => {
    return projectMembers.some(
      (member) =>
        member.email === user.email && member.firstName === user.firstName && member.lastName === user.lastName,
    )
  }

  // Handle adding a user as project member
  const handleAddMember = async (user) => {
    // Set the user being added to show loading state on button
    setAddingMember(user._id)

    // Show SweetAlert confirmation
    if (typeof window !== "undefined" && window.Swal) {
      const result = await window.Swal.fire({
        title: "Confirm",
        text: `Are you sure you want to add ${user.firstName} ${user.lastName} as a project member?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, add member!",
      })

      if (result.isConfirmed) {
        try {
          const response = await fetch("http://localhost:510/prmember/add", {
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
            throw new Error(errorData.message || "Failed to add project member")
          }

          const newMember = await response.json()

          // Update project members list
          setProjectMembers([...projectMembers, newMember])

          // Show success message
          window.Swal.fire(
            "Added!",
            `${user.firstName} ${user.lastName} has been added as a project member.`,
            "success",
          )
        } catch (error) {
          console.error("Error adding project member:", error)
          window.Swal.fire("Error!", error.message || "Failed to add project member.", "error")
        }
      }
    } else {
      // Fallback if SweetAlert is not available
      if (confirm(`Are you sure you want to add ${user.firstName} ${user.lastName} as a project member?`)) {
        try {
          const response = await fetch("http://localhost:510/prmember/add", {
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
            throw new Error(errorData.message || "Failed to add project member")
          }

          const newMember = await response.json()
          setProjectMembers([...projectMembers, newMember])
          alert(`${user.firstName} ${user.lastName} has been added as a project member.`)
        } catch (error) {
          console.error("Error adding project member:", error)
          alert(error.message || "Failed to add project member.")
        }
      }
    }

    // Reset adding state
    setAddingMember(null)
  }

  // Handle viewing member details
  const handleViewMember = (member) => {
    if (typeof window !== "undefined" && window.Swal) {
      window.Swal.fire({
        title: `${member.firstName} ${member.lastName}`,
        html: `
          <div class="text-left">
            <p><strong>Email:</strong> ${member.email}</p>
            <p><strong>Position:</strong> ${member.staffPost}</p>
            <p><strong>Contact:</strong> ${member.contactNo}</p>
            <p><strong>Roles:</strong> ${Array.isArray(member.role) ? member.role.join(", ") : member.role}</p>
          </div>
        `,
        icon: "info",
        confirmButtonText: "Close",
      })
    } else {
      alert(`
        Member: ${member.firstName} ${member.lastName}
        Email: ${member.email}
        Position: ${member.staffPost}
        Contact: ${member.contactNo}
        Roles: ${Array.isArray(member.role) ? member.role.join(", ") : member.role}
      `)
    }
  }

  // Handle editing member
  const handleEditMember = (member) => {
    // This would typically open a modal or navigate to an edit page
    alert(`Edit functionality for ${member.firstName} ${member.lastName} would go here`)
  }

  // Handle deleting member
  const handleDeleteMember = async (member) => {
    if (typeof window !== "undefined" && window.Swal) {
      const result = await window.Swal.fire({
        title: "Are you sure?",
        text: `You are about to remove ${member.firstName} ${member.lastName} from project members.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete!",
      })

      if (result.isConfirmed) {
        // Here you would make an API call to delete the member
        // For now, we'll just update the local state
        setProjectMembers(projectMembers.filter((m) => m._id !== member._id))

        window.Swal.fire(
          "Deleted!",
          `${member.firstName} ${member.lastName} has been removed from project members.`,
          "success",
        )
      }
    } else {
      if (confirm(`Are you sure you want to remove ${member.firstName} ${member.lastName} from project members?`)) {
        // Here you would make an API call to delete the member
        // For now, we'll just update the local state
        setProjectMembers(projectMembers.filter((m) => m._id !== member._id))
        alert(`${member.firstName} ${member.lastName} has been removed from project members.`)
      }
    }
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

  return (
    <div className="container mx-auto p-6">
      <CoordinatorWelcomeCard />
      <h1 className="mb-6 text-3xl font-bold">Project Member Management</h1>

      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "assign" && (
        <Card>
          <div className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Assign Project Members</h2>
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
                  {users.map((user) => {
                    const isMember = isProjectMember(user)
                    return (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">{user.staffPost}</td>
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
                            onClick={() => handleAddMember(user)}
                            disabled={isMember || addingMember === user._id}
                            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${isMember
                              ? "cursor-not-allowed bg-gray-100 text-gray-400"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                              }`}
                          >
                            {addingMember === user._id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <UserPlus className="mr-2 h-4 w-4" />
                            )}
                            {isMember ? "Already Member" : "Assign as Member"}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "manage" && (
        <Card>
          <div className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Manage Project Members</h2>
            {projectMembers.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No project members found. Assign members from the &quot;Assign Members&quot; tab.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Position</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {projectMembers.map((member) => (
                      <tr key={member._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {member.firstName} {member.lastName}
                        </td>
                        <td className="px-4 py-3">{member.email}</td>
                        <td className="px-4 py-3">{member.staffPost}</td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewMember(member)}
                              className="inline-flex items-center rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                            >
                              <Eye className=" h-4 w-4" />

                            </button>
                            <button
                              onClick={() => handleEditMember(member)}
                              className="inline-flex items-center rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
                            >
                              <Edit className=" h-4 w-4" />

                            </button>
                            <button
                              onClick={() => handleDeleteMember(member)}
                              className="inline-flex items-center rounded-md bg-red-50 px-2 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                            >
                              <Trash className=" h-4 w-4" />

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
    </div>
  )
}

