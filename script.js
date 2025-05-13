let qrScanner = null;
let currentDeviceId = null;
let currentStream = null;

function startQRCodeScanner(deviceId = null) {
    const qrUrlInput = document.getElementById("qr-url");
    const messageBox = document.getElementById("message");
    const videoContainer = document.getElementById("qr-video");

    // 스캔 시작 시 메시지 초기화
    messageBox.innerText = "";

    // 기존 스트림 중지
    stopQRCodeScanner();

    qrScanner = new Html5Qrcode("qr-video");

    const config = {
        fps: 30,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0,
        experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
        },
        videoConstraints: deviceId
            ? { deviceId: { exact: deviceId } }
            : { facingMode: { ideal: "environment" }, width: 1920, height: 1080 }
    };

    qrScanner.start(
        deviceId || { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
            console.log(`QR 코드 스캔 성공: ${decodedText}`);
            
            // "schoolreg.org"가 포함된 경우만 입력
            if (decodedText.includes("schoolreg.org")) {
                qrUrlInput.value = decodedText;
                showMessage("QR 코드가 성공적으로 인식되었습니다.", "green");
                
                // 카메라 즉시 중지
                stopQRCodeScanner();
            } else {
                showMessage("유효하지 않은 QR 코드입니다.", "red");
            }
        },
        (errorMessage) => {
            console.error(`QR 스캔 오류: ${errorMessage}`);
        }
    ).then(() => {
        // 현재 비디오 스트림 저장
        const videoElement = document.querySelector("#qr-video video");
        if (videoElement && videoElement.srcObject) {
            currentStream = videoElement.srcObject;
        }
    }).catch(err => {
        console.error(`QR 스캐너 시작 실패: ${err}`);
        alert("카메라 접근 권한을 허용해 주세요.");
    });

    // 카메라가 시작될 때 크기 강제 고정
    setTimeout(() => {
        const videoElement = videoContainer.querySelector("video");
        if (videoElement) {
            videoElement.classList.add("qr-video-canvas");
        }
    }, 500);
}

function stopQRCodeScanner() {
    if (qrScanner) {
        qrScanner.stop().then(() => {
            console.log("QR 스캐너 중지됨");
        }).catch(err => console.error("QR 스캐너 중지 오류:", err));
    }

    // 미디어 스트림 해제
    if (currentStream) {
        let tracks = currentStream.getTracks();
        tracks.forEach(track => {
            track.stop();
            console.log("스트림 트랙 중지됨:", track);
        });
        currentStream = null;
    }

    // 비디오 요소 제거
    const videoElement = document.querySelector("#qr-video video");
    if (videoElement) {
        videoElement.srcObject = null;
        videoElement.remove();
        console.log("비디오 요소 제거됨");
    }
}

function showMessage(message, color) {
    const messageBox = document.getElementById("message");
    messageBox.innerText = message;
    messageBox.style.color = color;

    // 메시지를 1초 후에 자동으로 지우기
    setTimeout(() => {
        messageBox.innerText = "";
    }, 1000);
}

function setupCameraSelection() {
    Html5Qrcode.getCameras().then(devices => {
        const select = document.getElementById("camera-select");

        // 카메라 목록을 선택 상자에 추가
        devices.forEach(device => {
            const option = document.createElement("option");
            option.value = device.id;
            option.text = device.label || `Camera ${device.id}`;
            select.appendChild(option);
        });

        // 기본적으로 맨 마지막 카메라 선택
        if (devices.length > 0) {
            const lastDevice = devices[devices.length - 1];
            currentDeviceId = lastDevice.id;
            select.value = currentDeviceId;
            startQRCodeScanner(currentDeviceId); // 기본 카메라 시작
        }
    }).catch(err => console.error("카메라 장치 검색 오류:", err));
}

function restartQRCodeScanner() {
    const qrUrlInput = document.getElementById("qr-url");
    qrUrlInput.value = ""; // 입력 필드 초기화
    startQRCodeScanner(currentDeviceId);
}

function submitToGoogleSheet() {
    const qrUrl = document.getElementById("qr-url").value.trim();
    if (!qrUrl) {
        alert("QR 코드가 인식되지 않았습니다.");
        return;
    }

    const scriptURL = "https://script.google.com/macros/s/AKfycbwEmCRMyTfv3htclwI-fRtw8AQTWktAjIJzAXe8oUPuqK_rbnqtYDoI3ihUsXABdD6u/exec";
    const formData = new FormData();
    formData.append("qrUrl", qrUrl);

    fetch(scriptURL, { method: "POST", body: formData })
        .then(response => response.json())
        .then(result => {
            if (result.status === "success") {
                showMessage("데이터가 성공적으로 전송되었습니다.", "green");
            } else {
                showMessage("데이터 전송 실패: " + result.message, "red");
            }

            // 데이터 전송 후 카메라 다시 시작
            setTimeout(() => {
                restartQRCodeScanner();
            }, 1000);
        })
        .catch(error => {
            showMessage("데이터 전송 실패. 다시 시도해주세요.", "red");
            console.error("데이터 전송 오류:", error);
            
            // 오류 발생 시 카메라 다시 시작
            setTimeout(() => {
                restartQRCodeScanner();
            }, 1000);
        });
}

