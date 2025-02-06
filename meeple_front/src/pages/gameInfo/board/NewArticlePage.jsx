import BoardHeader from "../../../components/info/BoardHeader";
import ArticleEditor from "../../../components/info/ArticleEditor";

const NewArticlePage = () => {
  return (
    <div>
      <section>
        <BoardHeader />
      </section>
      <section>
        <ArticleEditor />
      </section>
    </div>
  )
};

export default NewArticlePage;