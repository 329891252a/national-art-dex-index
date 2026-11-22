# National Art Dex 公開索引備援

將本目錄內容放在專用公開備援儲存庫的預設分支根目錄。sync.mjs 只讀取正式站的兩個公開 JSON，無需網站金鑰或訪客收藏。請保留 .github/workflows/sync.yml 的路徑；啟用 GitHub Actions，並允許工作流程以內建憑證寫入本儲存庫。可用 Run workflow 先執行一次。每日排定台北 01:35；以實際成功時間為準。

排程先讀同一備援位置的 mirror-status.json，再讀同目錄下的 cards-index-summary.json 及 cards-index.json。摘要中的 indexUrl 指向正式站；當正式站無法存取時應留在備援位置。用 lastSuccessfulCheckUtc 判斷同步是否過期，而不是用 upstreamUpdatedAt 判斷；後者是正式站的建置時間，圖鑑可以連續多日沒有變更。沒有最近一次成功紀錄、無法讀取、筆數或指紋不符，都不可宣稱已完成比對。站內資料不變時仍須執行原本的外部新卡查核。
