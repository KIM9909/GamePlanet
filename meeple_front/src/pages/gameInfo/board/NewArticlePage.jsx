import { useNavigate,useParams } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import BoardHeader from "../../../components/info/BoardHeader";
import ArticleForm from "../../../components/info/ArticleForm";

const NewArticlePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {gameId}=useParams()

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post('/game-info/community', formData);
      
      if (response.status === 200) {
        // 저장 성공 시 게시글 목록으로 이동
        navigate(`game/${gameId}/board`);
      }
    } catch (error) {
      console.error('게시글 저장 실패:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <section className="mb-6">
        <BoardHeader />
      </section>
      <section>
        <ArticleForm 
          onSubmit={handleSubmit}
          isEditing={false}
        />
      </section>
    </div>
  );
};

export default NewArticlePage;