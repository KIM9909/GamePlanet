import ReviewForm from "../info/ReviewForm"
import { useEffect,useState } from "react";
import axios from "axios";
import { useNavigate,useParams } from "react-router-dom";
import ReviewItem from "./ReviewItem";


const ReviewList = () =>{
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    setLoading(true);
    axios.get(`https://boardjjigae.duckdns.org/api/game-info/reivew?gameInfoId=${gameId}`)
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [gameId]);


  return (
    <div>
      <section>
        if(data.starAvg){
          `별점 ${data.starAvg}`
        } else {
          "아직 별점을 등록한 사람이 없어요"
        }

      </section>
      <ReviewForm />
      {/* 리뷰목록 */}
      <section>
        {data.reviewList.map((item)=> <ReviewItem key={item.gaemReviewId} {...item} />)}
      </section>
    </div>
  )
};

export default ReviewList;