// Função para fazer login
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Verifica se os campos foram preenchidos
  if (!email || !password) {
    createNotification(
      "Por favor, preencha todos os campos antes de fazer login.",
      "salmon",
      "red"
    );
    return;
  }

  try {
    const response = await window.electronAPI.login(email, password);

    if (response.success) {
      const { id } = response.user;

      // Armazena apenas o id como número inteiro no localStorage
      localStorage.setItem("userId", id);

      // Redireciona para a página inicial
      window.location.href = "../dashboard/dashboard.html";

      // Limpar os campos de email e senha
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
    } else {
      createNotification(response.message, "salmon", "red");
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    createNotification(
      "Erro ao fazer login. Tente novamente.",
      "salmon",
      "red"
    );
  }
}

// Adiciona um listener ao formulário de login
document.querySelector("form").addEventListener("submit", handleLogin);

// Função para criar notificações empilháveis
function createNotification(message, backgroundColor, borderColor) {
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.textContent = message;
  notification.style.backgroundColor = backgroundColor;
  notification.style.border = `2px solid ${borderColor}`;
  notification.style.position = "fixed";
  notification.style.right = "10px";
  notification.style.padding = "10px";
  notification.style.zIndex = 1000;

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
  let topOffset = 80;

  notifications.forEach((notification) => {
    topOffset += notification.offsetHeight + 10;
  });

  return topOffset;
}

// Função para atualizar as posições de todas as notificações visíveis
function updateNotificationPositions() {
  const notifications = document.querySelectorAll(".notification");
  let topOffset = 80;

  notifications.forEach((notification) => {
    notification.style.top = `${topOffset}px`;
    topOffset += notification.offsetHeight + 10;
  });
}
