
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] = useState(true);
  const [loadedIds, setLoadedIds] = useState(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const [searchType, setSearchType] = useState('content'); // 'name' or 'nickname'
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;


  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await GameInfoAPI.getCommunityPosts(gameInfoId);
      const sortedArticles = response.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      // 중복 제거 로직
      const newArticles = sortedArticles.filter(article => 
        !loadedIds.has(article.gameCommunityId)
      );
      
      if (newArticles.length === 0) {
        setHasMore(false);
        return;
      }

      setArticles(prev => [...prev, ...newArticles]);
      setLoadedIds(new Set([
        ...Array.from(loadedIds),
        ...newArticles.map(article => article.gameCommunityId)
      ]));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && 
      !loading && 
      !isLoadingMore &&
      hasMore
    ) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
      fetchArticles();
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [gameInfoId]);

  

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, isLoadingMore]);

  if (loading && articles.length === 0) 
    return <div className="text-white"><Loading /></div>;
  if (error) return <div className="text-white">에러가 발생했습니다.</div>;
  // if (!articles.length) return <div>데이터가 없습니다.</div>;

  // return (
  //   <div className="h-screen p-8">
  //     <div className="max-w-7xl mx-auto h-full">
  //       <div className="bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl h-full flex flex-col backdrop-blur-lg border border-indigo-500/30">
  //         {/* 헤더 영역 */}
  //         <div className="p-8 flex justify-between items-center">
  //           <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
  //             Community
  //           </h1>
  //           <button
  //             onClick={() => navigate(`/game-info/${gameInfoId}/board/write`)}
  //             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  //           >
  //             글쓰기
  //           </button>
  //         </div>

  //         {/* 스크롤 가능한 글 목록 영역 */}
  //         <div className="flex-1 overflow-y-auto px-8 pb-8">
  //           <div className="space-y-4">
  //             {articles.map((item) => (
  //               <ArticleItem
  //                 key={item.gameCommunityId}
  //                 content={item.gameCommunityContent}
  //                 createdAt={item.createAt}
  //                 createdBy={item.user}
  //                 comments={item.commentList}
  //                 articleId={item.gameCommunityId}
  //                 commentList={item.commentList}
  //               />
  //             ))}
  //           </div>
  //           {isLoadingMore && (
  //             <div className="text-center py-4">
  //               더 불러오는 중...
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );




  // 더미 데이터
  // const [users] = useState(Array.from({ length: 35 }, (_, index) => ({
  //   id: index + 1,
  //   name: `사용자${index + 1}`,
  //   nickname: `User${index + 1}`,
  //   email: `user${index + 1}@example.com`,
  // })));

  // 검색 필터링
  const filteredArticles = articles.filter(article => {
    if (!searchTerm) return true;
    
    if (searchType === 'content') {
      return article.gameCommunityContent.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      return article.user.nickname.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  // 현재 페이지의 데이터
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredArticles.slice(startIndex, endIndex);
  };

  // 검색 시 페이지 리셋
  const handleSearch = () => {
    setCurrentPage(1);
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
      <div className="flex justify-end mb-6">
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-slate-700 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-slate-600">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                내용
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                작성자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {article.gameCommunityContent}
                  {article.commentList?.length > 0 && (
                    <span className="text-cyan-500 ml-2">[{article.commentList.length}]</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {article.user.nickname}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(article.createAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
  );
};

export default BoardPage;