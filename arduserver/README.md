# ArduGate
Server to work with Arduino GSM gate
настройка Pm2 https://websofter.ru/zapusk-priloghenija-node-js-v-fonovom-reghime/
часы https://linux16.ru/articles/kak-uznat-v-linux-vremya-na-servere.html
сервер https://ruvds.com/ru-rub/my/servers

зайти на серввер putty
перейти в cd /home
остановить pm2 stop 0 
забрать с git версию git fetch, git pull, git checkout ...
включить сервер pm2 start ardugate/server.js
исключить базу из git : git rm --cached snsrdt.sdllite

pm2 list
