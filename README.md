#How to run execute the following command

`startx &`

`sudo mount /home/pi/usbdrv`

`cd /home/camera`

`node monitor.js`

#Variables

```javascript

var NORMAL_IMAGE_SOURCE = '/dev/video0'; //video source for normal image
var BLUE_IMAGE_SOURCE = '/dev/video1'; //video source for blue image
var OUT_DIR = '/home/pi/usbdrv/images'; //out dir for the files to be stored

```
