import { useState } from "react"
import TopNavbar from "../../components/Navbar/TopNavBar"
import InfoSideBar from "../../components/info/InfoSideBar"
import GameInfo from "../../components/info/GameInfo"
import GameRule from "../../components/info/GameRule"
import GameCommunity from "../../components/info/GameCommunity"
import ArticleList from "../../components/info/ArticleList"
import ReviewList from "../../components/info/ReviewList"
import PlayVideo from "../../components/info/PlayVideo"

const GameInfoPage = () => {
  const [selectedMenu, setSelectedMenu] = useState("gameinfo")

  const renderContent = () => {
    switch(selectedMenu) {
      case "gameinfo":
        return <GameInfo />
      case "gamerule":
        return <GameRule />
      case "gamecommunity":
        return <GameCommunity />
      case "review":
        return <ReviewList />
      case "playvideo":
        return <PlayVideo />
      default:
        return <GameInfo />
    }
  }

  return (
    <>
      <div className="flex">
        <InfoSideBar onMenuSelect={setSelectedMenu} />
        <div className="content flex-1 mx-10px bg-gray-200">
          {renderContent()}
        </div>
      </div>
    </>
  )
};

export default GameInfoPage;
