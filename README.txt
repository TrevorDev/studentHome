README
------
To run our software we require nodejs server being installed below are the instructions on how to install nodejs

How to install node.js
----------------------
curl https://raw.githubusercontent.com/creationix/nvm/v0.11.1/install.sh | bash
source ~/.profile
nvm install 0.11.13
npm install
npm install forever -g

How to run our server
---------------------
forever start -c "node --harmony" app.js

Where our website is
--------------------
Our website (once the server is running) is loaclhost:3000
