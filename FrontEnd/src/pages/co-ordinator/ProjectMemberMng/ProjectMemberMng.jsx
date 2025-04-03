/* eslint-disable no-unused-vars */
"use client"
import { useEffect, useState } from "react"
import { Loader2, UserPlus, Edit, Trash, Eye, X } from "lucide-react"
import CoordinatorWelcomeCard from "../../../components/CoordinatorWelcomeCard"
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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


function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

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
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}


export default function ProjectMemberMng() {
  const [users, setUsers] = useState([])
  const [projectMembers, setProjectMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [activeTab, setActiveTab] = useState("assign")
  const [addingMember, setAddingMember] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [assignmentType, setAssignmentType] = useState("schedule")
  const [formData, setFormData] = useState({
    assignmentType: "presentation",
    assignmentSubType: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const tabs = [
    { id: "assign", label: "Assign Project Members" },
    { id: "manage", label: "Manage Project Members" },
  ]

  const presentationSubTypes = ["proposal", "progress1", "progress2", "final"]
  const reportSubTypes = [
    "topicAssessmentForm",
    "projectCharter",
    "statusDocument1",
    "logBook",
    "proposalDocument",
    "statusDocument2",
    "finalThesis",
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

        const assignmentsResponse = await fetch("http://localhost:510/assignment/")
        const assignmentsData = assignmentsResponse.ok ? await assignmentsResponse.json() : []

        setUsers(usersData)
        setProjectMembers(membersData || [])
        setAssignments(assignmentsData || [])
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

  const handleAddMember = async (user) => {
    setAddingMember(user._id);

    toast.info(
      <div className="text-left">
        <p>Are you sure you want to add {user.firstName} {user.lastName} as a project member?</p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => {
              toast.dismiss();
              setAddingMember(null);
            }}
            className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss();
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
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || "Failed to add project member");
                }

                const newMember = await response.json();
                setProjectMembers([...projectMembers, newMember]);
                toast.success(`${user.firstName} ${user.lastName} has been added as a project member.`);
              } catch (error) {
                console.error("Error adding project member:", error);
                toast.error(error.message || "Failed to add project member.");
              } finally {
                setAddingMember(null);
              }
            }}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Confirm
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
      }
    );
  };


  // Handle viewing member details
  const handleViewMember = (member) => {
    toast.info(
      <div className="text-left">
        <p><strong>Member:</strong> {member.firstName} {member.lastName}</p>
        <p><strong>Email:</strong> {member.email}</p>
        <p><strong>Position:</strong> {member.staffPost}</p>
        <p><strong>Contact:</strong> {member.contactNo}</p>
        <p><strong>Roles:</strong> {Array.isArray(member.role) ? member.role.join(", ") : member.role}</p>
      </div>,
      {
        autoClose: false,
        closeButton: true,
      }
    )
  }

  // Handle editing member

  const handleEditMember = (member) => {
    setSelectedMember(member)
    setAssignmentType("schedule") // Default to schedule
    setFormData({
      assignmentType: "presentation",
      assignmentSubType: presentationSubTypes[0],
    })
    setIsModalOpen(true)
  }

  // Handle deleting member
  const handleDeleteMember = async (member) => {
    toast.info(
      <div className="text-left">
        <p>Are you sure you want to remove {member.firstName} {member.lastName} from project members?</p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => toast.dismiss()}
            className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss();
              try {
                // Here you would make an API call to delete the member
                // For now, we'll just update the local state
                setProjectMembers(projectMembers.filter((m) => m._id !== member._id));
                toast.success(`${member.firstName} ${member.lastName} has been removed from project members.`);
              } catch (error) {
                console.error("Error deleting member:", error);
                toast.error("Failed to delete member. Please try again.");
              }
            }}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
      }
    );
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Reset subType when type changes
    if (name === "assignmentType") {
      setFormData({
        ...formData,
        assignmentType: value,
        assignmentSubType: value === "presentation" 
          ? presentationSubTypes[0] 
          : reportSubTypes[0],
      });
      return;
    }
  
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle assignment type change (schedule or marking)
  const handleAssignmentTypeChange = (type) => {
    setAssignmentType(type)

    // Reset form data based on type
    if (type === "schedule") {
      setFormData({
        assignmentType: "presentation",
        assignmentSubType: presentationSubTypes[0],
      })
    } else {
      setFormData({
        assignmentType: "presentation",
        assignmentSubType: presentationSubTypes[0],
      })
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
  
    try {
      const endpoint = assignmentType === "schedule" 
        ? "http://localhost:510/assignShedule/add" 
        : "http://localhost:510/assignMark/add";
  
      // Prepare data based on assignment type
      const requestData = assignmentType === "schedule"
        ? {
            title: `${formData.assignmentType} - ${formData.assignmentSubType}`,
            type: formData.assignmentType,
            subType: formData.assignmentSubType,
            user: selectedMember._id,
            role: selectedMember.role // Assuming role exists in selectedMember
          }
        : {
            // For marking assignment, send complete member data
            ...selectedMember,
            assignmentType: formData.assignmentType,
            assignmentSubType: formData.assignmentSubType
          };
  
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to assign member");
      }
  
      // Success toast
      toast.success(
        `${selectedMember.firstName} ${selectedMember.lastName} has been assigned to ${
          assignmentType === "schedule" ? "schedule" : "create marking rubrics for"
        } ${formData.assignmentType} - ${formData.assignmentSubType}.`
      );
  
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error assigning member:", error);
      toast.error(error.message || "Failed to assign member.");
    } finally {
      setSubmitting(false);
    }
  };



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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
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
      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Assign ${selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : "Member"}`}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Type</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="assignmentTypeRadio"
                  value="schedule"
                  checked={assignmentType === "schedule"}
                  onChange={() => handleAssignmentTypeChange("schedule")}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">Schedule Assignment</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="assignmentTypeRadio"
                  value="marking"
                  checked={assignmentType === "marking"}
                  onChange={() => handleAssignmentTypeChange("marking")}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">Create Marking Rubric</span>
              </label>
            </div>
          </div>

          {assignmentType === "schedule" ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Presentation Subtype</label>
              <select
                name="assignmentSubType"
                value={formData.assignmentSubType}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-2"
                required
              >
                {presentationSubTypes.map((subType) => (
                  <option key={subType} value={subType}>
                    {subType.charAt(0).toUpperCase() + subType.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Type</label>
                <select
                  name="assignmentType"
                  value={formData.assignmentType}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                >
                  <option value="presentation">Presentation</option>
                  <option value="report">Report</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Subtype</label>
                <select
                  name="assignmentSubType"
                  value={formData.assignmentSubType}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                >
                  {formData.assignmentType === "presentation"
                    ? presentationSubTypes.map((subType) => (
                      <option key={subType} value={subType}>
                        {subType.charAt(0).toUpperCase() + subType.slice(1)}
                      </option>
                    ))
                    : reportSubTypes.map((subType) => (
                      <option key={subType} value={subType}>
                        {subType.charAt(0).toUpperCase() + subType.slice(1)}
                      </option>
                    ))}
                </select>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

