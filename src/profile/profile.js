// Obtém userInfo do localStorage
const userInfoString = localStorage.getItem("userInfo");
// Transforma em objeto
const userInfo = JSON.parse(userInfoString);
console.log("userInfo:", userInfo);
console.log(userId);

const loadUserData = async (userId) => {
   // Mostrar o modal de carregamento
   showLoadingModal();

   try {
      // Obtém os dados do usuário
      const resultado = await window.electronAPI.obterDadosUsuario(userId);

      // Verifica se a resposta foi bem-sucedida e se há dados
      if (resultado.success && resultado.dados_usuario.length > 0) {
         const dados = resultado.dados_usuario;
         const user = dados[0];

         // Carregar os dados nos inputs
         document.getElementById("name").value = user.nome;
         document.getElementById("position").value = user.cargo;
         document.getElementById("department").value = user.setor;
         document.getElementById("segment").value = user.segmento;
         document.getElementById("email").value = user.email;
         document.getElementById("password").value = user.senha;

         // Carregar a foto do usuário se existir ou usar avatar.png como padrão
         const avatarImage = document.querySelector(".avatar");
         avatarImage.src = user.foto ? user.foto : "../images/avatar.png";
      } else {
         console.error(
            "Nenhum dado de usuário encontrado ou erro ao obter dados."
         );
      }
   } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
   } finally {
      // Esconder o modal de carregamento
      hideLoadingModal();
   }
};

// Chame a função loadUserData com o userId quando a página for carregada ou em um evento específico
window.onload = () => {
   loadUserData(userId);
};

// Função para alterar visibilidade da senha
const togglePassword = () => {
   const passwordInput = document.getElementById("password");
   const toggleIcon = document.querySelector(".toggle-password");

   if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.classList.replace("fa-eye", "fa-eye-slash");
   } else {
      passwordInput.type = "password";
      toggleIcon.classList.replace("fa-eye-slash", "fa-eye");
   }
};

// Função para abrir o diálogo de arquivos
const openFileDialog = () => {
   const fileInput = document.getElementById("file-input");
   fileInput.click();
};

// Função para atualizar o avatar
const updateAvatar = (event) => {
   const file = event.target.files[0];
   if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
         const avatarImage = document.querySelector(".avatar");
         avatarImage.src = e.target.result;
      };
      reader.readAsDataURL(file);
   }
};

// Função para submeter o formulário
async function submitForm(event) {
   event.preventDefault();

   const id_usuario = userId;
   const nome = document.getElementById("name").value;
   const cargo = document.getElementById("position").value;
   const setor = document.getElementById("department").value;
   const segmento = document.getElementById("segment").value;
   const email = document.getElementById("email").value;
   const senha = document.getElementById("password").value;
   const fileInput = document.getElementById("file-input");
   let foto;

   // Se uma nova imagem foi selecionada, converta-a para base64
   if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      foto = await new Promise((resolve) => {
         reader.onloadend = () => resolve(reader.result.split(",")[1]);
         reader.readAsDataURL(file);
      });
   } else {
      // Se não houver nova imagem, use a foto atual (ou padrão)
      const avatarImage = document.querySelector(".avatar");
      foto = avatarImage.src.includes("avatar.png")
         ? null
         : avatarImage.src.split(",")[1];
   }

   // Chama a função de atualização
   try {
      const resultado = await window.electronAPI.atualizarDadosUsuario(
         id_usuario,
         nome,
         cargo,
         setor,
         segmento,
         email,
         senha,
         foto
      );
      console.log(resultado);
      createSuccessNotification("Dados atualizados com sucesso!");
   } catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error);
      createErrorNotification("Erro ao atualizar os dados!");
   }
}

// Adiciona o manipulador de evento ao formulário
document.querySelector(".user-form").addEventListener("submit", submitForm);
