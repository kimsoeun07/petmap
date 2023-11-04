import { LoaderFunction, LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData, useOutlet, useOutletContext } from '@remix-run/react';
import { useRef, useEffect, useState } from 'react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    try {
        const url = new URL(request.url)
        const data = JSON.parse(url.searchParams.get('data') ?? '[]')
        return json(data)
    } catch (err) {
        return json([])
    }
}

const MapView = () => {
    const data = useLoaderData<typeof loader>()
    const context = useOutletContext<{ isLoad: boolean }>()
    const [coords, setCoords] = useState<[number, number][]>(data);
    // { coords }: MapViewProps
    const ref = useRef<HTMLDivElement>(null);
    // window.addEventListener('message',(e) => setCoords(e.data) )

    // useEffect(() => {
    //     setCoords(v => [...v, [37.313268, 126.857011], [37.313140, 126.857617],
    //     [37.313012, 126.857998], [37.312428, 126.857784], [37.312162, 126.858033],
    //     [37.312291, 126.858370], [37.312394, 126.858742], [37.312265, 126.858938]]);
    // }, []);


    useEffect(() => {
        if (!window.kakao || !context.isLoad || !ref.current) return
        console.log(context)
        const options = { //지도를 생성할 때 필요한 기본 옵션
            center: new kakao.maps.LatLng(33.450701, 126.570667), //지도의 중심좌표.
            level: 3 //지도의 레벨(확대, 축소 정도)
        };

        let map = new kakao.maps.Map(ref.current, options); //지도 생성 및 객체 리턴

        // 지도 중심좌표를 접속위치로 변경합니다
        let locPosition = new kakao.maps.LatLng(coords[0][0], coords[0][1]);
        map.setCenter(locPosition); // 중심 좌표 설정

        const linePath = [];
        for (let k = 0; k < coords.length; k++) {
            linePath.push(new kakao.maps.LatLng(coords[k][0], coords[k][1]))
        }

        // 지도에 표시할 선을 생성합니다
        var polyline = new kakao.maps.Polyline({
            path: linePath, // 선을 구성하는 좌표배열 입니다
            strokeWeight: 5, // 선의 두께 입니다
            strokeColor: '#FFAE00', // 선의 색깔입니다
            strokeOpacity: 0.7, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
            strokeStyle: 'solid' // 선의 스타일입니다
        });

        // 지도에 선을 표시합니다 
        polyline.setMap(map);
    }, [coords, context])

    return (
        <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
            <div ref={ref} id="map" style={{
                height: '100vh'
            }}></div>
        </div>
    );
}

export default MapView;