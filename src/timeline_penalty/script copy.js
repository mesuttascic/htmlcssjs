
function createOptions(id, start, end, prefix, suffix) {
    var selectBox = document.getElementById(id);

    for (var i = start; i <= end; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = prefix + i + suffix;
        selectBox.appendChild(option);
    }
}

createOptions("anlik-iptal-saati", 0, 23, "", "");
createOptions("varis-gun-saati", 14, 23, "", ":00");
createOptions("ayni-gun-giris-saati", 12, 24, "", "");
createOptions("varis-gun-input", 1, 60, "", " gün");
createOptions("penalty-rate", 10, 70, "% ", "");

document.addEventListener("DOMContentLoaded", function() {
    const penaltyType = document.getElementById("penalty-type");
    const rateSelect = document.getElementById("penalty-rate");
    const dateInput = document.getElementById("penalty-day");
    const amountInput = document.getElementById("penalty-amount");

    function updateDisplay() {
        rateSelect.style.display = penaltyType.value === "1" ? "block" : "none";
        dateInput.style.display = penaltyType.value === "2" ? "block" : "none";
        amountInput.style.display = penaltyType.value === "3" ? "block" : "none";
    }
    penaltyType.addEventListener("change", updateDisplay);

    penaltyType.value = "0"; updateDisplay();
});


function setCurrentDateTimeInput(id, date) {
    const currentDateTimeInput = document.getElementById(id);
    
    // Tarihi ve saati biçimlendir
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ay sıfır ile başlamalı
    const day = String(date.getDate()).padStart(2, '0'); // Gün sıfır ile başlamalı
    const hours = String(date.getHours()).padStart(2, '0'); // Saat sıfır ile başlamalı
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Dakika sıfır ile başlamalı
    
    // Biçimlendirilmiş tarih ve saat değerini input alanına ata
    currentDateTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
}

document.addEventListener("DOMContentLoaded", function() {
    const currentDate = new Date();
    setCurrentDateTimeInput("current-date-time", currentDate);
    const checkinDate = new Date();
    checkinDate.setDate(currentDate.getDate() + 90);
    setCurrentDateTimeInput("checkin-date-time", checkinDate);
});

function updateTimeline() {
    const currentDate = new Date(document.getElementById("current-date-time").value);
    const checkinDate = new Date(document.getElementById("checkin-date-time").value);

    const timeline = document.getElementById("timeline");
    timeline.innerHTML = "";

    const timelineLength = (checkinDate - currentDate) / (1000 * 60 * 60 * 24); // Gün cinsinden fark

    var freeCancelToDate = document.getElementById("varis-gun-input").value;

    for (let i = 0; i < timelineLength; i++) {
        const point = document.createElement("div");
        point.classList.add("point");

        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + i);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        point.id = `${day}/${month}/${year}`;
        point.textContent = `.`;        

        const tooltip = document.createElement("span");
        tooltip.classList.add("tooltip");
        tooltip.textContent = `${day}/${month}/${year}`;

        point.appendChild(tooltip); // Tooltip'i noktaya ekleyelim

        timeline.appendChild(point);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    updateTimeline();
    const inputFields = document.querySelectorAll('.input-block input, .input-block select');
    inputFields.forEach(input => {
        input.addEventListener('change', updateTimeline);
    });
});
    

const points = [
    { id: "B", date: pointBDate, label: "Anlık Ücretsiz İptal Saati" },
    { id: "C", date: pointCDate, label: "Aynı Gün Giriş Ücretsiz İptal Saati" },
    { id: "Z", date: checkinDateTime, label: "Check-in Saati" },
];
const maxDate = Math.max(...points.map(point => point.date.getTime()));
const maxPoint = points.find(point => point.date.getTime() === maxDate);
addPoint(maxPoint.id, maxPoint.date, maxPoint.label);