function startQRCodeScanner() {
    const qrUrlInput = document.getElementById("qr-url");
    const qrScanner = new Html5Qrcode("qr-video");

    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        videoConstraints: {
            facingMode: { ideal: "environment" }  // 후면 카메라 우선 사용
        }
    };

    qrScanner.start(
        { facingMode: "environment" },
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

// 페이지 로드 시 QR 코드 스캐너 시작
window.onload = startQRCodeScanner;
