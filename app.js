(() => {
  "use strict";

  const body = document.body;
  const choiceScreen = document.querySelector("#choice-screen");
  const formScreen = document.querySelector("#form-screen");
  const successScreen = document.querySelector("#success-screen");
  const form = document.querySelector("#feedback-form");
  const steps = [...document.querySelectorAll(".form-step")];
  const progressBar = document.querySelector("#progress-bar");
  const stepLabel = document.querySelector("#current-step-label");
  const previousButton = document.querySelector("#previous-button");
  const nextButton = document.querySelector("#next-button");
  const submitButton = document.querySelector("#submit-button");
  const projectInput = document.querySelector("#project-input");
  const selectedProjectName = document.querySelector("#selected-project-name");
  const reviewCard = document.querySelector("#review-card");
  const toast = document.querySelector("#toast");
  const bugDetailsField = document.querySelector("[data-show-when-bug]");
  const bugDetails = form.elements.bug_details;
  const projectPanels = [...document.querySelectorAll("[data-project-panel]")];
  const projectNames = {
    monthly: "Monthly Colors",
    chromatic: "Chromatic Void"
  };
  const reviewLabels = {
    name: "Nome",
    email: "E-mail",
    city: "Cidade",
    state: "Estado",
    discovery: "Conheceu por",
    device: "Dispositivo",
    overall_rating: "Experiência geral",
    recommendation: "Recomendaria",
    monthly_clarity: "Clareza das informações",
    monthly_favorite_section: "Conteúdo favorito",
    monthly_favorite_month: "Mês favorito",
    monthly_language: "Idioma utilizado",
    monthly_return: "Usaria novamente",
    void_objective: "Objetivo do jogo",
    void_controls: "Resposta dos controles",
    void_difficulty: "Dificuldade",
    void_favorite_element: "Elemento favorito",
    void_play_again: "Jogaria novamente",
    positive_feedback: "Ponto mais positivo",
    improvement_feedback: "Melhoria principal",
    found_bug: "Encontrou erro",
    bug_details: "Detalhes do erro",
    additional_suggestion: "Outra sugestão"
  };

  let currentStep = 1;
  let selectedProject = "";
  let toastTimer;

  function createAmbientDots() {
    const holder = document.querySelector("#ambient-dots");
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < 34; index += 1) {
      const dot = document.createElement("i");
      dot.className = "ambient__dot";
      dot.style.setProperty("--size", `${2 + (index % 4)}px`);
      dot.style.setProperty("--top", `${(index * 37) % 96}%`);
      dot.style.setProperty("--left", `${(index * 61 + 7) % 98}%`);
      dot.style.setProperty("--alpha", `${0.14 + (index % 5) * 0.05}`);
      dot.style.setProperty("--duration", `${3.8 + (index % 6) * 0.7}s`);
      dot.style.setProperty("--delay", `${-(index % 8) * 0.45}s`);
      dot.style.setProperty("--drift", `${(index % 2 ? 1 : -1) * (5 + index % 9)}px`);
      fragment.append(dot);
    }

    holder.append(fragment);
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
  }

  function clearErrors(scope = form) {
    scope.querySelectorAll(".field.has-error").forEach((field) => field.classList.remove("has-error"));
    scope.querySelectorAll(".field-error, .group-error, .consent-error").forEach((error) => {
      error.textContent = "";
    });
  }

  function updateProjectFields() {
    projectPanels.forEach((panel) => {
      const active = panel.dataset.projectPanel === selectedProject;
      panel.hidden = !active;
      panel.querySelectorAll("[data-project-required]").forEach((input) => {
        input.required = active;
      });
      panel.querySelectorAll("input, select, textarea").forEach((input) => {
        input.disabled = !active;
      });
    });
  }

  function chooseProject(project) {
    selectedProject = project;
    body.dataset.project = project;
    projectInput.value = projectNames[project];
    selectedProjectName.textContent = projectNames[project];
    choiceScreen.hidden = true;
    choiceScreen.classList.remove("is-active");
    successScreen.hidden = true;
    formScreen.hidden = false;
    updateProjectFields();
    showStep(1, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => form.elements.name.focus({ preventScroll: true }), 420);
  }

  function resetExperience() {
    form.reset();
    clearErrors();
    selectedProject = "";
    currentStep = 1;
    projectInput.value = "";
    body.dataset.project = "none";
    formScreen.hidden = true;
    successScreen.hidden = true;
    choiceScreen.hidden = false;
    choiceScreen.classList.add("is-active");
    bugDetailsField.hidden = true;
    bugDetails.required = false;
    submitButton.classList.remove("is-loading");
    submitButton.disabled = false;
    document.querySelector("#confetti").replaceChildren();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showStep(stepNumber, shouldFocus = true) {
    currentStep = stepNumber;
    steps.forEach((step) => {
      const active = Number(step.dataset.step) === stepNumber;
      step.hidden = !active;
      step.classList.toggle("is-active", active);
    });

    stepLabel.textContent = String(stepNumber).padStart(2, "0");
    progressBar.style.width = `${stepNumber * 20}%`;
    previousButton.hidden = stepNumber === 1;
    nextButton.hidden = stepNumber === steps.length;
    submitButton.hidden = stepNumber !== steps.length;

    if (stepNumber === steps.length) buildReview();

    if (shouldFocus) {
      formScreen.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        const heading = steps[stepNumber - 1].querySelector("h2");
        heading?.setAttribute("tabindex", "-1");
        heading?.focus({ preventScroll: true });
      }, 360);
    }
  }

  function fieldErrorMessage(input) {
    if (input.validity.valueMissing) return "Preencha este campo para continuar.";
    if (input.validity.typeMismatch) return "Digite um e-mail válido.";
    if (input.validity.tooShort) return `Escreva pelo menos ${input.minLength} caracteres.`;
    return "Confira a informação preenchida.";
  }

  function validateStep(stepNumber) {
    clearErrors(steps[stepNumber - 1]);
    const step = steps[stepNumber - 1];
    const controls = [...step.querySelectorAll("input, select, textarea")].filter(
      (input) => !input.disabled && input.type !== "hidden"
    );
    const checkedGroups = new Set();
    let firstInvalid = null;

    controls.forEach((input) => {
      if (input.type === "radio") {
        if (checkedGroups.has(input.name)) return;
        checkedGroups.add(input.name);
        const group = controls.filter((control) => control.type === "radio" && control.name === input.name);
        if (group.some((control) => control.required) && !group.some((control) => control.checked)) {
          const fieldset = input.closest("fieldset");
          fieldset?.querySelector(".group-error")?.replaceChildren("Escolha uma opção para continuar.");
          firstInvalid ||= input;
        }
        return;
      }

      if (!input.checkValidity()) {
        if (input.type === "checkbox" && input.name === "consent") {
          document.querySelector(".consent-error").textContent = "Confirme a autorização para enviar.";
          firstInvalid ||= input;
          return;
        }
        const field = input.closest(".field");
        field?.classList.add("has-error");
        const error = field?.querySelector(".field-error");
        if (error) error.textContent = fieldErrorMessage(input);
        firstInvalid ||= input;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      showToast("Há uma resposta pendente nesta etapa.");
      return false;
    }

    return true;
  }

  function buildReview() {
    reviewCard.replaceChildren();
    const data = new FormData(form);
    const entries = [...data.entries()].filter(([name, value]) => {
      return reviewLabels[name] && String(value).trim() !== "";
    });

    entries.forEach(([name, value]) => {
      const row = document.createElement("div");
      const label = document.createElement("span");
      const answer = document.createElement("strong");
      row.className = "review-row";
      label.textContent = reviewLabels[name];
      answer.textContent = String(value);
      if (["overall_rating", "monthly_clarity", "void_controls"].includes(name)) {
        answer.textContent = `${value} de 5`;
      }
      if (name === "recommendation") answer.textContent = `${value} de 10`;
      row.append(label, answer);
      reviewCard.append(row);
    });
  }

  function formPayload() {
    const data = Object.fromEntries(new FormData(form).entries());
    delete data.consent;
    delete data.website;
    return {
      ...data,
      submitted_at: new Date().toISOString(),
      page_language: document.documentElement.lang,
      user_agent: navigator.userAgent
    };
  }

  function launchConfetti() {
    const holder = document.querySelector("#confetti");
    const colors = selectedProject === "chromatic"
      ? ["#47cef4", "#7b74ff", "#ffffff", "#3a79ff"]
      : ["#ff858f", "#ffd166", "#63d6b4", "#7587ed", "#d986d8"];
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < 36; index += 1) {
      const piece = document.createElement("i");
      piece.style.setProperty("--left", `${(index * 29 + 3) % 100}%`);
      piece.style.setProperty("--size", `${7 + (index % 5) * 2}px`);
      piece.style.setProperty("--color", colors[index % colors.length]);
      piece.style.setProperty("--duration", `${2.7 + (index % 6) * 0.22}s`);
      piece.style.setProperty("--delay", `${(index % 10) * 0.05}s`);
      piece.style.setProperty("--drift", `${(index % 2 ? 1 : -1) * (18 + index % 42)}px`);
      fragment.append(piece);
    }

    holder.append(fragment);
  }

  async function submitFeedback() {
    const endpoint = window.FEEDBACK_CONFIG?.googleScriptUrl?.trim();
    if (!endpoint || !endpoint.startsWith("https://script.google.com/")) {
      showToast("Conecte primeiro o endereço da Planilha Google no arquivo config.js.");
      return;
    }

    submitButton.disabled = true;
    submitButton.classList.add("is-loading");

    try {
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(formPayload())
      });

      formScreen.hidden = true;
      successScreen.hidden = false;
      launchConfetti();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Falha ao enviar feedback:", error);
      showToast("Não foi possível enviar agora. Verifique sua conexão e tente novamente.");
      submitButton.disabled = false;
      submitButton.classList.remove("is-loading");
    }
  }

  document.querySelectorAll("[data-choose-project]").forEach((card) => {
    card.addEventListener("click", () => chooseProject(card.dataset.chooseProject));
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
      card.style.setProperty("--my", `${event.clientY - bounds.top}px`);
    });
  });

  document.querySelectorAll("[data-reset-form]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      resetExperience();
    });
  });

  previousButton.addEventListener("click", () => {
    if (currentStep > 1) showStep(currentStep - 1);
  });

  nextButton.addEventListener("click", () => {
    if (validateStep(currentStep)) showStep(currentStep + 1);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (form.elements.website.value) return;
    if (!validateStep(currentStep)) return;
    submitFeedback();
  });

  form.addEventListener("input", (event) => {
    const field = event.target.closest(".field");
    field?.classList.remove("has-error");
    const error = field?.querySelector(".field-error");
    if (error) error.textContent = "";

    if (event.target.matches("textarea")) {
      const counter = field?.querySelector(".character-count");
      if (counter) counter.textContent = `${event.target.value.length} / ${event.target.maxLength}`;
    }
  });

  form.addEventListener("change", (event) => {
    if (event.target.type === "radio") {
      const error = event.target.closest("fieldset")?.querySelector(".group-error");
      if (error) error.textContent = "";
    }

    if (event.target.name === "found_bug") {
      const mustDescribe = event.target.value === "Sim";
      bugDetailsField.hidden = !mustDescribe;
      bugDetails.required = mustDescribe;
      if (!mustDescribe) {
        bugDetails.value = "";
        bugDetailsField.querySelector(".character-count").textContent = "0 / 700";
      }
    }

    if (event.target.name === "consent") {
      document.querySelector(".consent-error").textContent = "";
    }
  });

  createAmbientDots();
})();
