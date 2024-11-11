`cd hackU`
コンテナ立ち上げ
`docker compose up -d`
アクセス
`http://localhost:3000/`

コンテナに入る
docker exec -it hackU_react bash
コンテナの中で
bun install