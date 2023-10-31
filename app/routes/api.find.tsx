import { LoaderFunction, json } from "@remix-run/node";
import { client, collection } from "~/lib/mongodb";

export const loader:LoaderFunction = async ({request}) => {
    const url = new URL(request.url)
    const _lat = url.searchParams.get('lat')
    const _lon = url.searchParams.get('lon')
    if(!_lat || !_lon){
        return json({ error: 'Internal Server Error' }, 500)
    }
    const lat = parseFloat(_lat)
    const lon = parseFloat(_lon)
    try {
        await client.connect();


        // location 필드에 대한 지리 인덱스 생성
        await collection.createIndex({ location: "2dsphere" });

        // 첫 번째 단계: 'location' 필드가 존재하고, 그 값이 올바른 형식인 문서만 선택
        const validDocs = await collection.find({
            "영업상태명": "영업/정상",
            "location": { $exists: true, $type: "object" }
        }).toArray();

        // 두 번째 단계: 첫 번째 단계에서 선택된 문서 중에서 geospatial 쿼리 수행
        const query = {
            _id: { $in: validDocs.map(doc => doc._id) },
            location: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        // coordinates: [126.941131, 33.459216] // 아마도 상록수역
                        // coordinates:  //롯데타워 arr
                        coordinates: [lon, lat] //석호중학교
                    },
                    $maxDistance: 2000
                }
            }
        };

        // 데이터 조회
        const result = await collection.find(query).toArray();
        return json(result.map(v => ({ ...v, _id: v._id.toString() })));
    } catch (error) {
        console.error('데이터 조회 중 오류가 발생했습니다.', error);
        return json({ error: 'Internal Server Error' }, 500);
    }
}