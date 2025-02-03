const InfoSideBar = ({ onMenuSelect }) => {
  return (
    <div className="sidebar">
      <button onClick={() => onMenuSelect("gameinfo")}>gameinfo</button>
      <button onClick={() => onMenuSelect("gamerule")}>gamerule</button>

      <button onClick={() => onMenuSelect("gamecommunity")}>gamecommunity</button>
      <button onClick={() => onMenuSelect("gamereview")}>review</button>
      <button onClick={() => onMenuSelect("playvideo")}>playvideo</button>
    </div>
  )
};

export default InfoSideBar;
