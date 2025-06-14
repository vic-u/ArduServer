# ArduGate
Server to work with Arduino GSM gate
настройка Pm2 https://websofter.ru/zapusk-priloghenija-node-js-v-fonovom-reghime/
часы https://linux16.ru/articles/kak-uznat-v-linux-vremya-na-servere.html
сервер https://ruvds.com/ru-rub/my/servers

зайти на сервер putty
перейти в cd /home
остановить pm2 stop 0 
забрать с git версию git fetch, git pull, git checkout ...
включить сервер pm2 start arduserver/server.js
исключить базу из git : git rm --cached snsrdt.sdllite

pm2 list

stop firewalld
systemctl stop firewalld

Другой вариант с включением firewall

systemctl start firewalld
firewall-cmd --permanent --add-port=3000/tcp
https://www.dmosk.ru/miniinstruktions.php?mini=firewalld-centos

pm2 delete 0

sudo yum install epel-release
curl --silent --location http://rpm.nodesource.com/setup_12.x|sudo bash -
sudo yum install nodejs
sudo yum install gcc-c++ make
node -v
npm -v
npm express
npm install express --save
npm install net --save
npm install path --save
npm install debug --save
npm install express-session --save
npm install cookie-parser --save
npm install body-parser --save
npm install bcryptjs@2.4.3 --save

npm install bootstrap --save
npm install jquery --save
npm install popper --save

npm install popper@1.14.7 --save
npm install sqlite3 --save
npm install popper@1.16.1 --save

