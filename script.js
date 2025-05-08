function startQRCodeScanner() {
    const qrUrlInput = document.getElementById("qr-url");
    const qrScanner = new Html5Qrcode("qr-video");
    
    // 카메라 초기화
    Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length) {
            const cameraId = devices[0].id;

        const config = {
          fps: 10,
          qrbox: { width: 200, height: 100 } // 안전한 값
        };


            qrScanner.start(cameraId, config, (decodedText, decodedResult) => {
                console.log(`QR 코드 스캔 성공: ${decodedText}`);
                qrUrlInput.value = decodedText;
                qrScanner.stop(); // 스캔 성공 후 멈춤
            }, (errorMessage) => {
                console.error(`QR 스캔 오류: ${errorMessage}`);
            }).catch(err => {
                console.error(`QR 스캐너 시작 실패: ${err}`);
                alert("카메라 접근 권한을 허용해 주세요.");
            });
        } else {
            alert("사용 가능한 카메라가 없습니다.");
        }
    }).catch(err => console.error("카메라 장치 검색 오류:", err));
}

// 페이지 로드 시 QR 코드 스캐너 시작
window.onload = startQRCodeScanner;
