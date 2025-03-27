import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../socket";
import Swal from "sweetalert2";

export default function GroupCreation() {
  const [groupName, setGroupName] = useState(""); // State for group name
  const [users, setUsers] = useState([]); // List of all registered users
  const [selectedMembers, setSelectedMembers] = useState([]); // Selected group members
  const username = localStorage.getItem("username"); // Current user
  const navigate = useNavigate();

  // Fetch all registered users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://messenger-backend-y9he.onrender.com/api/auth/users"); // Fetch users from backend
        const filteredUsers = response.data.filter((u) => u.username !== username); // Exclude current user
        setUsers(filteredUsers); // Set user list
      } catch (error) {
        console.error(error)
        Swal.fire({
          icon: "error",
          title: "Failed to Load Users",
          text: "Could not load users. Please try again.",
        });
      }
    };
    fetchUsers(); // Call fetch function
  }, [username]); // Dependency on username

  // Toggle user selection for group membership
  const toggleMember = (user) => {
    setSelectedMembers((prev) =>
      prev.includes(user) ? prev.filter((m) => m !== user) : [...prev, user]
    );
  };

  // Handle group creation submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Details",
        text: "Please enter a group name and select at least one member.",
      });
      return;
    }

    Swal.fire({
      title: "Confirm Group Creation",
      text: `Create group "${groupName}" with ${selectedMembers.length} members?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Create",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        const members = [username, ...selectedMembers]; // Include current user in group
        socket.emit("createGroup", { groupName, members }); // Emit group creation to server
        Swal.fire({
          icon: "success",
          title: "Group Created!",
          text: `Group "${groupName}" has been successfully created.`,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/chat"); // Redirect to chat page
        });
      }
    });
  };

  // Handle Cancel button
  const handleCancel = () => {
    Swal.fire({
      title: "Cancel Group Creation?",
      text: "Are you sure you want to cancel?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/chat");
      }
    });
  };

  return (
    <div className="flex flex-col items-center min-h-screen justify-center bg-gradient-to-b from-teal-600 from-50% to-gray-100 to-50% space-y-6 px-4">
      <h2 className="font-pacific font-bold text-4xl text-white sm:text-3xl">Create Group</h2>

      <div className="w-full max-w-lg bg-white rounded-md shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-lg font-semibold">Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <label className="block text-lg font-semibold mt-4">Select Members</label>
          <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
            {users.map((user) => (
              <div
                key={user.username}
                className={`flex items-center p-2 shadow-sm rounded-md hover:bg-gray-200 cursor-pointer ${
                  selectedMembers.includes(user.username) ? "bg-teal-300" : "bg-white"
                }`}
                onClick={() => toggleMember(user.username)}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold ${
                    selectedMembers.includes(user.username) ? "bg-teal-700 text-white" : "bg-teal-600 text-white"
                  }`}
                >
                  {user.username[0].toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="font-semibold">{user.username}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-4"
          >
            Create Group
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="w-full bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 mt-2"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
