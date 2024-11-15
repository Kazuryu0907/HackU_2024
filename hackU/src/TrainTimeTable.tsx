import "react";
import { useEffect, useState } from "react";


export const getTimeFromTrainTimeTable = (trainTimeTable: String[]) => {
    const timetables:Array<{"odpt:departureTime":string,"odpt:destinationStation":Array<string>,"odpt:train":string,"odpt":string,"odpt:trainNumber":string,"odpt:trainType":string}> = trainTimeTable[0]["odpt:stationTimetableObject"];
    return timetables.map((t) => t["odpt:departureTime"]);
}

export const getNearTrainTime = (times: String[]) => {
    const valid_times:String[] = [];
    const now = new Date();
    const h_now = now.getHours();
    const m_now = now.getMinutes();
    const plus_15 = new Date(now.getTime() + 15*60*1000);
    const h_plus_15 = plus_15.getHours();
    const m_plus_15 = plus_15.getMinutes();
    console.log(h_now,m_now);
    times.forEach(t => {
        const h = parseInt(t.split(":")[0]);
        const m = parseInt(t.split(":")[1]);
        if(h_now < h || (h_now == h && m_now < m)){
            // const time = new Date(now.getFullYear(),now.getMonth(),now.getDate(),h,m);
            if(h_plus_15 > h || (h_plus_15 == h && m_plus_15 > m)){
                valid_times.push(t);
            }
        }

    })
    // const now = new Date();
    // times.forEach(t => {
    //     const h = parseInt(t.split(":")[0]);
    //     const m = parseInt(t.split(":")[1]);
    //     const time = new Date(now.getFullYear(),now.getMonth(),now.getDate(),h,m);
    //     if(time > now)valid_times.push(time);
    // });
    console.log(valid_times.slice(-1)[0]);
    return valid_times.slice(-1)[0];
}

// const TrainTimeTable = () => {
//     const [trainTimeTable, setTrainTimeTable] = useState<String[]>([]);
//     useEffect(() => {
//         fetch("https://api.odpt.org/api/v4/odpt:StationTimetable?acl:consumerKey=qdxr1f16n0hqqbxhpzipz2j8z3ir1agb1iuqx8kubffd3jmta12hnk4343rfey9n&odpt:station=odpt.Station:TokyoMetro.Hanzomon.Nagatacho&odpt:railDirection=odpt.RailDirection:TokyoMetro.Shibuya&odpt:calendar=odpt.Calendar:Weekday",{method:"GET"})
//         .then(res => res.json())
//         .then(data => {setTrainTimeTable(data);getNearTrainTime(getTimeFromTrainTimeTable(data))});
//     },[]);
//     return (
//         <div>
//             {/* {trainTimeTable} */}
//         </div>
//     )
// };

// export default TrainTimeTable;