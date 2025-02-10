import ReviewList from "../../components/info/ReviewList";
import ReviewForm from "../../components/info/ReviewForm"
import axios from "axios";
import { useParams } from "react-router-dom";

const ReviewPage = () => {
  const gameId=useParams();



  return (
    <>
      <section>
        평균별점
      </section>
      <div>
        <ReviewForm />
      </div>
      <div>
        <ReviewList />
      </div>
    </>
    
  )
};

export default ReviewPage;