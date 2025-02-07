// import { useState } from "react"
// import TopNavbar from "../../components/Navbar/TopNavBar"
// import InfoSideBar from "../../components/info/InfoSideBar"
// import GameInfo from "../../components/info/GameInfo"
// import GameRule from "../../components/info/GameRule"
// import GameCommunity from "../../components/info/GameCommunity"
// import ArticleList from "../../components/info/ArticleList"
// import ReviewList from "../../components/info/ReviewList"
// import PlayVideo from "../../components/info/PlayVideo"

// const GameInfoPage = () => {
//   const [selectedMenu, setSelectedMenu] = useState("gameinfo")

//   const renderContent = () => {
//     switch(selectedMenu) {
//       case "gameinfo":
//         return <GameInfo />
//       case "gamerule":
//         return <GameRule />
//       case "gamecommunity":
//         return <GameCommunity />
//       case "review":
//         return <ReviewList />
//       case "playvideo":
//         return <PlayVideo />
//       default:
//         return <GameInfo />
//     }
//   }

//   return (
//     <>
//       <div className="flex">
//         <InfoSideBar onMenuSelect={setSelectedMenu} />
//         <div className="content flex-1 mx-10px bg-gray-200">
//           {renderContent()}
//         </div>
//       </div>
//     </>
//   )
// };

// export default GameInfoPage;



import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const GameInfoPage = () => {
  const { gameId } = useParams(); // URL에서 gameId 받아오기
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`https://boardjjigae.duckdns.org/api/game-info/${gameId}`) //받아온 gameId로 게임 정보 받아오기
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [gameId]);

  if (loading) return <div>로딩중...</div>; // 정보 받기 전에 표시시
  if (error) return <div>에러가 발생했습니다.</div>;  //에러 발생 시
  if (!data) return <div>데이터가 없습니다.</div>;  

  return (
    <div>
      <section>{data.game.gameName}</section>
      <section>{data.gameInfoContent}</section>
    </div>
  );
};

export default GameInfoPage;