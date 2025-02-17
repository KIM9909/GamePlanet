import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { GameInfoAPI } from '../../../sources/api/GameInfoAPI';
import Pagination from "../../../components/admin/Pagination";
import { Search, MessageCircle, Calendar, User } from "lucide-react";
import Loading from "../../../components/Loading";
import NewArticleModal from "../../../components/info/board/NewArticleModal";

const BoardPage = () => {
  const { gameInfoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const gameInfo = location.state?.gameInfo;
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchType, setSearchType] = useState('content');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermInput, setSearchTermInput] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [isNewArticleModalOpen, setIsNewArticleModalOpen] = useState(false);
  
  const itemsPerPage = 9; // 3x3 그리드

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await GameInfoAPI.getCommunityPosts(gameInfoId);
      const Articles = response.sort((a, b) => 
        b.gameCommunityId - a.gameCommunityId
      );
      setArticles(Articles);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [gameInfoId]);

  if (loading && articles.length === 0) 
    return <div className="text-white"><Loading /></div>;
  if (error) return navigate("/errorpage");

  const filteredArticles = articles.filter(article => {
    if (!activeSearchTerm) return true;
    if (searchType === 'content') {
      return article.gameCommunityContent.toLowerCase().includes(activeSearchTerm.toLowerCase());
    } else {
      return article.user.nickname.toLowerCase().includes(activeSearchTerm.toLowerCase());
    }
  });

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredArticles.slice(startIndex, endIndex);
  };

  const handleSearch = () => {
    setActiveSearchTerm(searchTermInput);
    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleArticleClick = (article) => {
    navigate(`/game-info/${gameInfoId}/board/detail/${article.gameCommunityId}`, {
      state: {
        gameInfo,
        article
      }
    });
  };

  return (
<div className="h-[800px] p-8 bg-[#0a0a2a]/50">  {/* 전체 높이 지정 */}
  <div className="max-w-7xl mx-auto h-full"> {/* 높이를 부모에 맞춤 */}
    <div className="bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl p-8 backdrop-blur-lg border border-cyan-500/50 h-full overflow-y-auto">
          {/* 검색 및 글쓰기 섹션 */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-3">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
              >
                <option value="content">내용</option>
                <option value="nickname">닉네임</option>
              </select>
              <div className="relative">
                <input
                  type="text"
                  value={searchTermInput}
                  onChange={(e) => setSearchTermInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={searchType === 'content' ? '내용 검색...' : '닉네임 검색...'}
                  className="px-4 py-2 w-64 bg-slate-700 text-white placeholder-gray-400 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
                />
                <button 
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <Search size={20} />
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsNewArticleModalOpen(true)}
              className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              글쓰기
            </button>
          </div>

          {/* 게시글 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {getCurrentPageData().map((article) => (
              <div
                key={article.gameCommunityId}
                onClick={() => handleArticleClick(article)}
                className="bg-slate-800 rounded-lg p-4 hover:transform hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                {/* 게시글 내용 */}
                <div className="h-32 mb-4 overflow-hidden">
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                    {article.gameCommunityContent}
                  </p>
                </div>
                
                {/* 메타 정보 */}
                <div className="border-t border-slate-700 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <User size={16} />
                      <span>{article.user.nickname}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-gray-400">
                        <MessageCircle size={16} />
                        <span>{article.commentList?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar size={16} />
                        <span>{new Date(article.createAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          <div className="flex justify-center">
            <Pagination 
              totalItems={filteredArticles.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <NewArticleModal 
        isOpen={isNewArticleModalOpen}
        onClose={() => setIsNewArticleModalOpen(false)}
        gameInfoId={gameInfoId}
        onArticleCreated={fetchArticles}
      />
    </div>
  );
};

export default BoardPage;