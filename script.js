function startQRCodeScanner(deviceId = null) {
    const qrUrlInput = document.getElementById("qr-url");
    const qrScanner = new Html5Qrcode("qr-video");
    
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        videoConstraints: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: "environment" } }
    };

    qrScanner.start(
        deviceId || { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
            console.log(`QR 코드 스캔 성공: ${decodedText}`);
            qrUrlInput.value = decodedText;
            qrScanner.stop(); // 스캔 성공 후 멈춤
        },
        (errorMessage) => {
            console.error(`QR 스캔 오류: ${errorMessage}`);
        }
    ).catch(err => {
        console.error(`QR 스캐너 시작 실패: ${err}`);
        alert("카메라 접근 권한을 허용해 주세요.");
    });
}

function setupCameraSelection() {
    Html5Qrcode.getCameras().then(devices => {
        const select = document.getElementById("camera-select");
        devices.forEach(device => {
            const option = document.createElement("option");
            option.value = device.id;
            option.text = device.label || `Camera ${device.id}`;
            select.appendChild(option);
        });

        // 기본 후면 카메라 선택
        if (devices.length > 0) {
            startQRCodeScanner(devices[0].id);
        }
    }).catch(err => console.error("카메라 장치 검색 오류:", err));
}

// 페이지 로드 시 카메라 선택 메뉴 설정
window.onload = setupCameraSelection;
