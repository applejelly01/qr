let qrScanner = null;
let currentDeviceId = null;

function startQRCodeScanner(deviceId = null) {
    const qrUrlInput = document.getElementById("qr-url");
    const messageBox = document.getElementById("message");

    if (qrScanner) {
        qrScanner.stop().then(() => console.log("QR 스캐너 중지됨"));
    }

    qrScanner = new Html5Qrcode("qr-video");

    const config = {
        fps: 10,
        qrbox: { width: 200, height: 200 },
        videoConstraints: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: "environment" } }
    };

    qrScanner.start(
        deviceId || { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
            console.log(`QR 코드 스캔 성공: ${decodedText}`);
            qrUrlInput.value = decodedText;
            
            // 스캔 성공 시 카메라 중지
            stopQRCodeScanner();
        },
        (errorMessage) => {
            console.error(`QR 스캔 오류: ${errorMessage}`);
        }
    ).catch(err => {
        console.error(`QR 스캐너 시작 실패: ${err}`);
        alert("카메라 접근 권한을 허용해 주세요.");
    });
}

function stopQRCodeScanner() {
    if (qrScanner) {
        qrScanner.stop().then(() => console.log("QR 스캐너 중지됨"));
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

    const scriptURL = "https://script.google.com/macros/s/AKfycbyKLOCLcmmq9FzCUmk0-un4ABBq3u_RgyLcpnBfoaPHsuo0F1YXeDl_2JVE8A3sNNjv0Q/exec";
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
