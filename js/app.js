	var heart = document.getElementById('heart');
	var rr = document.getElementById("rr");
	var lastData = new Date();
	var dateNow = new Date();
	var mainDoc = document.getElementById("main");
	var noHeartData = true;
	var rarDataActiv = false;


	var hrmRAWSensor = tizen.sensorservice.getDefaultSensor('HRM_RAW');

	 window.onload = main();

	function main() {
	    buttonEvents();
	    publishToROS();
	    var sensors = tizen.sensorservice.getAvailableSensors();
	    console.log("possible sensores:" + sensors.toString());
	    heart.style.color = "red";
	    tizen.humanactivitymonitor.start('HRM', onChangeHR);


	    hrmRAWSensor.start(onsuccessCB);
	}

	function onGetSuccessCB(sensorData) {
	    console.log("HRMRaw light intensity: " + sensorData.lightIntensity);
	}

	function onerrorCB(error) {
	    console.log("Error occurred");
	}

	function onsuccessCB() {
	    console.log("HRMRaw sensor start");
	    rarDataActiv = true;
	    hrmRAWSensor.getHRMRawSensorData(onGetSuccessCB, onerrorCB);
	}



	function onChangeHR(hrmInfo) {
	    dateNow = new Date();
	    if (hrmInfo.heartRate > 0) {
	        lastData = new Date();
	        heart.innerHTML = "HeartRate:" + hrmInfo.heartRate;
	        rr.innerHTML = "rr:" + hrmInfo.rRInterval;

	        if (noHeartData === true) {
	            mainDoc.style.backgroundColor = "black";
	            noHeartData = false;

	        }
	    } else if ((dateNow - lastData) > 5000) {
	        heart.innerHTML = "No HR Data" + hrmInfo.heartRate;
	        rr.innerHTML = "No RR Data" + hrmInfo.rRInterval;
	        if (!noHeartData) {
	            mainDoc.style.backgroundColor = "red";
	            noHeartData = true;
	        }

	    }

	    if (rarDataActiv){
	        hrmRAWSensor.getHRMRawSensorData(onGetSuccessCB, onerrorCB);
	    }
	}

	
	//ubuntu IP: 192.168.137.205
	// started roslaunch server http://maryam-Precision-5560:35059/
	// ROS_MASTER_URI=http://maryam-Precision-5560:11311/
    // Rosbridge WebSocket server started at ws://0.0.0.0:9090

    function publishToROS(){
    	var ros = new ROSLIB.Ros({ url : 'ws://192.168.137.205:9090'});
    	
    	ros.on('connection', function() { console.log('Connected to websocket server.'); });
        ros.on('error', function(error) { console.log('Error connecting to websocket server: ', error); });
        ros.on('close', function() { console.log('Connection to websocket server closed.');});
        
        // publishing heart rate and rrinterval to /smartWatchData topic which I have created inside a ros package called watch
        var watchTopic = new ROSLIB.Topic({
            ros : ros,
            name : '/smartWatchData',
            messageType : 'watch/heartRaterrInterval'
            
          });
        
        // message to publish
        // in my watch ros package I have a massage called watch/heartRaterrInterval which contains two fields: int32: hr , int32: rr
        var hrRRInterwalMsg = new ROSLIB.Message({
              hr: 10,  // later I will change to hrmInfo.heartRate
              rr: 20   // later I will change to hrmInfo.rRInterval
          });
        
        watchTopic.publish(hrRRInterwalMsg);

    }

    
    
    
    
	function buttonEvents() {
	    console.log("init button events");
	    window.addEventListener("tizenhwkey", function(ev) {
	        var activePopup = null,
	            page = null,
	            pageId = "";

	        if (ev.keyName === "back") {
	            activePopup = document.querySelector(".ui-popup-active");
	            page = document.getElementsByClassName("ui-page-active")[0];
	            pageId = page ? page.id : "";

	            if (pageId === "main" && !activePopup) {
	                try {
	                    tizen.application.getCurrentApplication().exit();
	                } catch (ignore) {}
	            } else {
	                window.history.back();
	            }
	        }
	    });

	}