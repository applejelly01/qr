let qrScanner = null;
let currentDeviceId = null;

function startQRCodeScanner(deviceId = null) {
    const qrUrlInput = document.getElementById("qr-url");
    const messageBox = document.getElementById("message");
    const videoContainer = document.getElementById("qr-video");

    // 스캔 시작 시 메시지 초기화
    messageBox.innerText = "";

    if (qrScanner) {
        qrScanner.stop().then(() => console.log("QR 스캐너 중지됨"));
    }

    qrScanner = new Html5Qrcode("qr-video");

    const config = {
        fps: 15,
        qrbox: { width: 340, height: 255 }, // 30% 더 크게 (260x195 -> 340x255)
        videoConstraints: deviceId
            ? { deviceId: { exact: deviceId } }
            : { facingMode: { ideal: "environment" }, width: 1920, height: 1080 } // 고해상도
    };

    qrScanner.start(
        deviceId || { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
            console.log(`QR 코드 스캔 성공: ${decodedText}`);
            qrUrlInput.value = decodedText;
            
            // 스캔 성공 시 카메라 중지 및 메시지 지우기
            stopQRCodeScanner();
        },
        (errorMessage) => {
            console.error(`QR 스캔 오류: ${errorMessage}`);
        }
    ).catch(err => {
        console.error(`QR 스캐너 시작 실패: ${err}`);
        alert("카메라 접근 권한을 허용해 주세요.");
    });

    // 카메라가 시작될 때 크기 강제 고정
    setTimeout(() => {
        const videoElement = videoContainer.querySelector("video");
        if (videoElement) {
            videoElement.classList.add("qr-video-canvas");
        }
    }, 1000);
}

function stopQRCodeScanner() {
    if (qrScanner) {
        qrScanner.stop().then(() => {
            console.log("QR 스캐너 중지됨");
            // 스캔 멈출 때 메시지 지우기
            document.getElementById("message").innerText = "";
        });
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
    if (!qrUrl) {
        alert("QR 코드가 인식되지 않았습니다.");
        return;
    }

    const scriptURL = "https://script.google.com/macros/s/AKfycbxZWz6cX4ERTP73On7Bh_qSwNm7t4TjBhDi4N6E_aHGlcSduuNVp6rlgNWXOdA6KMJdNg/exec";
    const formData = new FormData();
    formData.append("qrUrl", qrUrl);

    fetch(scriptURL, { method: "POST", body: formData })
        .then(response => response.json())
        .then(result => {
            const messageBox = document.getElementById("message");
            if (result.status === "success") {
                messageBox.innerText = result.message;
            } else {
                messageBox.innerText = "데이터 전송 실패: " + result.message;
            }

            // 데이터 전송 후 카메라 다시 시작
            restartQRCodeScanner();
        })
        .catch(error => {
            document.getElementById("message").innerText = "데이터 전송 실패. 다시 시도해주세요.";
            console.error("데이터 전송 오류:", error);
            
            // 오류 발생 시 카메라 다시 시작
            restartQRCodeScanner();
        });
}

// 페이지 로드 시 카메라 선택 메뉴 설정
window.onload = setupCameraSelection;
