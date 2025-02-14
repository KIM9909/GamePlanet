
import ArticleItem from "../../../components/info/board/ArticleItem"
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameInfoAPI } from '../../../sources/api/GameInfoAPI';
import Pagination from "../../../components/admin/Pagination";
import { Search } from "lucide-react";
import Loading from "../../../components/Loading";

const BoardPage = () => {
  const { gameInfoId } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchType, setSearchType] = useState('content'); //content와 nickname중 선택
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const [searchTermInput, setSearchTermInput] = useState(''); // 검색어 입력값을 위한 새로운 state
  const [activeSearchTerm, setActiveSearchTerm] = useState(''); // 실제 검색에 사용될 검색어

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await GameInfoAPI.getCommunityPosts(gameInfoId);
      //최신 글이 앞에 오도록 정렬
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
  if (error) return 
    // <div className="text-white">에러가 발생했습니다.</div>;
    navigate("/errorpage");
  // if (!articles.length) return <div>데이터가 없습니다.</div>;



  // 검색 필터링 
  const filteredArticles = articles.filter(article => {
    if (!activeSearchTerm) return true;
    
    if (searchType === 'content') {
      return article.gameCommunityContent.toLowerCase().includes(activeSearchTerm.toLowerCase());
    } else {
      return article.user.nickname.toLowerCase().includes(activeSearchTerm.toLowerCase());
    }
  });

  // 현재 페이지의 데이터
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredArticles.slice(startIndex, endIndex);
  };

  const handleSearch = () => {
    setActiveSearchTerm(searchTermInput); // 입력된 검색어를 활성 검색어로 설정
    setCurrentPage(1); // 페이지 리셋
  };

  // Enter 키로도 검색버튼 눌리게
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleArticleClick = (articleId) => {
    navigate(`/game-info/${gameInfoId}/board/detail/${articleId}`);
  };

  return (
    <div>
      <div className="min-h-screen p-8 bg-[#0a0a2a]/50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl p-8 backdrop-blur-lg border border-cyan-500/50 max-h-[650px] overflow-y-auto custom-scrollbar">
            <div className="grid grid-rows-1 gap-8 mb-8">
              {/* 검색 영역 */}
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

              {/* 테이블 영역 */}
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
                        onClick={() => handleArticleClick(article.gameCommunityId)}
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

              {/* 페이지네이션과 글쓰기 버튼 */}
              <div className="flex justify-between items-center mt-4">
                
                <Pagination 
                  totalItems={filteredArticles.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
                <button
                  onClick={() => navigate(`/game-info/${gameInfoId}/board/write`)}
                  className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2"
                >
                  글쓰기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardPage;