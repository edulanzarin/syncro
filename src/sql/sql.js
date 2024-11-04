// Mostrar o modal ao carregar a página
const passwordModal = new bootstrap.Modal(
   document.getElementById("passwordModal"),
   {
      backdrop: "static",
      keyboard: false,
   }
);
passwordModal.show();

const correctPassword = "sql-query";

// Função para verificar a senha
const checkPassword = () => {
   const passwordInput = document.getElementById("passwordInput");
   if (passwordInput.value === correctPassword) {
      passwordModal.hide();
      document.getElementById("sql-container").style.display = "block";
   } else {
      passwordInput.classList.add("error-shake");
      setTimeout(() => {
         passwordInput.classList.remove("error-shake");
      }, 300);
   }
};

// Evento para o botão "Confirmar"
document
   .getElementById("submitPassword")
   .addEventListener("click", checkPassword);

// Evento para pressionar a tecla "Enter"
document
   .getElementById("passwordInput")
   .addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
         checkPassword();
      }
   });

// Define a função para executar a consulta SQL
const executeSql = async () => {
   const sqlQuery = document.getElementById("sqlTextarea").value;

   if (!sqlQuery.trim()) {
      alert("Por favor, insira um comando SQL.");
      return;
   }

   try {
      const resultado = await window.electronAPI.executarConsultaSQL(sqlQuery);

      const sqlResult = document.getElementById("sqlResult");
      if (resultado.success) {
         if (resultado.dados) {
            sqlResult.textContent = JSON.stringify(resultado.dados, null, 2);
         } else {
            sqlResult.textContent = resultado.message;
         }
      } else {
         sqlResult.textContent = `Erro: ${resultado.message}`;
      }
   } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      document.getElementById(
         "sqlResult"
      ).textContent = `Erro: ${error.message}`;
   }
};

// Função para lidar com o evento de teclado
const handleKeyDown = (event) => {
   if (event.key === "Enter") {
      if (event.shiftKey) {
         // Se Shift + Enter, insere uma nova linha
         event.preventDefault();
         const textarea = document.getElementById("sqlTextarea");
         const start = textarea.selectionStart;
         const end = textarea.selectionEnd;

         // Insere uma nova linha no local do cursor
         textarea.value =
            textarea.value.substring(0, start) +
            "\n" +
            textarea.value.substring(end);
         textarea.selectionStart = textarea.selectionEnd = start + 1;
      } else {
         // Se apenas Enter, executa a consulta
         event.preventDefault();
         executeSql();
      }
   }
};

// Adiciona um evento de clique ao botão "Enviar"
document.getElementById("executeSql").addEventListener("click", executeSql);

// Adiciona um evento de teclado ao textarea
document
   .getElementById("sqlTextarea")
   .addEventListener("keydown", handleKeyDown);
