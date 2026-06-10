let websites = {};
let dataLoaded = false;
let dataLoadingPromise = null;

// تحميل بيانات المواقع مرة واحدة فقط
function loadWebsitesData() {
  if (dataLoaded) return Promise.resolve(websites);
  if (dataLoadingPromise) return dataLoadingPromise;

  const files = [
    'data/QBS.json',
    'data/QRS.json',
    'data/QUS.json',
    'data/QWS.json',
    'data/QMS.json',
    'data/websites.json',
    'data/alasyah.json',
    'data/OCL1.json',
    'data/OCL2.json',
    'data/OCL4.json',
    'data/OCL5.json',
    'data/OCL6.json',
    'data/OCL7.json',
    'data/OCL8.json',
    'data/OCL9.json',
    'data/OCL10.json',
    'data/OCL11.json',
    'data/OCL12.json',
    'data/OCL13.json',
    'data/OCL14.json',
    'data/OCL15.json',
    'data/OCL16.json',
    'data/OCL17.json'
  ];

  dataLoadingPromise = Promise.all(
    files.map(file =>
      fetch(file).then(res => {
        if (!res.ok) {
          throw new Error(`تعذر تحميل الملف: ${file}`);
        }
        return res.json();
      })
    )
  )
    .then(dataArray => {
      dataArray.forEach(data => {
        Object.assign(websites, data);
      });
      dataLoaded = true;
      console.log('All websites data loaded:', websites);
      return websites;
    })
    .catch(error => {
      console.error('Error loading websites data:', error);
      throw error;
    });

  return dataLoadingPromise;
}

// وظيفة للحصول على رابط باستخدام المفتاح
function getWebsiteByKey(key) {
  if (!dataLoaded) {
    console.error('Data not loaded yet. Call loadWebsitesData first.');
    return null;
  }

  return websites[key] || 'Key not found';
}

// ----------------------
// أدوات تحسين البحث
// ----------------------

// توحيد النص قبل المقارنة
function normalizeText(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

// حساب مسافة Levenshtein لمعرفة الأقرب
function levenshteinDistance(a, b) {
  const matrix = [];
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  for (let i = 0; i <= lenB; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= lenA; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenB; i++) {
    for (let j = 1; j <= lenA; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // replace
          matrix[i][j - 1] + 1,     // insert
          matrix[i - 1][j] + 1      // delete
        );
      }
    }
  }

  return matrix[lenB][lenA];
}

// جلب أقرب الاقتراحات بحد أقصى 10
function getClosestSuggestions(searchTerm, limit = 10) {
  const normalizedTerm = normalizeText(searchTerm);
  const keys = Object.keys(websites);

  if (!normalizedTerm) return [];

  // أولاً: نبحث عن التطابقات المباشرة (contains)
  const directMatches = keys
    .map(key => {
      const normalizedKey = normalizeText(key);
      const exact = normalizedKey === normalizedTerm;
      const startsWith = normalizedKey.startsWith(normalizedTerm);
      const includes = normalizedKey.includes(normalizedTerm);
      const position = normalizedKey.indexOf(normalizedTerm);

      return {
        key,
        normalizedKey,
        exact,
        startsWith,
        includes,
        position,
        distance: levenshteinDistance(normalizedTerm, normalizedKey),
        lengthDiff: Math.abs(normalizedKey.length - normalizedTerm.length)
      };
    })
    .filter(item => item.includes);

  if (directMatches.length > 0) {
    return directMatches
      .sort((a, b) => {
        // 1) تطابق كامل
        if (a.exact !== b.exact) return a.exact ? -1 : 1;

        // 2) يبدأ بنفس النص
        if (a.startsWith !== b.startsWith) return a.startsWith ? -1 : 1;

        // 3) موقع النص داخل الكلمة
        if (a.position !== b.position) return a.position - b.position;

        // 4) أقل مسافة
        if (a.distance !== b.distance) return a.distance - b.distance;

        // 5) الأقصر فرقًا بالطول
        if (a.lengthDiff !== b.lengthDiff) return a.lengthDiff - b.lengthDiff;

        return a.key.localeCompare(b.key, 'ar');
      })
      .slice(0, limit)
      .map(item => item.key);
  }

  // إذا ما فيه تطابق مباشر، نجيب أقرب النتائج التقريبية
  const maxDistance = Math.max(1, Math.floor(normalizedTerm.length * 0.4));

  const fuzzyMatches = keys
    .map(key => {
      const normalizedKey = normalizeText(key);
      return {
        key,
        distance: levenshteinDistance(normalizedTerm, normalizedKey),
        lengthDiff: Math.abs(normalizedKey.length - normalizedTerm.length)
      };
    })
    .filter(item => item.distance <= maxDistance)
    .sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (a.lengthDiff !== b.lengthDiff) return a.lengthDiff - b.lengthDiff;
      return a.key.localeCompare(b.key, 'ar');
    })
    .slice(0, limit)
    .map(item => item.key);

  return fuzzyMatches;
}

// ----------------------
// عناصر الصفحة
// ----------------------
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
  feedbackBtn.onclick = function () {
    feedbackModal.style.display = "flex";
  };
}

// إغلاق النافذة
if (closeModal) {
  closeModal.onclick = function () {
    feedbackModal.style.display = "none";
  };
}

// إغلاق عند الضغط خارج النموذج
if (feedbackModal) {
  window.onclick = function (event) {
    if (event.target === feedbackModal) {
      feedbackModal.style.display = "none";
    }
  };
}

