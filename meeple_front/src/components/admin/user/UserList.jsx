import React, { useState, useEffect } from "react";
import { Search, Edit , Trash2 } from "lucide-react";
import Pagination from "../Pagination";
import AdminAPI from "../../../sources/api/AdminAPI";
import UserModal from "./UserModal";
import UserDeleteConfirmModal from "./UserDeleteConfirmModal";

const UserList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchType, setSearchType] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("전체");

  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const response = await AdminAPI.getUserList();
        if (response.code === 200) {
          setUsers(response.userList);
        }
      } catch (error) {
        console.error("사용자 목록을 불러오는 데 실패했습니다.", error);
      }
    };

    fetchUserList();
  }, []);

  const getUserStatus = (user) => {
    if (user.userDeletedAt) return "탈퇴예정";
    return "활성회원";
  };

  const getStatusCount = (status) => {
    if (status === "전체") return users.length;
    return users.filter(user => 
      status === "탈퇴예정" ? user.userDeletedAt : !user.userDeletedAt
    ).length;
  };

  const filteredUsers = users.filter((user) => {
    // 상태 필터링
    if (statusFilter !== "전체") {
      const userStatus = getUserStatus(user);
      if (userStatus !== statusFilter) return false;
    }

    // 검색어 필터링
    if (!searchTerm) return true;
    if (searchType === "name") {
      return user.userName.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      return user.userNickname.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = (updatedUser) => {
    setUsers(
      users.map((user) =>
        user.userId === updatedUser.userId ? updatedUser : user
      )
    );
    setIsModalOpen(false);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
  
    try {
      const response = await AdminAPI.deleteUser(userToDelete.userId);
      if (response.code === 200) {
        // 서버에서 최신 사용자 목록을 다시 가져오기
        const updatedListResponse = await AdminAPI.getUserList();
        if (updatedListResponse.code === 200) {
          setUsers(updatedListResponse.userList);
        }
      } else {
        alert(response.message || "회원 탈퇴 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원 탈퇴 처리 실패:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        {/* 상태 필터 버튼들 */}
        <div className="flex gap-2">
          {['전체', '활성회원', '탈퇴예정'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm
                ${statusFilter === status 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
            >
              {status}
              <span className="bg-slate-800 px-2 py-0.5 rounded-full text-xs">
                {getStatusCount(status)}
              </span>
            </button>
          ))}
        </div>

        {/* 기존 검색 영역 */}
        <div className="flex gap-3">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
          >
            <option value="name">이름</option>
            <option value="nickname">닉네임</option>
          </select>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchType === "name" ? "이름 검색..." : "닉네임 검색..."}
            className="px-4 py-2 bg-slate-700 text-white placeholder-gray-400 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => setCurrentPage(1)}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2"
          >
            <Search size={20} />
            검색
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-slate-700 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-slate-600">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                닉네임
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                생년월일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                이메일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600">
            {getCurrentPageData().map((user) => (
              <tr
                key={user.userId}
                className={`transition-colors ${
                  user.userDeletedAt 
                    ? 'bg-slate-800/50 hover:bg-slate-700/50' 
                    : 'hover:bg-slate-600'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    {user.userName}
                    {user.userDeletedAt && (
                      <span className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded-full">
                        탈퇴 예정
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    {user.userNickname}
                    {user.userDeletedAt && (
                      <span className="text-xs text-red-400">
                        {new Date(user.userDeletedAt).toLocaleDateString()} 삭제
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(user.userBirthday).toISOString().split("T")[0]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.userEmail}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleViewUser(user)}
                    className={`text-slate-400 hover:text-cyan-300 transition-colors ${
                      user.userDeletedAt && 'opacity-50 cursor-not-allowed'
                    }`}
                    disabled={user.userDeletedAt}
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className={`ml-4 text-slate-400 hover:text-red-300 transition-colors ${
                      user.userDeletedAt && 'opacity-50 cursor-not-allowed'
                    }`}
                    disabled={user.userDeletedAt}
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={filteredUsers.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />

      {userToDelete && (
        <UserDeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          userNickname={userToDelete.userNickname}
        />
      )}
    </div>
  );
};

export default UserList;
