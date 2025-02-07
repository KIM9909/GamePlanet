import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BoardHeader from "../../../components/info/BoardHeader";
import ArticleForm from "../../../components/info/ArticleForm";

const EditArticlePage = () => {
  const { gameId,articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`/game-info/community/${articleId}`);
        setArticle(response.data);
      } catch (error) {
        console.error('게시글 조회 실패:', error);
        alert('게시글을 불러오는데 실패했습니다.');
        navigate('/board');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId, navigate]);

  const handleSubmit = async (formData) => {
    try {
      const response = await axios.put(`/game-info/community/${articleId}`, formData);
      
      if (response.status === 200) {
        alert('게시글이 수정되었습니다.');
        navigate(`game/${gameId}/board/detail/${articleId}`); // 수정된 게시글 상세 페이지로 이동
      }
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <section className="mb-6">
        <BoardHeader />
      </section>
      <section>
        {article && (
          <ArticleForm 
            initialData={article}
            onSubmit={handleSubmit}
            isEditing={true}
          />
        )}
      </section>
    </div>
  );
};

export default EditArticlePage;
