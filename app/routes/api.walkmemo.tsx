import { LoaderFunction, json } from "@remix-run/node";
import { collection } from "~/lib/mongodb";

export const loader:LoaderFunction = async ({request}) => {
    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    const userID = url.searchParams.get('userID')
    if(!date || !userID) return json({ error: 'Server Error' }, 500)
    try {

        // 해당 날짜에 대한 데이터 조회 (예시로 모든 데이터 반환)
        // const data = await collection.find({ "date": date.slice(0, -14) });
        const data = await collection.find({ date: { $regex: new RegExp(date) }, userID:userID }).toArray();

        // // 필요한 속성만 선택하여 응답
        const responseData = data.map((item) => ({
            imageURL: item.coords,
            userID: item.userID,
            time: item.time,
            date: item.date,
        }));

        return json(responseData); // JSON 형식으로 응답

        // return json(data.map(v => ({ ...v, _id: v._id.toString() })));
    } catch (error) {
        console.error('데이터 조회 중 오류가 발생했습니다.', error);
        return json({ error: 'Server Error' }, 500);
    }
}