// تحميل البيانات أول ما الصفحة تفتح
loadWebsitesData().catch(() => {
  if (resultsContainer) {
    resultsContainer.innerHTML = "<p>تعذر تحميل بيانات المواقع.</p>";
    resultsContainer.className = "error-message";
  }
});

// البحث التلقائي مع تأخير
let searchTimer;
if (searchInput) {
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      showSuggestions(this.value.trim());
    }, 300);
  });

  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performSearch(this.value.trim());
      suggestionsContainer.style.display = "none";
    }
  });
}

// إخفاء الاقتراحات إذا ضغط خارجها
if (suggestionsContainer && searchInput) {
  document.addEventListener("click", function (e) {
    if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
      suggestionsContainer.style.display = "none";
    }
  });
}

// عرض الاقتراحات (أقرب 10 فقط)
async function showSuggestions(searchTerm) {
  suggestionsContainer.innerHTML = "";
  suggestionsContainer.style.display = "none";

  if (!searchTerm) return;

  try {
    await loadWebsitesData();

    const matchingKeys = getClosestSuggestions(searchTerm, 10);

    if (matchingKeys.length > 0) {
      const fragment = document.createDocumentFragment();

      matchingKeys.forEach(key => {
        const suggestionItem = document.createElement("div");
        suggestionItem.textContent = key;
        suggestionItem.className = "suggestion-item";

        suggestionItem.addEventListener("click", () => {
          searchInput.value = key;
          performSearch(key);
          suggestionsContainer.style.display = "none";
        });

        fragment.appendChild(suggestionItem);
      });

      suggestionsContainer.appendChild(fragment);
      suggestionsContainer.style.display = "block";
    }
  } catch (error) {
    console.error("Error showing suggestions:", error);
  }
}

// تنفيذ البحث
async function performSearch(searchTerm) {
  resultsContainer.innerHTML = "<p>جارٍ البحث...</p>";
  resultsContainer.className = "";

  if (!searchTerm) {
    resultsContainer.innerHTML = "<p>الرجاء إدخال كلمة للبحث</p>";
    resultsContainer.className = "error-message";
    return;
  }

  try {
    await loadWebsitesData();

    const foundKey = Object.keys(websites).find(
      key => normalizeText(key) === normalizeText(searchTerm)
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
      const closestKeys = getClosestSuggestions(searchTerm, 10);

      if (closestKeys.length > 0) {
        resultsContainer.innerHTML = "<p>لم يتم العثور على تطابق كامل. هذه أقرب النتائج:</p>";
        resultsContainer.className = "";

        const listWrapper = document.createElement("div");
        listWrapper.className = "closest-results";

        closestKeys.forEach(key => {
          const item = document.createElement("div");
          item.className = "suggestion-item";
          item.textContent = key;

          item.addEventListener("click", () => {
            searchInput.value = key;
            performSearch(key);
            suggestionsContainer.style.display = "none";
          });

          listWrapper.appendChild(item);
        });

        resultsContainer.appendChild(listWrapper);
      } else {
        resultsContainer.innerHTML = "<p>لم يتم العثور على الموقع المطلوب.</p>";
        resultsContainer.className = "error-message";
      }
    }
  } catch (error) {
    console.error("Error performing search:", error);
    resultsContainer.innerHTML = "<p>حدث خطأ أثناء البحث.</p>";
    resultsContainer.className = "error-message";
  }
}

// إظهار/إخفاء حقل سبب التعديل
if (feedbackType) {
  feedbackType.addEventListener("change", function () {
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
  equipmentLink.addEventListener("input", function () {
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

// إرسال النموذج إلى Google Forms
if (submitFeedback) {
  submitFeedback.onclick = function (e) {
    e.preventDefault();

    const type = feedbackType.value;
    const equipType = equipmentType.value;
    const code = equipmentCode.value.trim();
    const link = equipmentLink.value.trim();
    const reason = correctionReason.value.trim();

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

    const formData = new FormData();
    formData.append("entry.1768981552", type);
    formData.append("entry.1223622662", equipType);
    formData.append("entry.507274621", code);
    formData.append("entry.838611703", link);
    formData.append("entry.826576113", reason);

    fetch("https://docs.google.com/forms/d/e/1FAIpQLSfBKCbDVJ-ju6LuwL7qKXP2L7cav0wWQVv99ojK2b_HWpdMFw/formResponse", {
      method: "POST",
      body: formData
    })
      .then(response => {
        if (response.ok || response.type === "opaque") {
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
        } else {
          throw new Error("فشل إرسال النموذج");
        }
      })
      .catch(error => {
        console.error("Error:", error);
        feedbackMsg.textContent = "حدث خطأ أثناء الإرسال.";
        feedbackMsg.className = "error";
      });

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
  };
}

// إعادة تعيين النموذج
if (resetForm) {
  resetForm.onclick = function () {
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
  equipmentCode.addEventListener("keypress", function (e) {
    if (e.ctrlKey && e.key === "Enter") submitFeedback.click();
  });

  equipmentLink.addEventListener("keypress", function (e) {
    if (e.ctrlKey && e.key === "Enter") submitFeedback.click();
  });

  correctionReason.addEventListener("keypress", function (e) {
    if (e.ctrlKey && e.key === "Enter") submitFeedback.click();
  });
}
