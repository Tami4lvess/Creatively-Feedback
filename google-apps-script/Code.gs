const SHEET_NAME = "Respostas";

const HEADERS = [
  "Data e hora",
  "Projeto",
  "Nome",
  "E-mail",
  "Cidade",
  "Estado",
  "Conheceu por",
  "Dispositivo",
  "Experiência geral (1-5)",
  "Recomendaria (0-10)",
  "Monthly — clareza (1-5)",
  "Monthly — conteúdo favorito",
  "Monthly — mês favorito",
  "Monthly — idioma",
  "Monthly — usaria novamente",
  "Chromatic — objetivo claro",
  "Chromatic — controles (1-5)",
  "Chromatic — dificuldade",
  "Chromatic — elemento favorito",
  "Chromatic — jogaria novamente",
  "O que mais gostou",
  "O que melhorar",
  "Encontrou erro",
  "Detalhes do erro",
  "Outra sugestão",
  "Data enviada pelo navegador",
  "Idioma da página",
  "Navegador e dispositivo"
];

function doGet() {
  return jsonResponse({ ok: true, message: "Coletor de feedback ativo." });
}

function doPost(event) {
  const lock = LockService.getScriptLock();

  try {
    const payload = JSON.parse(event.postData.contents || "{}");
    validatePayload(payload);

    lock.waitLock(10000);
    const sheet = getOrCreateSheet();
    sheet.appendRow([
      new Date(),
      safeCell(payload.project),
      safeCell(payload.name),
      safeCell(payload.email),
      safeCell(payload.city),
      safeCell(payload.state),
      safeCell(payload.discovery),
      safeCell(payload.device),
      safeCell(payload.overall_rating),
      safeCell(payload.recommendation),
      safeCell(payload.monthly_clarity),
      safeCell(payload.monthly_favorite_section),
      safeCell(payload.monthly_favorite_month),
      safeCell(payload.monthly_language),
      safeCell(payload.monthly_return),
      safeCell(payload.void_objective),
      safeCell(payload.void_controls),
      safeCell(payload.void_difficulty),
      safeCell(payload.void_favorite_element),
      safeCell(payload.void_play_again),
      safeCell(payload.positive_feedback),
      safeCell(payload.improvement_feedback),
      safeCell(payload.found_bug),
      safeCell(payload.bug_details),
      safeCell(payload.additional_suggestion),
      safeCell(payload.submitted_at),
      safeCell(payload.page_language),
      safeCell(payload.user_agent)
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, message: String(error.message || error) });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function validatePayload(payload) {
  const required = [
    "project",
    "name",
    "email",
    "city",
    "state",
    "discovery",
    "device",
    "overall_rating",
    "recommendation",
    "positive_feedback",
    "improvement_feedback",
    "found_bug"
  ];

  required.forEach(function (field) {
    if (!String(payload[field] || "").trim()) {
      throw new Error("Campo obrigatório ausente: " + field);
    }
  });

  if (!/^\S+@\S+\.\S+$/.test(String(payload.email))) {
    throw new Error("E-mail inválido.");
  }

  if (!["Monthly Colors", "Chromatic Void"].includes(payload.project)) {
    throw new Error("Projeto inválido.");
  }

  if (payload.project === "Monthly Colors") {
    ["monthly_clarity", "monthly_favorite_section", "monthly_favorite_month", "monthly_language", "monthly_return"]
      .forEach(function (field) {
        if (!String(payload[field] || "").trim()) throw new Error("Resposta mensal ausente: " + field);
      });
  }

  if (payload.project === "Chromatic Void") {
    ["void_objective", "void_controls", "void_difficulty", "void_favorite_element", "void_play_again"]
      .forEach(function (field) {
        if (!String(payload[field] || "").trim()) throw new Error("Resposta do jogo ausente: " + field);
      });
  }

  if (payload.found_bug === "Sim" && !String(payload.bug_details || "").trim()) {
    throw new Error("Os detalhes do erro não foram informados.");
  }
}

function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight("bold")
      .setBackground("#253453")
      .setFontColor("#ffffff");
    sheet.autoResizeColumns(1, HEADERS.length);
  }

  return sheet;
}

function safeCell(value) {
  const text = String(value || "").replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, 2000);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
