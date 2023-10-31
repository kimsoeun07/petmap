import { LoaderFunction, json } from "@remix-run/node";
import { client, petcollection } from "~/lib/mongodb";

export const loader:LoaderFunction = async ({params}) => {
    try {
        const { userID } = params;

        // 해당 날짜에 대한 데이터 조회 (예시로 모든 데이터 반환)
        // const data = await collection.find({ "date": date.slice(0, -14) });
        await client.connect()
        const data = await petcollection.find({ userID: userID }).toArray();
// 
        // 필요한 속성만 선택하여 응답
        const responseData = data.map((item) => ({
            imageURL: item.imageURL,
            userID: item.userID,
            name: item.name,
            birthday: item.birthday,
            kind: item.kind,
            _id: item._id.toString()
        }));

        console.log(responseData)

        return json(responseData); // JSON 형식으로 응답
        // console.log(responseData)

        // return json(data)

        // return json(data.map(v => ({ ...v, _id: v._id.toString() })));
    } catch (error) {
        console.error('데이터 조회 중 오류가 발생했습니다.', error);
        return json({ error: 'Server Error' }, 500);
    }
}