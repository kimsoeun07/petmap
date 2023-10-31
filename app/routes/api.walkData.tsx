import { ActionFunction, json } from "@remix-run/node";
import { client, walkcollection } from "~/lib/mongodb";

interface iData{
    coords:string;
    timerResult:string;
    date:string;
    userID:string;
}

export const action:ActionFunction = async ({request}) => {
    const { coords, timerResult, date, userID } = (await request.json()) as iData
    try {
        await client.connect();
        console.log('연결 성공, 새로 데이터 넣음')


        await walkcollection.insertOne(
            {
                "userID": userID,
                "coords": coords,
                "time": timerResult,
                "date": date
            }
        )
    } catch(err){
        console.error('연결 오류 발생')
        return json({ error: 'Server Error' }, 500);
    }

    return json({ message: "데이터 업로드 성공" });

}