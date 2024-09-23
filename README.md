https://github.com/sombriks/node-libgpiod?tab=readme-ov-file


https://www.youngwonks.com/blog/Raspberry-Pi-3-Pinout


First 8 pins pull up by default. The rest pull down.


Tested on a pi 3b

https://www.raspberrypi.com/documentation/computers/os.html

sudo apt update
sudo apt full-upgrade


https://github.com/nodesource/distributions#debinstall

curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - &&\
sudo apt-get install -y nodejs

sudo apt install gpiod libgpiod2 libgpiod-dev libnode-dev git

git clone https://github.com/dawsontoth/hollyland-atem-bridge.git

which node
# /usr/bin/node
sudo crontab -e
@reboot (cd /home/trinity/hollyland-atem-bridge/ && /usr/bin/node index.js) &


