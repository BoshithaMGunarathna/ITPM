/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import CoordinatorWelcomeCard from '../../../components/CoordinatorWelcomeCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import Sweetalert from 'sweetalert2';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';



function ProjectMemberMng() {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [selectedUser, setSelectedUser] = useState({
    firstName: '',
    lastName: '',
    contactNo: '',
    email: ''
  });;
  const [selectedOption, setSelectedOption] = useState("option1");


  const [assignedUserData, setAssignedUserData] = useState([]);

  useEffect(() => {
    async function fetchAssignedUserData() {
      try {
        // Fetch assigned users from Database A
        const assignedUsersResponse = await axios.get('http://localhost:510/user', {

        });

        // Assuming assignedUsersResponse.data contains the assigned users
        const assignedUsers = assignedUsersResponse.data;
        setAssignedUserData(assignedUsers);
      } catch (error) {
        console.log("Error fetching assigned user data:", error);
        toast.error('Failed to load assigned users');
      }
    }

    fetchAssignedUserData();
  }, []);

  const [pmember, setPmember] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:510/prmember');
        const data = response.data;
        setPmember(data);
      } catch (error) {
        console.log("Error fetching data:", error);
        toast.error('Failed to load members');
      }
    }

    fetchData();
  }, []); // Add empty dependency array here



  // get data from the backend (all 3 models) and update the table
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch only the users with the role 'coordinator'
        const userData = await axios.get('http://localhost:510/prmember', {
          params: {
            role: 'coordinator'
          }
        });

        const [scheduleData, markingData] = await Promise.all([
          axios.get('http://localhost:510/assignShedule'),
          axios.get('http://localhost:510/assignMark')
        ]);

        // console.log("userData:", userData);
        // console.log("scheduleData:", scheduleData);
        // console.log("markingData:", markingData);

        // Assuming userData.data contains the filtered users
        const members = userData.data;
        const scheduleMap = new Map(scheduleData.data.map(item => [item.firstName, item]));
        const markingMap = new Map(markingData.data.map(item => [item.firstName, item]));

        // console.log("Members:", members);
        // console.log("Schedule Map:", scheduleMap);
        // console.log("Marking Map:", markingMap);

        const updatedTableData = members.map(member => ({
          ...member,
          assignedSchedule: scheduleMap.get(member.firstName) || null,
          assignedMarking: markingMap.get(member.firstName) || null
        }));

        console.log("Updated Table Data:", updatedTableData);
        setTableData(updatedTableData);
      } catch (error) {
        console.log("Error fetching data:", error);
        toast.error('Failed to load members');
      }
    }

    fetchData();
  }, []);




  //navigate to next page
  const handlePage = () => {
    navigate('/dashboard/addmember');
  };
  //assigning page eka
  const handleAssignPage = (rowData) => {
    if (rowData.assignedSchedule || rowData.assignedMarking) {
      const toastId = toast.warn(
        <div>
          <p>This member is already assigned to both schedule and marking.</p>
          <button onClick={() => handleProceed(rowData, toastId)} className="bg-blue-500 text-white rounded bg-primary px-3 pb-2 pt-2.5 ml-2">Proceed</button>
          <button onClick={() => toast.dismiss(toastId)} className="bg-red-500 inline-block rounded text-white bg-primary px-3 pb-2 pt-2.5 ml-2">Cancel</button>
        </div>,
        {
          closeOnClick: false,
          draggable: false,
          autoClose: false // Prevents auto-closing
        }
      );
    } else {
      navigate('/dashboard/assignmember', { state: { rowData } });
    }
  };

  const handleProceed = (rowData, toastId) => {
    navigate('/dashboard/assignmember', { state: { rowData } });
    toast.dismiss(toastId); // Dismiss the toast message after proceeding
  };
  //pop up window eka
  const handleUpdate = (user) => {
    setSelectedUser(user); // Set the selected user details
    setIsModalOpen(true); // Open the modal
  };

  //update function
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:510/user/update-account/${selectedUser._id}`, selectedUser);

      if (response.status === 200) {
        console.log('User updated successfully:', response.data.message);
        setTableData(prevData => prevData.map(data => data._id === selectedUser._id ? selectedUser : data)); // refresh nokara table eke adaala data eka witarak update wenawa
        setIsModalOpen(false); // Close modal after successful update
        Sweetalert.fire({
          title: 'Success',
          text: 'User updated successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        })
      } else {
        console.error('Failed to update user:', response.data.message);
        Sweetalert.fire({
          title: 'Error',
          text: response.data.message,
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
    } catch (error) {
      console.error('Error updating user:', error.message);
      Sweetalert.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonText: 'OK'
      })
    }
  };
  // delete function
  // const handleDelete = async (id) => {
  //   try {


  //     const response = await axios.delete(`http://localhost:510/user/delete-account/${id}`);

  //     if (response.status === 200) {
  //       console.log('User deleted successfully');
  //       // Remove the deleted user from the table data
  //       setTableData(prevData => prevData.filter(data => data._id !== id)); 
  //       toast.success('User deleted successfully');
  //     } else {
  //       console.error('Failed to delete user:', response.data.message);
  //       toast.error('Failed to delete user:', response.data.message);
  //     }
  //   } catch (error) {
  //     console.error('Error deleting user:', error.message);
  //     toast.error('Error deleting user:', error.message);
  //   }
  // };



  const handleDelete = (id) => {
    Sweetalert.fire({
      title: 'Are you sure?',
      text: "You want to delete this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:510/user/delete-account/${id}`).then((response) => {
          console.log(response)
          if (response.status === 200) {
            setTableData(prevData => prevData.filter(data => data._id !== id));
            Sweetalert.fire(
              'Deleted!',
              'Your record has been deleted.',
              'success'
            )
          } else {
            Sweetalert.fire(
              'Not Deleted!',
              'Something want wrong',
              'error'
            )

          }
        })

      }
    })

  }

  const handlePmemDelete = (id) => {
    Sweetalert.fire({
      title: 'Are you sure?',
      text: "You want to delete this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:510/prmember/delete/${id}`).then((response) => {
          console.log(response)
          if (response.status === 200) {
            setTableData(prevData => prevData.filter(data => data._id !== id));
            Sweetalert.fire(
              'Deleted!',
              'Your record has been deleted.',
              'success'
            )
          } else {
            Sweetalert.fire(
              'Not Deleted!',
              'Something want wrong',
              'error'
            )

          }
        })

      }
    })

  }
  const handleAdd = async (user) => {
    try {
      // Create a new project member object based on the user data
      const newMember = {
        firstName: user.firstName,
        lastName: user.lastName,
        contactNo: user.contactNo,
        email: user.email,
        staffPost: user.staffPost,
        level: user.level,
        assignedStatus: 'Assigned',
      };
      console.log('New Member:', newMember);

      // Make a POST request to add the user as a project member
      const response = await axios.post('http://localhost:510/prmember/add', newMember);

      if (response.status === 201) {
        // Get the existing roles of the user
        const existingRoles = user.role || [];

        // Append the new role to the existing roles array
        const updatedRoles = [...existingRoles, 'member'];

        // Update the user's role attribute with the updated roles
        const updateUser = {
          role: updatedRoles
        };

        const response2 = await axios.put(`http://localhost:510/user/update-account/${user._id}`, updateUser);

        if (response2.status === 201) {
          console.log('User role updated successfully:', response2.data.message);
        }

        // Remove the user from the tableData state if successfully added as a project member
        setTableData(prevData => prevData.filter(userData => userData._id !== user._id));
        toast.success('User added as a project member successfully');
      } else {
        console.error('Failed to add user as a project member:', response.data.message);
        toast.error('Failed to add user as a project member: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error adding user as a project member:', error.message);
      toast.error('Error adding user as a project member: ' + error.message);
    }
  };


  return (
    <div className="p-4">
      <CoordinatorWelcomeCard />
      <p className="mt-2 text-gray-600">Project Member Management</p>
      {/* Radio button group to select between options */}
      <div className="mt-4">
        <label className="mr-4">
          <input
            type="radio"
            value="option1"
            checked={selectedOption === "option1"}
            onChange={() => setSelectedOption("option1")}
            className="mr-2"
          />
          Add Project Members
        </label>
        <label>
          <input
            type="radio"
            value="option2"
            checked={selectedOption === "option2"}
            onChange={() => setSelectedOption("option2")}
            className="mr-2"
          />
          Manage Project members
        </label>
      </div>
      {selectedOption === "option1" && (
        <div className="overflow-x-auto bg-white px-6 py-8 rounded shadow-md text-black w-full mb-8">
          <h2 className="text-lg font-bold mb-4">Assign Users as project managers</h2>
          <table className="min-w-full text-left text-sm font-light" style={{ maxWidth: '400px' }}>
            <thead className="border-b bg-white font-medium dark:border-neutral-500 dark:bg-neutral-600">
              <tr>
                <th scope="col" className="px-4 py-4">Name</th>
                <th scope="col" className="px-4 py-4">Email</th>
                <th scope="col" className="px-4 py-4">Staff Post</th>
                <th scope="col" className="px-4 py-4">Add As a Project member</th>
              </tr>
            </thead>
            <tbody>
              {/* Map through all assigned users and display their names, emails, and staff posts */}
              {assignedUserData.map((user, index) => (
                <tr key={index} className="border-dark:border-neutral-500">
                  <td className="px-4 py-4">{user.firstName} {user.lastName}</td>
                  <td className="px-4 py-4">{user.email}</td>
                  <td className="px-4 py-4">{user.staffPost}</td>
                  {/* Button for each user */}
                  <td className="px-4 py-4 flex justify-center text-white">
                    <button
                      onClick={() => handleAdd(user)}
                      className={`bg-blue-500 rounded bg-primary px-3 pb-2 pt-2.5 ml-2 ${pmember.find((member) => member.email === user.email) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={pmember.find((member) => member.email === user.email)}
                    >
                      Add
                    </button>
                   

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      }


      {
        selectedOption === "option2" && (
          <div className="overflow-x-auto bg-white px-6 py-8 rounded shadow-md text-black w-full">
            <h2 className="text-lg font-bold mb-4">Assign project managers to schedules and markings</h2>
            <table className="min-w-full text-left text-sm font-light">
              <thead className="border-b bg-white font-medium dark:border-neutral-500 dark:bg-neutral-600">
                <tr>
                  <th scope="col" className="px-6 py-4">First Name</th>
                  <th scope="col" className="px-6 py-4">Last Name</th>
                  <th scope="col" className="px-6 py-4">Contact Number</th>
                  <th scope="col" className="px-6 py-4">staffPost</th>
                  <th scope="col" className="px-6 py-4">Email</th>
                  <th scope="col" className="px-6 py-4">Assigned Schedule</th>
                  <th scope="col" className="px-6 py-4">Assigned Marking</th>
                  <th scope="col" className="px-6 py-4">Assign</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((data, index) => (
                  <tr key={index} className="border-dark:border-neutral-500">
                    <td className="px-6 py-4">{data.firstName}</td>
                    <td className="px-6 py-4">{data.lastName}</td>
                    <td className="px-6 py-4">{data.contactNo}</td>
                    <td className="px-6 py-4">{data.staffPost}</td>
                    <td className="px-6 py-4">{data.email}</td>

                    <td className="px-6 py-4">{data.assignedSchedule ? data.assignedSchedule.selectedAssignment : 'Not Assigned to any'}</td>
                    <td className="px-6 py-4">{data.assignedMarking ? data.assignedMarking.selectedAssignment : 'Not Assigned to any'}</td>
                    <td className="px-6 py-4 flex justify-center text-white">
                      <button onClick={() => handleUpdate(data)} className="bg-blue-500 rounded bg-primary px-3 pb-2 pt-2.5 ml-2">
                        <FaEdit />
                      </button>
                      <button onClick={() => handlePmemDelete(data._id)} className="bg-red-500 inline-block rounded bg-primary px-3 pb-2 pt-2.5 ml-2">
                        <FaTrash />
                      </button>

                      <ToastContainer />
                      <button
                        onClick={() => handleAssignPage(data)}
                        disabled={data.assignedSchedule && data.assignedMarking}
                        className={`bg-green-700 inline-block rounded bg-primary px-3 pb-2 pt-2.5 ml-2 ${data.assignedSchedule && data.assignedMarking ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <FaUserPlus />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        )
      }

      <div className="px-4 py-2">
        <button onClick={handlePage} className="bg-blue-600 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded mr-2">
          Add Member
        </button>
      </div>

      {/* pop up for Update */}
      {
        isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
            <div className="bg-white p-8 rounded-md shadow-md w-96">
              <h2 className="text-xl mb-4">Update User</h2>
              <form onSubmit={handleUpdateUser}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                  <input
                    type="text"
                    value={selectedUser.firstName}
                    onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                  <input
                    type="text"
                    value={selectedUser.lastName}
                    onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Contact Number</label>
                  <input
                    type="text"
                    value={selectedUser.contactNo}
                    onChange={(e) => setSelectedUser({ ...selectedUser, contactNo: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );


}

export default ProjectMemberMng;