function startQRCodeScanner() {
    const video = document.getElementById("qr-video");
    const qrUrlInput = document.getElementById("qr-url");

    // QR 코드 스캔 설정
    const qrScanner = new Html5Qrcode("qr-video");
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

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
    ).catch(err => console.error(`QR 스캐너 시작 실패: ${err}`));
}

function extractAndSubmit() {
    const url = document.getElementById("qr-url").value.trim();
    const regex = /\/([^\/?]+)\?A=([0-9a-zA-Z]+)/;
    const match = url.match(regex);

    if (match && match[1] && match[2]) {
        const code1 = match[1];
        const code2 = match[2];
        
        // 구글 시트에 데이터 전송 (Google Apps Script 사용)
        const scriptURL = "https://script.google.com/macros/s/your-google-script-id/exec";
        const formData = new FormData();
        formData.append("code1", code1);
        formData.append("code2", code2);

        fetch(scriptURL, { method: "POST", body: formData })
            .then(response => response.text())
            .then(result => {
                document.getElementById("message").innerText = "데이터가 성공적으로 전송되었습니다!";
            })
            .catch(error => {
                document.getElementById("message").innerText = "전송에 실패했습니다. 다시 시도해주세요.";
                console.error("Error:", error);
            });
    } else {
        alert("올바른 URL 형식이 아닙니다. 예시: http://example.org/GD?A=0034");
    }
}

// 페이지 로드 시 QR 코드 스캐너 시작
window.onload = startQRCodeScanner;
