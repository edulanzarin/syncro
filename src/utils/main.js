// Obter userId do localStorage
const userId = localStorage.getItem("userId");

// Função para fazer as verificações e carregar os dados do usuário
const carregarDadosUsuario = async () => {
   let userInfo;
   try {
      const response = await window.electronAPI.obterDadosUsuario(userId);

      if (response.success && response.dados_usuario.length > 0) {
         userInfo = response.dados_usuario[0];
      }

      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      carregarImagemPerfil(userInfo.foto);
   } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
   }
};

const carregarImagemPerfil = (foto) => {
   const userAvatar = document.getElementById("user-avatar");
   const base64Image =
      foto && foto.startsWith("data:image/png;base64,")
         ? foto
         : `data:image/png;base64,${foto || ""}`;

   const tempImg = new Image();

   tempImg.onload = () => {
      userAvatar.src = base64Image;
   };

   tempImg.onerror = () => {
      userAvatar.src = "../images/avatar.png";
   };

   tempImg.src = base64Image || "../images/avatar.png";
};

// Chama a função para verificar usuário
carregarDadosUsuario();

// Seleciona todos os elementos com a classe 'menu-header'
const menuItems = document.querySelectorAll(".menu-header");

// Função para redirecionar automaticamente com base no ID do item clicado
menuItems.forEach((item) => {
   item.addEventListener("click", () => {
      window.location.href = `../${item.id}/${item.id}.html`;
   });
});

// Função para redirecionar para sql.html
const redirectSql = () => {
   const logo = document.querySelector(".logo");
   let clickCount = 0;

   logo.addEventListener("click", () => {
      clickCount += 1;

      if (clickCount === 15) {
         window.location.href = "../sql/sql.html";
      }
   });
};

// Chame a função para ativar o redirecionamento
redirectSql();

// URLs dos GIFs de sucesso e erro
const successGifUrl = "../images/success.gif";
const errorGifUrl = "../images/error.gif";

// Função para criar notificações de sucesso
function createSuccessNotification(message) {
   createNotification(message, "#dff0d8", "#3c763d", successGifUrl);
}

// Função para criar notificações de falha
function createErrorNotification(message) {
   createNotification(message, "#f2dede", "#a94442", errorGifUrl);
}

// Função para criar notificações empilháveis
function createNotification(message, backgroundColor, borderColor, gifUrl) {
   // Cria um novo elemento de notificação
   const notification = document.createElement("div");
   notification.classList.add("notification");
   notification.textContent = message;
   notification.style.backgroundColor = backgroundColor;
   notification.style.border = `2px solid ${borderColor}`;
   notification.style.position = "fixed";
   notification.style.right = "10px";
   notification.style.padding = "10px";
   notification.style.zIndex = 1000;

   // Adiciona o GIF de sucesso ou erro
   const gif = document.createElement("img");
   gif.src = gifUrl;
   gif.style.width = "20px";
   gif.style.marginRight = "10px";
   notification.prepend(gif);

   // Define a posição 'top' com base nas notificações existentes
   const topOffset = calculateNotificationOffset();
   notification.style.top = `${topOffset}px`;

   // Adiciona a notificação ao body
   document.body.appendChild(notification);

   // Remove a notificação após 5 segundos e atualiza as posições
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

// Função para mostrar o modal de carregamento e criar a estrutura HTML
const showLoadingModal = () => {
   let loadingModal = document.getElementById("loading-modal");
   if (!loadingModal) {
      loadingModal = document.createElement("div");
      loadingModal.id = "loading-modal";
      loadingModal.className = "loading-modal";
      loadingModal.style.display = "flex";

      const loadingContent = document.createElement("div");
      loadingContent.className = "loading-content";

      const loadingImage = document.createElement("img");
      loadingImage.src = "../images/loading.gif";
      loadingImage.alt = "Carregando...";

      const loadingText = document.createElement("p");
      loadingText.textContent = "Tudo estará pronto em breve...";

      loadingContent.appendChild(loadingImage);
      loadingContent.appendChild(loadingText);

      loadingModal.appendChild(loadingContent);

      document.body.appendChild(loadingModal);
   } else {
      loadingModal.style.display = "flex";
   }
};

// Função para esconder o modal de carregamento
const hideLoadingModal = () => {
   const loadingModal = document.getElementById("loading-modal");
   if (loadingModal) {
      loadingModal.style.display = "none";
   }
};
