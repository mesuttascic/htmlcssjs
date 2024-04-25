
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
createOptions("iadesiz-varis-gun-input", 1, 29, "", " güne kadar ücretsiz");
createOptions("iadesiz-varis-hafta-input", 4, 12, "", " hafta kalana kadar ücretsiz");
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
    checkinDate.setDate(currentDate.getDate()+10);
    setCurrentDateTimeInput("checkin-date", checkinDate, true);
});

function addPoint(timeline, id, date, message, bgColor) {
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
    const freeCancelCheckbox = document.getElementById('free-cancel');
    const cancelPolicy = document.getElementById('cancel-policy');

    if (freeCancelCheckbox.checked) {
        cancelPolicy.style.display = 'none';
    } else {
        cancelPolicy.style.display = 'block';
    }


    const currentDate = new Date(document.getElementById("current-date-time").value);
    const checkinDate = new Date(document.getElementById("checkin-date").value);
    const checkinDateTime = getCheckinDateTime();
    
    var freeCancelToDate = document.getElementById("varis-gun-input").value;

    const timeline = document.getElementById("timeline");
    timeline.innerHTML = "";
    const timelines = document.getElementById("timelines");
    timelines.innerHTML = "";

    // A current-date-time
    addPoint(timeline, "A", currentDate, "Rezervasyon Saati");

    // B current-date-time + anlik-iptal-saati
    const pointInstantCancel = new Date(currentDate);
    pointInstantCancel.setHours(currentDate.getHours() + parseInt(document.getElementById("anlik-iptal-saati").value));

    // C eğer current-date-time == checkin-date-time ise current-date-time.date + ayni-gun-giris-saati - 1dakika
    const pointSameDay = new Date(currentDate);
    pointSameDay.setHours(0, 0, 0, 0);
    if (currentDate.toDateString() === checkinDate.toDateString()) {
        pointSameDay.setHours(checkinDate.getUTCHours() + parseInt(document.getElementById("ayni-gun-giris-saati").value));
        // pointCDate.setMinutes(checkinDate.getMinutes() - 1); // 1 dakika çıkar
    }

    // E checkin-date-time.date - varis-gun-input gün + 14 saat
    var pointArrivalDate = new Date(checkinDate);
    pointArrivalDate.setDate(pointArrivalDate.getDate() - parseInt(freeCancelToDate));
    pointArrivalDate.setHours(pointArrivalDate.getUTCHours() + parseInt(document.getElementById("varis-gun-saati").value));
   
    if (freeCancelCheckbox.checked) { pointArrivalDate = checkinDateTime; }

    const points = [
        { id: "B", date: pointInstantCancel, label: "Anlık Ücretsiz İptal Saati", bgColor: "green"},
        { id: "C", date: pointSameDay, label: "Aynı Gün Giriş Ücretsiz İptal Saati", bgColor: "green"},
        { id: "D", date: pointArrivalDate, label: "Varış Günü Ücretsiz İptal Saati", bgColor: "green"},
    ];

    const maxDate = Math.max(...points.map(point => point.date.getTime()));
    const maxPoint = points.find(point => point.date.getTime() === maxDate);

    if (maxPoint.date > currentDate && maxPoint.date < checkinDateTime){
        addPoint(timeline, maxPoint.id, maxPoint.date, maxPoint.label, maxPoint.bgColor);
    }
    if(checkinDateTime > currentDate){
        if(maxPoint.date >= checkinDateTime) {
            addPoint(timeline, maxPoint.id, checkinDateTime, maxPoint.label + " >= Check-in Saati", maxPoint.bgColor);
        }
        else{
            addPoint(timeline, "Z", checkinDateTime, "Check-in Saati", "orange");
        }
    }
    
    addPoint(timelines, "A", currentDate, "Rezervasyon Saati");
    points.forEach(point => addPoint(timelines, point.id, point.date, point.label, point.bgColor));
    addPoint(timelines, "Z", checkinDateTime, "Check-in Saati", "orange");
}

document.addEventListener("DOMContentLoaded", function() {
    updateTimeline();
    const inputFields = document.querySelectorAll('.input-block input, .input-block select');
    inputFields.forEach(input => {
        input.addEventListener('change', updateTimeline);
    });
    
    const freeCancelCheckbox = document.getElementById('free-cancel');
    freeCancelCheckbox.addEventListener('change',  updateTimeline);
});


var a = {
    "FacilityId": "6361",
    "CancellationOption": 1,
    "InstantCancellationOption": 3,
    "SameDayCancellationHour": 19,
    "SameDayMinRoom": 5,
    "PeriodValue": 5,
    "LastDayCancellationHour": 16,

    "NonRefCancelConfig": 0,
    "NonRefFreeCancelWeek": 0,

    "PenaltyType": 5,
    "Penalty": 200,
    
    "CollectingOption": 0,
    "TargetTypeConfig": 10,

    "PeriodCase": 1,
    "AdminCancellationOption": 0,
    "ActionValue": 2,
    
    "UpdatedBy": 1006041,
    "SecurityId": 1006041,
    "IPAddress": "217.131.80.85",
    "UpdatedOn": "2024-04-25T10:19:36.420",
  }

  $that.cancellationPenaltyTypeChange = function () {
    var ruleModel = $scope.$commonCancelModel;
    var actonType = ruleModel.PenaltyType;
    switch (actonType) {
      case 0:
        ruleModel.Penalty = 0;
        break;
      case 1:
        ruleModel.Penalty =
          ruleModel.Penalty < 10
            ? 10
            : ruleModel.Penalty > 70
              ? 70
              : ruleModel.Penalty;
        break;
      case 4:
        ruleModel.ActionValue =
          ruleModel.Penalty < 1
            ? 1
            : ruleModel.Penalty > 3
              ? 3
              : ruleModel.Penalty;
        break;
      case 5:
        ruleModel.ActionValue = ruleModel.Penalty < 1 ? 1 : ruleModel.Penalty;
        break;
      case 100:
        ruleModel.Penalty = 100;
        break;
    }
  };