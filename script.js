let websites = {
  "1": "https://maps.app.goo.gl/KiKgAYwhPcow5itx7",
  "QW4-789-22": "https://maps.app.goo.gl/R1oVAA1srYB6Gwsy8?g_st=ic",
  "QW4-799-3A": "https://maps.app.goo.gl/Vciq98Tor1X98a1E7?g_st=ic",
  "QW4-702": "https://maps.app.goo.gl/iA8AhhuAK3BokvAV9?g_st=ic",
  "QW4-692": "https://maps.app.goo.gl/itaqzXgLaJCqog1E6?g_st=ic",
  "AP2-138-31-168-4": "https://maps.app.goo.gl/YyyiGNozLjRLmbfK6?g_st=iw",
  "37397": "https://maps.app.goo.gl/Gu2ySogCLDNQzH5p8?g_st=ic",
  "Uzs4-51": "https://maps.app.goo.gl/QXgkmbsg6QHwFmRL8?g_st=ic",
  "UZS4-60A-20": "https://maps.app.goo.gl/p1msfw6SAkwhS2W6A?g_st=ic",
  "Uzs4-68": "https://maps.app.goo.gl/D9BATeg8Ds2ywewg6?g_st=ic",
  "UZS4-82-2": "https://maps.app.goo.gl/HH9RnHCbBgkM5HFz6?g_st=ic",
  "Uzs4-91-9A": "https://maps.app.goo.gl/MtrBUga2ozzuakDu6?g_st=ic",
  "UZW9-77": "https://maps.app.goo.gl/jQNgRVMeQB8rfsh6A?g_st=ic",
  "КА3-6": "https://maps.app.goo.gl/qpejoza8oYpeohZ66",
  "КАЗ-2А": "https://maps.app.goo.gl/jiqJo2jJRGKbyg9U8"
};

const feedbackBtn = document.getElementById("feedbackBtn");
const feedbackModal = document.getElementById("feedbackModal");
const closeModal = document.getElementById("closeModal");
const searchInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("resultsContainer");
const suggestionsContainer = document.getElementById("suggestions");
const submitFeedback = document.getElementById("submitFeedback");
const resetForm = document.getElementById("resetForm");
const feedbackType = document.getElementById("feedbackType");
const equipmentType = document.getElementById("equipmentType");
const equipmentCode = document.getElementById("equipmentCode");
const equipmentLink = document.getElementById("equipmentLink");
const correctionReason = document.getElementById("correctionReason");
const correctionReasonLabel = document.getElementById("correctionReasonLabel");
const feedbackMsg = document.getElementById("feedbackMsg");

// فتح نافذة الملاحظات
if (feedbackBtn) {
  feedbackBtn.onclick = function() {
    feedbackModal.style.display = "flex";
  };
}

// إغلاق النافذة
if (closeModal) {
  closeModal.onclick = function() {
    feedbackModal.style.display = "none";
  };
}

// إغلاق عند الضغط خارج النموذج
if (feedbackModal) {
  window.onclick = function(event) {
    if (event.target === feedbackModal) {
      feedbackModal.style.display = "none";
    }
  };
}

// البحث التلقائي مع تأخير
let searchTimer;
if (searchInput) {
  searchInput.addEventListener("input", function() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      showSuggestions(this.value.trim());
    }, 300);
  });

  searchInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      performSearch(this.value.trim());
      suggestionsContainer.style.display = "none";
    }
  });
}

if (suggestionsContainer) {
  document.addEventListener("click", function(e) {
    if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
      suggestionsContainer.style.display = "none";
    }
  });
}

function showSuggestions(searchTerm) {
  suggestionsContainer.innerHTML = "";
  suggestionsContainer.style.display = "none";

  if (!searchTerm) {
    return;
  }

  const matchingKeys = Object.keys(websites)
    .filter(key => key.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 5);

  if (matchingKeys.length > 0) {
    matchingKeys.forEach(key => {
      const suggestionItem = document.createElement("div");
      suggestionItem.textContent = key;
      suggestionItem.className = "suggestion-item";
      suggestionItem.addEventListener("click", () => {
        searchInput.value = key;
        performSearch(key);
        suggestionsContainer.style.display = "none";
      });
      suggestionsContainer.appendChild(suggestionItem);
    });
    suggestionsContainer.style.display = "block";
  }
}

function performSearch(searchTerm) {
  resultsContainer.innerHTML = "<p>جارٍ البحث...</p>";

  if (!searchTerm) {
    resultsContainer.innerHTML = "<p>الرجاء إدخال كلمة للبحث</p>";
    resultsContainer.className = "error-message";
    return;
  }

  const foundKey = Object.keys(websites).find(key =>
    key.toLowerCase() === searchTerm.toLowerCase()
  );

  if (foundKey) {
    resultsContainer.innerHTML = "";
    const linkElement = document.createElement("a");
    linkElement.href = websites[foundKey];
    linkElement.textContent = "انقر هنا للانتقال إلى الموقع";
    linkElement.target = "_blank";
    linkElement.className = "result-link";
    resultsContainer.appendChild(linkElement);
  } else {
    resultsContainer.innerHTML = "<p>لم يتم العثور على الموقع المطلوب.</p>";
    resultsContainer.className = "error-message";
  }
}

