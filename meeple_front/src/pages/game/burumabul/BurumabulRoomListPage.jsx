import React, { useEffect, useState, useRef, useCallback } from "react";
import BurumabulRoomListCard from "../../../components/game/burumabul/BurumabulRoomListCard";
import {
  listBurumabulRoom,
  searchBurumabulRoomname,
} from "../../../sources/api/BurumabulRoomAPI";
import { Search } from "lucide-react";

const ITEMS_PER_LOAD = 10; // 한 번에 보여줄 개수
const BurumabulRoomList = () => {
  const [roomList, setRoomList] = useState([]);
  const [visibleRooms, setVisibleRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const [searchName, setSearchName] = useState("");

  // 기존의 방 목록 가져오기
  const getRoomList = async () => {
    try {
      const response = await listBurumabulRoom();
      setRoomList(response);
      console.log(response);
      setVisibleRooms(response.slice(0, ITEMS_PER_LOAD));
    } catch (error) {
      console.error("부루마불 방 목록 조회 중 에러 발생 :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("방 목록 불러오는 중...");
    getRoomList();
  }, []);
  console.log("방 목록 : ", roomList);

  console.log(roomList);

  // 검색어가 변경될 때마다 검색 실행
  useEffect(() => {
    const fetchSearchResult = async () => {
      if (!searchName.trim()) {
        getRoomList();
        return;
      }

      setLoading(true);
      try {
        const searchResult = await searchBurumabulRoomname(searchName);
        setRoomList(searchResult);
        setVisibleRooms(searchResult.slice(0, ITEMS_PER_LOAD));
      } catch (error) {
        console.error("검색 중 에러 발생: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResult();
  }, [searchName]);

  // 검색 핸들러
  const handleSearch = async (e) => {
    e.preventDefault();
    // 검색어가 없으면 전체 표시
    if (!searchName.trim()) {
      getRoomList();
      return;
    }

    setLoading(true);
    try {
      const searchResult = await searchBurumabulRoomname(searchName);
      setRoomList(searchResult);
      setVisibleRooms(searchResult.slice(0, ITEMS_PER_LOAD));
    } catch (error) {
      console.error("검색 중 에러 발생 :", error);
    } finally {
      setLoading(false);
    }
  };

  // 더 보기 함수
  const loadMoreRooms = () => {
    if (loading) return;
    setLoading(true);

    setTimeout(() => {
      setVisibleRooms((prev) => [
        ...prev,
        ...roomList.slice(prev.length, prev.length + ITEMS_PER_LOAD),
      ]);
      setLoading(false);
    }, 1000);
  };

  const lastRoomElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          visibleRooms.length < roomList.length
        ) {
          loadMoreRooms();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, visibleRooms, roomList]
  );

  return (
    <div className="flex justify-center flex-col items-center w-full  min-h-screen bg-gradient-to-b from-black via-purple-900 to-indigo-900">
      <h1 className="text-white text-4xl text-center my-10">
        부루마불 게임 대기방 목록
      </h1>
      {/* 검색바 추가 */}
      <div className="w-[70%] mb-6 flex justify-center">
        <form onSubmit={handleSearch} className="flex gap-2 w-2/3">
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="방 이름으로 검색..."
            className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-yellow-500"
          />
          <button type="submit">
            <Search size={44} color="#eeff00" strokeWidth={3} />
          </button>
        </form>
      </div>

      {roomList.length > 0 ? (
        <div className="bg-yellow-300 rounded-lg w-[60%] h-[70vh] overflow-y-auto p-4">
          <div className="my-6 flex flex-col items-center justify-center mx-auto gap-4 ">
            {visibleRooms.map((roomInfo, index) => {
              if (index === visibleRooms.length - 1) {
                return (
                  <div key={index} ref={lastRoomElementRef}>
                    <BurumabulRoomListCard key={index} roomInfo={roomInfo} />
                  </div>
                );
              }
              return (
                <div key={index}>
                  <BurumabulRoomListCard key={index} roomInfo={roomInfo} />
                </div>
              );
            })}
          </div>
          {loading && (
            <div className="text-center text-white mt-4">로딩 중...</div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-300 rounded-lg  w-[60%] h-[70vh] flex justify-center items-center">
          <div className="text-white text-3xl font-bold font-">
            생성된 방 목록이 없습니다.
          </div>
        </div>
      )}
    </div>
  );
};

export default BurumabulRoomList;
