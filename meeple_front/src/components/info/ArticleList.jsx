import ArticleItem from "./ArticleItem"
const ArticleList = () =>{
  return (
    <div className="my-5px mx-10px">
      <h3>Community</h3>
      <section>
        <section className="my-5px ">
          <br />
          <span className="w-auto border-b-2 justify-center">제목</span>
          <span className="w-20px border-b-2 justify-center">작성자</span>
          <span className="w-20px border-b-2 justify-center">작성일</span>
          <span className="w-10px border-b-2 justify-center">조회수</span>
          제목 작성자 작성일 조회수
        </section>
        <section>
          <ArticleItem />
        </section>
        <section>
          <div>pagesButton</div>
          <div>createArticleButton</div>
        </section>
      </section>
    </div>
  )
};

export default ArticleList;