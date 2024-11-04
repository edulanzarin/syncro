// Função para registrar um novo usuário
async function handleRegister(event) {
  event.preventDefault();

  // Captura os valores dos campos do formulário
  const nome = document.getElementById("nome").value;
  const cargo = document.getElementById("cargo").value;
  const setor = document.getElementById("setor").value;
  const segmento = document.getElementById("segmento").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  // Verifica se todos os campos foram preenchidos
  if (!nome || !cargo || !setor || !segmento || !email || !senha) {
    createNotification(
      "Por favor, preencha todos os campos antes de registrar.",
      "salmon",
      "red"
    );
    return;
  }

  try {
    // Chama a API de registro através do contexto exposto pelo Electron
    const response = await window.electronAPI.register(
      nome,
      cargo,
      setor,
      segmento,
      email,
      senha
    );

    // Verifica a resposta
    if (response.success) {
      // Redireciona para a página de login ou realiza outra ação após o registro
      window.location.href = "../login/login.html";
    } else {
      // Mostra uma notificação de erro caso o registro falhe
      createNotification(response.message, "salmon", "red");
    }
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    createNotification("Erro ao registrar. Tente novamente.", "salmon", "red");
  }
}

// Adiciona um listener ao formulário de registro
document.querySelector("form").addEventListener("submit", handleRegister);

// Função para criar notificações empilháveis
function createNotification(message, backgroundColor, borderColor) {
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.textContent = message;
  notification.style.backgroundColor = backgroundColor;
  notification.style.border = `2px solid ${borderColor}`;

  const topOffset = calculateNotificationOffset();
  notification.style.top = `${topOffset}px`;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
    updateNotificationPositions();
  }, 5000);
}

// Função para calcular a posição 'top' da nova notificação
function calculateNotificationOffset() {
  const notifications = document.querySelectorAll(".notification");
  let topOffset = 30;

  notifications.forEach((notification) => {
    topOffset += notification.offsetHeight + 10;
  });

  return topOffset;
}

// Função para atualizar as posições de todas as notificações visíveis
function updateNotificationPositions() {
  const notifications = document.querySelectorAll(".notification");
  let topOffset = 30;

  notifications.forEach((notification) => {
    notification.style.top = `${topOffset}px`;
    topOffset += notification.offsetHeight + 10;
  });
}
