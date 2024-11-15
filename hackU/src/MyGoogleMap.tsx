// src/components/GoogleMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import { mapPrefectures } from '@/datas/mapPrefectures'; //都道府県データ

// 初期化用の定数
const INITIALIZE_LAT  = 35.67981;  // 緯度
const INITIALIZE_LNG  = 139.73695; // 経度
const INITIALIZE_ZOOM = 16;        // ズームレベル

const INITIALIZE_MAP_WIDTH  = '100%';  // 地図の幅
const INITIALIZE_MAP_HEIGHT = '800px'; // 地図の高さ

let myLocation;

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


    //初期レンダー後に適用されるエフェクト
    useEffect(() => {
        if (!mapRef.current) return;

        const initializedMap  = new google.maps.Map(mapRef.current, {
            center: { lat: INITIALIZE_LAT, lng: INITIALIZE_LNG },
            zoom: INITIALIZE_ZOOM,
        });

        setMap(initializedMap);
    }, []);

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

  // マーカーを地図に更新する関数
  const updateMarkers = (stations: google.maps.places.PlaceResult[]) => {
    // 古いマーカーを削除
    markers.forEach(marker => marker.setMap(null));

    // 新しいマーカーを作成
    const newMarkers = stations.map(station => {
      const stationName = station.name || "不明";
      const padding = 10; // パディング
      const fontSize = 14; // フォントサイズ
      const textWidth = stationName.length * fontSize * 1.0; // 文字数に基づく幅計算（簡易的に文字幅を推定）
      const rectWidth = textWidth + padding * 2; // 背景矩形の幅（文字の幅 + パディング）

      const marker = new google.maps.Marker({
        position: {
          lat: station.geometry?.location.lat() || 0,
          lng: station.geometry?.location.lng() || 0,
        },
        map,
        title: station.name,
        icon: {
        url: "data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' width='" + rectWidth + "' height='50'>" + "<rect x='0' y='0' width='" + rectWidth + "' height='40' fill='white'/>" + "<text x='" + (padding) + "' y='20' font-size='" + fontSize + "' fill='black'>"+ encodeURIComponent(stationName) + "</text></svg>",
        scaledSize: new google.maps.Size(rectWidth, 50), // アイコンサイズ
      },
      });

      return marker;
    });

    // 新しいマーカーを状態に保存
    setMarkers(newMarkers);
  };


    return (
        <div>
            
            {/** ヘッダー */}
            <div className='header'>
            <p className="clicked_station">station name</p>
            </div>
      
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