// 페이지를 닫을 때 카메라 스트림 완전히 중지
window.onbeforeunload = () => {
    stopQRCodeScanner();
};

// 페이지 로드 시 카메라 선택 메뉴 설정
window.onload = setupCameraSelection;





/*
let qrScanner = null;
let currentDeviceId = null;
let currentStream = null;

function startQRCodeScanner(deviceId = null) {
    const qrUrlInput = document.getElementById("qr-url");
    const messageBox = document.getElementById("message");
    const videoContainer = document.getElementById("qr-video");

    // 스캔 시작 시 메시지 초기화
    messageBox.innerText = "";

    // 기존 스트림 중지
    stopQRCodeScanner();

    qrScanner = new Html5Qrcode("qr-video");

    const config = {
        fps: 30,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0,
        experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
        },
        videoConstraints: deviceId
            ? { deviceId: { exact: deviceId } }
            : { facingMode: { ideal: "environment" }, width: 1920, height: 1080 }
    };

    qrScanner.start(
        deviceId || { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
            console.log(`QR 코드 스캔 성공: ${decodedText}`);
            qrUrlInput.value = decodedText;
            stopQRCodeScanner();
        },
        (errorMessage) => {
            console.error(`QR 스캔 오류: ${errorMessage}`);
        }
    ).then(stream => {
        currentStream = stream; // 현재 스트림 저장
    }).catch(err => {
        console.error(`QR 스캐너 시작 실패: ${err}`);
        alert("카메라 접근 권한을 허용해 주세요.");
    });

    // 카메라가 시작될 때 크기 강제 고정
    setTimeout(() => {
        const videoElement = videoContainer.querySelector("video");
        if (videoElement) {
            videoElement.classList.add("qr-video-canvas");
        }
    }, 500);
}

function stopQRCodeScanner() {
    if (qrScanner) {
        qrScanner.stop().then(() => {
            console.log("QR 스캐너 중지됨");
        }).catch(err => console.error("QR 스캐너 중지 오류:", err));
    }

    // 미디어 스트림 해제
    if (currentStream) {
        let tracks = currentStream.getTracks();
        tracks.forEach(track => track.stop());
        currentStream = null;
    }
}

function setupCameraSelection() {
    Html5Qrcode.getCameras().then(devices => {
        const select = document.getElementById("camera-select");

        // 카메라 목록을 선택 상자에 추가
        devices.forEach(device => {
            const option = document.createElement("option");
            option.value = device.id;
            option.text = device.label || `Camera ${device.id}`;
            select.appendChild(option);
        });

        // 기본적으로 맨 마지막 카메라 선택
        if (devices.length > 0) {
            const lastDevice = devices[devices.length - 1];
            currentDeviceId = lastDevice.id;
            select.value = currentDeviceId;
            startQRCodeScanner(currentDeviceId); // 기본 카메라 시작
        }
    }).catch(err => console.error("카메라 장치 검색 오류:", err));
}

function restartQRCodeScanner() {
    const qrUrlInput = document.getElementById("qr-url");
    qrUrlInput.value = ""; // 입력 필드 초기화
    startQRCodeScanner(currentDeviceId);
}

function submitToGoogleSheet() {
    const qrUrl = document.getElementById("qr-url").value.trim();
    const messageBox = document.getElementById("message");

    if (!qrUrl) {
        alert("QR 코드가 인식되지 않았습니다.");
        return;
    }

    const scriptURL = "https://script.google.com/macros/s/AKfycbwulI1eSQ3w6KFWsFrORATRMDR3RmfnV9cwiq3NJ1A2gqSsS0xDp-U1j0AkYv91Ww-Vyg/exec";
    const formData = new FormData();
    formData.append("qrUrl", qrUrl);

    fetch(scriptURL, { method: "POST", body: formData })
        .then(response => response.json())
        .then(result => {
            if (result.status === "success") {
                messageBox.innerText = "데이터가 성공적으로 전송되었습니다.";
                messageBox.style.color = "green";
            } else {
                messageBox.innerText = "데이터 전송 실패: " + result.message;
                messageBox.style.color = "red";
            }

            // 데이터 전송 후 카메라 다시 시작
            setTimeout(() => {
                restartQRCodeScanner();
                messageBox.innerText = ""; // 메시지 초기화
            }, 1000);
        })
        .catch(error => {
            messageBox.innerText = "데이터 전송 실패. 다시 시도해주세요.";
            messageBox.style.color = "red";
            console.error("데이터 전송 오류:", error);
            
            // 오류 발생 시 카메라 다시 시작
            setTimeout(() => {
                restartQRCodeScanner();
                messageBox.innerText = ""; // 메시지 초기화
            }, 1000);
        });
}

// 페이지를 닫을 때 카메라 스트림 완전히 중지
window.onbeforeunload = () => {
    stopQRCodeScanner();
};

// 페이지 로드 시 카메라 선택 메뉴 설정
window.onload = setupCameraSelection;
*/
