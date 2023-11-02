import type { MetaFunction } from "@remix-run/node";
import { Outlet, useOutletContext } from "@remix-run/react";
import React, { useRef, useEffect, createContext, useState, } from 'react';
import { Drawer } from "flowbite";
import { BiSearch } from "react-icons/bi/index.js";
import '~/css/find.css'
// import 'api'

export const meta: MetaFunction = () => {
    return [
        { title: "New Remix App" },
        { name: "description", content: "Welcome to Remix!" },
    ];
};

type YourDataType = {
    _id: string;
    사업장명: string;
    도로명전체주소: string;
    소재지전화: string;
    location: {
        type: "Point",
        coordinates: [
            number,
            number
        ]
    }
};

// MapContext 생성
const MapContext = createContext<React.MutableRefObject<any> | null>(null);

// Index 컴포넌트
export default function Index() {
    const ref = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null); // mapRef의 타입을 React.MutableRefObject<any>로 변경
    const { isLoad } = useOutletContext<{ isLoad: boolean }>()

    const markerRef = useRef<kakao.maps.Marker | null>(null); // markerRef 추가 검색한 좌표 저장
    const infowindowRef = useRef<kakao.maps.InfoWindow | null>(null); // infowindowRef 추가 검색한 좌표 인포윈도우 저장

    const initialMarkerRef = useRef<kakao.maps.Marker | null>(null); // markerRef 추가 처음 위치 조회 좌표 저장
    const initialInfowindowRef = useRef<kakao.maps.InfoWindow | null>(null); // infowindowRef 추가 처음 위치 조회 좌표 저장

    const [markers, setMarkers] = useState<kakao.maps.Marker[]>([]) //병원데이터 마커

    const target = useRef<HTMLDivElement>(null);
    const drawer = useRef<Drawer>();

    const [searchResults, setSearchResults] = useState<YourDataType[]>([]) // 결과 데이터를 저장할 상태 변수

    // const [messageLocation, setMessageLocation] = useState('');

    //react native에서 위치 받기
    // window.addEventListener('message', (e) => alert(e.data))
    
    // window.addEventListener('message', (e) => {
    //     try {
    //         const message = JSON.parse(e.data);
    //         console.log(message); // 수신한 메시지 출력
    //         // 원하는 동작 추가
    //       } catch (error) {
    //         console.error('메시지 파싱 오류:', error);
    //       }
    //     // 원하는 동작 추가
    // });

    // window.addEventListener('DOMContentLoaded', (event) => {
    //     // window.webLocation에 접근하여 위치 정보를 가져옵니다.
    //     const location = window.webLocation;
    //     console.log(location); // 받아온 위치 정보를 출력
    //     // 여기서 필요한 동작을 수행합니다.
    // });

    // window.addEventListener('message', (event) => {
    //     const location = JSON.parse(event.data);
    //     console.log(location); // 받아온 위치 정보를 출력
    //     // 여기서 필요한 동작을 수행합니다.

    //     setMessageLocation(location);

    //     alert(`${location}`)
    //   });


    useEffect(() => {
        if (!target || !isLoad) return;
        drawer.current = new Drawer(target.current, {
            placement: 'bottom',
        });

        if (!ref.current) return;
        const options = { //지도를 생성할 때 필요한 기본 옵션
            center: new kakao.maps.LatLng(33.450701, 126.570667), //지도의 중심좌표.
            level: 3 //지도의 레벨(확대, 축소 정도)
        };

        const navigator = window.navigator;
        let map = new kakao.maps.Map(ref.current, options); //지도 생성 및 객체 리턴

        mapRef.current = map;

        if (navigator.geolocation) {

            // const locPosition = new kakao.maps.LatLng(37.302975, 126.866580),
            //     message = '내 위치'

            // displayMarker(locPosition, message);

            // fetch(`http://172.30.14.29:5000/api/find?lat=${37.302975}&lon=${126.866580}`, {
            //     method: 'GET',
            //     headers: { 'Content-Type': 'application/json' },
            //     // body: JSON.stringify({ lon, lat }) // 현재 위치 정보 전송
            // })
            //     .then(response => response.json())
            //     .then(data => {
            //         console.log(data);
            //         setSearchResults(data)
            //     })
            //     .catch(error => console.error('Error:', error));



            // GeoLocation을 이용해서 접속 위치를 얻어옵니다
            navigator.geolocation.getCurrentPosition(async function (position) {

                const lat = position.coords.latitude; // 위도
                const lon = position.coords.longitude; // 경도

                const locPosition = new kakao.maps.LatLng(lat, lon), // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
                    message = '<div style="padding:5px;">내 위치</div>'; // 인포윈도우에 표시될 내용입니다
                console.log(`그냥 좌표 받아온거 : ${lat},${lon}`)

                alert(`이건가? ${lat},${lon}`)



                fetch(`/api/find?lat=${lat}&lon=${lon}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    // body: JSON.stringify({ lon, lat }) // 현재 위치 정보 전송
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        setSearchResults(data)
                    })
                    .catch(error => console.error('Error:', error));


                // 마커와 인포윈도우를 표시합니다
                displayMarker(locPosition, message);

            });

        } else { // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다
            const locPosition = new kakao.maps.LatLng(37.566352778, 126.977952778),
                message = '위치 조회 실패..'

            displayMarker(locPosition, message);
        }


        // 지도에 마커와 인포윈도우를 표시하는 함수입니다
        async function displayMarker(locPosition: kakao.maps.LatLng, message: string) {
            // if (markerPoint !== null) {
            //     markerPoint.setMap(null);
            // }

            // 마커를 생성합니다
            const newMarker = new kakao.maps.Marker({
                map: map,
                position: locPosition
            });

            const iwContent = message, // 인포윈도우에 표시할 내용
                iwRemoveable = true;

            // 인포윈도우를 생성합니다
            const newInfowindow = new kakao.maps.InfoWindow({
                content: iwContent,
                removable: iwRemoveable
            });

            // 인포윈도우를 마커위에 표시합니다
            newInfowindow.open(map, newMarker);

            // setMarkerPoint(newMarker)

            // 지도 중심좌표를 접속위치로 변경합니다
            map.setCenter(locPosition);

            initialMarkerRef.current = newMarker; // 현재 마커 객체 업데이트
            initialInfowindowRef.current = newInfowindow; // 현재 인포윈도우 객체 업데이트

        }
    }, [isLoad]);

    useEffect(() => {
        if (!isLoad) return
        // 마커 이미지의 이미지 주소입니다
        var imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
        const map = mapRef.current;
        if (!map) return;

        if (searchResults.length > 0) {
            setMarkers([]);

            for (let i = 0; i < searchResults.length; i++) {

                // 마커 이미지의 이미지 크기 입니다
                var imageSize = new kakao.maps.Size(24, 35);

                // 마커 이미지를 생성합니다    
                var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

                let lat = searchResults[i].location.coordinates[1];
                let lon = searchResults[i].location.coordinates[0];

                // 마커를 생성합니다
                var marker = new kakao.maps.Marker({
                    map: map, // 마커를 표시할 지도
                    position: new kakao.maps.LatLng(lat, lon), // 마커의 위치
                    image: markerImage, // 마커 이미지 

                });

                // 마커에 표시할 인포윈도우를 생성합니다 
                var infowindow = new kakao.maps.InfoWindow({
                    content: searchResults[i].사업장명, // 인포윈도우에 표시할 내용
                    removable: true,
                });

                // setMarkers(prevMarkers => [...prevMarkers, marker]); // 이전 markers 배열과 새로운 marker 추가

                // marker.setMap(map);
                infowindow.open(map, marker);

            }
            for (let i = 0; i < markers.length; i++) {
                markers[i].setMap(map);
            }
        }

    }, [searchResults, isLoad])

    const handleGeocoding = async (inputAddress: string) => {
        try {
            const map = mapRef.current;

            if (!map) return;

            const geocoder = new kakao.maps.services.Geocoder();
            // const result = 
            await new Promise<any>((resolve, reject) => {
                geocoder.addressSearch(inputAddress, (result: any[], status: any) => {
                    if (status === kakao.maps.services.Status.OK) {

                        resolve(result);
                        const latitude = parseFloat(result[0].y);
                        const longitude = parseFloat(result[0].x);

                        const coords = new kakao.maps.LatLng(latitude, longitude);

                        let lon = longitude;
                        let lat = latitude;

                        fetch(`/api/find?lat=${lat}&lon=${lon}`, {
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' },
                            // body: JSON.stringify({ lon, lat }) // 현재 위치 정보 전송
                        })
                            .then(response => response.json())
                            .then(data => {
                                console.log(data);
                                setSearchResults(data)
                            })
                            .catch(error => console.error('Error:', error));


                        // Remove previous marker and infowindow
                        if (markerRef.current !== null && infowindowRef.current !== null) {
                            markerRef.current.setMap(null);
                            infowindowRef.current.close();
                            markerRef.current = null;
                            infowindowRef.current = null;
                        }

                        // Remove initial marker
                        if (initialMarkerRef.current !== null && initialInfowindowRef.current !== null) {
                            initialMarkerRef.current.setMap(null);
                            initialInfowindowRef.current.close();
                            initialMarkerRef.current = null;
                            initialInfowindowRef.current = null;
                        }

                        // 결과값으로 받은 위치를 마커로 표시합니다
                        const marker = new kakao.maps.Marker({
                            map: map,
                            position: coords,
                        });

                        // 인포윈도우로 장소에 대한 설명을 표시합니다
                        const infowindow = new kakao.maps.InfoWindow({
                            content: '<div style="width:150px;text-align:center;padding:6px 0;">내 위치</div>',
                            removable: true,
                        });
                        infowindow.open(map, marker);

                        // setMarkerPoint(marker)
                        // setInfowindowPoint(infowindow)

                        // Update the state variables with the new marker and infowindow
                        markerRef.current = marker;
                        infowindowRef.current = infowindow;

                        // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
                        map.setCenter(coords);
                    }
                    else
                        reject(new Error("Geocoding failed."));
                });
            });

            // ...
        } catch (error) {
            console.error(error); // 에러 메세지 출력 또는 다른 에러 처리 로직 수행
        }

    }



    return (
        <>
            <div className="contents ">
                <div className="bg-white absolute z-10 top-0 h-12" style={{ width: "100%", flexDirection: "row" }}>
                    <BiSearch style={{ display: "inline", margin: 10, fontSize: 30 }} />
                    <input placeholder="정확한 주소를 입력하세요" style={{ border: "2px solid black", margin: 10 }} onChange={(e) => handleGeocoding(e.target.value)} />
                    <button onClick={() => {
                        if (!drawer.current) return;
                        drawer.current.toggle();
                    }} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg 
                text-sm px-5 py-2.5 mr-0 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 right-0"
                        type="button">
                        Show drawer
                    </button>
                </div>
            </div>

            <div className="contents, max-h">


                <div ref={target} className="fixed bottom-0 left-0 right-0 z-40 w-full p-4 overflow-y-auto transition-transform bg-white dark:bg-gray-800 translate-none" tabIndex={-1} style={{
                    maxHeight: '40vh', // 최대 높이를 화면 높이의 30%로 설정
                    overflowY: 'auto',  // 내용이 넘치면 스크롤 가능하도록 설정
                }}>
                    <h5 className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                        </svg>동물병원</h5>
                    <button onClick={() => {
                        if (!drawer.current) return;
                        drawer.current.toggle();
                    }} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 right-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close menu</span>
                    </button>
                    <div className="max-w-lg mb-6 text-sm text-gray-500 dark:text-gray-400">
                        {searchResults.map((result, index) => (
                            <div key={index}>
                                <p>{result.사업장명}</p>
                                <p>{result.도로명전체주소}</p>
                                <p>{result.소재지전화}</p>
                                <hr style={{ marginTop: 10, marginBottom: 10 }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            <MapContext.Provider value={mapRef}>
                <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
                    <div ref={ref} id="map" style={{ height: '100vh' }}></div>
                    <Outlet />
                </div>
            </MapContext.Provider>
        </>
    );
}
