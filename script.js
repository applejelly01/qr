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

        // 기본 후면 카메라 선택 (첫 번째 카메라)
        if (devices.length > 0) {
            startQRCodeScanner(devices[0].id);
            select.value = devices[0].id;
        }
    }).catch(err => console.error("카메라 장치 검색 오류:", err));
}

function submitToGoogleSheet() {
    const qrUrl = document.getElementById("qr-url").value.trim();
    if (!qrUrl) {
        alert("QR 코드가 인식되지 않았습니다.");
        return;
    }

    const scriptURL = "https://script.google.com/a/macros/taean-hs.es.kr/s/AKfycbygTSVCDIPbodcuAReR8_tz6bSR1fdD9PHvTDNlHtTJ-DuhE01pZRX9n--qCR0dnAi_/exec";
    const formData = new FormData();
    formData.append("qrUrl", qrUrl);

    fetch(scriptURL, { method: "POST", body: formData })
        .then(response => response.text())
        .then(result => {
            document.getElementById("message").innerText = "데이터가 성공적으로 전송되었습니다!";
            console.log("데이터 전송 성공:", result);
        })
        .catch(error => {
            document.getElementById("message").innerText = "데이터 전송 실패. 다시 시도해주세요.";
            console.error("데이터 전송 오류:", error);
        });
}

// 페이지 로드 시 카메라 선택 메뉴 설정
window.onload = setupCameraSelection;
