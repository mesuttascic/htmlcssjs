
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
createOptions("ayni-gun-giris-saati", 12, 24, "", "");
createOptions("varis-gun-saati", 14, 23, "", ":00");
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
function getCheckinDateTime() {
    const dateString = document.getElementById("checkin-date").value;
    const timeString = document.getElementById("checkin-time").value;
    
    const dateTimeString = `${dateString}T${timeString}`;
    const combinedDateTime = new Date(dateTimeString);

    return combinedDateTime;
}


function setCurrentDateTimeInput(id, date, onlyDate = false) {
    const currentDateTimeInput = document.getElementById(id);
    
    // Tarihi ve saati biçimlendir
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ay sıfır ile başlamalı
    const day = String(date.getDate()).padStart(2, '0'); // Gün sıfır ile başlamalı

    if (onlyDate) {
        currentDateTimeInput.value = `${year}-${month}-${day}`;
        return;
    }
    const hours = String(date.getHours()).padStart(2, '0'); // Saat sıfır ile başlamalı
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Dakika sıfır ile başlamalı
    
    // Biçimlendirilmiş tarih ve saat değerini input alanına ata
    currentDateTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
}

document.addEventListener("DOMContentLoaded", function() {
    var currentDate = new Date();
    setCurrentDateTimeInput("current-date-time", currentDate);
    var checkinDate = new Date();
    checkinDate.setDate(currentDate.getDate());
    setCurrentDateTimeInput("checkin-date", checkinDate, true);
});

function addPoint(id, date, message, bgColor) {
    const point = document.createElement("div");
    point.classList.add("point");
    point.id = id;
    point.dataset.date = date.toISOString();

    // Tarihi ve saat biçimlendir
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ay sıfır ile başlamalı
    const day = String(date.getDate()).padStart(2, '0'); // Gün sıfır ile başlamalı
    const hours = String(date.getHours()).padStart(2, '0'); // Saat sıfır ile başlamalı
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Dakika sıfır ile başlamalı

    // YYYY-MM-DDTHH:MM formatında tarih ve saat
    point.textContent = `${year}-${month}-${day}T${hours}:${minutes}`;

    const tooltip = document.createElement("span");
    tooltip.classList.add("tooltip");
    tooltip.textContent = message;

    point.appendChild(tooltip); 
    point.style.backgroundColor = bgColor;

    timeline.appendChild(point);
}


function updateTimeline() {
    const currentDate = new Date(document.getElementById("current-date-time").value);
    const checkinDate = new Date(document.getElementById("checkin-date").value);
    const checkinDateTime = getCheckinDateTime();
    
    var freeCancelToDate = document.getElementById("varis-gun-input").value;

    const timeline = document.getElementById("timeline");
    timeline.innerHTML = "";

    // A current-date-time
    addPoint("A", currentDate, "Rezervasyon Saati");

    // B current-date-time + anlik-iptal-saati
    const pointBDate = new Date(currentDate);
    pointBDate.setHours(currentDate.getHours() + parseInt(document.getElementById("anlik-iptal-saati").value));
            //addPoint("B", pointBDate, "Anlık Ücretsiz İptal Saati");

    // C eğer current-date-time == checkin-date-time ise current-date-time.date + ayni-gun-giris-saati - 1dakika
    const pointCDate = new Date(checkinDate);
    pointCDate.setHours(checkinDate.getUTCHours() + parseInt(document.getElementById("ayni-gun-giris-saati").value));
        // pointCDate.setMinutes(checkinDate.getMinutes() - 1); // 1 dakika çıkar
            //addPoint("C", pointCDate, "Aynı Gün Giriş Ücretsiz İptal Saati");

    // E checkin-date-time.date - varis-gun-input gün + 14 saat
    const pointEDate = new Date(checkinDate);
    pointEDate.setDate(checkinDate.getDate() - parseInt(freeCancelToDate));
    pointEDate.setHours(pointEDate.getUTCHours() + parseInt(document.getElementById("varis-gun-saati").value));

            // addPoint(">", checkinDateTime, "Check-in Saati");
    if (currentDate.toDateString() === checkinDate.toDateString()) {
        const points = [
            { id: "B", date: pointBDate, label: "Anlık Ücretsiz İptal Saati", bgColor: "green"},
            { id: "C", date: pointCDate, label: "Aynı Gün Giriş Ücretsiz İptal Saati", bgColor: "green"},
            { id: "E", date: pointEDate, label: "Varış Günü Ücretsiz İptal Saati", bgColor: "green"},
        ];
        const maxDate = Math.max(...points.map(point => point.date.getTime()));
        const maxPoint = points.find(point => point.date.getTime() === maxDate);

        if (maxPoint.date > currentDate && maxPoint.date < checkinDateTime){
            addPoint(maxPoint.id, maxPoint.date, maxPoint.label, maxPoint.bgColor);
        }
        if(checkinDateTime > currentDate){
            if(maxPoint.date >= checkinDateTime) {
                addPoint(maxPoint.id, checkinDateTime, maxPoint.label + " >= Check-in Saati", maxPoint.bgColor);
            }
            else{
                addPoint("Z", checkinDateTime, "Check-in Saati", "orange");
            }
        }
    }
    else {
        addPoint("B", pointBDate, "Anlık Ücretsiz İptal Saati");
        addPoint("E", pointEDate);
    
        // D checkin-date-time + varis-gun-saati
        const pointDDate = new Date(checkinDate);
        pointDDate.setHours(checkinDate.getUTCHours() + parseInt(document.getElementById("varis-gun-saati").value));
        addPoint("D", pointDDate, "Varış Günü Saati (Sonrası NoShow)");
        addPoint("Z", checkinDateTime, "Check-in Saati", "orange");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    updateTimeline();
    const inputFields = document.querySelectorAll('.input-block input, .input-block select');
    inputFields.forEach(input => {
        input.addEventListener('change', updateTimeline);
    });
});