import { LoaderFunction, json } from "@remix-run/node";
import { ObjectId } from "mongodb";
import { client, petcollection } from "~/lib/mongodb";

export const loader:LoaderFunction = async ({params}) => {
    try {
        await client.connect();
        
        await petcollection.deleteOne({ _id: new ObjectId(params.id)});  // deleteOne 메소드 사용

        return json({ message: "데이터 삭제 성공" });
    } catch (error) {
        console.error("Error deleting data:", error);
        return json({ message: "서버 내부 오류" }, 500);
    }
}