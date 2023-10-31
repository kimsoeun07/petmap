import { Outlet, useOutletContext } from "@remix-run/react";
import { useState, useEffect, useRef, createContext } from "react";
import type { MouseEventHandler } from 'react';
import { FaPlayCircle, FaPauseCircle } from 'react-icons/fa/index.js';

import {
    getApps,
    // 파이어베이스는 하나당 하나의 기능만을 쓸 수 있음. 앱들을 많이 만들어 낼 수 있는데, 그걸 가져오는 거
    initializeApp,
} from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyAE0QB1aMijN9XjGYXoCbYX0cBZx2wPPaI",
    authDomain: "test-aae13.firebaseapp.com",
    databaseURL: "https://test-aae13-default-rtdb.firebaseio.com",
    projectId: "test-aae13",
    storageBucket: "test-aae13.appspot.com",
    messagingSenderId: "798180387857",
    appId: "1:798180387857:web:5cb93874eb94fa4d7915b0"
};

// firebase.initializeApp(firebaseConfig);
if (!getApps().length) {
    initializeApp(firebaseConfig);
}

function formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    console.log(milliseconds)
    return `${hours}:${minutes}:${seconds}`;
}

const MapContext = createContext<React.MutableRefObject<any> | null>(null);

export default function Page() {
    const { isLoad } = useOutletContext<{isLoad:boolean}>()
    const [but, setBut] = useState(false)
    const [start, setStart] = useState(0)
    const [end, setEnd] = useState(0)
    const [coords, setCoords] = useState<[number, number][]>([]);
    // const [coords, setCoords] = useState<kakao.maps.LatLng[] | kakao.maps.LatLng[][]>([]);
    const current = useRef<[number, number]>([0, 0])
    const setT = useRef<NodeJS.Timeout>()

    // const [showModal, setShowModal] = useState(false);

    // const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
    const [timerResult, setTimerResult] = useState('');

    // 추가된 부분 - 현재 로그인된 사용자의 ID 상태 변수
    const [userId, setUserId] = useState<string | null>(null);

    // Start or Pause button handler
    const butFunc: MouseEventHandler = () => {
        if (but) {
            //타이머 멈춤
            setBut(false)
            clearInterval(setT.current)
            setTimerResult(formatTime(end - start))

        } else {
            //멈춰져 있을 때, 실행시킴
            setEnd(0)
            setStart(0)
            setCoords([current.current]);
            // setCoords(v => [...v, [37.313268, 126.857011], [37.313140, 126.857617], 
            //     [37.313012, 126.857998], [37.312428, 126.857784], [37.312162, 126.858033], 
            //     [37.312291, 126.858370], [37.312394, 126.858742], [37.312265, 126.858938]]);
            setT.current = setInterval(() => {
                setEnd(v => v + 1000)
            }, 1000)
            setBut(true)
            // cancelAnimationFrame(index)

        }
    }


    const ref = useRef<HTMLDivElement>(null);
    const mapRef = useRef<kakao.maps.Map>()
    useEffect(() => {
        if (!ref.current || !isLoad) return;
        const options = { //지도를 생성할 때 필요한 기본 옵션
            center: new kakao.maps.LatLng(33.450701, 126.570667), //지도의 중심좌표.
            level: 3 //지도의 레벨(확대, 축소 정도)
        };

        let map = new kakao.maps.Map(ref.current, options); //지도 생성 및 객체 리턴
        mapRef.current = map;

        const lat = 37.302975;
        const lon = 126.866580;
        const center = new kakao.maps.LatLng(lat, lon);
        map.setCenter(center);

        if (!navigator.geolocation) {
            const lat = 37.302975;
            const lon = 126.866580;
            const center = new kakao.maps.LatLng(lat, lon);
            map.setCenter(center);
        }

        window.addEventListener("message", (event) => {
            // alert(event.data);
            setUserId(event.data);
        });

        //   map.setCenter(new kakao.maps.LatLng(coords[0][0], coords[0][1]));

        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const center = new kakao.maps.LatLng(lat, lon);
            map.setCenter(center);
        });

        // Firebase Authentication에서 현재 로그인된 사용자 정보 가져오기
        // const auth = getAuth();
        // onAuthStateChanged(auth, (user) => {
        //     if (!user) {
        //         console.log("로그아웃 상태입니다.")
        //         setUserId(null);
        //     } else {
        //         console.log("현재 로그인된 구글 이메일 주소: ", user.email);
        //         // 로그인된 사용자가 있는 경우
        //         setUserId(user.uid);
        //     }
        // });


    }, [isLoad]);


    useEffect(() => {
        if(!isLoad) return
        //여기에다 선 그리기
        //길이가 0이면 초기화
        let linePath = []
        if (!mapRef.current) return
        const map = mapRef.current
        console.log(`coords = ${coords}`)
        for (let k = 0; k < coords.length; k++) {
            linePath.push(new kakao.maps.LatLng(coords[k][0], coords[k][1]))
        }

        const polyline = new kakao.maps.Polyline({
            path: linePath, // 선을 구성하는 좌표배열 입니다
            strokeWeight: 5, // 선의 두께 입니다
            strokeColor: '#FFAE00', // 선의 색깔입니다
            strokeOpacity: 0.7, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
            strokeStyle: 'solid' // 선의 스타일입니다
        });

        // 지도에 선을 표시합니다 
        polyline.setMap(map);

    }, [coords, isLoad])

    useEffect(() => {

        if (!mapRef.current || !navigator.geolocation || !isLoad) return

        //여기 >1로 수정 해 놓으시오
        if (!but && coords.length >= 1) {
            sendData();
            console.log('!but, sendData함수 실행')
        }


        let setT: NodeJS.Timeout
        const getCurrent = () => {
            navigator.geolocation.getCurrentPosition((position) => {
                setT = setTimeout(() => {
                    const lat = position.coords.latitude; // 위도
                    const lon = position.coords.longitude; // 경도

                    current.current = [lat, lon]
                    // 마커와 인포윈도우를 표시합니다
                    const locPosition = new kakao.maps.LatLng(lat, lon), // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
                        message = '<div style="padding:5px;">내 위치</div>';
                    displayMarker(locPosition, message)
                    getCurrent()
                    // if (but) {
                    //     if (coords.length === 0 || coords[coords.length - 1][0] !== lat || coords[coords.length - 1][1] !== lon)
                    //         // setCoords(v => [...v, [lat, lon]])
                    // }
                }, 1000)
            });
        }

        const displayMarker = (locPosition: kakao.maps.LatLng, message: string) => {
            if (!mapRef.current) return
            // const map = mapRef.current
            // map.setCenter(locPosition);

        }
        getCurrent()
        return () => {
            clearTimeout(setT)
        }


    }, [but, isLoad])

    const sendData = () => {
        if (!userId) {
            return
        } // userId가 없으면 데이터 전송하지 않음

        const date = new Date();

        console.log('데이터 보내기 함수 실행중')

        fetch('/api/walkData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coords, timerResult, date, userId }) // 현재 위치 정보 전송
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            })
            .catch(error => console.error('Error:', error));

    }


    return (
        <>
            <div style={{ position: "absolute", left: 0, bottom: 0, zIndex: 3, width: "100%", height: "30%", borderTopLeftRadius: "10%", borderTopRightRadius: "10%", backgroundColor: "white", textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 30 }}>{formatTime(end - start)}</div>
                <button onClick={butFunc} style={{ padding: 50, textAlign: 'center' }}>{!but ? <FaPlayCircle size={50} /> : <FaPauseCircle size={50} />}</button>
            </div>

            <MapContext.Provider value={ref}>
                <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
                    <div ref={ref} id="map" style={{ height: '100vh' }}></div>
                    <Outlet />
                </div>
            </MapContext.Provider>
        </>
    );
}