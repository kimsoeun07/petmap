import { LoaderFunction, json } from "@remix-run/node";
import { collection } from "~/lib/mongodb";

export const loader:LoaderFunction = async ({request}) => {
    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    const userID = url.searchParams.get('userID')
    if(!date || !userID) return json({ error: 'Server Error' }, 500)
    const dateRegex = new RegExp(date + "T");
    try {
// { $regex: new RegExp(date) }
        const data = await collection.find({ date: dateRegex, userID: userID }).toArray();

        const responseData = data.map((item) => ({
            imageURL: item.coords,
            userID: item.userID,
            time: item.time,
            date: item.date,
        }));

        return json(responseData); // JSON 형식으로 응답
        
    } catch (error) {
        console.error('데이터 조회 중 오류가 발생했습니다.', error);
        return json({ error: 'Server Error' }, 500);
    }
}