// إظهار/إخفاء حقل سبب التعديل في feedback.html و modal
if (feedbackType) {
  feedbackType.addEventListener("change", function() {
    if (this.value === "تصحيح") {
      correctionReason.style.display = "block";
      correctionReasonLabel.style.display = "block";
      correctionReason.required = true;
    } else {
      correctionReason.style.display = "none";
      correctionReasonLabel.style.display = "none";
      correctionReason.required = false;
    }
  });
}

// معاينة رابط خرائط Google
if (equipmentLink) {
  equipmentLink.addEventListener("input", function() {
    const link = this.value.trim();
    if (link.includes("maps.app.goo.gl")) {
      feedbackMsg.textContent = "الرابط صالح!";
      feedbackMsg.className = "";
    } else {
      feedbackMsg.textContent = "الرجاء إدخال رابط خرائط Google صالح.";
      feedbackMsg.className = "error";
    }
  });
}

// إرسال النموذج إلى خادم وسيط
if (submitFeedback) {
  submitFeedback.onclick = async function(e) {
    e.preventDefault();
    const type = feedbackType.value;
    const equipType = equipmentType.value;
    const code = equipmentCode.value.trim();
    const link = equipmentLink.value.trim();
    const reason = correctionReason.value.trim();

    // التحقق من الحقول
    if (!equipType) {
      feedbackMsg.textContent = "الرجاء اختيار نوع المعدة.";
      feedbackMsg.className = "error";
      return;
    }
    if (!code || !link) {
      feedbackMsg.textContent = "الرجاء إدخال رمز المعدة ورابط خرائط Google.";
      feedbackMsg.className = "error";
      return;
    }
    if (type === "تصحيح" && !reason) {
      feedbackMsg.textContent = "الرجاء إدخال سبب التعديل.";
      feedbackMsg.className = "error";
      return;
    }
    if (!link.includes("maps.app.goo.gl")) {
      feedbackMsg.textContent = "الرجاء إدخال رابط خرائط Google صالح.";
      feedbackMsg.className = "error";
      return;
    }

    // إرسال البيانات إلى الخادم الوسيط
    const proxyUrl = "https://se-zeta-nine.vercel.app/submit"; // استبدل هذا برابط الخادم الوسيط (مثل https://your-vercel-app.vercel.app/submit)
    const formData = {
      "entry.1768981552": type,
      "entry.1223622662": equipType,
      "entry.507274621": code,
      "entry.838611703": link,
      "entry.826576113": reason,
      "dlut": Date.now().toString()
    };

    try {
      const response = await fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        feedbackMsg.textContent = "تم إرسال الإدخال بنجاح!";
        feedbackMsg.className = "";
        equipmentType.value = "";
        equipmentCode.value = "";
        equipmentLink.value = "";
        correctionReason.value = "";
        correctionReason.style.display = "none";
        correctionReasonLabel.style.display = "none";
        feedbackType.value = "إضافة";
        setTimeout(() => {
          feedbackMsg.textContent = "";
          if (feedbackModal) feedbackModal.style.display = "none";
        }, 3000);

        // تخزين احتياطي في localStorage
        const feedbackList = JSON.parse(localStorage.getItem("feedbackList") || "[]");
        feedbackList.push({
          type,
          equipmentType: equipType,
          code,
          link,
          reason: type === "تصحيح" ? reason : "",
          timestamp: new Date().toISOString()
        });
        localStorage.setItem("feedbackList", JSON.stringify(feedbackList));
      } else {
        throw new Error(`فشل الإرسال: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      feedbackMsg.textContent = "حدث خطأ أثناء الإرسال. تحقق من الاتصال بالخادم الوسيط.";
      feedbackMsg.className = "error";
    }
  };
}

// إعادة تعيين النموذج
if (resetForm) {
  resetForm.onclick = function() {
    equipmentType.value = "";
    equipmentCode.value = "";
    equipmentLink.value = "";
    correctionReason.value = "";
    correctionReason.style.display = "none";
    correctionReasonLabel.style.display = "none";
    feedbackType.value = "إضافة";
    feedbackMsg.textContent = "تم إعادة تعيين النموذج.";
    feedbackMsg.className = "";
    setTimeout(() => {
      feedbackMsg.textContent = "";
    }, 3000);
  };
}

// اختصار Ctrl+Enter للإرسال
if (equipmentCode && equipmentLink && correctionReason) {
  equipmentCode.addEventListener("keypress", function(e) {
    if (e.ctrlKey && e.key === "Enter") submitFeedback.click();
  });
  equipmentLink.addEventListener("keypress", function(e) {
    if (e.ctrlKey && e.key === "Enter") submitFeedback.click();
  });
  correctionReason.addEventListener("keypress", function(e) {
    if (e.ctrlKey && e.key === "Enter") submitFeedback.click();
  });
}