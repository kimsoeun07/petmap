import { ActionFunction, json } from "@remix-run/node";
import { client, petcollection } from "~/lib/mongodb";

interface iData{
    imageURL:string;
    userID:string;
    name:string;
    birthday:string;
    kind:string;
}

export const action:ActionFunction = async ({request}) => {
    const { imageURL, userID, name, birthday, kind} = (await request.json()) as iData
    try {
        await client.connect();
        console.log('연결 성공, 새로 데이터 넣음')


        await petcollection.insertOne(
            {
                "imageURL": imageURL,
                "userID": userID,
                "name": name,
                "birthday": birthday,
                "kind": kind
            }
        )
    } catch(err){
        console.error('연결 오류 발생')
        return json({ error: 'Server Error' }, 500);
    }

    return json({ message: "데이터 업로드 성공" });

}