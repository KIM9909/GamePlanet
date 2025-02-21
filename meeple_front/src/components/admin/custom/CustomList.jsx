import React, { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import Pagination from '../Pagination';
import CustomAPI from '../../../sources/api/CustomAPI';
import AdminCustomModal from './AdminCustomModal';

const CustomList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchType, setSearchType] = useState('nickname');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [customGames, setCustomGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCustomId, setSelectedCustomId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCustomGames = async () => {
      try {
        setLoading(true);
        const response = await CustomAPI.getAllElements();
        
        // 신청전 상태를 제외한 게임만 필터링
        const formattedGames = response
          .filter(game => game.customStatus !== '신청전')
          .map(game => ({
            id: game.customId,
            nickname: game.userNickName,
            gameName: game.customName,
            submitDate: new Date(game.createdAt).toLocaleDateString(),
            status: game.customStatus,
            imageUrl: game.imageUrl,
            userId: game.userId,
            updatedAt: game.updatedAt
          }));
        setCustomGames(formattedGames);
      } catch (err) {
        setError('커스텀 게임 목록을 불러오는데 실패했습니다.');
        console.error('Error fetching custom games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomGames();
  }, []);

  const filteredGames = customGames.filter(game => {
    const matchesSearch = !searchTerm || (
      searchType === 'nickname' 
        ? game.nickname.toLowerCase().includes(searchTerm.toLowerCase())
        : game.gameName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus = statusFilter === '전체' || game.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredGames.slice(startIndex, endIndex);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '신청완료':
        return 'bg-yellow-500';
      case '심사진행중':
        return 'bg-blue-500';
      case '심사완료':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const refreshList = async () => {
    try {
      const response = await CustomAPI.getAllElements();
      const formattedGames = response
        .filter(game => game.customStatus !== '신청전')
        .map(game => ({
          id: game.customId,
          nickname: game.userNickName,
          gameName: game.customName,
          submitDate: new Date(game.createdAt).toLocaleDateString(),
          status: game.customStatus,
        }));
      setCustomGames(formattedGames);
    } catch (err) {
      console.error('Error refreshing list:', err);
    }
  };

  const getStatusCount = (status) => {
    if (status === '전체') return customGames.length;
    return customGames.filter(game => game.status === status).length;
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        {/* 상태 필터 버튼들 */}
        <div className="flex gap-2">
          {['전체', '신청완료', '심사진행중', '심사완료'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                handleFilterChange();
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

        {/* 검색 영역 */}
        <div className="flex gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
          >
            <option value="nickname">닉네임</option>
            <option value="gameName">게임 이름</option>
          </select>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleFilterChange();
            }}
            placeholder={searchType === 'nickname' ? '닉네임 검색...' : '게임 이름 검색...'}
            className="px-4 py-2 bg-slate-700 text-white placeholder-gray-400 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 w-64"
          />
          <button 
            onClick={handleFilterChange}
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
                닉네임
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                게임 이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                제출일자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                진행상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                상세조회
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600">
            {getCurrentPageData().map((game) => (
              <tr key={game.id} className="hover:bg-slate-600 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {game.nickname}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {game.gameName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {game.submitDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(game.status)}`}>
                    {game.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button 
                    onClick={() => {
                      setSelectedCustomId(game.id);
                      setIsModalOpen(true);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                  >
                    <Eye size={16} />
                    상세보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={filteredGames.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* 상세보기 모달 */}
      <AdminCustomModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomId(null);
        }}
        customId={selectedCustomId}
        onStatusUpdate={refreshList}
        getStatusColor={getStatusColor}
      />
    </div>
  );
};

export default CustomList;