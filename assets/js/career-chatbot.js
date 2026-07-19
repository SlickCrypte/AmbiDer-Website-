/* =============================================================================
   AmbiDer Advisors & Management Consultants LLP
   career-chatbot.js
   Floating careers assistant. Vanilla JavaScript, no external libraries.
   Answers a fixed set of career-related questions using simple keyword
   matching. For future upgrade to a live agent, swap `getBotReply()` for
   an API call and keep the rendering functions unchanged.
   ============================================================================= */

(function () {
  "use strict";

  const toggleBtn = document.getElementById("adChatToggle");
  const chatWindow = document.getElementById("adChatWindow");
  const chatBody = document.getElementById("adChatBody");
  const chatInput = document.getElementById("adChatInput");
  const chatSend = document.getElementById("adChatSend");

  if (!toggleBtn || !chatWindow) return;

  const QUICK_ACTIONS = [
    { label: "Current Openings", key: "openings" },
    { label: "Apply Now", key: "apply" },
    { label: "Internship", key: "internship" },
    { label: "Contact HR", key: "contact" },
    { label: "Recruitment Process", key: "process" },
    { label: "FAQ", key: "faq" }
  ];

  const RESPONSES = {
    openings: {
      text: "We currently have openings across Strategy & Corporate Finance, Operations Consulting, Digital & Technology, Risk & Compliance, and People & Culture. You can browse and filter every open role on the Careers page.",
      link: { href: "careers.html", label: "View Current Openings" }
    },
    apply: {
      text: "You can apply directly from any job listing. Click a role on the Careers page, then select Apply Now to complete the online application, including your resume upload.",
      link: { href: "apply.html", label: "Go to Application Form" }
    },
    internship: {
      text: "Our Internship Program includes Campus Hiring, Summer Internship, and Winter Internship tracks, open to students across eligible degree programs. Duration and eligibility vary by track.",
      link: { href: "internships.html", label: "View Internship Program" }
    },
    resume: {
      text: "Resumes can be uploaded in PDF, DOC, or DOCX format on the Apply page. You'll see a confirmation once your upload succeeds, and it's automatically attached to your application.",
      link: { href: "apply.html", label: "Go to Application Form" }
    },
    process: {
      text: "Our recruitment process has five stages: application review, a screening call, a case and skills interview, a partner interview, and finally offer and onboarding. Most candidates hear back within four to six weeks.",
      link: { href: "careers.html", label: "Current Openings" }
    },
    contact: {
      text: "Our HR and recruitment team can be reached at careers@ambideradvisors.com or +91 124 456 7890. You can also use the main Contact page for other firm inquiries.",
      link: { href: "contact.html", label: "Contact AmbiDer" }
    },
    office: {
      text: "Our head office is located at DLF Cyber City, Gurugram, Haryana 122002, India. We also have teams based in Mumbai and Bengaluru, plus remote-eligible roles in select practices.",
      link: { href: "contact.html", label: "Get Directions" }
    },
    working: {
      text: "Life at AmbiDer means real client ownership from early on, structured mentorship through the AmbiDer Brilliance Board, and a culture that values candor and growth. Take a look at Life at AmbiDer for more.",
      link: { href: "life-at-ambider.html", label: "Explore Life at AmbiDer" }
    },
    faq: {
      text: "Our Careers FAQ page covers application steps, multi-role applications, internship eligibility, remote work, the interview process, resume formatting, and how to check your application status.",
      link: { href: "faq.html", label: "Read Careers FAQ" }
    },
    default: {
      text: "I can help with current openings, internship details, resume uploads, the interview process, contacting HR, our office location, or what it's like working at AmbiDer. What would you like to know?",
      link: null
    }
  };

  function keywordMatch(message) {
    const m = message.toLowerCase();
    if (/(open|role|position|job|vacanc)/.test(m)) return "openings";
    if (/(apply|application|how do i apply)/.test(m)) return "apply";
    if (/(intern)/.test(m)) return "internship";
    if (/(resume|cv|upload)/.test(m)) return "resume";
    if (/(interview|process|recruitment|hiring stage)/.test(m)) return "process";
    if (/(hr|contact|email|phone|call)/.test(m)) return "contact";
    if (/(office|location|address|where)/.test(m)) return "office";
    if (/(culture|life at|benefit|working at|why join)/.test(m)) return "working";
    if (/(faq|question)/.test(m)) return "faq";
    return "default";
  }

  function appendMessage(text, sender) {
    const div = document.createElement("div");
    div.className = "chat-msg " + sender;
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    return div;
  }

  function appendLink(href, label) {
    const div = document.createElement("div");
    div.className = "chat-msg bot";
    const a = document.createElement("a");
    a.href = href;
    a.textContent = label + " →";
    a.style.color = "var(--ad-gold)";
    a.style.fontWeight = "600";
    a.style.textDecoration = "none";
    div.appendChild(a);
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function appendQuickActions() {
    const wrap = document.createElement("div");
    wrap.className = "chat-quick-actions";
    QUICK_ACTIONS.forEach((qa) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chat-quick-btn";
      btn.textContent = qa.label;
      btn.addEventListener("click", function () {
        handleUserMessage(qa.label, qa.key);
      });
      wrap.appendChild(btn);
    });
    chatBody.appendChild(wrap);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function botReplyTo(key) {
    const response = RESPONSES[key] || RESPONSES.default;
    appendMessage(response.text, "bot");
    if (response.link) {
      appendLink(response.link.href, response.link.label);
    }
  }

  function handleUserMessage(displayText, forcedKey) {
    appendMessage(displayText, "user");
    const key = forcedKey || keywordMatch(displayText);
    // Small delay to feel conversational rather than instantaneous.
    setTimeout(function () {
      botReplyTo(key);
    }, 350);
  }

  function initConversation() {
    chatBody.innerHTML = "";
    appendMessage("Hello! I'm the AmbiDer Careers Assistant. Ask me about openings, internships, resumes, or the interview process — or tap a quick action below.", "bot");
    appendQuickActions();
  }

  function openChat() {
    chatWindow.classList.add("open");
    toggleBtn.classList.add("open");
    if (!chatBody.dataset.initialized) {
      initConversation();
      chatBody.dataset.initialized = "true";
    }
    chatInput.focus();
  }

  function closeChat() {
    chatWindow.classList.remove("open");
    toggleBtn.classList.remove("open");
  }

  toggleBtn.addEventListener("click", function () {
    if (chatWindow.classList.contains("open")) {
      closeChat();
    } else {
      openChat();
    }
  });

  chatSend.addEventListener("click", function () {
    const val = chatInput.value.trim();
    if (!val) return;
    handleUserMessage(val);
    chatInput.value = "";
  });

  chatInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      chatSend.click();
    }
  });
})();