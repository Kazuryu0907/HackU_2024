// src/components/GoogleMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import { mapPrefectures } from '@/datas/mapPrefectures'; //都道府県データ
import { getTimeFromTrainTimeTable,getNearTrainTime } from "./TrainTimeTable";
import {MarkerF} from "@react-google-maps/api";
// 初期化用の定数
const INITIALIZE_LAT  = 35.67981;  // 緯度
const INITIALIZE_LNG  = 139.73695; // 経度
const INITIALIZE_ZOOM = 16;        // ズームレベル

const INITIALIZE_MAP_WIDTH  = '100%';  // 地図の幅
const INITIALIZE_MAP_HEIGHT = '800px'; // 地図の高さ

const MyGoogleMap: React.FC = () => {
    const mapRef                  = useRef<HTMLDivElement>(null);
    const [map, setMap]           = useState<google.maps.Map | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null); // 緯度経度state
    const [station, setStation]     = useState<google.maps.places.PlaceResult[]>([]); // 周辺駅state
    const [startLocation, setStartLocation]           = useState<string | null>(null);
    const [endLocation, setEndLocation]               = useState<string | null>(null);
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
    const [distance, setDistance]                     = useState<string | null>(null);  // 距離state
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]); // マーカー管理用
    const [currentTime, setCurrentTime] = useState<string>('');//現在時刻
    const [currentPosition, setCurrentPosition] = useState<google.maps.LatLng | null>(null);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null); // エラーを表示するためのステート




    //初期レンダー後に適用されるエフェクト
    useEffect(() => {
        if (!mapRef.current) return;

        const initializedMap  = new google.maps.Map(mapRef.current, {
            center: { lat: INITIALIZE_LAT, lng: INITIALIZE_LNG },
            zoom: INITIALIZE_ZOOM,
            mapId: "DEMO_MAP_ID"
        });

        setMap(initializedMap);
    }, []);

    const currentLocationOnClick = () => {
      if(!map) return;
      if(!latitude || !longitude) return;
      map.setCenter({ lat: latitude, lng: longitude });
      const service = new google.maps.places.PlacesService(map);
      service.nearbySearch(
        {
          location: { lat: latitude, lng: longitude },
          radius: 1000, // 検索範囲（メートル）
          type: 'transit_station', // 駅を検索
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            setStation(results || []);
            // 新しいマーカーを配置
            updateMarkers(results || []);
          }
        }
      );
    };

    //mapが更新されたら発動
    useEffect(() => {
        if (!map) return;

        /*// クリックリスナー
        map.addListener('click', (event: { latLng: { lat: () => any; lng: () => any; }; }) => {
            // 緯度経度の取得
            const latitude = event.latLng.lat();
            const longitude = event.latLng.lng();
            setLocation({ lat: latitude, lng: longitude });

            // 駅データの取得
            const service = new google.maps.places.PlacesService(map);
            service.nearbySearch({
                location: { lat: latitude, lng: longitude },
                radius: 3000,  // 検索範囲（メートル）
                type: 'transit_station'  // 駅を検索 bus_station subway_station train_station
            }, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    setStation(results || []);
                }
            });


            // 最寄り駅の緯度経度を取得
            var firstPlace = station[0];
            // 一段階ずつundifineでないことを確認しないとエラーになる
            if (firstPlace && firstPlace.geometry && firstPlace.geometry.location) {
                // var station_latitude = firstPlace.geometry.location.lat();
                // var station_latitude2 = firstPlace['geometry']['location']['lat']();
                var nearest_station_location = firstPlace.geometry.location;

                console.log("緯度:", nearest_station_location.lat());
                console.log("経度:", nearest_station_location.lng());
                
            } else {
                console.error("場所情報が取得できませんでした");
            }
        }); //クリックリスナー終了
        */

        // クリックリスナーの登録
    map.addListener('click', (event: { latLng: { lat: () => any; lng: () => any; }; }) => {
      const latitude = event.latLng.lat();
      const longitude = event.latLng.lng();
      setLocation({ lat: latitude, lng: longitude });

      // 駅データの取得（バス停や駅）
      const service = new google.maps.places.PlacesService(map);
      service.nearbySearch(
        {
          location: { lat: latitude, lng: longitude },
          radius: 1000, // 検索範囲（メートル）
          type: 'transit_station', // 駅を検索
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            setStation(results || []);
            // 新しいマーカーを配置
            updateMarkers(results || []);
          }
        }
      );
    });
  }, [map]);


  const getUniqueBus = (stations: google.maps.places.PlaceResult[]) => {
    return stations.filter(
      (ele,index,self) => self.findIndex(e => e.name === ele.name) === index
    );
  }

  const getStatons = (stations: google.maps.places.PlaceResult[]) => {
    return stations.filter(s => s.name?.includes("駅")).map(s => s.name).filter(s => s !== undefined);
  }
  const fetchStation = async(stationName: string):Promise<{railway:string|undefined,station_code:string}> =>{
    const url = `https://api.odpt.org/api/v4/odpt:Station?acl:consumerKey=qdxr1f16n0hqqbxhpzipz2j8z3ir1agb1iuqx8kubffd3jmta12hnk4343rfey9n&dc:title=${stationName.replace("駅","")}`;
    const res = await fetch(url,{method:"GET"});
    const data = await res.json();
    if(data.length === 0)return {"railway":undefined,"station_code":""};
    console.log(data[0])
    const railway = data[0]["owl:sameAs"];
    const station_code = data[0]["odpt:stationCode"].slice(0,1);
    return {"railway":railway,"station_code":station_code};
  }

  const getStationTime2 = async(stationRailway: string) => {
    const url = `https://api.odpt.org/api/v4/odpt:StationTimetable?acl:consumerKey=qdxr1f16n0hqqbxhpzipz2j8z3ir1agb1iuqx8kubffd3jmta12hnk4343rfey9n&odpt:station=${stationRailway}&odpt:calendar=odpt.Calendar:Weekday`;
    const res = await fetch(url,{method:"GET"});
    const data = await res.json();
    const time = getNearTrainTime(getTimeFromTrainTimeTable(data));
    // console.log(time)
    return time;
  }

  const resetMap = () => {
    if(!mapRef.current)return;
    const initializedMap  = new google.maps.Map(mapRef.current, {
      center: { lat: INITIALIZE_LAT, lng: INITIALIZE_LNG },
      zoom: INITIALIZE_ZOOM,
      mapId: "DEMO_MAP_ID"
    });

    // setMap(initializedMap);
    return initializedMap;
  }

  const no_time_url = (stationName: string) => {
    const padding = 10; // パディング
    const fontSize = 14; // フォントサイズ
    const textWidth = stationName.length * fontSize * 1.0; // 文字数に基づく幅計算（簡易的に文字幅を推定）
    const rectWidth = textWidth + padding * 2; // 背景矩形の幅（文字の幅 + パディング）
    const url = "data:image/svg+xml;charset=UTF-8," + 
        "<svg xmlns='http://www.w3.org/2000/svg' width='" + rectWidth + "' height='60'>" + 
          // 吹き出しの四角い部分
          "<rect x='0' y='0' width='" + rectWidth + "' height='40' rx='8' ry='8' fill='Turquoise'/>" + 
          // 吹き出しの尾（三角形）
          "<polygon points='" + (rectWidth / 2 - 10) + ",40 " + (rectWidth / 2 + 10) + ",40 " + (rectWidth / 2) + ",50' fill='Turquoise'/>" +
          // テキスト
          "<text x='" + padding + "' y='25' font-size='" + fontSize + "' fill='black'>" + 
            encodeURIComponent(stationName) + 
          "</text>" + 
        "</svg>";
      return url;
  }

  const time_url = (stationName: string, time: string, stationCode:string) => {
    const padding = 10; // パディング
    const fontSize = 14; // フォントサイズ
    const textWidth = stationName.length * fontSize * 1.0; // 文字数に基づく幅計算（簡易的に文字幅を推定）
    const rectWidth = textWidth + padding * 2; // 背景矩形の幅（文字の幅 + パディング）
    const url = "data:image/svg+xml;charset=UTF-8," + 
        "<svg xmlns='http://www.w3.org/2000/svg' width='" + rectWidth + "' height='80'>" + 
          // 吹き出しの四角い部分
          "<rect x='0' y='0' width='" + rectWidth + "' height='60' rx='8' ry='8' fill='tomato'/>" + 
          // 吹き出しの尾（三角形）
          "<polygon points='" + (rectWidth / 2 - 10) + ",60 " + (rectWidth / 2 + 10) + ",60 " + (rectWidth / 2) + ",70' fill='tomato'/>" +
          // テキスト
          "<text x='" + padding + "' y='25' font-size='" + fontSize + "' fill='black'>" + 
            encodeURIComponent(`${stationName}`) +
          "</text>" + 
          "<text x='" + padding + "' y='50' font-size='" + fontSize + "' fill='black'>" + 
            encodeURIComponent(`${stationCode} ${time}`) +
          "</text>" + 
        "</svg>";
    return url;
  }
  // マーカーを地図に更新する関数

  const updateMarkers = async(stations: google.maps.places.PlaceResult[]) => {
    // 古いマーカーを削除
    console.log(markers);
    markers.forEach(marker => {marker.setMap(null);marker.setOpacity(0)});
    // 重複削除
    stations = getUniqueBus(stations);
    console.log(getStatons(stations));
    const stationInfo = await Promise.all(getStatons(stations).map(station => fetchStation(station || "")));
    const railways = stationInfo.map(s => s.railway);
    const stationCodes = stationInfo.map(s => s.station_code);

    const stationRailwayInfo = new Map<string,string|undefined>();
    getStatons(stations).forEach((station,index) => {
      stationRailwayInfo.set(station,railways[index]);
    });
    const stationTimes = await Promise.all(Array.from(stationRailwayInfo.values()).map(r => r !== undefined ? getStationTime2(r) : undefined));
    const stationTimesInfo = new Map<string,string>();
    const stationCodeInfo = new Map<string,string>();
    Array.from(stationRailwayInfo.keys()).forEach((s,index) => {
      if(stationTimes[index] !== undefined)stationTimesInfo.set(s,stationTimes[index]);
      if(stationCodes[index] !== "")stationCodeInfo.set(s,stationCodes[index]);
    });
    console.log(stationTimesInfo);
    console.log(stationCodeInfo);
    // const stationTimes = await Promise.all(railways.filter(r => r.railway != undefined).map(railway => getStationTime2(railway.railway)));
    // console.log(stationTimes);
    // const railway = await fetchStation(getStatons(stations)[0] as string)
    // console.log(await getStationTime2(railway));
    // const stationTimes = await Promise.all(stations.map(station => getStationTime(station.name || "")));

    // 新しいマーカーを作成
    const newMarkers = stations.map((station) => {
      const stationName = station.name || "不明";
      const padding = 10; // パディング
      const fontSize = 14; // フォントサイズ
      const textWidth = stationName.length * fontSize * 1.0; // 文字数に基づく幅計算（簡易的に文字幅を推定）
      const rectWidth = textWidth + padding * 2; // 背景矩形の幅（文字の幅 + パディング）

      const url = !stationTimesInfo.has(stationName) ? no_time_url(stationName) : time_url(stationName,stationTimesInfo.get(stationName) || "", stationCodeInfo.get(stationName)||"");
      const scaledSize = !stationTimesInfo.has(stationName) ? new google.maps.Size(rectWidth, 60) : new google.maps.Size(rectWidth, 80);
    //   const marker = new google.maps.marker.AdvancedMarkerElement({
    //     map: map,
    //     position: {
    //       lat: station.geometry?.location.lat() || 0,
    //       lng: station.geometry?.location.lng() || 0,
    //     },
    //     title: station.name,
    //     content: img,
    //   });
    //   return marker;
    // });
      const marker = new google.maps.Marker({
        position: {
          lat: station.geometry?.location.lat() || 0,
          lng: station.geometry?.location.lng() || 0,
        },
        map,
        title: station.name,
        icon: {
        url: url,
        scaledSize: scaledSize, // アイコンサイズ
      },
      });

      return marker;
    });

    // 新しいマーカーを状態に保存
    setMarkers(newMarkers);
  };

  // 現在時刻を定期的に更新
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString()); // 現在時刻を更新
    }, 1000); // 1秒ごとに更新

    return () => clearInterval(interval); // コンポーネントがアンマウントされる時にインターバルをクリア
  }, []);

  // useEffectを使ってコンポーネントがマウントされたときに現在地を取得
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude); // 緯度をステートに保存
          setLongitude(longitude); // 経度をステートに保存
        },
        (err) => {
          setError('位置情報の取得に失敗しました。エラーコード: ' + err.code); // エラーハンドリング
        }
      );
    } else {
      setError('このブラウザはGeolocation APIをサポートしていません。');
    }
  }, []); // 空の依存配列で、最初の1回だけ実行
    return (
        <div>
            {/** ヘッダー */}
            
            {/* <div className='header'>
            <p className="clicked_station">station name</p>
            </div> */}

            <div className="time">
            <p>現在時刻: {currentTime}</p>
            </div>
            <p>現在地情報</p>
            {error ? (
              <p style={{ color: 'red' }}>{error}</p> // エラーがあれば表示
            ) : (
              <div>
                <p>緯度: {latitude !== null ? latitude : '取得中...'}</p>
                <p>経度: {longitude !== null ? longitude : '取得中...'}</p>
              </div>
            )}
            <button onClick={currentLocationOnClick} style={{marginBottom:"16px"}}>現在地から取得</button>
      
            {/** 地図表示 */}
            <div ref={mapRef} style={{ width: INITIALIZE_MAP_WIDTH, height: INITIALIZE_MAP_HEIGHT }} />
            
            {/** 緯度経度表示 */}
            {location && (
                <div className="mx-5 my-5">
                <h2 className="underline text-lg mb-3">Location</h2>
                <p>Latitude: {location.lat}</p>
                <p>Longitude: {location.lng}</p>
                </div>
            )}

            {/** 店舗リストの表示(追加) */}
            {station.length > 0 && (
                <div className="mx-5 mb-5">
                    <h2 className="underline text-lg mb-3">Nearby Station</h2>
                    <ul className="list-disc list-inside">
                        {station.map((station, index) => (
                            <li key={index}>{station.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        
    );
};

export default MyGoogleMap;
