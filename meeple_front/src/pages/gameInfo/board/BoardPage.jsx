import ArticleItem from "../../../components/info/board/ArticleItem"
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { GameInfoAPI } from '../../../sources/api/GameInfoAPI';
import Pagination from "../../../components/admin/Pagination";
import { Search } from "lucide-react";
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
  
  const itemsPerPage = 10;

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
    <div>
      <div className="min-h-screen p-8 bg-[#0a0a2a]/50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl p-8 backdrop-blur-lg border border-cyan-500/50 max-h-[650px] overflow-y-auto custom-scrollbar">
            <div className="grid grid-rows-1 gap-8 mb-8">
              <div className="flex gap-3 justify-between">
                <div className="flex gap-3">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="content">내용</option>
                    <option value="nickname">닉네임</option>
                  </select>
                  <input
                    type="text"
                    value={searchTermInput}
                    onChange={(e) => setSearchTermInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={searchType === 'content' ? '내용 검색...' : '닉네임 검색...'}
                    className="px-4 py-2 bg-slate-700 text-white placeholder-gray-400 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                  <button 
                    onClick={handleSearch}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2"
                  >
                    <Search size={20} />
                    검색
                  </button>
                </div>
                <div className="">
                  <button
                    onClick={() => setIsNewArticleModalOpen(true)}
                    className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex flex-end items-center gap-2"
                  >
                    글쓰기
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-slate-700 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-600">
                      <th className="w-8/12 px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                        내용
                      </th>
                      <th className="w-2/12 px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                        작성자
                      </th>
                      <th className="w-2/12 px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                        작성일
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-600">
                    {getCurrentPageData().map((article) => (
                      <tr 
                        key={article.gameCommunityId} 
                        className="hover:bg-slate-600 transition-colors cursor-pointer"
                        onClick={() => handleArticleClick(article)}
                      >
                        <td className="w-8/12 px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {article.gameCommunityContent}
                          {article.commentList?.length > 0 && (
                            <span className="text-cyan-500 ml-2">[{article.commentList.length}]</span>
                          )}
                        </td>
                        <td className="w-2/12 px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                          {article.user.nickname}
                        </td>
                        <td className="w-2/12 px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                          {new Date(article.createAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <Pagination 
                  totalItems={filteredArticles.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
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